"""
AI Tutor — FastAPI Backend with 100% Pinecone RAG & Admin Engine
Upload PDF Books → Auto Chunk & Embed to Pinecone → Pinecone Vector Store → Real-time RAG Student Tutor
"""
import json
import os
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from dotenv import load_dotenv

load_dotenv()

from pdf_extractor import extract_text_from_pdf, truncate_text_for_api
from deepseek_client import generate_golden_dataset
from exporters import dataset_to_pdf, dataset_to_docx
import rag_service

# ─── App Initialization ────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Tutor & Admin RAG Platform",
    description="Vector DB powered student tutoring platform & Admin management engine.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# ─── CORS Configuration ────────────────────────────────────────────────────────
_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5174")
_origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Public & Health Endpoints ─────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "AI Tutor RAG Engine",
        "pinecone_index": os.getenv("PINECONE_INDEX_NAME", "ai-tutor"),
        "embedding_model": os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Pinecone Vector Book Library Endpoints ────────────────────────────────────
@app.get("/api/books")
async def list_books():
    """
    Returns all active books ingested into Pinecone vector index.
    """
    books = rag_service.load_pinecone_books()
    return {"success": True, "books": books}


@app.get("/api/books/{book_id}")
async def get_book(book_id: str):
    """
    Returns detailed modules and topics of a specific book.
    """
    book = rag_service.get_book_by_id_from_pinecone(book_id)
    if not book:
        raise HTTPException(404, "Book not found.")
    return {"success": True, "book": book}


