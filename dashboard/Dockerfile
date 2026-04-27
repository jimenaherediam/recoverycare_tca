# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (usamos --include=dev porque Vite es una devDependency)
RUN npm install

# Copiar el resto del código (Asegúrate de que sea solo un punto)
COPY . .

# Inyectar URL de la API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la app (Añadimos esta bandera para ver qué falla exactamente si falla)
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
# Asegúrate de que el archivo nginx.conf exista en tu carpeta
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]