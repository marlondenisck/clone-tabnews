---
name: api-development
description: "Use when: developing new API endpoints, adding routes, creating models, documenting endpoints, incrementally improving API documentation"
applyTo: ["pages/api/**", "models/**", "documentacao.md", ".instructions.md"]
---

# Instruções para Desenvolvimento da API - Clone TabNews

## Objetivo

Diretrizes para manter API consistente, testada e documentada. Segue padrões específicos do projeto clone-tabnews.

---

## Regras para Novos Endpoints

### 1. Estrutura de Pasta

Sempre criar novos endpoints seguindo o padrão Next.js:

```
pages/api/v1/[recurso]/index.js
pages/api/v1/[recurso]/[id]/index.js
```

### 2. Template Base para Novo Endpoint

```javascript
import { createRouter } from "next-connect";
import controller from "infra/controller";
import modelName from "models/modelName";
import userFeatures from "@/utils/userFeatures";

const router = createRouter();

// 1. Middleware obrigatório
router.use(controller.injectAnonymousOrUser);

// 2. Proteção com feature (se endpoint requer autenticação)
router.get(getHandler);
router.post(
  controller.canRequest(userFeatures.FEATURE_NAME),
  postHandler
);
router.patch(
  controller.canRequest(userFeatures.FEATURE_NAME),
  patchHandler
);
router.delete(
  controller.canRequest(userFeatures.FEATURE_NAME),
  deleteHandler
);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const user = request.context.user; // Já validado
  // Implementação
}

async function postHandler(request, response) {
  // Implementação
}

async function patchHandler(request, response) {
  // Implementação
}

async function deleteHandler(request, response) {
  // Implementação
}
```

### 3. Documentação Obrigatória

Para cada novo endpoint, SEMPRE adicionar à `documentacao.md`:

1. **Seção no Markdown:**

```markdown
#### [MÉTODO] `/api/v1/[rota]`

[Descrição breve do endpoint]

**Método:** [GET/POST/PATCH/DELETE]

**Autenticação:** ✅ / ❌ (requer feature: ?)

**Parâmetros:** (se aplicável)
- `param1` (tipo, obrigatório/opcional): Descrição

**Body:** (se aplicável)
```json
{}
```

**Resposta ([STATUS]):**
```json
{}
```

**Erros:**
- `STATUS`: Descrição
```

2. **Atualizar seção "Visão Geral"**
3. **Atualizar Estrutura de Diretórios**
4. **Listar em Cobertura de Testes**

### 4. Testes Obrigatórios

Para cada novo endpoint, criar testes em:

```
tests/integration/api/v1/[recurso]/[metodo].test.js
```

Exemplo: `tests/integration/api/v1/posts/get.test.js`

---

## Checklist para Novo Endpoint

- [ ] Arquivo criado em `pages/api/v1/[recurso]/...`
- [ ] Middleware `injectAnonymousOrUser` presente
- [ ] Feature `canRequest` adicionada (se endpoint protegido)
- [ ] Modelo/função criada em `models/` se necessário
- [ ] Testes de integração criados em `tests/integration/`
- [ ] Endpoint documentado em `documentacao.md`
- [ ] Exemplos de request/response adicionados
- [ ] Possíveis erros listados
- [ ] Seção de testes atualizada

---

## Padrões de Status HTTP

| Status | Uso                                  |
| ------ | ------------------------------------ |
| 200    | GET bem-sucedido, operação realizada |
| 201    | Recurso criado (POST)                |
| 204    | Sem conteúdo (DELETE bem-sucedido)   |
| 400    | Requisição inválida                  |
| 401    | Não autenticado                      |
| 403    | Sem permissão (feature ausente)      |
| 404    | Recurso não encontrado               |
| 409    | Conflito (ex: usuário já existe)     |
| 422    | Erro de validação                    |
| 500    | Erro interno do servidor             |
| 503    | Serviço indisponível                 |

---

## Middlewares Obrigatórios

### `injectAnonymousOrUser`

**TODO endpoint DEVE usar:**

```javascript
router.use(controller.injectAnonymousOrUser);
```

Este middleware:
- ✅ Verifica cookie `session_id`
- ✅ Se existe: busca sessão no BD, injeta usuário autenticado
- ✅ Se não existe: injeta usuário anônimo com features padrão
- ✅ Armazena em `request.context.user`

**Features de usuário anônimo:**
```javascript
["read:activation_token", "create:session", "create:user"]
```