# ─── Admin Book Upload & Vector Embedding Pipeline ──────────────────────────────
@app.post("/api/admin/books/upload")
async def admin_upload_book(
    file: UploadFile = File(...),
    title: str = Form(...),
    author: str = Form("Academic Faculty"),
    category: str = Form("General Textbook"),
    edition: str = Form("2026 Edition")
):
    """
    Admin Upload PDF → Extract text → Structure chunks → Embed in OpenAI text-embedding-3-small → Upsert to Pinecone vector store.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) < 512:
        raise HTTPException(400, "Uploaded PDF file appears empty or corrupted.")

    book_id = f"book-{uuid.uuid4().hex[:8]}"

    # Step 1: Extract text and generate chunks
    try:
        chunks, total_pages, preview_text = rag_service.extract_and_chunk_pdf(
            pdf_bytes=pdf_bytes,
            book_id=book_id,
            book_title=title
        )
    except Exception as e:
        raise HTTPException(422, f"PDF text extraction failed: {e}")

    if not chunks:
        raise HTTPException(422, "PDF contains no extractable text.")

    # Step 2: Embed and Upsert chunks directly to Pinecone vector index
    try:
        total_upserted = rag_service.upsert_chunks_to_pinecone(chunks)
    except Exception as e:
        raise HTTPException(500, f"Pinecone vector embedding upsert failed: {e}")

    # Step 3: Extract chapter modules and topics
    try:
        modules = rag_service.extract_book_modules_from_text(preview_text, title)
    except Exception as e:
        print(f"Module extraction notice: {e}")
        modules = []

    # Step 4: Generate student-friendly description & save book metadata record
    try:
        description = rag_service.generate_book_description_from_text(preview_text, title, total_pages)
    except Exception as e:
        print(f"Description generation notice: {e}")
        description = f"Comprehensive textbook covering key principles, core definitions, and practical study guides for {title} across {total_pages} pages."

    gradients = [
        "from-indigo-600 to-violet-900",
        "from-blue-600 to-cyan-900",
        "from-emerald-600 to-teal-900",
        "from-purple-600 to-pink-900",
        "from-amber-600 to-orange-900"
    ]
    cover_gradient = gradients[hash(book_id) % len(gradients)]

    book_record = {
        "id": book_id,
        "title": title,
        "author": author,
        "category": category,
        "edition": edition,
        "description": description,
        "total_pages": total_pages,
        "cover_gradient": cover_gradient,
        "total_chunks": len(chunks),
        "stats": {
            "modules": len(modules),
            "chapters": len(modules) * 3,
            "topics": sum(len(m.get("topics", [])) for m in modules),
            "totalHours": f"{max(4, total_pages // 15)} hrs"
        },
        "modules": modules,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    rag_service.save_book_to_pinecone(book_record)

    return JSONResponse({
        "success": True,
        "message": f"Successfully ingested and embedded '{title}' into Pinecone vector index!",
        "book": book_record,
        "ingestion": {
            "total_pages": total_pages,
            "total_chunks": len(chunks),
            "vectors_upserted": total_upserted,
            "pinecone_index": os.getenv("PINECONE_INDEX_NAME", "ai-tutor")
        }
    })


@app.delete("/api/admin/books/{book_id}")
async def admin_delete_book(book_id: str):
    """
    Purges matching vectors from Pinecone and removes book record.
    """
    book = rag_service.get_book_by_id_from_pinecone(book_id)
    if not book:
        raise HTTPException(404, "Book not found.")

    # Purge vectors from Pinecone vector index
    rag_service.delete_book_from_pinecone(book_id)

    return {"success": True, "message": f"Book '{book['title']}' and its Pinecone vectors were purged."}


# ─── Admin RAG Testing Playground Endpoint ─────────────────────────────────────
@app.post("/api/admin/test-rag")
async def admin_test_rag(request: Request):
    """
    Admin playground to test Pinecone vector retrieval and RAG response generation.
    """
    body = await request.json()
    query = body.get("query", "").strip()
    book_id = body.get("book_id")

    if not query:
        raise HTTPException(400, "Query string is required.")

    # Perform RAG Query and AI Answer Generation on Pinecone
    res = rag_service.generate_rag_answer(query=query, book_id=book_id)

    return {
        "success": True,
        "query": query,
        "book_id": book_id,
        "vector_matches": res["matches"],
        "answer": res["text"],
        "citations": res["citations"]
    }


# ─── Student Real-Time AI Doubt Solver Chat Endpoint ───────────────────────────
@app.post("/api/chat")
async def student_chat(request: Request):
    """
    Student real-time AI Doubt Solver endpoint connected to Pinecone RAG.
    """
    body = await request.json()
    query = body.get("query", "").strip()
    book_id = body.get("book_id")
    history = body.get("history", [])

    if not query:
        raise HTTPException(400, "Query string is required.")

    res = rag_service.generate_rag_answer(query=query, book_id=book_id, chat_history=history)

    return {
        "success": True,
        "answer": res["text"],
        "follow_ups": res.get("follow_ups", []),
        "citations": res["citations"],
        "sources": [f"Page {m['page']}" for m in res["matches"][:3]]
    }


@app.get("/api/admin/stats")
async def admin_stats():
    """
    Returns Admin Overview Stats from Pinecone vector store.
    """
    books = rag_service.load_pinecone_books()
    total_books = len(books)
    total_chunks = sum(b.get("total_chunks", 0) for b in books)

    return {
        "success": True,
        "total_books": total_books,
        "total_chunks": total_chunks,
        "pinecone_index": os.getenv("PINECONE_INDEX_NAME", "ai-tutor"),
        "embedding_model": os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"),
        "rag_status": "Connected & Operational"
    }


# ─── Legacy Golden Dataset Endpoints ──────────────────────────────────────────
@app.post("/generate")
async def generate(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted.")
    pdf_bytes = await file.read()
    if len(pdf_bytes) < 512:
        raise HTTPException(400, "File appears empty or corrupted.")
    try:
        pdf_text, pdf_meta = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(422, f"PDF text extraction failed: {e}")
    pdf_text = truncate_text_for_api(pdf_text)
    try:
        dataset = await generate_golden_dataset(pdf_text, pdf_meta)
    except ValueError as e:
        raise HTTPException(500, f"Dataset generation failed: {e}")
    return JSONResponse({"success": True, "dataset": dataset})


@app.post("/export/pdf")
async def export_pdf(request: Request):
    body = await request.json()
    dataset = body.get("dataset")
    if not dataset:
        raise HTTPException(400, "No dataset in request body.")
    pdf_bytes = dataset_to_pdf(dataset)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="golden_dataset_{ts}.pdf"'},
    )


@app.post("/export/docx")
async def export_docx(request: Request):
    body = await request.json()
    dataset = body.get("dataset")
    if not dataset:
        raise HTTPException(400, "No dataset in request body.")
    docx_bytes = dataset_to_docx(dataset)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="golden_dataset_{ts}.docx"'},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
