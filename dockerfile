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
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY
ARG VITE_AI_BASE_URL
ARG VITE_AI_API_KEY
ARG VITE_AI_MODEL
ARG VITE_API_URL
ARG VITE_ADMIN_EMAIL
ARG VITE_ADMIN_PASS
ARG VITE_EVOLUTION_URL
ARG VITE_EVOLUTION_KEY
ARG VITE_EVOLUTION_INSTANCE

# Suporte a fallbacks antigos se passados sem prefixo VITE_
ARG SUPABASE_URL
ARG SUPABASE_KEY

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-$SUPABASE_URL}
ENV VITE_SUPABASE_KEY=${VITE_SUPABASE_KEY:-$SUPABASE_KEY}
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL
ENV VITE_AI_API_KEY=$VITE_AI_API_KEY
ENV VITE_AI_MODEL=$VITE_AI_MODEL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_EMAIL=$VITE_ADMIN_EMAIL
ENV VITE_ADMIN_PASS=$VITE_ADMIN_PASS
ENV VITE_EVOLUTION_URL=$VITE_EVOLUTION_URL
ENV VITE_EVOLUTION_KEY=$VITE_EVOLUTION_KEY
ENV VITE_EVOLUTION_INSTANCE=$VITE_EVOLUTION_INSTANCE

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
