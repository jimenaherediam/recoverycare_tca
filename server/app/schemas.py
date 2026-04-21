from datetime import datetime, date
from typing import Any, Optional, List
from pydantic import BaseModel, Field
from .models import TipoIngesta, NivelAlerta, TipoAlerta, TipoPlan, Especialidad, AutorCuestionario


# --- Auth ---
class RegisterPaciente(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    dni: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=4, max_length=128)
    edad: Optional[int] = None
    localidad: Optional[str] = None
    codigo_profesional: Optional[str] = None
    email: Optional[str] = None


class LoginPaciente(BaseModel):
    dni: str
    password: str


class LoginProfesional(BaseModel):
    email: str
    password: str
    codigo_profesional: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class PacienteOut(BaseModel):
    id_paciente: int
    nombre: str
    dni: str
    edad: Optional[int]
    localidad: Optional[str]
    codigo_profesional: Optional[str]

    class Config:
        from_attributes = True


# --- Meals ---
class MealRecordIn(BaseModel):
    tipo_ingesta: TipoIngesta = TipoIngesta.OTRO
    menu_descripcion: Optional[str] = None
    cantidad_ingerida: Optional[str] = None
    acompanado: bool = False
    autor: AutorCuestionario = AutorCuestionario.PACIENTE
    nivel_ansiedad: Optional[float] = None  # 0..10 self-report (opcional)
    camara_oculta: bool = False
    desconexion_camara: bool = False
    respuestas: dict = Field(default_factory=dict)  # JSON libre del cuestionario


class AlertaOut(BaseModel):
    id_alerta: int
    descripcion: Optional[str]
    nivel: NivelAlerta
    tipo_alerta: TipoAlerta
    fecha: datetime
    revisada: bool

    class Config:
        from_attributes = True


class AnalisisOut(BaseModel):
    id_analisis: int
    nivel_ansiedad: float
    resumen: Optional[str]
    alertas: List[AlertaOut]

    class Config:
        from_attributes = True


class MealRecordOut(BaseModel):
    id_comida: int
    fecha: datetime
    menu_descripcion: Optional[str]
    acompanado: bool
    analisis: Optional[AnalisisOut]

    class Config:
        from_attributes = True


# --- Chat ---
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    messages: List[ChatMessage]


class ChatHistoryItem(BaseModel):
    id_chatbot: int
    role: str
    mensaje: str
    fecha: datetime

    class Config:
        from_attributes = True


# --- Appointments ---
class CitaIn(BaseModel):
    fecha: datetime
    motivo: Optional[str] = None
    id_paciente: int


class CitaOut(BaseModel):
    id_cita: int
    fecha: datetime
    motivo: Optional[str]
    id_paciente: int
    id_profesional: Optional[int]

    class Config:
        from_attributes = True


# --- Plans ---
class PlanOut(BaseModel):
    id_plan: int
    tipo: TipoPlan
    descripcion: Optional[str]
    contenido: str
    fecha_inicio: date
    activo: bool

    class Config:
        from_attributes = True


# --- Day history ---
class DayHistoryOut(BaseModel):
    fecha: date
    comidas: List[MealRecordOut]
    citas: List[CitaOut]
    alertas: List[AlertaOut]