### `canRequest(feature)`

Para endpoints protegidos, adicione:

```javascript
router.patch(
  controller.canRequest(userFeatures.READ_ACTIVATION_TOKEN),
  patchHandler
);
```

Este middleware:
- ✅ Verifica se `request.context.user.features` inclui a feature
- ✅ Se não: lança `ForbiddenError` (403)
- ✅ Se sim: permite prosseguir

---

## Sistema de Features (Permissões)

### Features Atuais

Arquivo: `utils/userFeatures.js`

```javascript
const READ_ACTIVATION_TOKEN = "read:activation_token"; // Padrão ao criar usuário
const CREATE_SESSION = "create:session";               // Adiciona ao ativar
const READ_SESSION = "read:session";                   // Adiciona ao ativar
const CREATE_USER = "create:user";                     // Disponível para todos
```

### Fluxo de Features

```
Usuário novo
  ↓
[read:activation_token]
  ↓
Clica no email de ativação
  ↓
PATCH /activations/[token_id]
  ↓
[create:session, read:session]
  ↓
Pode fazer login e acessar /user
```

### Ao Adicionar Nova Feature

1. Adicione constante em `utils/userFeatures.js`
2. Use em middleware `controller.canRequest(newFeature)`
3. Documente em qual fluxo usuário recebe essa feature
4. Crie testes: com feature, sem feature, usuário anônimo

---

## Classes de Erro

### Arquivo: `infra/errors/index.js`

Use a classe correta para cada situação:

| Classe | Status | Quando Usar | Exemplo |
|--------|--------|-------------|-------------|
| `ValidationError` | 400/422 | Entrada inválida, validação falha | Email duplicado, campo vazio |
| `UnauthorizedError` | 401 | Autenticação falhou | Senha incorreta, sessão expirada |
| `ForbiddenError` | 403 | Falta de permissão (feature ausente) | Usuário sem `read:session` |
| `NotFoundError` | 404 | Recurso não existe | Usuário não encontrado |
| `InternalServerError` | 500 | Erro inesperado | Crash, erro não tratado |
| `ServiceError` | 503 | Serviço externo indisponível | BD desconectado |

### Template de Erro

```javascript
import { ValidationError } from "infra/errors";

throw new ValidationError({
  message: "O email já está cadastrado no sistema.",
  action: "Tente com outro email ou faça login se já tem conta."
});
```

### Resposta Gerada Automaticamente

```json
{
  "name": "ValidationError",
  "message": "O email já está cadastrado no sistema.",
  "action": "Tente com outro email ou faça login se já tem conta.",
  "status_code": 422
}
```

---

## Padrões de Validação

### Regras Obrigatórias

1. ✅ **Validação ocorre NO MODELO, nunca no handler**
2. ✅ **Lançar `ValidationError` com mensagem e action claras**
3. ✅ **Validar tipo de dados (string, number, etc.)**
4. ✅ **Queries ao BD SEMPRE parametrizadas** (previne SQL injection)
5. ✅ **Testar: válido, inválido, duplicado, vazio**

### Exemplo em Modelo

```javascript
// models/user.js

async function validateUniqueEmail(email) {
  const existing = await database.query({
    text: `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    values: [email] // Parametrizado!
  });

  if (existing.rowCount > 0) {
    throw new ValidationError({
      message: "O email já está cadastrado no sistema.",
      action: "Tente com outro email ou faça login."
    });
  }
}

async function create(userInput) {
  // Validar presença
  if (!userInput.email || !userInput.username || !userInput.password) {
    throw new ValidationError({
      message: "Email, username e password são obrigatórios.",
      action: "Verifique se todos os campos foram preenchidos."
    });
  }

  // Validar tipos
  if (typeof userInput.email !== "string") {
    throw new ValidationError({
      message: "Email deve ser uma string."
    });
  }

  // Validar unicidade
  await validateUniqueEmail(userInput.email);
  
  // Continuar com criação...
}
```

---

## Padrão de Senhas

### SEMPRE use `models/password.js`

```javascript
import password from "models/password";

// Ao criar/atualizar usuário:
const hashedPassword = await password.hash(plainTextPassword);

// Ao autenticar:
const isValid = await password.compare(plainText, hashedPassword);

