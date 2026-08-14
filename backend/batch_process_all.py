"""
Batch Processor for Chapters 1.1, 1.2, 1.3, 1.4, and 1.5 Golden Datasets.
Extracts source PDF texts, calls DeepSeek API to generate structured educational Golden Datasets,
and exports JSON and PDF files matching the exact reference Golden Dataset layout.
"""
import os
import sys
import json
import asyncio
import time
import pypdf
from dotenv import load_dotenv
from openai import AsyncOpenAI

sys.path.insert(0, '.')
from exporters import dataset_to_pdf

load_dotenv()

BASE_DIR = r"c:\Users\hp\Desktop\miscellaneous\AI tutor"

CHAPTER_SPECS = [
    {
        "id": "1.1",
        "file": "Chapter_1.1_Source.pdf",
        "topic": "What do the concepts of 'company', 'body corporate', 'corporation' and 'person' contemplate in relation to companies registered under the Companies Act?",
        "subtopics": [
            "Introduction",
            "Attributes of corporate personality",
            "Difference between incorporation of a company and constitution or establishment of a corporation",
            "Whether company is a 'person'",
            "Whether a company is a citizen"
        ]
    },
    {
        "id": "1.2",
        "file": "chapter 1.2.pdf",
        "topic": "Distinct personality of a company - U. P. State Ind. Dev. Corp. Ltd v Monsanto Manufacturers Ltd [2015] 189 Comp Cas 69 (SC) : does it need reconsideration?",
        "subtopics": [
            "Introduction: Two judgments in stark contrast",
            "Corporate personality of a company",
            "The principle of independent corporate entity",
            "Piercing the veil",
            "What did Monsanto case decide?"
        ]
    },
    {
        "id": "1.3",
        "file": "chapter 1.3.pdf",
        "topic": "Can an entity not registered as a company under Companies Act be converted into a company?",
        "subtopics": [
            "Companies Act provisions regarding formation of a company",
            "Special definition of 'company' under section 366"
        ]
    },
    {
        "id": "1.4",
        "file": "chapter 1.4.pdf",
        "topic": "What is the relevance and significance of the definition of 'body corporate' vis-à-vis 'company'?",
        "subtopics": [
            "Introduction",
            "Legislative history of definition of 'body corporate'",
            "Ordinary meaning of 'body corporate'",
            "Scope",
            "Expressions 'body corporate' and 'corporation' are synonymous and interchangeable",
            "Attributes of corporate personality",
            "Body corporate or corporation distinct from shareholders",
            "Statutory corporation",
            "Whether City Municipal Council/Town Municipal Council is body corporate/corporation",
            "Society registered under the Societies Registration Act, 1860",
            "Co-operative society",
            "Corporation sole",
            "Corporation aggregate"
        ]
    },
    {
        "id": "1.5",
        "file": "chapter 1.5.pdf",
        "topic": "What is Corporate Personality of a Company and What is Vicarious Liability of Directors and Employees under the Standard Penal Provision?",
        "subtopics": [
            "Concept of 'vicarious liability'",
            "The genesis",
            "Liability under sub-section (1)",
            "Identification of the person or persons in charge of, and responsible to, the company for the conduct of its business",
            "Prosecution of directors/officers sans the company",
            "Reversal of the view in Sheoratan Agarwal's case",
            "Two topical judgments of Supreme Court",
            "Section 27 of the SEBI Act"
        ]
    }
]

def extract_pdf_text(filepath: str) -> str:
    reader = pypdf.PdfReader(filepath)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

