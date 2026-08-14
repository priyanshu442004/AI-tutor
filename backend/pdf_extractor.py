"""
PDF Text Extractor using PyMuPDF (fitz)
Handles multi-column, complex legal PDFs robustly.
"""
import fitz  # PyMuPDF
import re
from typing import Tuple


def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, dict]:
    """
    Extract full text from a PDF file given as bytes.
    Returns (full_text, metadata_dict)
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    metadata = {
        "page_count": doc.page_count,
        "title": doc.metadata.get("title", ""),
        "author": doc.metadata.get("author", ""),
        "subject": doc.metadata.get("subject", ""),
    }

    pages_text = []
    for page_num in range(doc.page_count):
        page = doc[page_num]
        blocks = page.get_text("blocks", sort=True)
        page_lines = []
        for block in blocks:
            if block[6] == 0:  # text block
                text = block[4].strip()
                if text:
                    page_lines.append(text)
        page_text = "\n".join(page_lines)
        pages_text.append(f"[PAGE {page_num + 1}]\n{page_text}")

    doc.close()

    full_text = "\n\n".join(pages_text)
    full_text = re.sub(r'\n{4,}', '\n\n\n', full_text)
    full_text = re.sub(r'[ \t]{2,}', ' ', full_text)

    return full_text.strip(), metadata


def truncate_text_for_api(text: str, max_chars: int = 15000) -> str:
    """
    Truncate text to fit within API context limits.
    Cuts at a paragraph boundary where possible.
    """
    if len(text) <= max_chars:
        return text

    truncated = text[:max_chars]
    last_para = truncated.rfind('\n\n')
    if last_para > max_chars * 0.75:
        truncated = truncated[:last_para]

    return truncated + "\n\n[Content truncated — covers first portion of document]"
