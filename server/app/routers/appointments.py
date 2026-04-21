from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Cita, Paciente, Profesional
from ..schemas import CitaIn, CitaOut
from ..security import get_current_user, get_current_paciente, get_current_profesional
from ..models import Usuario, TipoUsuario

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[CitaOut])
def list_appointments(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    if user.tipo == TipoUsuario.PACIENTE:
        return db.query(Cita).filter(Cita.id_paciente == user.id_usuario).order_by(Cita.fecha.asc()).all()
    if user.tipo == TipoUsuario.PROFESIONAL:
        return db.query(Cita).filter(Cita.id_profesional == user.id_usuario).order_by(Cita.fecha.asc()).all()
    raise HTTPException(status_code=403, detail="Rol no autorizado")


@router.post("", response_model=CitaOut)
def create_appointment(
    payload: CitaIn,
    db: Session = Depends(get_db),
    prof: Profesional = Depends(get_current_profesional),
):
    cita = Cita(
        fecha=payload.fecha,
        motivo=payload.motivo,
        id_paciente=payload.id_paciente,
        id_profesional=prof.id_profesional,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return cita
