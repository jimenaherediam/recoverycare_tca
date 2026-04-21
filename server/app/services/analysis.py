"""Heuristic + LLM analysis for meal records."""
from typing import List, Tuple, Optional
from ..models import (
    AnalisisIA, Alerta, NivelAlerta, TipoAlerta, TipoIngesta, Comida
)
from ..schemas import MealRecordIn
from sqlalchemy.orm import Session
from .ollama import generate_text
from ..config import settings


CANTIDADES_BAJAS = {"poco", "muy poco", "nada", "casi nada", "1/4", "un cuarto"}


def _heuristic(payload: MealRecordIn) -> Tuple[float, List[Tuple[TipoAlerta, NivelAlerta, str]]]:
    """Returns (nivel_ansiedad_estimado, alertas)."""
    ans = float(payload.nivel_ansiedad or 0.0)
    alertas: List[Tuple[TipoAlerta, NivelAlerta, str]] = []

    # Inferir ansiedad de palabras clave si no la dieron
    raw_text = " ".join(str(v) for v in payload.respuestas.values()).lower()
    if not payload.nivel_ansiedad:
        if any(w in raw_text for w in ["muy ansiosa", "muy mal", "horrible", "no puedo"]):
            ans = 8.5
        elif any(w in raw_text for w in ["ansiosa", "nerviosa", "mal", "difícil", "dificil"]):
            ans = 6.0
        elif any(w in raw_text for w in ["bien", "tranquila", "normal", "ok"]):
            ans = 2.5

    if ans >= 7:
        alertas.append((TipoAlerta.ANSIEDAD_ELEVADA, NivelAlerta.ALTO, f"Nivel de ansiedad alto ({ans:.1f}/10)"))
    elif ans >= 5:
        alertas.append((TipoAlerta.ANSIEDAD_ELEVADA, NivelAlerta.MEDIO, f"Nivel de ansiedad moderado ({ans:.1f}/10)"))

    cant = (payload.cantidad_ingerida or "").strip().lower()
    if cant in CANTIDADES_BAJAS or any(w in cant for w in ["poco", "nada"]):
        alertas.append((TipoAlerta.CANTIDAD_INADECUADA, NivelAlerta.MEDIO, "Cantidad ingerida baja"))

    if payload.camara_oculta:
        alertas.append((TipoAlerta.OCULTACION_CAMARA, NivelAlerta.ALTO, "Cámara ocultada durante la comida"))
    if payload.desconexion_camara:
        alertas.append((TipoAlerta.DESCONEXION_CAMARA, NivelAlerta.ALTO, "Desconexión de cámara durante la comida"))

    return ans, alertas


async def _llm_summary(payload: MealRecordIn) -> Optional[str]:
    if not settings.ENABLE_LLM_ANALYSIS:
        return None
    try:
        prompt = (
            "Eres un asistente clínico para TCA. Analiza brevemente este registro de comida del paciente "
            "y devuelve UN ÚNICO PÁRRAFO (máx 60 palabras) con tono empático y profesional. "
            "Detecta señales sutiles de ansiedad o evitación si las hay.\n\n"
            f"Tipo: {payload.tipo_ingesta.value}\n"
            f"Menú: {payload.menu_descripcion or 'no indicado'}\n"
            f"Cantidad ingerida: {payload.cantidad_ingerida or 'no indicada'}\n"
            f"Acompañado: {'sí' if payload.acompanado else 'no'}\n"
            f"Ansiedad autoreportada: {payload.nivel_ansiedad if payload.nivel_ansiedad is not None else 'no indicada'}\n"
            f"Respuestas del cuestionario: {payload.respuestas}\n"
        )
        return await generate_text(prompt)
    except Exception as e:
        print("LLM summary failed:", e)
        return None


async def analyze_meal(db: Session, comida: Comida, payload: MealRecordIn) -> AnalisisIA:
    ans, alertas_calc = _heuristic(payload)
    resumen = await _llm_summary(payload)

    analisis = AnalisisIA(
        id_comida=comida.id_comida,
        nivel_ansiedad=ans,
        cantidad_ingerida=payload.cantidad_ingerida or "",
        tipo_ingesta=payload.tipo_ingesta,
        camara_oculta=payload.camara_oculta,
        desconexion_camara=payload.desconexion_camara,
        conversacion_sensible=False,
        resultado=resumen,
    )
    db.add(analisis)
    db.flush()

    for tipo, nivel, desc in alertas_calc:
        db.add(Alerta(
            id_analisis=analisis.id_analisis,
            descripcion=desc,
            nivel=nivel,
            tipo_alerta=tipo,
            revisada=False,
        ))
    db.flush()
    return analisis
