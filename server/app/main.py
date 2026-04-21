from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, meals, chat, appointments, history, plans, alerts

# Crea las tablas si no existen (en dev / SQLite). Comenta si importas tu .sql a MariaDB.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RecoveryCare API", version="0.1.0")

origins = ["*"] if settings.CORS_ORIGINS.strip() == "*" else [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "recoverycare-api"}


app.include_router(auth.router)
app.include_router(meals.router)
app.include_router(chat.router)
app.include_router(appointments.router)
app.include_router(history.router)
app.include_router(plans.router)
app.include_router(alerts.router)
