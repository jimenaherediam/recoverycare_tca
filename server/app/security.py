from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import Usuario, Paciente, Profesional, TipoUsuario


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)


def hash_password(p: str) -> str:
    return pwd_context.hash(p)


def verify_password(p: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(p, hashed)
    except Exception:
        return False


def create_access_token(sub: int, tipo: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(sub), "tipo": tipo, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    if not creds:
        raise HTTPException(status_code=401, detail="Falta cabecera Authorization")
    payload = _decode(creds.credentials)
    user_id = int(payload.get("sub"))
    user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def get_current_paciente(user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)) -> Paciente:
    if user.tipo != TipoUsuario.PACIENTE:
        raise HTTPException(status_code=403, detail="Requiere rol PACIENTE")
    p = db.query(Paciente).filter(Paciente.id_paciente == user.id_usuario).first()
    if not p:
        raise HTTPException(status_code=404, detail="Perfil de paciente no encontrado")
    return p


def get_current_profesional(user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)) -> Profesional:
    if user.tipo != TipoUsuario.PROFESIONAL:
        raise HTTPException(status_code=403, detail="Requiere rol PROFESIONAL")
    p = db.query(Profesional).filter(Profesional.id_profesional == user.id_usuario).first()
    if not p:
        raise HTTPException(status_code=404, detail="Perfil profesional no encontrado")
    return p
