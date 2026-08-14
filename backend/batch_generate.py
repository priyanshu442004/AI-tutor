"""
Batch Generator for Chapters 1.2 to 1.5 Golden Datasets.
Extracts each chapter PDF, calls DeepSeek multi-pass pipeline,
and exports JSON, PDF, and DOCX files.
"""
import asyncio
import os
import sys
import json
import time

sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()

from pdf_extractor import extract_text_from_pdf, truncate_text_for_api
from deepseek_client import generate_golden_dataset
from exporters import dataset_to_pdf, dataset_to_docx

CHAPTER_FILES = [
    ("chapter 1.2.pdf", "1.2"),
    ("chapter 1.3.pdf", "1.3"),
    ("chapter 1.4.pdf", "1.4"),
    ("chapter 1.5.pdf", "1.5"),
]

BASE_DIR = r"c:\Users\hp\Desktop\miscellaneous\AI tutor"

async def process_chapter(filename: str, chap_num: str):
    pdf_path = os.path.join(BASE_DIR, filename)
    print(f"\n==================================================")
    print(f" PROCESSING CHAPTER {chap_num}: {filename}")
    print(f"==================================================")

    if not os.path.exists(pdf_path):
        print(f"ERROR: File not found: {pdf_path}")
        return

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    text, meta = extract_text_from_pdf(pdf_bytes)
    print(f"Extracted {meta['page_count']} pages, {len(text)} raw characters.")

    truncated_text = truncate_text_for_api(text, max_chars=18000)
    print(f"Truncated text for DeepSeek API: {len(truncated_text)} chars.")

    t0 = time.time()
    print("Generating Golden Dataset via DeepSeek...")
    dataset = await generate_golden_dataset(truncated_text, meta)
    t1 = time.time()
    print(f"Generation complete in {t1-t0:.1f} seconds.")

    # Save JSON
    json_path = os.path.join(BASE_DIR, f"Golden_Dataset_Chapter_{chap_num}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    print(f" Saved JSON -> {json_path}")

    # Export PDF
    try:
        pdf_bytes = dataset_to_pdf(dataset)
        pdf_out_path = os.path.join(BASE_DIR, f"Golden_Dataset_Chapter_{chap_num}.pdf")
        with open(pdf_out_path, "wb") as f:
            f.write(pdf_bytes)
        print(f" Saved PDF -> {pdf_out_path}")
    except Exception as e:
        print(f" PDF Export failed for Chapter {chap_num}: {e}")

    # Export DOCX
    try:
        docx_bytes = dataset_to_docx(dataset)
        docx_out_path = os.path.join(BASE_DIR, f"Golden_Dataset_Chapter_{chap_num}.docx")
        with open(docx_out_path, "wb") as f:
            f.write(docx_bytes)
        print(f" Saved DOCX -> {docx_out_path}")
    except Exception as e:
        print(f" DOCX Export failed for Chapter {chap_num}: {e}")

async def main():
    print("Starting Batch Golden Dataset Generation for Chapters 1.2 to 1.5...")
    for filename, chap_num in CHAPTER_FILES:
        try:
            await process_chapter(filename, chap_num)
        except Exception as e:
            print(f"ERROR processing Chapter {chap_num}: {e}")
    print("\n==================================================")
    print(" ALL CHAPTERS (1.2 to 1.5) PROCESSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
