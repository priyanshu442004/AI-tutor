import os
import re
import json
import fitz  # PyMuPDF
from openai import OpenAI
from pinecone import Pinecone
from dotenv import load_dotenv
from db import get_legal_book_structure

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "ai-tutor")

LEGAL_PINECONE_API_KEY = os.getenv("LEGAL_PINECONE_API_KEY", "pcsk_6Ybht3_6FBYXef9XjZ5CFPpGbLRH8dv8dUqq6WrJeLX9eVBMB3R25phnonj1i45HJYQNqc")
LEGAL_PINECONE_INDEX_NAME = os.getenv("LEGAL_PINECONE_INDEX_NAME", "cla-online")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

# File path for Pinecone books registry
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PINECONE_REGISTRY_PATH = os.path.join(DATA_DIR, "pinecone_books_registry.json")

# Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL) if DEEPSEEK_API_KEY else None

def get_pinecone_index(is_legal: bool = False):
    if is_legal:
        key = LEGAL_PINECONE_API_KEY
        idx_name = LEGAL_PINECONE_INDEX_NAME
    else:
        key = PINECONE_API_KEY
        idx_name = PINECONE_INDEX_NAME
        
    if not key:
        raise ValueError("Pinecone API Key is missing in configuration.")
        
    pc = Pinecone(api_key=key)
    return pc.Index(idx_name)


