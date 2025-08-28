ARG BUILD_DIR=/tmp/pb_build
ARG FRONTEND_DIR=/tmp/frontend_build

# Build stage para o frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copie os arquivos de configuração do frontend
COPY ./frontend/package.json ./frontend/package-lock.json* ./
RUN npm ci

# Copie o código-fonte do frontend
COPY ./frontend .
# Build do frontend (isso vai usar as configurações do vite.config.js)
RUN npm run build

# Build stage para o PocketBase
FROM alpine:3.22 AS pocketbase-base

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl tzdata

FROM pocketbase-base AS pocketbase-build
RUN apk add --no-cache unzip

ARG PB_VERSION=0.29.3
ARG BUILD_DIR=/tmp/pb_build

# Download pocketbase binary for linux_amd64 and unzip
RUN curl -fsSL -o /tmp/pocketbase.zip \
    https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip /tmp/pocketbase.zip -d ${BUILD_DIR}

# Imagem final combinada
FROM pocketbase-base AS final

ARG UID=1001
ARG GID=1001
ARG USER=pocketbase
ARG GROUP=pocketbase
ARG PB_WORKDIR=/pocketbase
ARG PB_HOME=/opt/pocketbase
ARG PB_VERSION=0.29.3

ENV TZ=America/Sao_Paulo \
    PB_PORT=8090 \
    PB_WORKDIR=${PB_WORKDIR} \
    PB_HOME=${PB_HOME}

EXPOSE ${PB_PORT}

# create non-root user and directories
RUN addgroup -g ${GID} ${GROUP} \
    && adduser -u ${UID} -G ${GROUP} -s /bin/sh -D ${USER} \
    && mkdir -p "${PB_HOME}" \
    && mkdir -p -m 777 "${PB_WORKDIR}" \
    && chown ${USER}:${GROUP} "${PB_WORKDIR}"

# copy the pocketbase executable from build stage
COPY --from=pocketbase-build /tmp/pb_build/pocketbase ${PB_HOME}/pocketbase
RUN chmod 755 "${PB_HOME}/pocketbase" \
    && ln -s "${PB_HOME}/pocketbase" /usr/local/bin/pocketbase

# Copie o build do frontend para a pasta pb_public do PocketBase
# Note: O Vite já configura a saída para o caminho correto em ../backend/pb_public/app
# mas no contexto do Docker precisamos copiar explicitamente
COPY --from=frontend-builder /app/dist/ ${PB_WORKDIR}/pb_public/

# Cria o diretório para hooks (se necessário)
RUN mkdir -p ${PB_WORKDIR}/pb_hooks/

# Copie arquivos específicos do PocketBase se existirem (opcional)
# Nota: O Dockerfile não suporta facilmente a verificação condicional de existência de arquivos
# Você pode comentar esta linha se o diretório pb_hooks não existir
COPY ./backend/pb_hooks/ ${PB_WORKDIR}/pb_hooks/

USER ${USER}
WORKDIR "${PB_WORKDIR}"

CMD ["pocketbase", "serve", "--http=0.0.0.0:8090"]
