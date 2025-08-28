ARG BUILD_DIR=/tmp/pb_build

# Vamos pular o build do frontend e apenas usar os arquivos já buildados

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
    && mkdir -p -m 777 "${PB_WORKDIR}/pb_data" \
    && chown -R ${USER}:${GROUP} "${PB_WORKDIR}"

# copy the pocketbase executable from build stage
COPY --from=pocketbase-build /tmp/pb_build/pocketbase ${PB_HOME}/pocketbase
RUN chmod 755 "${PB_HOME}/pocketbase" \
    && ln -s "${PB_HOME}/pocketbase" /usr/local/bin/pocketbase

# Copie todo o conteúdo do backend, incluindo os arquivos estáticos já buildados
COPY ./backend/pb_public/ ${PB_WORKDIR}/pb_public/

# Cria o diretório para hooks (se necessário)
RUN mkdir -p ${PB_WORKDIR}/pb_hooks/

# Cria o diretório para migrações (se necessário)
RUN mkdir -p ${PB_WORKDIR}/pb_migrations/

# Copie outros diretórios específicos do PocketBase se existirem
# Nota: Se o diretório pb_hooks não existir, você pode comentar esta linha
COPY ./backend/pb_hooks/ ${PB_WORKDIR}/pb_hooks/

COPY ./backend/pb_migrations/ ${PB_WORKDIR}/pb_migrations/

# Copie o script de inicialização
COPY ./backend/entrypoint.sh ${PB_HOME}/entrypoint.sh
RUN chmod +x ${PB_HOME}/entrypoint.sh

USER ${USER}
WORKDIR "${PB_WORKDIR}"

CMD ["sh", "-c", "${PB_HOME}/entrypoint.sh"]
