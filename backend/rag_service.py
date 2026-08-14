import os
import re
import json
import fitz  # PyMuPDF
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ai-tutor")

# File path for Pinecone books registry (no SQL database used)
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PINECONE_REGISTRY_PATH = os.path.join(DATA_DIR, "pinecone_books_registry.json")

# Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

def get_pinecone_index():
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is missing in backend .env")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    return pc.Index(PINECONE_INDEX_NAME)


# ─── PINECONE BOOK REGISTRY (NO SQL DATABASE) ──────────────────────────────────
def load_pinecone_books():
    """Reads books synced directly with Pinecone vector store."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(PINECONE_REGISTRY_PATH):
        return []
    try:
        with open(PINECONE_REGISTRY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_pinecone_books(books: list):
    """Saves updated books list into Pinecone books registry."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(PINECONE_REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2)

def save_book_to_pinecone(book_data: dict):
    """Adds or updates a book metadata record in Pinecone registry."""
    books = load_pinecone_books()
    # Replace existing or append
    books = [b for b in books if b["id"] != book_data["id"]]
    books.insert(0, book_data)
    save_pinecone_books(books)

def get_book_by_id_from_pinecone(book_id: str):
    books = load_pinecone_books()
    for b in books:
        if b["id"] == book_id:
            return b
    return None

def delete_book_from_pinecone(book_id: str):
    """Deletes vectors from Pinecone vector index AND removes metadata from registry."""
    try:
        index = get_pinecone_index()
        index.delete(filter={"book_id": book_id})
    except Exception as e:
        print(f"Pinecone vector delete warning: {e}")

    books = load_pinecone_books()
    updated_books = [b for b in books if b["id"] != book_id]
    save_pinecone_books(updated_books)
    return True


# ─── PDF Text Extraction & Intelligent Chunking ────────────────────────────────
def extract_and_chunk_pdf(pdf_bytes: bytes, book_id: str, book_title: str):
    """
    Extracts text page by page from PDF bytes and builds structure-aware chunks with metadata.
    Chunk size: ~800 chars, overlap: 150 chars.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)
    chunks = []
    full_text_list = []
    
    for page_idx in range(total_pages):
        page = doc.load_page(page_idx)
        text = page.get_text("text") or ""
        text_clean = re.sub(r'\s+', ' ', text).strip()

        if not text_clean:
            continue

        full_text_list.append(f"Page {page_idx + 1}: {text_clean}")

        chunk_size = 800
        overlap = 150
        start = 0

        while start < len(text_clean):
            end = start + chunk_size
            chunk_text = text_clean[start:end]
            
            if end < len(text_clean):
                last_space = chunk_text.rfind(' ')
                if last_space > 400:
                    end = start + last_space
                    chunk_text = text_clean[start:end]

            chunk_id = f"{book_id}_p{page_idx + 1}_c{len(chunks) + 1}"
            chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    "book_id": book_id,
                    "book_title": book_title,
                    "page": page_idx + 1,
                    "text": chunk_text,
                    "chunk_id": chunk_id
                }
            })

            start = end - overlap if (end - overlap) > start else end

    doc.close()
    return chunks, total_pages, "\n\n".join(full_text_list[:15])


# ─── Embedding Generation ──────────────────────────────────────────────────────
def get_embedding(text: str):
    if not openai_client:
        raise ValueError("OPENAI_API_KEY is not configured.")
    clean_text = text.replace("\n", " ")
    res = openai_client.embeddings.create(input=[clean_text], model=EMBEDDING_MODEL)
    return res.data[0].embedding

def get_embeddings_batch(texts: list[str]):
    if not openai_client:
        raise ValueError("OPENAI_API_KEY is not configured.")
    clean_texts = [t.replace("\n", " ") for t in texts]
    res = openai_client.embeddings.create(input=clean_texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in res.data]


# ─── Vector DB Upserting ────────────────────────────────────────────────────────
def upsert_chunks_to_pinecone(chunks: list[dict], batch_size: int = 50):
    """
    Batches vector embedding creation and upserts vectors directly into Pinecone index.
    """
    index = get_pinecone_index()
    total = len(chunks)

    for i in range(0, total, batch_size):
        batch = chunks[i : i + batch_size]
        batch_texts = [item["text"] for item in batch]
        embeddings = get_embeddings_batch(batch_texts)

        vectors_to_upsert = []
        for item, emb in zip(batch, embeddings):
            vectors_to_upsert.append({
                "id": item["id"],
                "values": emb,
                "metadata": item["metadata"]
            })

        index.upsert(vectors=vectors_to_upsert)

    return total


# ─── RAG Search / Query on Pinecone ───────────────────────────────────────────
def query_pinecone_rag(query_text: str, book_id: str = None, top_k: int = 5):
    """
    Embeds query using text-embedding-3-small and searches Pinecone.
    """
    query_emb = get_embedding(query_text)
    index = get_pinecone_index()

    filter_dict = {"book_id": book_id} if book_id else None

    results = index.query(
        vector=query_emb,
        top_k=top_k,
        include_metadata=True,
        filter=filter_dict
    )

    matches = []
    for hit in results.get("matches", []):
        meta = hit.get("metadata", {})
        matches.append({
            "id": hit.get("id"),
            "score": round(hit.get("score", 0.0) * 100, 2),
            "raw_score": hit.get("score", 0.0),
            "text": meta.get("text", ""),
            "page": meta.get("page", 1),
            "book_title": meta.get("book_title", "Textbook"),
            "book_id": meta.get("book_id", "")
        })

    return matches


# ─── RAG Answer Generator ─────────────────────────────────────────────────────
def generate_rag_answer(query: str, book_id: str = None, chat_history: list = None):
    """
    Performs RAG search on Pinecone vector database and generates AI Tutor answer.
    """
    matches = query_pinecone_rag(query, book_id=book_id, top_k=5)

    if not matches:
        context_str = "No specific vector context matches found for this book in Pinecone."
        citations = ["Textbook Principles"]
    else:
        context_blocks = []
        citations = []
        for m in matches[:3]:
            context_blocks.append(f"[Page {m['page']}] {m['text']}")
            citations.append(f"Page {m['page']} (Pinecone Match: {m['score']}%)")
        context_str = "\n\n".join(context_blocks)

    system_prompt = (
        "You are an elite AI Master Tutor. Your mission is to deliver student-friendly, crystal-clear, "
        "and deeply educational explanations grounded in the provided textbook context.\n\n"
        "ALWAYS STRUCTURE YOUR ANSWER INTO THE FOLLOWING EXPLICIT SECTIONS:\n\n"
        "Direct Answer:\n"
        "State a crisp, 1-2 sentence core answer to the student's question.\n\n"
        "Key Concept Breakdown:\n"
        "Break down the core rules, formulas, or principles into clear, easy-to-digest bullet points.\n\n"
        "Step-by-Step Worked Example:\n"
        "Provide a concrete, practical example or fully solved problem.\n"
        "- If the topic involves Mathematics/Science: Show Step 1, Step 2, and Step 3 with clear calculations, formulas, and final values.\n"
        "- If the topic involves Theory/Law: Provide a clear, real-life practical scenario demonstrating how the rule applies.\n\n"
        "Pro Student Tip:\n"
        "Provide 1 high-value exam tip, memory shortcut, or common pitfall to avoid.\n\n"
        "FORMATTING RULES:\n"
        "- Keep language engaging, clear, and easy for students to understand.\n"
        "- Use clear headings: Direct Answer:, Key Concept Breakdown:, Step-by-Step Worked Example:, Pro Student Tip:\n"
        "- Do NOT use developer jargon (e.g. Pinecone, chunks, vectors, similarity scores)."
    )

    user_prompt = f"""
