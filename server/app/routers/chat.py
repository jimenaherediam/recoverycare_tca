import json
import asyncio
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Chatbot, Paciente
from ..schemas import ChatIn, ChatHistoryItem
from ..security import get_current_paciente
from ..services.ollama import stream_chat

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT_TEMPLATE = (
    "Eres un asistente de apoyo emocional para pacientes en recuperación de trastornos de la conducta "
    "alimentaria (TCA) y ansiedad. Te diriges a {nombre} con empatía, calidez y siempre en español. "
    "Ofreces escucha activa, técnicas de regulación emocional y psicoeducación breve. "
    "NO sustituyes a un profesional médico: si detectas crisis, autolesión o ideación suicida, "
    "recomienda contactar inmediatamente con su profesional o servicios de emergencia (112). "
    "Mensajes breves, cercanos y útiles."
)


@router.post("")
async def chat(
    payload: ChatIn,
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    # Guarda el último mensaje user
    if payload.messages and payload.messages[-1].role == "user":
        db.add(Chatbot(
            id_paciente=paciente.id_paciente,
            role="user",
            mensaje=payload.messages[-1].content,
        ))
        db.commit()

    nombre = paciente.usuario.nombre if paciente.usuario else "amig@"
    system = SYSTEM_PROMPT_TEMPLATE.format(nombre=nombre)
    msgs = [m.model_dump() for m in payload.messages]

    async def event_stream():
        full = []
        try:
            async for chunk in stream_chat(msgs, system=system):
                full.append(chunk)
                # SSE compatible con OpenAI delta format
                obj = {"choices": [{"delta": {"content": chunk}}]}
                yield f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)
            yield "data: [DONE]\n\n"
        finally:
            if full:
                db.add(Chatbot(
                    id_paciente=paciente.id_paciente,
                    role="assistant",
                    mensaje="".join(full),
                ))
                db.commit()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/history", response_model=list[ChatHistoryItem])
def chat_history(
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    return (
        db.query(Chatbot)
        .filter(Chatbot.id_paciente == paciente.id_paciente)
        .order_by(Chatbot.fecha.asc())
        .all()
    )
