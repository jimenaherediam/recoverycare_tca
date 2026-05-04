"""Endpoints exclusivos para profesionales: listado y detalle de pacientes, evolución, planes."""
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import (
    Alerta, AnalisisIA, Cita, Comida, NivelAlerta,
    PacienteProfesional, Paciente, PlanPersonalizado, Profesional, TipoPlan, Usuario, Chatbot,
)
from ..security import get_current_profesional
from ..schemas import ChatHistoryItem

router = APIRouter(prefix="/professional", tags=["professional"])


def _verify_patient_belongs(profesional_id: int, patient_id: int, db: Session):
    link = db.query(PacienteProfesional).filter(
        PacienteProfesional.profesional_id == profesional_id,
        PacienteProfesional.paciente_id == patient_id,
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")


# ── Estadísticas globales del profesional ────────────────────────────────────
@router.get("/stats")
def get_stats(
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    links = db.query(PacienteProfesional).filter(
        PacienteProfesional.profesional_id == profesional.id_profesional
    ).all()
    patient_ids = [l.paciente_id for l in links]

    if not patient_ids:
        return {"total_pacientes": 0, "alertas_pendientes": 0, "alertas_altas": 0, "citas_hoy": 0}

    alertas_pendientes = (
        db.query(Alerta).join(AnalisisIA).join(Comida)
        .filter(Comida.paciente_id.in_(patient_ids), Alerta.revisada == False)
        .count()
    )
    alertas_altas = (
        db.query(Alerta).join(AnalisisIA).join(Comida)
        .filter(
            Comida.paciente_id.in_(patient_ids),
            Alerta.nivel == NivelAlerta.ALTO,
            Alerta.revisada == False,
        )
        .count()
    )
    citas_hoy = (
        db.query(Cita)
        .filter(
            Cita.id_profesional == profesional.id_profesional,
            func.date(Cita.fecha) == date.today(),
        )
        .count()
    )

    return {
        "total_pacientes": len(patient_ids),
        "alertas_pendientes": alertas_pendientes,
        "alertas_altas": alertas_altas,
        "citas_hoy": citas_hoy,
    }


# ── Lista de pacientes con resumen ───────────────────────────────────────────
@router.get("/patients")
def list_patients(
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    links = db.query(PacienteProfesional).filter(
        PacienteProfesional.profesional_id == profesional.id_profesional
    ).all()

    result = []
    for link in links:
        pid = link.paciente_id
        paciente = db.query(Paciente).filter(Paciente.id_paciente == pid).first()
        usuario = db.query(Usuario).filter(Usuario.id_usuario == pid).first()
        if not paciente or not usuario:
            continue

        last_meal = (
            db.query(Comida)
            .filter(Comida.paciente_id == pid)
            .order_by(desc(Comida.fecha))
            .first()
        )
        alertas_sin_revisar = (
            db.query(Alerta).join(AnalisisIA).join(Comida)
            .filter(Comida.paciente_id == pid, Alerta.revisada == False)
            .count()
        )
        alertas_altas = (
            db.query(Alerta).join(AnalisisIA).join(Comida)
            .filter(
                Comida.paciente_id.in_([pid]),
                Alerta.nivel == NivelAlerta.ALTO,
                Alerta.revisada == False,
            )
            .count()
        )
        week_ago = datetime.utcnow() - timedelta(days=7)
        avg_anxiety = (
            db.query(func.avg(AnalisisIA.nivel_ansiedad))
            .join(Comida)
            .filter(Comida.paciente_id == pid, Comida.fecha >= week_ago)
            .scalar()
        )

        result.append({
            "id": pid,
            "nombre": usuario.nombre,
            "email": usuario.email or "",
            "edad": paciente.edad,
            "localidad": paciente.localidad,
            "fecha_diagnostico": paciente.fecha_diagnostico,
            "estancia_hospitalaria": paciente.estancia_hospitalaria,
            "alertas_sin_revisar": alertas_sin_revisar,
            "alertas_altas": alertas_altas,
            "ultima_comida": last_meal.fecha if last_meal else None,
            "ansiedad_media_semana": round(float(avg_anxiety), 1) if avg_anxiety else None,
        })

    return result


# ── Detalle de un paciente ────────────────────────────────────────────────────
@router.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    paciente = db.query(Paciente).filter(Paciente.id_paciente == patient_id).first()
    usuario = db.query(Usuario).filter(Usuario.id_usuario == patient_id).first()

    meals = (
        db.query(Comida)
        .filter(Comida.paciente_id == patient_id)
        .order_by(desc(Comida.fecha))
        .limit(30)
        .all()
    )

    meals_data = []
    for meal in meals:
        analysis = db.query(AnalisisIA).filter(AnalisisIA.id_comida == meal.id_comida).first()
        alerts = (
            db.query(Alerta).filter(Alerta.id_analisis == analysis.id_analisis).all()
            if analysis else []
        )
        meals_data.append({
            "id": meal.id_comida,
            "fecha": meal.fecha,
            "menu_descripcion": meal.menu_descripcion,
            "acompanado": meal.acompanado,
            "analisis": {
                "nivel_ansiedad": analysis.nivel_ansiedad,
                "cantidad_ingerida": analysis.cantidad_ingerida,
                "tipo_ingesta": analysis.tipo_ingesta.value if analysis.tipo_ingesta else None,
                "resultado": analysis.resultado,
                "camara_oculta": analysis.camara_oculta,
                "desconexion_camara": analysis.desconexion_camara,
            } if analysis else None,
            "alertas": [
                {
                    "id": a.id_alerta,
                    "nivel": a.nivel.value,
                    "tipo": a.tipo_alerta.value,
                    "descripcion": a.descripcion,
                    "revisada": a.revisada,
                    "fecha": a.fecha,
                }
                for a in alerts
            ],
        })

    return {
        "id": patient_id,
        "nombre": usuario.nombre,
        "email": usuario.email or "",
        "edad": paciente.edad,
        "localidad": paciente.localidad,
        "fecha_diagnostico": paciente.fecha_diagnostico,
        "estancia_hospitalaria": paciente.estancia_hospitalaria,
        "comidas": meals_data,
    }


# ── Evolución (datos para gráficas) ─────────────────────────────────────────
@router.get("/patients/{patient_id}/evolution")
def get_evolution(
    patient_id: int,
    days: int = 30,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    start = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(AnalisisIA, Comida)
        .join(Comida, AnalisisIA.id_comida == Comida.id_comida)
        .filter(Comida.paciente_id == patient_id, Comida.fecha >= start)
        .order_by(Comida.fecha)
        .all()
    )

    return [
        {
            "fecha": meal.fecha,
            "nivel_ansiedad": ai.nivel_ansiedad,
            "cantidad_ingerida": ai.cantidad_ingerida,
            "tipo_ingesta": ai.tipo_ingesta.value if ai.tipo_ingesta else None,
            "camara_oculta": ai.camara_oculta,
        }
        for ai, meal in rows
    ]


# ── Alertas de un paciente ───────────────────────────────────────────────────
@router.get("/patients/{patient_id}/alerts")
def get_patient_alerts(
    patient_id: int,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    rows = (
        db.query(Alerta, Comida)
        .join(AnalisisIA, Alerta.id_analisis == AnalisisIA.id_analisis)
        .join(Comida, AnalisisIA.id_comida == Comida.id_comida)
        .filter(Comida.paciente_id == patient_id)
        .order_by(desc(Alerta.fecha))
        .all()
    )

    return [
        {
            "id": a.id_alerta,
            "nivel": a.nivel.value,
            "tipo": a.tipo_alerta.value,
            "descripcion": a.descripcion,
            "revisada": a.revisada,
            "fecha": a.fecha,
            "comida": {"id": c.id_comida, "fecha": c.fecha, "menu": c.menu_descripcion},
        }
        for a, c in rows
    ]


# ── Planes de un paciente ────────────────────────────────────────────────────
@router.get("/patients/{patient_id}/plans")
def get_patient_plans(
    patient_id: int,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    plans = (
        db.query(PlanPersonalizado)
        .filter(PlanPersonalizado.id_paciente == patient_id)
        .order_by(desc(PlanPersonalizado.fecha_inicio))
        .all()
    )
    return [
        {
            "id": p.id_plan,
            "tipo": p.tipo.value,
            "descripcion": p.descripcion,
            "contenido": p.contenido,
            "fecha_inicio": p.fecha_inicio,
            "activo": p.activo,
        }
        for p in plans
    ]


class PlanIn(BaseModel):
    tipo: str = "OTROS"
    descripcion: str = ""
    contenido: str


@router.post("/patients/{patient_id}/plans")
def create_plan(
    patient_id: int,
    body: PlanIn,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    plan = PlanPersonalizado(
        id_paciente=patient_id,
        id_profesional=profesional.id_profesional,
        tipo=TipoPlan(body.tipo),
        descripcion=body.descripcion,
        contenido=body.contenido,
        fecha_inicio=date.today(),
        activo=True,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id_plan, "message": "Plan creado correctamente"}


@router.patch("/patients/{patient_id}/plans/{plan_id}/toggle")
def toggle_plan(
    patient_id: int,
    plan_id: int,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)
    plan = db.query(PlanPersonalizado).filter(
        PlanPersonalizado.id_plan == plan_id,
        PlanPersonalizado.id_paciente == patient_id,
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    plan.activo = not plan.activo
    db.commit()
    return {"activo": plan.activo}


# ── Citas de un paciente ─────────────────────────────────────────────────────
@router.get("/patients/{patient_id}/appointments")
def get_patient_appointments(
    patient_id: int,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, patient_id, db)

    citas = (
        db.query(Cita)
        .filter(Cita.id_paciente == patient_id, Cita.id_profesional == profesional.id_profesional)
        .order_by(desc(Cita.fecha))
        .all()
    )
    return [{"id": c.id_cita, "fecha": c.fecha, "motivo": c.motivo} for c in citas]


class CitaIn(BaseModel):
    patient_id: int
    fecha: datetime
    motivo: Optional[str] = None


@router.post("/appointments")
def create_appointment(
    body: CitaIn,
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    _verify_patient_belongs(profesional.id_profesional, body.patient_id, db)

    cita = Cita(
        id_paciente=body.patient_id,
        id_profesional=profesional.id_profesional,
        fecha=body.fecha,
        motivo=body.motivo,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return {"id": cita.id_cita, "fecha": cita.fecha, "motivo": cita.motivo}


@router.get("/appointments")
def list_appointments(
    profesional: Profesional = Depends(get_current_profesional),
    db: Session = Depends(get_db),
):
    citas = (
        db.query(Cita, Usuario)
        .join(Usuario, Cita.id_paciente == Usuario.id_usuario)
        .filter(Cita.id_profesional == profesional.id_profesional)
        .order_by(Cita.fecha)
        .all()
    )
    return [
        {
            "id": c.id_cita,
            "fecha": c.fecha,
            "motivo": c.motivo,
            "paciente_id": c.id_paciente,
            "paciente_nombre": u.nombre,
        }
        for c, u in citas
    ]

@router.get("/patients/{id_paciente}/chat", response_model=list[ChatHistoryItem])
def get_patient_chat_history(
    id_paciente: int,
    db: Session = Depends(get_db),
    profesional: Profesional = Depends(get_current_profesional),
):
    # 1. Verificar relación Paciente-Profesional
    vinculo = db.query(PacienteProfesional).filter(
        PacienteProfesional.profesional_id == profesional.id_profesional,
        PacienteProfesional.paciente_id == id_paciente
    ).first()

    if not vinculo:
        raise HTTPException(status_code=403, detail="No autorizado para ver este paciente")

    # 2. Devolver mensajes ordenados
    mensajes = (
        db.query(Chatbot)
        .filter(Chatbot.id_paciente == id_paciente)
        .order_by(Chatbot.fecha.asc())
        .all()
    )
    
    return mensajes