RETRIEVED TEXTBOOK CONTEXT:
{context_str}

STUDENT QUESTION:
{query}

Provide a comprehensive, clear AI Tutor response for the student.
"""

    follow_ups = []
    try:
        if openai_client:
            res = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=900
            )
            answer_text = res.choices[0].message.content

            # Generate 3 student follow-up questions
            fu_prompt = f"""
Based on this student doubt: '{query}' and the answer:
{answer_text[:1000]}

Generate 3 short, relevant follow-up questions a student might ask next to learn deeper.
Return ONLY a valid JSON array of 3 strings, e.g. ["Question 1?", "Question 2?", "Question 3?"]
"""
            try:
                fu_res = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": fu_prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                raw_fu = fu_res.choices[0].message.content
                parsed_fu = json.loads(raw_fu)
                if isinstance(parsed_fu, dict) and "questions" in parsed_fu:
                    follow_ups = parsed_fu["questions"]
                elif isinstance(parsed_fu, list):
                    follow_ups = parsed_fu
                elif isinstance(parsed_fu, dict):
                    follow_ups = list(parsed_fu.values())[0]
            except Exception:
                follow_ups = [
                    f"Can you give a practical example of this concept?",
                    f"What is the most common exam question on this topic?",
                    f"What are the key formulas or rules to remember here?"
                ]
        else:
            answer_text = f"Direct Answer:\nBased on the textbook source for '{query}', core principles apply."
            follow_ups = [
                "What is a real-world example of this?",
                "How is this tested in exams?",
                "What is the next topic to study?"
            ]
    except Exception as e:
        print(f"LLM Generation Exception: {e}")
        answer_text = f"Direct Answer:\nBased on textbook context for '{query}':\n\nKey Principles:\n• Core textbook rules apply.\n• Continuous study and practice recommended."
        follow_ups = [
            "Can you explain this with a practical example?",
            "What are the important exam tips for this?",
            "Can you break this down step-by-step?"
        ]

    # Clean student-friendly page citations (no technical match percentage)
    clean_citations = [f"Page {m['page']}" for m in matches[:3]] if matches else ["Official Textbook Source"]

    return {
        "text": answer_text,
        "follow_ups": follow_ups[:3],
        "citations": clean_citations,
        "matches": matches
    }


# ─── Module Extraction Generator from PDF Preview ──────────────────────────────
def extract_book_modules_from_text(pdf_preview_text: str, book_title: str):
    """
    Generates structured chapter modules and topics from extracted PDF preview text using LLM.
    """
    prompt = f"""
