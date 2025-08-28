# PocketBase v0.29.3 — Documentação (Context7 snapshot)

Fonte: Context7 library ID `/pocketbase/pocketbase`, consulta: v0.29.3

Observação: este arquivo contém um snapshot da documentação técnica coletada via Context7 (trechos de changelogs, snippets de código e perguntas e respostas relevantes). Use como referência local; para detalhes completos consulte o repositório oficial do PocketBase.

---

## Resumo rápido

- PocketBase é um backend em Go com DB SQLite embutido, dashboard admin, autenticação, arquivos e API REST-ish.
- Este snapshot reúne trechos de changelog, exemplos em Go/JS/Dart, e notas sobre mudanças de API e comportamento.

## Principais mudanças e snippets relevantes (seleção)

- Realtime: correção para iteração concorrente de clientes, retorno de cópia superficial do map de clients.

- Dao / Banco de dados:
  - `Dao.MaxLockRetries` exposto para ajustar tentativas em locks de DB.
  - `Dao.ModelQueryTimeout` disponível para ajustar timeout de queries.

- Middlewares e contexto:
  - `apis.ContextUserKey` renomeado para `apis.ContextAuthRecordKey`.
  - Novas middlewares: `apis.RequireRecordAuth(...)`, `apis.RequireAdminOrRecordAuth(...)`, `apis.RequireSameContextRecordAuth()`.
  - `$apis.gzip()` e `$apis.bodyLimit(bytes)` expostos ao JSVM.

- Arquivos e storage:
  - `filesystem.NewFileFromBytes()` e `filesystem.NewFileFromUrl(ctx, url)` helpers.
  - Suporte a protected files via token curto (requisições com token query param).
  - `fs.DeleteByPrefix()` agora roda em background em deleção de registros.

- Admin UI e SDKs:
  - Admin UI atualizado para usar SDK JS mais recente (resolução de conflitos com campo `isNew`).
  - Notas para instalar dependências da Admin UI com `npm install`.
  - Exemplo de uso do SDK JS: `import PocketBase from 'pocketbase'; const pb = new PocketBase('http://127.0.0.1:8090');`

- Requisitos e builds:
  - Comentários de atualização do mínimo Go para builds/release (1.20.3, 1.22.x em versões posteriores).

- API e rotas:
  - Todos os handlers relacionados a usuários migrados para `/api/collections/:collection/...`.
  - Endpoints importantes: `/api/collections/:collection/records`, `/api/collections/:collection/auth-with-password`, etc.

## Exemplos de código (trechos selecionados)

Go — acessar/ajustar Dao.MaxLockRetries:

```go
maxRetries := Dao.MaxLockRetries
// Dao.MaxLockRetries = 10
```

JS — exemplo básico do SDK:

```js
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
```

Shell — instalar SDK JS:

```sh
npm install pocketbase@latest --save
```

## Perguntas e respostas (selecionadas do snapshot)

- Q: qual versão do `golang.org/x/net` em v0.22.29?
  - R: atualizada para 0.33.0 para corrigir CVE-2024-45338.

- Q: Como o `page` parameter foi alterado na API de list/search?
  - R: `page` normalization foi removida; solicitar página inexistente devolve `items: []`.

## Nota sobre a versão 0.29.3

O snapshot Context7 retornou trechos de changelog e snippets relacionados a várias versões; para o conteúdo específico linha-a-linha de um changelog v0.29.3 recomendo consultar o CHANGELOG do repositório oficial do PocketBase ou a documentação hospedada em https://pocketbase.io/docs.

---

Arquivo salvo localmente: `docs/pocketbase-0.29.3.md`

Se quiser, posso:
- substituir o conteúdo pelo changelog completo extraído diretamente do GitHub (mais verboso), ou
- extrair apenas a documentação da API REST ou da SDK JavaScript em arquivos separados.
