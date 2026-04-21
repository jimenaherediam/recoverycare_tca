from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Comida, Cita, Alerta, AnalisisIA, Paciente
from ..schemas import DayHistoryOut, AlertaOut, MealRecordOut, AnalisisOut, CitaOut
from ..security import get_current_paciente
from .meals import _to_meal_out

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=DayHistoryOut)
def day_history(
    date_filter: date | None = Query(None, alias="date"),
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    d = date_filter or date.today()
    comidas = (
        db.query(Comida)
        .filter(Comida.paciente_id == paciente.id_paciente, func.date(Comida.fecha) == d)
        .order_by(Comida.fecha.asc())
        .all()
    )
    citas = (
        db.query(Cita)
        .filter(Cita.id_paciente == paciente.id_paciente, func.date(Cita.fecha) == d)
        .all()
    )
    # alertas vinculadas a análisis de comidas de ese día
    comida_ids = [c.id_comida for c in comidas]
    alertas = []
    if comida_ids:
        alertas = (
            db.query(Alerta)
            .join(AnalisisIA, AnalisisIA.id_analisis == Alerta.id_analisis)
            .filter(AnalisisIA.id_comida.in_(comida_ids))
            .all()
        )

    return DayHistoryOut(
        fecha=d,
        comidas=[_to_meal_out(c) for c in comidas],
        citas=[CitaOut.model_validate(c) for c in citas],
        alertas=[AlertaOut.model_validate(a) for a in alertas],
    )
