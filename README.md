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
# Crie um diretório específico para os dados do PocketBase se ele não existir
mkdir -p ./backend/pb_data
chmod -R 777 ./backend/pb_data

# Execute o contêiner com permissões adequadas
docker run -p 8090:8090 \
  -v $(pwd)/backend/pb_data:/pocketbase/pb_data:rw \
  --memory=512m \
  --memory-swap=1g \
  landing-page-vue-pocketbase
```

Se o comando acima não funcionar, tente esta versão alternativa:

```bash
# Comando alternativo com usuário root e configurações adicionais
docker run -p 8090:8090 \
  -v $(pwd)/backend/pb_data:/pocketbase/pb_data:rw,z \
  --user root \
  --memory=512m \
  --memory-swap=1g \
  --shm-size=256m \
  --cap-add SYS_ADMIN \
  landing-page-vue-pocketbase
```

A aplicação estará disponível em:
- Frontend: http://localhost:8090/app/
- API e Admin UI do PocketBase: http://localhost:8090/

### Notas importantes

- O volume `-v $(pwd)/backend/pb_data:/pocketbase/pb_data:rw` é usado para persistir os dados do PocketBase no host, com a flag `:rw` garantindo permissões de leitura e escrita
- A porta padrão do PocketBase é 8090, mas pode ser alterada usando a variável de ambiente `PB_PORT`
- As opções `--memory=512m` e `--memory-swap=1g` ajudam a evitar problemas de memória com o SQLite
- Se você ainda encontrar problemas, tente iniciar com um banco de dados limpo removendo os arquivos em `./backend/pb_data` (faça backup antes!)

### Solução de problemas

Se você encontrar o erro "unable to open database file: out of memory (14)", tente as seguintes soluções:

1. Certifique-se de que o diretório `backend/pb_data` tem permissões adequadas:
   ```bash
   chmod -R 777 ./backend/pb_data
   ```

2. Inicie com um banco de dados limpo (faça backup primeiro!):
   ```bash
   mv ./backend/pb_data ./backend/pb_data_backup
   mkdir -p ./backend/pb_data
   chmod 777 ./backend/pb_data
   ```

3. Execute o Docker com usuário root e permissões explícitas para o volume:
   ```bash
   docker run -p 8090:8090 \
     -v $(pwd)/backend/pb_data:/pocketbase/pb_data:rw,z \
     --user root \
     landing-page-vue-pocketbase
   ```

4. Limpe todos os contêineres e imagens Docker anteriores:
   ```bash
   docker stop $(docker ps -aq)
   docker rm $(docker ps -aq)
   docker system prune -af
   docker build -t landing-page-vue-pocketbase .
   ```

5. Tente usar o Docker com menos camadas de virtualização:
   ```bash
   # Se estiver usando WSL no Windows, execute diretamente no Windows
   # Se estiver usando uma VM, tente diretamente no host
   ```
