"""SQLAlchemy ORM mirroring the recoverycare MariaDB schema (with small pragmatic adjustments)."""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Float, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
import enum
from .database import Base


# --- ENUMs ---
class TipoUsuario(str, enum.Enum):
    PACIENTE = "PACIENTE"
    PROFESIONAL = "PROFESIONAL"
    ADMIN = "ADMIN"
    VOLUNTARIO = "VOLUNTARIO"


class Localidad(str, enum.Enum):
    GALICIA = "GALICIA"
    ASTURIAS = "ASTURIAS"
    CANTABRIA = "CANTABRIA"
    PAIS_VASCO = "PAIS VASCO"
    NAVARRA = "NAVARRA"
    ARAGON = "ARAGÓN"
    CATALUNA = "CATALUÑA"
    CASTILLA_LEON = "CASTILLA Y LEÓN"
    LA_RIOJA = "LA RIOJA"
    VALENCIA = "COMUNIDAD VALENCIANA"
    MADRID = "MADRID"
    EXTREMADURA = "EXTREMADURA"
    CASTILLA_MANCHA = "CASTILLA LA MANCHA"
    MURCIA = "MURCIA"
    ANDALUCIA = "ANDALUCÍA"
    BALEARES = "ISLAS BALEARES"
    CANARIAS = "ISLAS CANARIAS"
    CEUTA = "CEUTA"
    MELILLA = "MELILLA"


class Especialidad(str, enum.Enum):
    PSIQUIATRA = "PSIQUIATRA"
    PSICOLOGO = "PSICÓLOGO"
    NUTRICIONISTA = "NUTRICIONISTA"


class TipoIngesta(str, enum.Enum):
    DESAYUNO = "DESAYUNO"
    COMIDA = "COMIDA"
    CENA = "CENA"
    OTRO = "OTRO"


class NivelAlerta(str, enum.Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"


class TipoAlerta(str, enum.Enum):
    TIEMPO_INADECUADO = "TIEMPO_INADECUADO"
    ANSIEDAD_ELEVADA = "ANSIEDAD_ELEVADA"
    DESCONEXION_CAMARA = "DESCONEXION_CAMARA"
    OCULTACION_CAMARA = "OCULTACION_CAMARA"
    CANTIDAD_INADECUADA = "CANTIDAD_INADECUADA"


class TipoPlan(str, enum.Enum):
    MENU = "MENU"
    MEDICAMENTOS = "MEDICAMENTOS"
    EJERCICIOS = "EJERCICIOS"
    OTROS = "OTROS"


class AutorCuestionario(str, enum.Enum):
    PACIENTE = "PACIENTE"
    ACOMPANANTE = "ACOMPAÑANTE"


# --- Tablas ---
class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    dni = Column(String(20), unique=True, nullable=True, index=True)
    password = Column(String(255), nullable=False)  # bcrypt hash
    tipo = Column(Enum(TipoUsuario), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Paciente(Base):
    __tablename__ = "paciente"
    id_paciente = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), primary_key=True)
    edad = Column(Integer, nullable=True)
    fecha_diagnostico = Column(Date, nullable=True)
    estancia_hospitalaria = Column(Boolean, default=False)
    localidad = Column(String(50), nullable=True)
    codigo_profesional = Column(String(50), nullable=True)

    usuario = relationship("Usuario", backref="paciente_data")
    comidas = relationship("Comida", back_populates="paciente", cascade="all, delete")
    chats = relationship("Chatbot", back_populates="paciente", cascade="all, delete")


class Profesional(Base):
    __tablename__ = "profesional"
    id_profesional = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), primary_key=True)
    especialidad = Column(String(50), nullable=True)
    codigo_profesional = Column(String(50), unique=True, nullable=True, index=True)

    usuario = relationship("Usuario", backref="profesional_data")


class PacienteProfesional(Base):
    __tablename__ = "paciente_profesional"
    id = Column(Integer, primary_key=True, autoincrement=True)
    profesional_id = Column(Integer, ForeignKey("profesional.id_profesional", ondelete="CASCADE"), nullable=False)
    paciente_id = Column(Integer, ForeignKey("paciente.id_paciente", ondelete="CASCADE"), nullable=False)


