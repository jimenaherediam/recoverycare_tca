from datetime import datetime, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Comida, Cuestionario, Paciente, AnalisisIA, Alerta
from ..schemas import MealRecordIn, MealRecordOut, AnalisisOut, AlertaOut
from ..security import get_current_paciente
from ..services.analysis import analyze_meal
import json

router = APIRouter(prefix="/meals", tags=["meals"])


def _to_meal_out(c: Comida) -> MealRecordOut:
    a = c.analisis[0] if c.analisis else None
    analisis_out = None
    if a:
        analisis_out = AnalisisOut(
            id_analisis=a.id_analisis,
            nivel_ansiedad=a.nivel_ansiedad,
            resumen=a.resultado,
            alertas=[AlertaOut.model_validate(x) for x in a.alertas],
        )
    return MealRecordOut(
        id_comida=c.id_comida,
        fecha=c.fecha,
        menu_descripcion=c.menu_descripcion,
        acompanado=c.acompanado,
        analisis=analisis_out,
    )




@router.post("/record", response_model=MealRecordOut)
async def record_meal(
    payload: MealRecordIn,
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    # 1. Guardar la comida
    comida = Comida(
        menu_descripcion=payload.menu_descripcion,
        acompanado=payload.acompanado,
        paciente_id=paciente.id_paciente,
        fecha=datetime.utcnow(),
    )
    db.add(comida)
    db.flush()

    # 2. Guardar el Cuestionario convertido a String
    db.add(Cuestionario(
        comida_id=comida.id_comida,
        autor=payload.autor,
        # Convertimos el diccionario a un string JSON:
        preguntas_respuestas=payload.respuestas, 
    ))

    # 3. Lanzar el Análisis de IA
    await analyze_meal(db, comida, payload)
    
    db.commit()
    db.refresh(comida)
    return _to_meal_out(comida)


@router.get("/", response_model=list[MealRecordOut])
def list_meals(
    date_filter: date | None = Query(None, alias="date"),
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    q = db.query(Comida).filter(Comida.paciente_id == paciente.id_paciente)
    if date_filter:
        q = q.filter(func.date(Comida.fecha) == date_filter)
    comidas = q.order_by(Comida.fecha.desc()).all()
    return [_to_meal_out(c) for c in comidas]