if (!isValid) {
  throw new UnauthorizedError({
    message: "Senha não confere."
  });
}
```

### Salt Rounds

- **Produção**: 14 rounds (seguro, 100-200ms)
- **Desenvolvimento**: 1 round (rápido, testes)

---

## Padrão de Cookies de Sessão

### SEMPRE use

```javascript
import controller from "infra/controller";

// Ao fazer login:
const newSession = await session.create(userId);
controller.setSessionCookie(newSession.token, response);

// Ao fazer logout:
controller.clearSessionCookie(response);
```

### Características do Cookie

- `httpOnly: true` — Protege contra XSS
- `sameSite: 'strict'` — Protege contra CSRF
- `secure: true` em produção — HTTPS only
- `maxAge: 30 dias` — Expiry

---

## Padrão de Testes

### Estrutura Esperada

```javascript
// tests/integration/api/v1/[recurso]/[metodo].test.js

import orchestrator from "@/tests/orchestrator";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("[MÉTODO] /api/v1/[rota]", () => {
  describe("Casos de sucesso", () => {
    test("Quando dados válidos", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/...`, {
        method: "GET"
      });
      expect(response.status).toBe(200);
    });
  });

  describe("Casos de erro", () => {
    test("Quando recurso não existe", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/...`, {
        method: "GET"
      });
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.name).toBe("NotFoundError");
    });
  });
});
```

### Helpers Disponíveis

Arquivo: `tests/orchestrator.js`

```javascript
await orchestrator.createUser();           // Cria usuário (não ativado)
await orchestrator.createSession(user);    // Cria sessão (requer ativação)
await orchestrator.activateUser(user);     // Ativa usuário
await orchestrator.clearDatabase();         // Limpa BD completo
await orchestrator.runPendingMigrations(); // Executa migrações
await orchestrator.getLastEmail();         // Obtém último email
```

---

## Nomeação de Recursos

- **Coleções:** plural (`/users`, `/posts`, `/comments`)
- **Recurso específico:** use parâmetros dinâmicos (`/users/[username]`, `/posts/[id]`)
- **Ações especiais:** substantivos (`/migrations`, `/status`)

---

## Exemplo Real: Endpoint de Ativação

**Arquivo:** `pages/api/v1/activations/[token_id]/index.js`

```javascript
import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import userFeatures from "@/utils/userFeatures";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(
  controller.canRequest(userFeatures.READ_ACTIVATION_TOKEN),
  patchHandler
);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id
  );

  return response.status(200).json(usedActivationToken);
}
```

**Testes:** `tests/integration/api/v1/activations/[token_id]/path.test.js`

```javascript
describe("PATCH /api/v1/activations/[token_id]", () => {
  test("Quando token é válido, ativa usuário", async () => {
    const user = await orchestrator.createUser();
    const token = await activation.create(user.id);

    const response = await fetch(
      `${webserver.origin}/api/v1/activations/${token.id}`,
      { method: "PATCH" }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.used_at).toBeDefined();
  });

  test("Quando token já foi usado, retorna 404", async () => {
    const user = await orchestrator.createUser();
    const token = await activation.create(user.id);

    await fetch(`${webserver.origin}/api/v1/activations/${token.id}`, {
      method: "PATCH"
    });

    const response = await fetch(
      `${webserver.origin}/api/v1/activations/${token.id}`,
      { method: "PATCH" }
    );

    expect(response.status).toBe(404);
  });
});
```

---

## Verificação Contínua

Antes de fazer commit:

1. ✅ Rodar testes: `npm test`
2. ✅ Verificar documentação atualizada em `documentacao.md`
3. ✅ Validar estrutura do código e padrões
4. ✅ Confirmar tratamento de erros centralizado
5. ✅ Testar casos: sucesso, erro, autorização

---

## Recursos Auxiliares

- **Documentação Principal:** [documentacao.md](documentacao.md)
- **Testes de Exemplo:** [tests/integration/api/v1/](tests/integration/api/v1/)
- **Modelos:** [models/](models/)
- **Features:** [utils/userFeatures.js](utils/userFeatures.js)
- **Controlador:** [infra/controller.js](infra/controller.js)
- **Erros:** [infra/errors/index.js](infra/errors/index.js)

---

## Links para Fluxos Principais

- **Registro e Ativação:** Veja `models/user.js` + `models/activation.js`
- **Login:** Veja `pages/api/v1/sessions/index.js`
- **Verificação de Sessão:** Veja `pages/api/v1/user/index.js`
- **Logout:** DELETE `/api/v1/sessions`
