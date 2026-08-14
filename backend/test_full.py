"""End-to-end test: Extract PDF + Call DeepSeek + Print dataset summary."""
import asyncio, os, sys, json
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
from pdf_extractor import extract_text_from_pdf, truncate_text_for_api
from deepseek_client import generate_golden_dataset

PDF_PATH = r"c:\Users\hp\Desktop\miscellaneous\AI tutor\Chapter_1.1_Source.pdf"

async def test():
    print("Step 1: Extracting PDF text...")
    with open(PDF_PATH, "rb") as f:
        pdf_bytes = f.read()
    text, meta = extract_text_from_pdf(pdf_bytes)
    print(f"  Pages: {meta['page_count']}, Raw chars: {len(text)}")
    
    text = truncate_text_for_api(text)
    print(f"  After truncation: {len(text)} chars")
    
    print("Step 2: Calling DeepSeek API...")
    dataset = await generate_golden_dataset(text, meta)
    
    print("Step 3: Results:")
    m = dataset.get("metadata", {})
    modules = dataset.get("modules", [])
    total_topics = sum(len(mod.get("topics", [])) for mod in modules)
    print(f"  Book: {m.get('book_name', 'N/A')[:60]}")
    print(f"  Chapter: {m.get('chapter_name', 'N/A')[:60]}")
    print(f"  Modules: {len(modules)}")
    print(f"  Total Topics: {total_topics}")
    print(f"  Finish reason: {m.get('finish_reason', 'N/A')}")
    
    # Save for inspection
    out = r"c:\Users\hp\Desktop\miscellaneous\AI tutor\backend\test_output.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    print(f"  Saved full JSON to: {out}")
    print("DONE - Test passed!")

asyncio.run(test())
