# Despliegue con Docker Compose

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose (incluido en Docker Desktop)

## Configuración de Base de Datos

La aplicación utiliza **MariaDB** como base de datos principal con el esquema definido en `server/recoverycare.sql`.

### Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tus valores:
- `JWT_SECRET`: Cambia a una clave segura en producción
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase (opcional)
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase (opcional)

## Pasos para Desplegar

### 1. Construir y Levantar los Contenedores

```bash
docker-compose up -d
```

Esto construirá y levantará:
- **MariaDB**: Base de datos en `localhost:3306`
- **Backend**: FastAPI en `http://localhost:8000`
- **Frontend**: React en `http://localhost`

### 2. Verificar el Estado

```bash
docker-compose ps
```

### 3. Ver Logs

Para ver todos los logs:
```bash
docker-compose logs -f
```

Para ver logs específicos:
```bash
docker-compose logs -f db
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Acceder a la Aplicación

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Base de datos**: localhost:3306 (usuario: recoverycare_user, password: recoverycare_pass)

## Primera Ejecución

En la primera ejecución, MariaDB importará automáticamente el esquema desde `server/recoverycare.sql`. Esto puede tomar unos minutos.

## Gestión de Datos

### Acceder a la Base de Datos

```bash
docker-compose exec db mysql -u recoverycare_user -p recoverycare
# Password: recoverycare_pass
```

### Backup de la Base de Datos

```bash
docker-compose exec db mysqldump -u recoverycare_user -p recoverycare > backup.sql
# Password: recoverycare_pass
```

### Restaurar Backup

```bash
docker-compose exec -T db mysql -u recoverycare_user -p recoverycare < backup.sql
# Password: recoverycare_pass
```