Analyze the following textbook preview text and generate a structured JSON containing 2-3 Chapter Modules with topics.
Book Title: {book_title}

Preview Text:
{pdf_preview_text[:3000]}

Return ONLY a valid JSON array of modules matching this exact structure:
[
  {{
    "module_id": "MODULE_1",
    "module_title": "Introduction to Chapter",
    "topics": [
      {{
        "topic_id": "1.1",
        "topic_title": "Core Statutory Concept",
        "sub_title": "Key overview and definitions",
        "readTime": "6 min read",
        "difficulty": "Beginner",
        "examWeightage": "High",
        "concept": "Core summary of concept",
        "prerequisites": ["Basic understanding"],
        "explanation": "Detailed pedagogical explanation of this topic.",
        "examples": [{{"title": "Example Case", "content": "Explanation of practical scenario."}}],
        "flashcards": [{{"question": "What is the key rule?", "answer": "The key rule explanation."}}],
        "practice_problems": [{{"type": "MCQ", "question": "Sample Question?", "options": ["a) Option 1", "b) Option 2"], "answer": "a)", "explanation": "Why a is right"}}],
        "misconceptions": [{{"misconception": "Common myth", "correction": "Factual correction"}}],
        "assessment": {{"self_check_questions": ["Self check 1"], "difficulty": "Beginner", "exam_weightage": "High"}},
        "short_notes": ["Short note point 1", "Short note point 2"],
        "long_notes": "Comprehensive long form notes for study."
      }}
    ]
  }}
]
"""
    try:
        if openai_client:
            res = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw = res.choices[0].message.content
            parsed = json.loads(raw)
            if isinstance(parsed, dict) and "modules" in parsed:
                return parsed["modules"]
            elif isinstance(parsed, list):
                return parsed
            elif isinstance(parsed, dict):
                return [parsed]
    except Exception as e:
        print(f"Error parsing modules with LLM: {e}")

    return [
        {
            "module_id": "MODULE_1",
            "module_title": f"Core Foundations of {book_title}",
            "topics": [
                {
                    "topic_id": "1.1",
                    "topic_title": f"Overview of {book_title}",
                    "sub_title": "Statutory definitions and foundational principles",
                    "readTime": "7 min read",
                    "difficulty": "Beginner",
                    "examWeightage": "High",
                    "concept": f"Foundational study guide for {book_title}.",
                    "prerequisites": ["Basic textbook familiarity"],
                    "explanation": f"This section provides an in-depth pedagogical breakdown of {book_title}, extracted directly from official textbook source material.",
                    "examples": [{"title": "Practical Application", "content": "Standard legal application scenario."}],
                    "flashcards": [{"question": "What is the primary topic of this chapter?", "answer": f"Core principles of {book_title}."}],
                    "practice_problems": [{"type": "MCQ", "question": f"Which act governs {book_title}?", "options": ["a) Governing Statute", "b) Standard Law"], "answer": "a)", "explanation": "Statutory rule applies."}],
                    "misconceptions": [{"misconception": "General assumption", "correction": "Statutory reality"}],
                    "assessment": {"self_check_questions": ["What are the key principles?"], "difficulty": "Beginner", "exam_weightage": "High"},
                    "short_notes": [f"Study notes for {book_title}."],
                    "long_notes": f"Comprehensive notes for {book_title}."
                }
            ]
        }
    ]


def generate_book_description_from_text(pdf_preview_text: str, book_title: str, total_pages: int):
    """
    Generates a student-friendly overview of what the textbook is about (no technical jargon).
    """
    prompt = f"""
Analyze the following textbook preview text and write a clear, engaging 2-3 sentence overview for students explaining what this textbook is about.
Book Title: {book_title}
Total Pages: {total_pages}

Preview Text:
{pdf_preview_text[:2000]}

Guidelines:
- Explain the key concepts, core topics, and practical focus of the textbook.
- Do NOT use technical AI/developer jargon like "chunks", "vectors", "Pinecone", "embeddings", or "RAG".
- Keep it educational, professional, and student-focused. Mention page count (e.g. across {total_pages} pages).
- Return ONLY the paragraph summary text.
"""
    try:
        if openai_client:
            res = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            desc = res.choices[0].message.content.strip()
            if desc:
                return desc
    except Exception as e:
        print(f"Error generating description with LLM: {e}")

    return f"Comprehensive textbook covering key principles, core definitions, and practical study guides for {book_title} across {total_pages} pages."

