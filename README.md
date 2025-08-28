# landing-page-vue-pocketbase

## Executando com Docker

Este projeto pode ser facilmente executado usando Docker. O Dockerfile na raiz do projeto utiliza os arquivos do frontend já buildados e configura o backend PocketBase em uma única imagem.

### Preparando os arquivos para o Docker

Certifique-se de que você já buildou o frontend antes de construir a imagem Docker:

```bash
# Navegue até a pasta do frontend
cd frontend
# Instale as dependências
npm install
# Faça o build do frontend (isso colocará os arquivos na pasta backend/pb_public/app)
npm run build
```

### Construindo a imagem Docker

```bash
docker build -t landing-page-vue-pocketbase .
```

### Executando o contêiner

```bash
# Crie um volume Docker para persistir os dados do PocketBase
docker volume create pocketbase_data

# Execute o contêiner usando o volume Docker
docker run -p 8090:8090 \
  -v pocketbase_data:/pocketbase/pb_data \
  landing-page-vue-pocketbase
```

Se o comando acima não funcionar, tente esta versão alternativa com configurações adicionais:

```bash
# Comando alternativo com usuário root e configurações adicionais
docker run -p 8090:8090 \
  -v pocketbase_data:/pocketbase/pb_data \
  landing-page-vue-pocketbase
```

A aplicação estará disponível em:
- Frontend: http://localhost:8090/app/
- API e Admin UI do PocketBase: http://localhost:8090/

### Notas importantes

- O volume nomeado `pocketbase_data` é usado para persistir os dados do PocketBase entre reinicializações do contêiner
- A porta padrão do PocketBase é 8090, mas pode ser alterada usando a variável de ambiente `PB_PORT`
- Para fazer backup dos dados, você pode usar `docker volume inspect pocketbase_data` para encontrar o caminho do volume no host

### Gerenciando os dados

Para fazer backup dos dados do volume Docker:

```bash
# Encontre o caminho do volume no sistema de arquivos do host
docker volume inspect pocketbase_data

# Crie um contêiner temporário para fazer backup do volume
docker run --rm -v pocketbase_data:/source -v $(pwd):/backup alpine tar -czf /backup/pocketbase_backup.tar.gz -C /source .
```

Para restaurar um backup:

```bash
# Crie ou recrie o volume (se necessário)
docker volume create pocketbase_data

# Crie um contêiner temporário para restaurar o backup
docker run --rm -v pocketbase_data:/target -v $(pwd):/backup alpine sh -c "rm -rf /target/* && tar -xzf /backup/pocketbase_backup.tar.gz -C /target"
```

Para examinar os dados no volume:

```bash
# Inicie um shell em um contêiner temporário montando o volume
docker run -it --rm -v pocketbase_data:/data alpine sh
```
