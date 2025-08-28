# landing-page-vue-pocketbase

## Executando com Docker

Este projeto pode ser facilmente executado usando Docker. O Dockerfile na raiz do projeto constrói tanto o frontend Vue.js quanto o backend PocketBase em uma única imagem.

### Construindo a imagem Docker

```bash
docker build -t landing-page-vue-pocketbase .
```

### Executando o contêiner

```bash
docker run -p 8090:8090 -v $(pwd)/backend/pb_data:/pocketbase/pb_data landing-page-vue-pocketbase
```

A aplicação estará disponível em:
- Frontend: http://localhost:8090/app/
- API e Admin UI do PocketBase: http://localhost:8090/

### Notas importantes

- O volume `-v $(pwd)/backend/pb_data:/pocketbase/pb_data` é usado para persistir os dados do PocketBase no host
- A porta padrão do PocketBase é 8090, mas pode ser alterada usando a variável de ambiente `PB_PORT`