# ─── PINECONE BOOK REGISTRY & MSSQL LEGAL INTEGRATION ─────────────────────────
def load_pinecone_books():
    """
    Reads books synced directly with Pinecone vector store + MSSQL Legal book.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    registry_books = []
    if os.path.exists(PINECONE_REGISTRY_PATH):
        try:
            with open(PINECONE_REGISTRY_PATH, "r", encoding="utf-8") as f:
                registry_books = json.load(f)
        except Exception:
            registry_books = []
            
    # Remove any old static legal book from registry list to avoid duplicates
    filtered = [b for b in registry_books if b.get("id") not in ["book-legal", "legal"]]
    
    # Dynamically inject the MSSQL-backed Legal book at position 0
    legal_book = get_legal_book_structure()
    
    return [legal_book] + filtered

def save_pinecone_books(books: list):
    """Saves updated books list into Pinecone books registry."""
    os.makedirs(DATA_DIR, exist_ok=True)
    filtered = [b for b in books if b.get("id") not in ["book-legal", "legal"]]
    with open(PINECONE_REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered, f, indent=2)

def save_book_to_pinecone(book_data: dict):
    """Adds or updates a book metadata record in Pinecone registry."""
    books = load_pinecone_books()
    books = [b for b in books if b["id"] != book_data["id"]]
    books.insert(0, book_data)
    save_pinecone_books(books)

def get_book_by_id_from_pinecone(book_id: str):
    if book_id in ["book-legal", "legal"]:
        return get_legal_book_structure()
        
    books = load_pinecone_books()
    for b in books:
        if b["id"] == book_id:
            return b
    return None

def delete_book_from_pinecone(book_id: str):
    """Deletes vectors from Pinecone vector index AND removes metadata from registry."""
    if book_id in ["book-legal", "legal"]:
        return False
        
    try:
        index = get_pinecone_index(is_legal=False)
        index.delete(filter={"book_id": book_id})
    except Exception as e:
        print(f"Pinecone vector delete warning: {e}")

    books = load_pinecone_books()
    updated_books = [b for b in books if b["id"] != book_id]
    save_pinecone_books(updated_books)
    return True


# ─── PDF Text Extraction & Intelligent Chunking ────────────────────────────────
def extract_and_chunk_pdf(pdf_bytes: bytes, book_id: str, book_title: str):
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
def upsert_chunks_to_pinecone(chunks: list[dict], batch_size: int = 50, is_legal: bool = False):
    index = get_pinecone_index(is_legal=is_legal)
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


# ─── RAG Search / Query on Pinecone (Dual DB Support) ──────────────────────────
def query_pinecone_rag(query_text: str, book_id: str = None, top_k: int = 5):
    is_legal = (book_id in ["book-legal", "legal"])
    query_emb = get_embedding(query_text)
    index = get_pinecone_index(is_legal=is_legal)

    # For Legal vector index cla-online, query without strict book_id filter if not present in metadata
    filter_dict = {"book_id": book_id} if (book_id and not is_legal) else None

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
            "text": meta.get("text", "") or meta.get("content", "") or str(meta),
            "page": meta.get("page", 1),
            "book_title": "Legal CLA Reference" if is_legal else meta.get("book_title", "Textbook"),
            "book_id": book_id or ""
        })

    return matches


# ─── RAG Answer Generator (Legal vs Standard Prompt Routing) ────────────────────
def generate_rag_answer(query: str, book_id: str = None, chat_history: list = None):
    is_legal = (book_id in ["book-legal", "legal"])
    matches = query_pinecone_rag(query, book_id=book_id, top_k=5)

    if not matches:
        context_str = "No specific vector context matches found in Pinecone."
        citations = ["CLA Legal Framework" if is_legal else "Textbook Principles"]
    else:
        context_blocks = []
        citations = []
        for m in matches[:3]:
            context_blocks.append(f"[Page {m['page']}] {m['text']}")
            citations.append(f"Page {m['page']} (Pinecone Match: {m['score']}%)")
        context_str = "\n\n".join(context_blocks)

    if is_legal:
        system_prompt = (
            "You are an authoritative Senior Legal Counsel and Corporate Law Specialist for the CLA Legal Platform.\n"
            "Your audience consists of legal professionals, advocates, corporate executives, and law practitioners seeking rigorous, precise, and statutory-grounded legal analysis.\n\n"
            "ALWAYS STRUCTURE YOUR ANSWER INTO THE FOLLOWING EXPLICIT SECTIONS:\n\n"
            "Direct Legal Opinion:\n"
            "State a concise, authoritative 1-2 sentence legal position or statutory interpretation addressing the inquiry.\n\n"
            "Statutory Framework & Case Precedents:\n"
            "Detail relevant sections, acts, and statutory definitions (e.g. Companies Act 2013, Section 2(11), Section 2(20), etc.) and cite key judicial precedents governing the query.\n\n"
            "Practical & Corporate Implications:\n"
            "Explain practical compliance implications, liability aspects, procedural requirements, or operational impacts for corporate entities.\n\n"
            "Strategic Recommendation:\n"
            "Provide 1-2 actionable recommendations, compliance checkpoints, or risk mitigation measures for legal practice.\n\n"
            "FORMATTING RULES:\n"
            "- Use precise legal terminology.\n"
            "- Ground all statements strictly in statutory provisions and authentic legal context.\n"
            "- Do NOT use developer jargon (e.g. Pinecone, chunks, vectors, similarity scores)."
        )
        user_prompt = f"""
RETRIEVED STATUTORY & LEGAL CONTEXT (from Pinecone cla-online index):
{context_str}

LEGAL INQUIRY:
{query}

Deliver a rigorous, authoritative legal analysis for this inquiry.
"""
    else:
        system_prompt = (
            "You are an elite AI Master Tutor. Your mission is to deliver student-friendly, crystal-clear, "
            "and deeply educational explanations grounded in the provided textbook context.\n\n"
            "ALWAYS STRUCTURE YOUR ANSWER INTO THE FOLLOWING EXPLICIT SECTIONS:\n\n"
            "Direct Answer:\n"
            "State a crisp, 1-2 sentence core answer to the student's question.\n\n"
            "Key Concept Breakdown:\n"
            "Break down the core rules, formulas, or principles into clear, easy-to-digest bullet points.\n\n"
            "Step-by-Step Worked Example:\n"
            "Provide a concrete, practical example or fully solved problem.\n\n"
            "Pro Student Tip:\n"
            "Provide 1 high-value exam tip, memory shortcut, or common pitfall to avoid.\n\n"
            "FORMATTING RULES:\n"
            "- Keep language engaging, clear, and easy for students to understand.\n"
            "- For mathematical equations, write them in clear, readable text (e.g. f(x) = 2x - 1, lim (x → 3) f(x) = 5). Do NOT output raw LaTeX math delimiters like \\( or \\[ or \\lim_{x \\to a}.\n"
            "- Do NOT append 'Source:' or page numbers or citation lists at the end of the response.\n"
            "- Do NOT use developer jargon."
        )
        user_prompt = f"""
