"""Quick sanity check for DeepSeek API."""
import asyncio, os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
from deepseek_client import get_client

async def test():
    client = get_client()
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    print(f"Testing model: {model}")
    resp = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Return only JSON."},
            {"role": "user", "content": 'Return this exact JSON: {"status": "ok", "model": "deepseek"}'}
        ],
        max_tokens=50,
        temperature=0,
        response_format={"type": "json_object"},
    )
    print("Response:", resp.choices[0].message.content)
    print("Finish reason:", resp.choices[0].finish_reason)
    print("✅ DeepSeek API working correctly!")

asyncio.run(test())
