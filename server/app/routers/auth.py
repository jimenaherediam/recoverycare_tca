from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Usuario, Paciente, Profesional, TipoUsuario
from ..schemas import RegisterPaciente, LoginPaciente, LoginProfesional, TokenOut, PacienteOut
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_to_dict(u: Usuario, p: Paciente | None = None, prof: Profesional | None = None) -> dict:
    base = {
        "id": u.id_usuario,
        "nombre": u.nombre,
        "email": u.email,
        "dni": u.dni,
        "tipo": u.tipo.value if hasattr(u.tipo, "value") else u.tipo,
    }
    if p:
        base.update({
            "edad": p.edad,
            "localidad": p.localidad,
            "codigo_profesional": p.codigo_profesional,
        })
    if prof:
        base.update({
            "especialidad": prof.especialidad.value if prof.especialidad else None,
            "codigo_profesional": prof.codigo_profesional,
        })
    return base


@router.post("/register", response_model=TokenOut)
def register_paciente(payload: RegisterPaciente, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.dni == payload.dni).first():
        raise HTTPException(status_code=409, detail="DNI ya registrado")

    user = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        dni=payload.dni.strip().upper(),
        password=hash_password(payload.password),
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
    db.commit()
    db.refresh(user)
    db.refresh(paciente)

    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_to_dict(user, paciente))


@router.post("/login", response_model=TokenOut)
def login_paciente(payload: LoginPaciente, db: Session = Depends(get_db)):
    dni = payload.dni.strip().upper()
    user = db.query(Usuario).filter(Usuario.dni == dni, Usuario.tipo == TipoUsuario.PACIENTE).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="DNI o contraseña incorrectos")
    paciente = db.query(Paciente).filter(Paciente.id_paciente == user.id_usuario).first()
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_to_dict(user, paciente))


@router.post("/professional/login", response_model=TokenOut)
def login_profesional(payload: LoginProfesional, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == payload.email, Usuario.tipo == TipoUsuario.PROFESIONAL).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    prof = db.query(Profesional).filter(Profesional.id_profesional == user.id_usuario).first()
    if payload.codigo_profesional and prof and prof.codigo_profesional != payload.codigo_profesional:
        raise HTTPException(status_code=401, detail="Código profesional incorrecto")
    token = create_access_token(user.id_usuario, user.tipo.value)
    return TokenOut(access_token=token, user=_user_to_dict(user, prof=prof))


@router.get("/me")
def me(user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Paciente).filter(Paciente.id_paciente == user.id_usuario).first()
    prof = db.query(Profesional).filter(Profesional.id_profesional == user.id_usuario).first()
    return _user_to_dict(user, p, prof)
