# ========================================
# SQR Vendas — Frontend Dockerfile
# Build com Vite + Serve com Nginx
# ========================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY frontend/ ./

# Variáveis de ambiente para o build (injetadas pelo EasyPanel como build args)
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG VITE_API_URL
ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_KEY=$SUPABASE_KEY
ENV VITE_API_URL=$VITE_API_URL

# Build de produção
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copiar build do Vite para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx para SPA (redireciona tudo para index.html)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
