---
name: api-development
description: "Use when: developing new API endpoints, adding routes, creating models, documenting endpoints, incrementally improving API documentation"
applyTo: ["pages/api/**", "models/**", "documentacao.md", ".instructions.md"]
---

# Instruções para Desenvolvimento da API - Clone TabNews

## Objetivo

Este arquivo fornece diretrizes para manter a documentação da API atualizada automaticamente conforme novos endpoints são desenvolvidos.

---

## Regras para Novos Endpoints

### 1. Estrutura de Pasta

Sempre criar novos endpoints seguindo o padrão Next.js:

```
pages/api/v1/[recurso]/index.js
pages/api/v1/[recurso]/[id]/index.js
```

### 2. Template Base para Novo Endpoint

Ao criar um novo endpoint, sempre seguir este template:

```javascript
import { createRouter } from "next-connect";
import controller from "infra/controler";
import modelName from "models/modelName";

const router = createRouter();

router.get(getHandler); // Se aplicável
router.post(postHandler); // Se aplicável
router.patch(patchHandler); // Se aplicável
router.delete(deleteHandler); // Se aplicável

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  // Implementação
}

async function postHandler(request, response) {
  // Implementação
}

// ... outros handlers
```

### 3. Documentação Obrigatória

Para cada novo endpoint, SEMPRE adicionar à `documentacao.md`:

1. **Seção no Markdown:**

   ````markdown
   #### [MÉTODO] `[ROTA]`

   [Descrição breve do endpoint]

   **Método:** [GET/POST/PATCH/DELETE]

   **Parâmetros:** (se aplicável)

   - `param1` (tipo, obrigatório/opcional): Descrição

   **Body:** (se aplicável)

   ```json
   {}
   ```
   ````

   **Resposta ([STATUS]):**

   ```json
   {}
   ```

   **Erros:**
   - `STATUS`: Descrição do erro

   ```

   ```

2. **Atualizar a seção "Visão Geral"** com o novo endpoint

3. **Atualizar a Estrutura de Diretórios** se necessário

### 4. Testes Obrigatórios

Para cada novo endpoint, criar testes em:

```
tests/integration/api/v1/[recurso]/[metodo].test.js
```

Exemplo: `tests/integration/api/v1/posts/get.test.js`

Então adicionar à documentação:

```markdown
- `[recurso]/[metodo].test.js`: Testes para [MÉTODO] /[rota]
```

---

## Checklist para Novo Endpoint

- [ ] Arquivo criado em `pages/api/v1/[recurso]/...`
- [ ] Handler implementado com tratamento de erro centralizado
- [ ] Modelo/função criada em `models/` se necessário
- [ ] Testes de integração criados em `tests/integration/`
- [ ] Endpoint documentado em `documentacao.md`
- [ ] Exemplos de request/response adicionados
- [ ] Possíveis erros listados
- [ ] Seção de testes atualizada

---

## Padrões de Status HTTP

Usar os status codes corretos:

| Status | Uso                                  |
| ------ | ------------------------------------ |
| 200    | GET bem-sucedido, operação realizada |
| 201    | Recurso criado (POST)                |
| 204    | Sem conteúdo (DELETE bem-sucedido)   |
| 400    | Requisição inválida                  |
| 404    | Recurso não encontrado               |
| 409    | Conflito (ex: usuário já existe)     |
| 500    | Erro interno do servidor             |

---

## Nomeação de Recursos

- **Coleções:** plural (`/users`, `/posts`, `/comments`)
- **Recurso específico:** use parâmetros dinâmicos (`/users/[username]`, `/posts/[id]`)
- **Ações especiais:** substantivos (`/migrations`, `/status`)

---

## Exemplo: Adicionando um novo endpoint de Posts

### 1. Criar arquivo

`pages/api/v1/posts/index.js`:

```javascript
import { createRouter } from "next-connect";
import controller from "infra/controler";
import post from "models/post";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const posts = await post.findAll();
  return response.status(200).json(posts);
}

async function postHandler(request, response) {
  const newPost = await post.create(request.body);
  return response.status(201).json(newPost);
}
```

### 2. Criar testes

`tests/integration/api/v1/posts/get.test.js` e `post.test.js`

### 3. Atualizar documentação.md

Adicionar à seção de Endpoints:

````markdown
### 5. Posts

#### GET `/api/v1/posts`

Lista todos os posts.

**Método:** GET

**Resposta (200):**

```json
[
  {
    "id": "uuid-do-post",
    "title": "Título do post",
    "content": "Conteúdo",
    "author_id": "uuid-do-autor",
    "created_at": "2026-05-13T10:30:45.123Z"
  }
]
```
````

#### POST `/api/v1/posts`

Cria um novo post.

**Método:** POST

**Body:**

```json
{
  "title": "Novo Post",
  "content": "Conteúdo do post",
  "author_id": "uuid-do-autor"
}
```

**Resposta (201):**

```json
{
  "id": "novo-uuid",
  "title": "Novo Post",
  "content": "Conteúdo do post",
  "author_id": "uuid-do-autor",
  "created_at": "2026-05-13T10:30:45.123Z"
}
```

```

---

## Verificação Contínua

Antes de fazer commit:

1. ✅ Rodar testes: `npm test`
2. ✅ Verificar documentação atualizada
3. ✅ Validar estrutura do código
4. ✅ Confirmar tratamento de erros

---

## Recursos Auxiliares

- **Documentação Principal:** `documentacao.md`
- **Testes de Exemplo:** `tests/integration/api/v1/`
- **Modelos:** `models/`
- **Controlador de Erros:** `infra/controler.js`
```
