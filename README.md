# RecoveryCare

**RecoveryCare** es una plataforma integral diseñada para el seguimiento y apoyo de pacientes en tratamiento por Trastornos de la Conducta Alimentaria (TCA). Diseñada como trabajo final de la asignatura Aplicaciones en Salud Digital (GIB-UPM)

---

## Estructura del Proyecto

El sistema se divide en cuatro componentes principales:

*   **📱 App Móvil:** Para pacientes (registro de comidas, estados de ánimo, comunicación con el profesional y módulos de ayuda).
*   **💻 Portal Web:** Para profesionales (gestión y monitorizacion de alertas y dashboard de cada paciente).
*   **⚡ Backend:** API construida con **FastAPI**.
*   **🗄️ Base de Datos:** Motor **SQLite** (`recoverycare.db`).

---

## Despliegue Rápido

Para levantar todo el proyecto (App, Web, API y DB) de forma automática, utiliza **Docker Compose**.

1.  **Levantar servicios:**
    ```bash
    docker compose up -d
    ```

2.  **Verificar estado:**
    ```bash
    docker compose ps
    ```

---

## Acceso Local (Localhost)

Una vez desplegado, puedes acceder a los servicios en las siguientes direcciones:

| Componente | Puerto | URL |
| :--- | :--- | :--- |
| **API Backend** | `8000` | [http://localhost:8000](http://localhost:8000) |
| **Docs (Swagger)** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Portal Web** | `3000` | [http://localhost:3000](http://localhost:3000) |
| **App Móvil** | `80` | [http://localhost:80](http://localhost:80) |

---

## Notas Técnicas
*   La base de datos se genera automáticamente como un archivo `.db`.
*   Asegúrate de tener instalados **Docker** y **Docker Compose**.

---
Trabajo realizado por:
* Jimena Heredia Morales (jimena.heredia@alumnos.upm.es)
* Belén Gómez Martínez (belen.gomez@alumnos.upm.es)
* Ana Martínez Suárez (ana.martinezs@alumnos.upm.es)
* Andrea Serrano Basulto (andrea.serrano@alumnos.upm.es)