async def generate_dataset_for_chapter(client: AsyncOpenAI, spec: dict) -> dict:
    filepath = os.path.join(BASE_DIR, spec["file"])
    print(f"\n==================================================")
    print(f" PROCESSING CHAPTER {spec['id']}: {spec['file']}")
    print(f"==================================================")

    raw_text = extract_pdf_text(filepath)
    print(f"Extracted {len(raw_text)} raw characters from {spec['file']}.")

    truncated_text = raw_text[:35000]
    subtopics_formatted = "\n".join([f"{i+1}. {st}" for i, st in enumerate(spec["subtopics"])])

    prompt = f"""You are an expert educational content architect creating ground-truth Golden Datasets for an AI Tutor platform.
Context: The purpose is to explain law books in simpler, easy-to-understand language for students while maintaining full legal accuracy, case law citations, and statutory section references.

Book Name: BASIC CONCEPTS OF COMPANY & ITS STRUCTURE
Chapter Name: Chapter 1 Concepts of "company"
Chapter Topic Name: {spec['topic']}

Subtopics to cover:
{subtopics_formatted}

Source PDF text:
---
{truncated_text}
---

Create the complete Golden Dataset adhering STRICTLY to this structure for EVERY subtopic mentioned above:

For each subtopic, provide:
A. Concept: Clear, direct legal definition in simple student-friendly language.
B. Prerequisites: List of foundational prior concepts a student should know before learning this section.
C. Explanation: Comprehensive yet simple explanation covering statutory provisions with exact section numbers, judicial interpretations with full case names and years, practical implications, and key principles.
D. Examples: Concrete realistic scenarios/examples with named parties and clear legal outcomes.
E. Practice Problems: Thought-provoking conceptual and scenario-based practice questions.
F. Common Misconceptions: Common myths/wrong beliefs paired with accurate legal realities.
G. Assessment: Self-check assessment questions, difficulty level ("Intermediate"), and exam weightage ("High").

After ALL subtopics are covered, provide:
- Short Note: A clear, high-yield summary in simple language covering all subtopics of this chapter, ideal for quick student revision.
- Long Note: A comprehensive, detailed academic reference synthesizing all subtopics of this chapter, incorporating all statutory section references, case law citations, and legal doctrines.

Return ONLY valid JSON matching this exact structure:
{{
  "metadata": {{
    "book_name": "BASIC CONCEPTS OF COMPANY & ITS STRUCTURE",
    "chapter_name": "Chapter 1 Concepts of \\"company\\"",
    "chapter_topic": "{spec['topic']}",
    "sub_topics_covered": {json.dumps(spec['subtopics'])}
  }},
  "sub_topics": [
    {{
      "sub_topic_number": 1,
      "sub_topic_name": "{spec['subtopics'][0]}",
      "concept": "...",
      "prerequisites": ["..."],
      "explanation": "...",
      "examples": ["Example 1: ...", "Example 2: ..."],
      "practice_problems": ["1. ...", "2. ..."],
      "common_misconceptions": [
        {{"myth": "...", "reality": "..."}}
      ],
      "assessment": ["1. ...", "2. ..."]
    }}
  ],
  "short_note": "...",
  "long_note": "..."
}}
"""

    print("Calling DeepSeek API...")
    t0 = time.time()
    resp = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=8000,
        temperature=0.2
    )
    t1 = time.time()
    print(f"DeepSeek response received in {t1-t0:.1f} seconds.")

    content = resp.choices[0].message.content
    dataset = json.loads(content)
    return dataset

async def main():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    for spec in CHAPTER_SPECS:
        chap_id = spec["id"]
        try:
            dataset = await generate_dataset_for_chapter(client, spec)

            # Save JSON
            json_path = os.path.join(BASE_DIR, f"Golden_Dataset_Chapter_{chap_id}.json")
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(dataset, f, indent=2, ensure_ascii=False)
            print(f" Saved JSON -> {json_path}")

            # Export PDF
            pdf_bytes = dataset_to_pdf(dataset)
            pdf_path = os.path.join(BASE_DIR, f"Golden_Dataset_Chapter_{chap_id}.pdf")
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)
            print(f" Saved PDF -> {pdf_path}")

        except Exception as e:
            print(f" ERROR processing Chapter {chap_id}: {e}")
            import traceback
            traceback.print_exc()

    print("\n==================================================")
    print(" ALL GOLDEN DATASETS (1.1 to 1.5) GENERATED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
