
import json
import httpx
from typing import AsyncIterator, List, Dict
from ..config import settings


async def generate_text(prompt: str, system: str | None = None) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{settings.OLLAMA_URL}/api/chat",
            json={"model": settings.OLLAMA_MODEL, "messages": messages, "stream": False},
        )
        r.raise_for_status()
        data = r.json()
        return (data.get("message") or {}).get("content", "")


async def stream_chat(messages: List[Dict[str, str]], system: str | None = None) -> AsyncIterator[str]:
    full_messages = []
    if system:
        full_messages.append({"role": "system", "content": system})
    full_messages.extend(messages)

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            f"{settings.OLLAMA_URL}/api/chat",
            json={"model": settings.OLLAMA_MODEL, "messages": full_messages, "stream": True},
        ) as r:
            r.raise_for_status()
            async for line in r.aiter_lines():
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = obj.get("message") or {}
                chunk = msg.get("content")
                if chunk:
                    yield chunk
                if obj.get("done"):
                    break