class Comida(Base):
    __tablename__ = "comida"
    id_comida = Column(Integer, primary_key=True, autoincrement=True)
    menu_descripcion = Column(String(200), nullable=True)
    acompanado = Column(Boolean, default=False)
    paciente_id = Column(Integer, ForeignKey("paciente.id_paciente", ondelete="CASCADE"), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    paciente = relationship("Paciente", back_populates="comidas")
    cuestionarios = relationship("Cuestionario", back_populates="comida", cascade="all, delete")
    analisis = relationship("AnalisisIA", back_populates="comida", cascade="all, delete")


class Cuestionario(Base):
    __tablename__ = "cuestionario"
    id = Column(Integer, primary_key=True, autoincrement=True)
    comida_id = Column(Integer, ForeignKey("comida.id_comida", ondelete="CASCADE"), nullable=False)
    autor = Column(Enum(AutorCuestionario), nullable=False, default=AutorCuestionario.PACIENTE)
    preguntas_respuestas = Column(JSON, nullable=False)

    comida = relationship("Comida", back_populates="cuestionarios")


class Chatbot(Base):
    __tablename__ = "chatbot"
    id_chatbot = Column(Integer, primary_key=True, autoincrement=True)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" | "assistant"
    mensaje = Column(Text, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    paciente = relationship("Paciente", back_populates="chats")


class AnalisisIA(Base):
    __tablename__ = "analisisia"
    id_analisis = Column(Integer, primary_key=True, autoincrement=True)
    id_comida = Column(Integer, ForeignKey("comida.id_comida", ondelete="CASCADE"), nullable=True)
    id_chat = Column(Integer, ForeignKey("chatbot.id_chatbot"), nullable=True)
    resultado = Column(Text, nullable=True)
    fecha = Column(Date, default=date.today)
    nivel_ansiedad = Column(Float, default=0.0)
    cantidad_ingerida = Column(String(50), nullable=True)
    tipo_ingesta = Column(Enum(TipoIngesta), default=TipoIngesta.OTRO)
    camara_oculta = Column(Boolean, default=False)
    desconexion_camara = Column(Boolean, default=False)
    conversacion_sensible = Column(Boolean, default=False)

    comida = relationship("Comida", back_populates="analisis")
    alertas = relationship("Alerta", back_populates="analisis", cascade="all, delete")


class Alerta(Base):
    __tablename__ = "alerta"
    id_alerta = Column(Integer, primary_key=True, autoincrement=True)
    id_analisis = Column(Integer, ForeignKey("analisisia.id_analisis", ondelete="CASCADE"), nullable=True)
    descripcion = Column(Text, nullable=True)
    nivel = Column(Enum(NivelAlerta), default=NivelAlerta.BAJO)
    fecha = Column(DateTime, default=datetime.utcnow)
    tipo_alerta = Column(Enum(TipoAlerta), nullable=False)
    revisada = Column(Boolean, default=False)

    analisis = relationship("AnalisisIA", back_populates="alertas")


class Cita(Base):
    __tablename__ = "cita"
    id_cita = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, nullable=False)
    motivo = Column(String(200), nullable=True)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"), nullable=False)
    id_profesional = Column(Integer, ForeignKey("profesional.id_profesional"), nullable=True)


class PlanPersonalizado(Base):
    __tablename__ = "planpersonalizado"
    id_plan = Column(Integer, primary_key=True, autoincrement=True)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"), nullable=False)
    id_profesional = Column(Integer, ForeignKey("profesional.id_profesional"), nullable=True)
    tipo = Column(Enum(TipoPlan), nullable=False)
    descripcion = Column(Text, nullable=True)
    contenido = Column(Text, nullable=False)
    fecha_inicio = Column(Date, default=date.today)
    activo = Column(Boolean, default=True)


class EvolucionReport(Base):
    __tablename__ = "evolucionreport"
    id_reporte = Column(Integer, primary_key=True, autoincrement=True)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"), nullable=False)
    tipo_tca = Column(Text, nullable=True)
    fecha = Column(Date, default=date.today)
    imc = Column(Float, default=0.0)
    tasa_cumplimiento = Column(Float, default=0.0)
    ansiedad = Column(Float, default=0.0)


class ContenidoEducativo(Base):
    __tablename__ = "contenidoeducativo"
    id_contenido = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(200), nullable=True)
    tipo = Column(String(20), nullable=True)  # VIDEO | JUEGO
    url = Column(Text, nullable=True)
    descripcion = Column(Text, nullable=True)
