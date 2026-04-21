from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alerta, AnalisisIA, Comida, Paciente, PacienteProfesional, Usuario, TipoUsuario
from ..schemas import AlertaOut
from ..security import get_current_user, get_current_profesional

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertaOut])
def list_alerts(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    if user.tipo == TipoUsuario.PACIENTE:
        return (
            db.query(Alerta)
            .join(AnalisisIA).join(Comida)
            .filter(Comida.paciente_id == user.id_usuario)
            .order_by(Alerta.fecha.desc())
            .all()
        )
    if user.tipo == TipoUsuario.PROFESIONAL:
        pac_ids = [r.paciente_id for r in db.query(PacienteProfesional).filter(PacienteProfesional.profesional_id == user.id_usuario).all()]
        if not pac_ids:
            return []
        return (
            db.query(Alerta)
            .join(AnalisisIA).join(Comida)
            .filter(Comida.paciente_id.in_(pac_ids))
            .order_by(Alerta.fecha.desc())
            .all()
        )
    raise HTTPException(status_code=403, detail="Rol no autorizado")


@router.patch("/{alerta_id}", response_model=AlertaOut)
def mark_reviewed(
    alerta_id: int,
    db: Session = Depends(get_db),
    prof = Depends(get_current_profesional),
):
    a = db.query(Alerta).filter(Alerta.id_alerta == alerta_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    a.revisada = True
    db.commit()
    db.refresh(a)
    return a
