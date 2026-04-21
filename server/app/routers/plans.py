from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PlanPersonalizado, Paciente
from ..schemas import PlanOut
from ..security import get_current_paciente

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("/today", response_model=list[PlanOut])
def plans_today(
    db: Session = Depends(get_db),
    paciente: Paciente = Depends(get_current_paciente),
):
    return (
        db.query(PlanPersonalizado)
        .filter(PlanPersonalizado.id_paciente == paciente.id_paciente, PlanPersonalizado.activo == True)
        .all()
    )