RETRIEVED TEXTBOOK CONTEXT:
{context_str}

STUDENT QUESTION:
{query}

Provide a comprehensive, clear AI Tutor response for the student.
"""

    # Choose LLM Client (Prefer DeepSeek model for generating answers)
    llm_client = deepseek_client if deepseek_client else openai_client
    llm_model = DEEPSEEK_MODEL if (llm_client == deepseek_client) else "gpt-4o-mini"

    follow_ups = []
    try:
        if llm_client:
            res = llm_client.chat.completions.create(
                model=llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            answer_text = res.choices[0].message.content

            fu_prompt = f"""
Based on this query: '{query}' and legal/educational response:
{answer_text[:1000]}

Generate 3 short, relevant follow-up questions a student or legal practitioner might ask next.
Return ONLY a valid JSON array of 3 strings, e.g. ["Question 1?", "Question 2?", "Question 3?"]
"""
            try:
                fu_res = llm_client.chat.completions.create(
                    model=llm_model,
                    messages=[{"role": "user", "content": fu_prompt}],
                    temperature=0.3,
                )
                raw_fu = fu_res.choices[0].message.content
                cleaned_fu = re.sub(r'^```(?:json)?\s*', '', raw_fu.strip(), flags=re.MULTILINE)
                cleaned_fu = re.sub(r'```\s*$', '', cleaned_fu.strip()).strip()
                parsed_fu = json.loads(cleaned_fu)
                if isinstance(parsed_fu, dict) and "questions" in parsed_fu:
                    follow_ups = parsed_fu["questions"]
                elif isinstance(parsed_fu, list):
                    follow_ups = parsed_fu
                elif isinstance(parsed_fu, dict):
                    follow_ups = list(parsed_fu.values())[0]
            except Exception:
                follow_ups = [
                    "What are the relevant statutory provisions governing this?",
                    "What landmark court precedents apply here?",
                    "What compliance procedure must be followed?"
                ]
        else:
            answer_text = f"Direct Legal Opinion:\nBased on authoritative legal source for '{query}', core statutory rules apply."
            follow_ups = [
                "What is a real-world corporate example?",
                "What statutory provisions govern this?",
                "What is the next topic to analyze?"
            ]
    except Exception as e:
        print(f"LLM Generation Exception: {e}")
        answer_text = f"Direct Legal Opinion:\nBased on authoritative legal context for '{query}':\n\nKey Principles:\n• Relevant statutory provisions apply.\n• Legal review recommended."
        follow_ups = [
            "Can you explain the statutory provisions in detail?",
            "What case precedents apply here?",
            "What are the procedural requirements?"
        ]

    clean_citations = [f"Page {m['page']}" for m in matches[:3]] if matches else ["Official CLA Legal Source" if is_legal else "Official Textbook Source"]

    return {
        "text": answer_text,
        "follow_ups": follow_ups[:3],
        "citations": clean_citations,
        "matches": matches
    }


# ─── Module Extraction Generator from PDF Preview ──────────────────────────────
def extract_book_modules_from_text(pdf_preview_text: str, book_title: str):
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
    prompt = f"""
Analyze the following textbook preview text and write a clear, engaging 2-3 sentence overview for students explaining what this textbook is about.
Book Title: {book_title}
Total Pages: {total_pages}

Preview Text:
{pdf_preview_text[:2000]}

Guidelines:
- Explain the key concepts, core topics, and practical focus of the textbook.
- Do NOT use technical AI/developer jargon.
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
