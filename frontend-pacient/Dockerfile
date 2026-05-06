# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Declaramos los ARGs que vienen del docker-compose.yml
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Los convertimos en ENVs para que Vite los intercepte al compilar
ENV VITE_API_URL=$VITE_API_URL

# Construimos la app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Limpiamos el nginx por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiamos el build
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]