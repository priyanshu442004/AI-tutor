"""
DeepSeek API Client — GoldenGen AI
Generates ground-truth Golden Datasets strictly following AI_Tutor_Agent_System_Prompt.md
"""
import os
import json
import re
from datetime import datetime, timezone
from openai import AsyncOpenAI
from dotenv import load_dotenv
from prompts import SYSTEM_PROMPT

load_dotenv()


def get_client() -> AsyncOpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY missing from environment")
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


def safe_json_parse(raw: str) -> dict:
    """Parse JSON with bracket-balancing repair for truncated responses."""
    cleaned = re.sub(r'^```(?:json)?\s*', '', raw.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'```\s*$', '', cleaned.strip()).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    work = cleaned.rstrip().rstrip(',')
    in_str = False
    esc = False
    opens = []
    for ch in work:
        if esc:
            esc = False
            continue
        if ch == '\\' and in_str:
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch in ('{', '['):
            opens.append(ch)
        elif ch == '}' and opens and opens[-1] == '{':
            opens.pop()
        elif ch == ']' and opens and opens[-1] == '[':
            opens.pop()

    closers = {'[': ']', '{': '}'}
    for bracket in reversed(opens):
        work += closers[bracket]

    try:
        return json.loads(work)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON repair failed: {e}")


async def generate_golden_dataset(pdf_text: str, pdf_metadata: dict) -> dict:
    """
    Generates a ground-truth Golden Dataset from uploaded PDF text using DeepSeek API
    strictly adhering to AI_Tutor_Agent_System_Prompt.md structure and writing rules.
    """
    client = get_client()
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    temperature = float(os.getenv("TEMPERATURE", "0.2"))
    max_tokens = int(os.getenv("MAX_TOKENS", "8000"))

    # Prepare prompt
    book_name = pdf_metadata.get("book_name", "BASIC CONCEPTS OF COMPANY & ITS STRUCTURE")
    title_fallback = pdf_metadata.get("title") or "Chapter Concepts"

    user_prompt = f"""You are generating an AI Tutor Golden Dataset for the following source text.

Book Name: {book_name}
Extracted Document Title/Topic: {title_fallback}

Source PDF Content:
---
{pdf_text[:35000]}
---

First, infer the exact Book Name, Chapter Name, Chapter Topic Name, and Sub Topic Names from the text if not explicitly stated above.
Then, generate the COMPLETE Golden Dataset following every mandatory writing rule, section label (A-G for every sub-topic), Misconceptions format, Assessment format (1. MCQ, 2. Short Answer, 3. True/False), Short Note, and Long Note.

Return ONLY the valid JSON object.
"""

    print("[GoldenGen] Calling DeepSeek API with system prompt...")
    resp = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        response_format={"type": "json_object"},
    )

    raw_content = resp.choices[0].message.content.strip()
    dataset = safe_json_parse(raw_content)

    # Normalize wrapper keys if model wrapped output
    for key in ["dataset", "golden_dataset", "data"]:
        if key in dataset and isinstance(dataset[key], dict) and ("sub_topics" in dataset[key] or "metadata" in dataset[key] or "subtopics" in dataset[key]):
            dataset = dataset[key]
            break

    return dataset
