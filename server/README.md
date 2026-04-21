# RecoveryCare FastAPI Server

Servidor backend para la app RecoveryCare. Implementa autenticación JWT (paciente + profesional), análisis de comidas (reglas + LLM), chatbot Ollama, citas, historial y planes personalizados.

> ⚠️ **Este servidor NO se ejecuta en Lovable.** Lovable solo aloja la app frontend (React). Tienes que arrancarlo tú en tu máquina (o desplegarlo en Render/Railway/Fly).

---

## 1. Requisitos

- Python 3.10+
- (Opcional) MariaDB/MySQL si quieres usar tu BD `recoverycare` en vez de SQLite
- (Opcional) [Ollama](https://ollama.com) corriendo en `http://localhost:11434` con un modelo (ej. `ollama pull llama3.1`)

---

## 2. Instalación

```bash
cd server
python -m venv .venv
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
cp .env.example .env
```

Edita `.env` a tu gusto. Por defecto usa **SQLite** (`./recoverycare.db`) — cero configuración.

### Para usar tu MariaDB (puerto 3304, base `recoverycare`)

En `.env`:
```
DATABASE_URL=mysql+pymysql://root:tu_password@127.0.0.1:3304/recoverycare?charset=utf8mb4
```
Y:
```bash
pip install pymysql cryptography
```

---

## 3. Arrancar

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

La primera vez crea automáticamente las tablas (vía SQLAlchemy `create_all`). Si usas MariaDB y prefieres importar tu `.sql` original, **hazlo antes** de arrancar y comenta la línea `Base.metadata.create_all(...)` en `app/main.py`.

---

## 4. Conectar la app de Lovable

En el `.env` del frontend (raíz del repo, NO el de `server/`):

```
VITE_API_URL=http://localhost:8000
```

(Si el preview de Lovable se sirve por https y bloquea el http de localhost, usa un túnel: `ngrok http 8000` y pon esa URL.)

---

## 5. Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro paciente (`{nombre, dni, password, edad?, localidad?, codigo_profesional?}`) |
| POST | `/auth/login` | Login paciente (`{dni, password}`) → JWT |
| POST | `/auth/professional/login` | Login profesional (`{email, password, codigo_profesional}`) |
| GET | `/auth/me` | Datos del usuario autenticado |
| POST | `/meals/record` | Registra comida + cuestionario, devuelve análisis IA |
| GET | `/meals/?date=YYYY-MM-DD` | Comidas del paciente (filtrable por fecha) |
| POST | `/chat` | Chat con Ollama (streaming SSE) — guarda historial |
| GET | `/chat/history` | Historial completo del chatbot |
| GET | `/appointments` | Citas del paciente |
| POST | `/appointments` | Crear cita (solo profesional) |
| GET | `/history?date=YYYY-MM-DD` | Comidas + alertas + citas de un día |
| GET | `/plans/today` | Planes personalizados activos |
| GET | `/alerts` | Alertas del paciente (profesional ve las de sus pacientes) |
| PATCH | `/alerts/{id}` | Marcar alerta como revisada (profesional) |

Todas las rutas excepto `/auth/*` requieren `Authorization: Bearer <jwt>`.

---

## 6. Roles

El JWT incluye `{sub: <id_usuario>, tipo: "PACIENTE"|"PROFESIONAL"}`. Las rutas de paciente usan `Depends(get_current_paciente)`, las de profesional `Depends(get_current_profesional)`.

---

## 7. Análisis IA de comidas

`POST /meals/record` ejecuta:

1. **Reglas heurísticas** (`app/services/analysis.py`): umbrales sobre `nivel_ansiedad`, `cantidad_ingerida`, `tipo_ingesta`, banderas (`camara_oculta`, `desconexion_camara`).
2. **LLM** (Ollama, opcional): manda el cuestionario al modelo configurado y le pide un resumen empático + señales sutiles. Si Ollama no está disponible, se omite sin romper.
3. Genera **alertas** automáticas si supera los umbrales (`alerta` table, niveles BAJO/MEDIO/ALTO).

Ajusta umbrales y prompts en `app/services/analysis.py`.

---

## 8. Chatbot

`POST /chat` es streaming SSE compatible con el formato OpenAI (`data: {...}\n\n` + `data: [DONE]`). Internamente llama a Ollama (`/api/chat` con `stream:true`) y reformatea cada token. Mensajes del usuario y respuestas completas se guardan en la tabla `chatbot`.

---

## 9. CORS

Por defecto `allow_origins=["*"]` para desarrollo. En producción, restringe a tu dominio de Lovable en `app/main.py`.

---

## 10. Despliegue

- **Render / Railway / Fly.io**: suben Python directo. Asegúrate de poner `DATABASE_URL`, `JWT_SECRET`, `OLLAMA_URL` (o desactivar Ollama) como env vars.
- **Docker**: hay un `Dockerfile` en esta carpeta.

```bash
docker build -t recoverycare-api .
docker run -p 8000:8000 --env-file .env recoverycare-api
```
