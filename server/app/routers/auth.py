from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Usuario, Paciente, Profesional, TipoUsuario, PacienteProfesional
from ..schemas import RegisterPaciente, LoginPaciente, LoginProfesional, TokenOut, PacienteOut
from ..security import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterProfesional(BaseModel):
    nombre: str
    email: str
    password: str
    especialidad: Optional[str] = None
    codigo_profesional: Optional[str] = None


def _user_dict(u: Usuario, extra: dict = {}) -> dict:
    base = {
        "id": u.id_usuario,
        "nombre": u.nombre,
        "email": u.email,
        "dni": u.dni,
        "tipo": u.tipo.value if hasattr(u.tipo, "value") else u.tipo,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }
    base.update(extra)
    return base


#  Paciente: registro 
@router.post("/register", response_model=TokenOut)
def register_paciente(payload: RegisterPaciente, db: Session = Depends(get_db)):
    if payload.dni and db.query(Usuario).filter(Usuario.dni == payload.dni).first():
        raise HTTPException(status_code=409, detail="DNI ya registrado")

    user = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        dni=payload.dni.strip().upper() if payload.dni else None,
        password=payload.password,
        tipo=TipoUsuario.PACIENTE,
    )
    db.add(user)
    db.flush()

    paciente = Paciente(
        id_paciente=user.id_usuario,
        edad=payload.edad,
        localidad=payload.localidad,
        codigo_profesional=payload.codigo_profesional,
    )
    db.add(paciente)
    db.flush()

    # Auto-vincular al profesional si se indicó código
    if payload.codigo_profesional:
        # Buscar el profesional por su codigo_profesional en la tabla profesional
        row = db.execute(
            text("SELECT id_profesional FROM profesional WHERE codigo_profesional = :code"),
            {"code": payload.codigo_profesional}
        ).fetchone()
        prof_id = row[0] if row else None

        if prof_id:
            # Verificar que no exista ya el vínculo
            existing = db.execute(
                text("SELECT 1 FROM paciente_profesional WHERE paciente_id = :pid AND profesional_id = :prid"),
                {"pid": user.id_usuario, "prid": prof_id}
            ).fetchone()
            if not existing:
                next_id = (db.execute(text("SELECT MAX(id) FROM paciente_profesional")).fetchone()[0] or 0) + 1
                db.execute(
                    text("INSERT INTO paciente_profesional (id, paciente_id, profesional_id) VALUES (:id, :pid, :prid)"),
                    {"id": next_id, "pid": user.id_usuario, "prid": prof_id}
                )

    db.commit()
    db.refresh(user)
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_dict(user))


#  Paciente: login
@router.post("/login", response_model=TokenOut)
def login_paciente(payload: LoginPaciente, db: Session = Depends(get_db)):
    dni = payload.dni.strip().upper()
    user = db.query(Usuario).filter(Usuario.dni == dni, Usuario.tipo == TipoUsuario.PACIENTE).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="DNI o contraseña incorrectos")
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_dict(user))



#  Profesional: registro 
@router.post("/professional/register", response_model=TokenOut)
def register_profesional(payload: RegisterProfesional, db: Session = Depends(get_db)):
    # 1. Comprobar si el email ya existe
    if db.query(Usuario).filter(Usuario.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email ya registrado")
 
    # 2. Crear el Usuario general
    user = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        password=payload.password,
        tipo=TipoUsuario.PROFESIONAL,
    )
    db.add(user)
    db.flush()
 
    # Generar un código único basado en el ID del usuario
    codigo_profesional = f"PRO-{user.id_usuario}"
 
    # 3. Crear el registro específico del Profesional
    db.execute(
        text("""
            INSERT INTO profesional (id_profesional, especialidad, codigo_profesional)
            VALUES (:id, :especialidad, :codigo)
        """),
        {"id": user.id_usuario, "especialidad": payload.especialidad, "codigo": codigo_profesional}
    )
    db.commit()
    db.refresh(user)
 
    # 4. Preparar respuesta con datos del profesional
    extra = {
        "especialidad": payload.especialidad,
        "codigo_profesional": codigo_profesional
    }
 
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_dict(user, extra=extra))
 
 
#  Profesional: login 
@router.post("/professional/login", response_model=TokenOut)
def login_profesional(payload: LoginProfesional, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == payload.email, Usuario.tipo == TipoUsuario.PROFESIONAL).first()
    
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    prof = db.query(Profesional).filter(Profesional.id_profesional == user.id_usuario).first()
    
    # Validación del código profesional durante el login (si se proporciona)
    if payload.codigo_profesional and prof and prof.codigo_profesional != payload.codigo_profesional:
        raise HTTPException(status_code=401, detail="Código profesional incorrecto")
    
    # Preparar datos extra del profesional
    extra = {}
    if prof:
        extra = {
            "especialidad": prof.especialidad,
            "codigo_profesional": prof.codigo_profesional
        }
    
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_dict(user, extra=extra))
 
#  Me 
@router.get("/me")
def me(user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    extra = {}
    if user.tipo == TipoUsuario.PROFESIONAL:
        row = db.execute(
            text("SELECT especialidad, codigo_profesional FROM profesional WHERE id_profesional = :id"),
            {"id": user.id_usuario}
        ).fetchone()
        if row:
            extra = {"especialidad": row[0], "codigo_profesional": row[1]}
    return _user_dict(user, extra)
