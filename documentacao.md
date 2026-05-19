# Documentação da API - Clone TabNews

## Visão Geral

A API do Clone TabNews é uma REST API construída com Next.js que fornece endpoints para autenticar sessões, gerenciar usuários, verificar o status do banco de dados e executar migrações.

**Versão:** v1  
**Base URL:** `/api/v1`

---

## Endpoints

### 1. Status do Banco de Dados

#### GET `/api/v1/status`

Retorna informações sobre o status e saúde do banco de dados PostgreSQL.

**Método:** GET

**Resposta (200):**

```json
{
  "update_at": "2026-05-13T10:30:45.123Z",
  "postgres_version": "15.2",
  "max_connections": 100,
  "used_connections": 5
}
```

**Descrição dos campos:**

- `update_at`: Timestamp ISO da última atualização
- `postgres_version`: Versão do PostgreSQL
- `max_connections`: Número máximo de conexões permitidas
- `used_connections`: Número de conexões ativas no momento

---

### 2. Migrações

#### GET `/api/v1/migrations`

Lista todas as migrações pendentes que ainda não foram executadas.

**Método:** GET

**Resposta (200):**

```json
[
  {
    "id": "1777652267190_users",
    "name": "users",
    "filePath": "infra/migrations/1777652267190_users.js"
  }
]
```

---

#### POST `/api/v1/migrations`

Executa todas as migrações pendentes no banco de dados.

**Método:** POST

**Resposta (201):** Quando migrações foram executadas

```json
[
  {
    "id": "1777652267190_users",
    "name": "users",
    "filePath": "infra/migrations/1777652267190_users.js"
  }
]
```

**Resposta (200):** Quando não há migrações pendentes

```json
[]
```

---

### 3. Sessões

#### POST `/api/v1/sessions`

Autentica um usuário com email e senha.

**Método:** POST

**Body (application/json):**

```json
{
  "email": "usuario@example.com",
  "password": "senha_segura"
}
```

**Resposta (201):**

```json
{}
```

**Erros:**

- `401`: Dados de autenticação não conferem
- `401`: Senha não confere

Exemplo de erro (senha incorreta):

```json
{
  "name": "UnauthorizedError",
  "message": "Senha não confere.",
  "action": "Verifique se este dado está correto.",
  "status_code": 401
}
```

---

### 4. Usuários

#### POST `/api/v1/users`

Cria um novo usuário no sistema.

**Método:** POST

**Body (application/json):**

```json
{
  "username": "novo_usuario",
  "password": "senha_segura",
  "email": "usuario@example.com"
}
```

**Resposta (201):**

```json
{
  "id": "uuid-do-usuario",
  "username": "novo_usuario",
  "email": "usuario@example.com",
  "created_at": "2026-05-13T10:30:45.123Z"
}
```

**Erros:**

- `400`: Dados inválidos ou usuário já existe
- `500`: Erro ao criar usuário

---

#### GET `/api/v1/users/[username]`

Busca informações de um usuário específico pelo username.

**Método:** GET

**Parâmetros:**

- `username` (string, obrigatório): O nome de usuário a ser buscado

**Resposta (200):**

```json
{
  "id": "uuid-do-usuario",
  "username": "novo_usuario",
  "email": "usuario@example.com",
  "created_at": "2026-05-13T10:30:45.123Z",
  "updated_at": "2026-05-13T10:30:45.123Z"
}
```

**Erros:**

- `404`: Usuário não encontrado

---

#### PATCH `/api/v1/users/[username]`

Atualiza informações de um usuário específico.

**Método:** PATCH

**Parâmetros:**

- `username` (string, obrigatório): O nome de usuário a ser atualizado

**Body (application/json):**

```json
{
  "email": "novo_email@example.com",
  "password": "nova_senha"
}
```

**Resposta (200):**

```json
{
  "id": "uuid-do-usuario",
  "username": "novo_usuario",
  "email": "novo_email@example.com",
  "created_at": "2026-05-13T10:30:45.123Z",
  "updated_at": "2026-05-13T10:30:45.123Z"
}
```

**Erros:**

- `400`: Dados inválidos
- `404`: Usuário não encontrado
- `500`: Erro ao atualizar usuário

---

### 5. Usuário Logado

#### GET `/api/v1/user`

Retorna os dados do usuário autenticado via sessão ativa.

**Método:** GET

**Autenticação:** ✅ Requer sessão ativa (cookie `session_id`)

**Headers:**

```
Cookie: session_id=...
```

**Resposta (200):**

```json
{
  "id": "uuid-do-usuario",
  "username": "novo_usuario",
  "email": "usuario@example.com",
  "features": ["create:session", "read:session"],
  "created_at": "2026-05-13T10:30:45.123Z",
  "updated_at": "2026-05-13T10:30:45.123Z"
}
```

**Comportamento:**

- Valida sessão ativa no banco
- Renova a sessão (estende expiry em 30 dias)
- Atualiza o cookie `session_id` com novo token
- Retorna usuário completo com features

**Erros:**

- `401`: Sessão inválida ou expirada
- `403`: Usuário sem permissão `read:session`

---

#### DELETE `/api/v1/sessions`

Encerra a sessão ativa do usuário (logout).

**Método:** DELETE

**Autenticação:** ✅ Requer sessão ativa (cookie `session_id`)

**Headers:**

```
Cookie: session_id=...
```

**Resposta (200):**

```json
{
  "id": "uuid-da-sessao",
  "token": "token_expirado",
  "user_id": "uuid-do-usuario",
  "expires_at": "2025-05-13T10:30:45.123Z",
  "created_at": "2026-05-13T10:30:45.123Z",
  "updated_at": "2026-05-13T10:30:45.123Z"
}
```

**Comportamento:**

- Expira a sessão no banco de dados
- Limpa o cookie `session_id` (definindo maxAge = -1)
- Retorna sessão expirada

**Erros:**

- `401`: Sessão inválida ou já expirada

---

### 6. Ativação de Usuário

#### PATCH `/api/v1/activations/[token_id]`

Ativa um usuário novo utilizando token enviado por email.

**Método:** PATCH

**Autenticação:** ✅ Requer feature `read:activation_token` (usuário anônimo por padrão)

**Parâmetros:**

- `token_id` (UUID, obrigatório): Token de ativação único enviado por email

**Resposta (200):**

```json
{
  "id": "uuid-do-token",
  "user_id": "uuid-do-usuario",
  "expires_at": "2026-05-13T10:45:45.123Z",
  "used_at": "2026-05-13T10:30:45.123Z",
  "created_at": "2026-05-13T10:30:45.123Z",
  "updated_at": "2026-05-13T10:30:45.123Z"
}
```

**Fluxo de Ativação:**

1. Valida token: deve existir, não estar expirado, não ter sido usado
2. Verifica se usuário ainda tem feature `read:activation_token` (não ativado)
3. Adiciona features ao usuário: `create:session`, `read:session` (permite login)
4. Marca token como usado (sets `used_at`)
5. Retorna token com metadados de ativação

**Erros:**

- `404`: Token não encontrado, expirado ou já foi utilizado
- `403`: Usuário já ativado (não tem feature `read:activation_token`)
- `403`: Usuário logado tentando ativar token de outro usuário

---

#### POST `/api/v1/status`

Testa conectividade e saúde geral do sistema.

**Método:** POST

**Body (application/json):**

```json
{}
```

**Resposta (201):**

```json
{
  "update_at": "2026-05-13T10:30:45.123Z",
  "postgres_version": "15.2",
  "max_connections": 100,
  "used_connections": 5
}
```

**Nota:** Retorna o mesmo que GET /status, mas com status 201 (Created).

---

---

## Sistemas de Features (Permissões de Usuário)

O projeto utiliza um sistema baseado em **features** para controle de acesso granular. Cada usuário tem um array de features que determina quais ações pode realizar.

### Features Disponíveis

| Feature                 | Descrição                      | Concedida Quando          |
| ----------------------- | ------------------------------ | ------------------------- |
| `read:activation_token` | Ler e usar tokens de ativação  | Ao criar usuário (padrão) |
| `create:session`        | Criar nova sessão (login)      | Após ativar usuário       |
| `read:session`          | Ler dados de sessão ativa      | Após ativar usuário       |
| `create:user`           | Criar novo usuário (registrar) | Todos os públicos         |

### Fluxo de Features

```
┌─────────────────────┐
│ Usuário novo criado │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Features: [read:activation_token]   │
│ Status: NÃO ativado                 │
└──────────┬───────────────────────────┘
           │
           │ Clica no link de ativação
           │ PATCH /activations/[token_id]
           ▼
┌───────────────────────────────────────────────────────────┐
│ Features: [create:session, read:session]               │
│ Status: ATIVADO ✓                                       │
│ Pode fazer login, acessar /user, renovar sessão        │
└───────────────────────────────────────────────────────────┘
```

### Middleware de Autorização

Todo endpoint que requer feature específica usa o middleware `canRequest(feature)` do controller:

```javascript
router.patch(
  controller.canRequest(userFeatures.READ_ACTIVATION_TOKEN),
  patchHandler,
);
```

Se usuário não tiver a feature, retorna `403 ForbiddenError`.

---

## Fluxos Principais da Aplicação

### 1. Fluxo de Registro e Ativação

```
1. Usuário preenche formulário
   POST /api/v1/users
   Body: { username, email, password }
   ▼
   ✓ Valida email/username únicos
   ✓ Hash da senha com bcryptjs
   ✓ Insere usuário com feature [read:activation_token]
   ✓ Gera token de ativação (válido por 15 min)
   ✓ Envia email com link: /cadastro/ativar/{token.id}
   ← Resposta 201 + User object

2. Usuário clica no email
   PATCH /api/v1/activations/{token_id}
   ▼
   ✓ Valida token (existe, não expirou, não foi usado)
   ✓ Verifica se usuário tem feature [read:activation_token]
   ✓ Adiciona features: [create:session, read:session]
   ✓ Marca token como usado (used_at = now)
   ← Resposta 200 + Token object

3. Usuário redirecionado para login ✓
```

### 2. Fluxo de Login

```
1. Usuário preenche email/senha
   POST /api/v1/sessions
   Body: { email, password }
   ▼
   ✓ Busca usuário por email
   ✓ Compara senha com bcryptjs
   ✓ Verifica feature [create:session]
   ✓ Gera token de sessão (válido por 30 dias)
   ✓ Insere sessão no banco
   ✓ SET Cookie: session_id (httpOnly, secure, sameSite=strict)
   ← Resposta 201 + Session object

[Navegador armazena session_id automaticamente]
```

### 3. Fluxo de Uso de Sessão

```
1. Usuário logado acessa protected endpoint
   GET /api/v1/user
   Cookie: session_id=...
   ▼
   ✓ Middleware injectAnonymousOrUser busca sessão no BD
   ✓ Valida token: exists + not expired
   ✓ Injeta usuário em request.context.user
   ✓ Middleware canRequest verifica feature [read:session]
   ✓ Renova sessão: extends expires_at + novo token
   ✓ SET Cookie: session_id (novo)
   ← Resposta 200 + User object

[Cada requisição renova a sessão]
```

### 4. Fluxo de Logout

```
1. Usuário clica em "Sair"
   DELETE /api/v1/sessions
   Cookie: session_id=...
   ▼
   ✓ Busca sessão no BD
   ✓ Expira sessão: expires_at -= 1 year
   ✓ CLEAR Cookie: session_id (maxAge = -1)
   ← Resposta 200 + Expired session object

[Usuário agora anônimo]
```

### 5. Fluxo de Atualização de Usuário

```
1. Usuário logado edita perfil
   PATCH /api/v1/users/{username}
   Cookie: session_id=...
   Body: { email?, password?, username? }
   ▼
   ✓ Busca usuário atual
   ✓ Se email: valida unicidade
   ✓ Se username: valida unicidade
   ✓ Se password: faz hash
   ✓ Atualiza BD
   ← Resposta 200 + Updated user object
```

---

## Tratamento de Erros

Todos os endpoints utilizam um manipulador de erros centralizado (`controller.errorHandlers`) que padroniza as respostas de erro.

### Classes de Erro

| Classe                | Status | Uso                  | Exemplo                          |
| --------------------- | ------ | -------------------- | -------------------------------- |
| `ValidationError`     | 400    | Entrada inválida     | Username vazio, email inválido   |
| `UnauthorizedError`   | 401    | Autenticação falhou  | Senha incorreta, sessão expirada |
| `ForbiddenError`      | 403    | Falta de permissão   | Usuário sem feature necessária   |
| `NotFoundError`       | 404    | Recurso não existe   | Usuário/token não encontrado     |
| `InternalServerError` | 500    | Erro inesperado      | Erro BD, crash inesperado        |
| `ServiceError`        | 503    | Serviço indisponível | BD desconectado                  |

### Formato Padrão de Erro

```json
{
  "name": "NomeDoErro",
  "message": "Descrição legível do erro",
  "action": "Sugestão do que fazer para resolver",
  "status_code": 400
}
```

**Exemplo:**

```json
{
  "name": "ValidationError",
  "message": "O email já está cadastrado no sistema.",
  "action": "Tente com outro email ou faça login se já tem conta.",
  "status_code": 422
}
```

---

---

## Modelos de Dados

A lógica de negócio está organizada em modelos reutilizáveis em `models/`:

### `user.js` — Gerenciamento de Usuários

**Responsabilidades:**

- Criar usuário com features padrão
- Buscar por ID, username ou email (case-insensitive)
- Atualizar dados do usuário
- Validar unicidade de username e email
- Adicionar features ao usuário

**Funções Principais:**

| Função                             | Descrição                                                   |
| ---------------------------------- | ----------------------------------------------------------- |
| `create(userObject)`               | Cria novo usuário, valida unicidade, injeta features padrão |
| `findOneById(userId)`              | Busca por ID, lança NotFoundError se não existe             |
| `findOneByUsername(username)`      | Case-insensitive, lança NotFoundError                       |
| `findOneByEmail(email)`            | Case-insensitive, lança NotFoundError                       |
| `update(username, updateObject)`   | Atualiza email/password, valida unicidade                   |
| `setFeatures(userId, features)`    | Adiciona features ao usuário                                |
| `validateUniqueUsername(username)` | Lança ValidationError se duplicado                          |
| `validateUniqueEmail(email)`       | Lança ValidationError se duplicado                          |

**Features Padrão ao Criar:**

```javascript
["read:activation_token"];
```

### `authentication.js` — Autenticação

**Responsabilidades:**

- Autenticar usuário com email e senha
- Validar credenciais

**Funções Principais:**

| Função                                 | Descrição                                                       |
| -------------------------------------- | --------------------------------------------------------------- |
| `getAuthenticateUser(email, password)` | Busca usuário, compara senha, lança UnauthorizedError se falhar |

### `authorization.js` — Autorização

**Responsabilidades:**

- Verificar se usuário tem feature específica
- Controle de acesso granular

**Funções Principais:**

| Função               | Descrição                                       |
| -------------------- | ----------------------------------------------- |
| `can(user, feature)` | Retorna boolean se user.features inclui feature |

### `session.js` — Gerenciamento de Sessão

**Responsabilidades:**

- Criar sessão
- Buscar sessão válida por token
- Renovar sessão (estende expiração)
- Expirar sessão

**Constantes:**

- `EXPIRATION_IN_MILLISECONDS`: 30 dias

**Funções Principais:**

| Função                              | Descrição                                |
| ----------------------------------- | ---------------------------------------- |
| `create(userId)`                    | Cria nova sessão com token criptografado |
| `findOneValidByToken(sessionToken)` | Busca por token válido (não expirado)    |
| `renew(sessionId)`                  | Estende expires_at + retorna novo token  |
| `expireById(sessionId)`             | Define expires_at para o passado         |

**Token:**

- Gerado com `crypto.randomBytes(48).toString("hex")`
- 96 caracteres hexadecimais

### `activation.js` — Tokens de Ativação

**Responsabilidades:**

- Criar token de ativação
- Buscar token válido
- Marcar token como usado
- Ativar usuário
- Enviar email de ativação

**Constantes:**

- `EXPIRATION_IN_MILLISECONDS`: 15 minutos

**Funções Principais:**

| Função                         | Descrição                                   |
| ------------------------------ | ------------------------------------------- |
| `create(userId)`               | Cria token UUID válido por 15 min           |
| `findOneValidById(tokenId)`    | Busca token não expirado e não usado        |
| `markTokenAsUsed(tokenId)`     | Sets used_at timestamp                      |
| `activateUserByUserId(userId)` | Verifica feature, adiciona session features |
| `sendEmailToUser(user, token)` | Envia email com link de ativação            |

**Email Template:**

```
Subject: Ative sua conta
Body:
Olá {username}.

Por favor, ative sua conta clicando no link abaixo:
{origin}/cadastro/ativar/{token.id}

Obrigado!
```

**Features Adicionadas ao Ativar:**

```javascript
["create:session", "read:session"];
```

### `password.js` — Hash de Senha

**Responsabilidades:**

- Gerar hash bcryptjs
- Comparar senha com hash

**Funções Principais:**

| Função                                   | Descrição                                        |
| ---------------------------------------- | ------------------------------------------------ |
| `hash(plainPassword)`                    | Retorna hash com salt rounds baseado em NODE_ENV |
| `compare(plainPassword, hashedPassword)` | Retorna boolean                                  |

**Salt Rounds:**

- **Produção** (NODE_ENV=production): 14 rounds
- **Desenvolvimento**: 1 round

### `migrator.js` — Gerenciador de Migrações

**Responsabilidades:**

- Listar migrações pendentes
- Executar migrações

**Funções Principais:**

| Função                    | Descrição                                 |
| ------------------------- | ----------------------------------------- |
| `listPendingMigrations()` | Retorna array de migrações não executadas |
| `runPendingMigrations()`  | Executa todas as pendentes                |

**Configuração:**

- Diretório: `infra/migrations/`
- Tabela tracking: `pgmigrations`
- Tool: `node-pg-migrate` v6.2.2

---

## Arquitetura

### Estrutura de Diretórios

```
pages/api/v1/
├── status/
│   └── index.js                 # GET/POST saúde do BD
├── migrations/
│   └── index.js                 # GET/POST migrações
├── sessions/
│   └── index.js                 # POST login / DELETE logout
├── user/
│   └── index.js                 # GET usuário logado
├── users/
│   ├── index.js                 # POST criar usuário
│   └── [username]/
│       └── index.js             # GET/PATCH usuário por username
└── activations/
    └── [token_id]/
        └── index.js             # PATCH ativar com token

models/
├── user.js                      # Operações com usuários
├── authentication.js            # Autenticação
├── authorization.js             # Autorização (features)
├── session.js                   # Gerenciamento de sessão
├── activation.js                # Tokens de ativação
├── password.js                  # Hash/comparação de senha
└── migrator.js                  # Gerenciador de migrações

infra/
├── controller.js                # Middlewares + handlers de erro
├── database.js                  # Pool PostgreSQL
├── email.js                     # Envio de email (Nodemailer)
├── webserver.js                 # Config de origin
├── errors/
│   └── index.js                 # Classes de erro
├── migrations/
│   ├── 1777652267190_users.js
│   ├── 1778784449509_sessions.js
│   ├── 1778960357425_add-features-to-users.js
│   └── 1779033721383_user-activation-tokens.js
└── scripts/
    └── wait-for-postgres.js     # Script de health-check

utils/
└── userFeatures.js              # Constantes de features

tests/
├── integration/
│   └── api/v1/
│       ├── status/
│       │   ├── get.test.js
│       │   └── post.test.js
│       ├── migrations/
│       │   ├── get.test.js
│       │   └── post.test.js
│       ├── sessions/
│       │   ├── post.test.js
│       │   ├── delete.test.js
│       │   └── security.test.js
│       ├── user/
│       │   └── get.test.js
│       ├── users/
│       │   ├── post.test.js
│       │   ├── [username]/
│       │   │   ├── get.test.js
│       │   │   └── patch.test.js
│       ├── activations/
│       │   └── [token_id]/
│       │       └── path.test.js
│       └── registration/
│           └── registration-flow.test.js
└── e2e/
    └── status/
        └── status.e2e.spec.ts   # Testes Playwright
```

### Componentes Principais

- **Router:** Usa `next-connect` para composição de middlewares
- **Controller:** `infra/controller.js` centraliza:
  - Middleware `injectAnonymousOrUser`: Parse de sessão
  - Middleware `canRequest(feature)`: Verificação de features
  - Error handlers: `onNoMatch`, `onError`
  - Cookie management: `setSessionCookie`, `clearSessionCookie`
- **Models:** Lógica de negócio isolada em `models/`
- **Database:** Pool PostgreSQL com interface parametrizada
- **Email:** Nodemailer com templates

### Padrão de Middleware

Todo endpoint segue este padrão:

```javascript
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter();

// 1. Injetar usuário (anônimo ou autenticado)
router.use(controller.injectAnonymousOrUser);

// 2. Verificar feature (se endpoint requer autenticação)
router.get(controller.canRequest(userFeatures.FEATURE_NAME), getHandler);

// 3. Handlers
async function getHandler(request, response) {
  // request.context.user já contém usuário + features
  // Lógica aqui
}

// 4. Erro centralizado
export default router.handler(controller.errorHandlers);
```

---

---

## Cobertura de Testes de Integração

Os testes estão localizados em `tests/integration/api/v1/` e cobrem todos os endpoints:

| Endpoint                        | Testes                               | Arquivo                                  |
| ------------------------------- | ------------------------------------ | ---------------------------------------- |
| `GET /status`                   | Saúde do BD, versão, conexões        | `status/get.test.js`                     |
| `POST /status`                  | Teste de POST no status              | `status/post.test.js`                    |
| `GET /migrations`               | Lista migrações pendentes            | `migrations/get.test.js`                 |
| `POST /migrations`              | Executa migrações                    | `migrations/post.test.js`                |
| `POST /sessions`                | Login com credenciais                | `sessions/post.test.js`                  |
| `DELETE /sessions`              | Logout e limpeza de cookie           | `sessions/delete.test.js`                |
| `POST /sessions`                | Segurança de sessão, renovação       | `sessions/security.test.js`              |
| `GET /user`                     | Usuário logado, renovação            | `user/get.test.js`                       |
| `POST /users`                   | Criar usuário, validação             | `users/post.test.js`                     |
| `GET /users/[username]`         | Buscar usuário público               | `users/[username]/get.test.js`           |
| `PATCH /users/[username]`       | Atualizar usuário, validação         | `users/[username]/patch.test.js`         |
| `PATCH /activations/[token_id]` | Ativar usuário com token             | `activations/[token_id]/path.test.js`    |
| **Fluxo E2E**                   | Registro completo → Ativação → Login | `registration/registration-flow.test.js` |

**Execução:**

```bash
# Rodar todos os testes
npm test

# Rodar um arquivo específico
npm test -- tests/integration/api/v1/users/post.test.js

# Modo watch
npm run test:watch
```

**Testes E2E (Playwright):**

```bash
# Rodar testes com UI
npm run test:e2e
```

Localizado em: `tests/e2e/status/status.e2e.spec.ts`

---

## Variáveis de Ambiente

**Arquivo:** `.env.development` ou `.env`

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres-dev
POSTGRES_PORT=5432
POSTGRES_DB=clone_tabnews

# Email
EMAIL_HTTP_HOST=mailcatcher-dev
EMAIL_HTTP_PORT=1080

# Node
NODE_ENV=development
```

---

## Padrões e Convenções

### Convenção de Nomeação

- **Endpoints:** Plural para coleções (`/users`, `/sessions`)
- **Features:** `resource:action` (ex: `read:session`, `create:user`)
- **Componentes:** PascalCase (ex: `UserModel`, `SessionController`)
- **Funções:** camelCase (ex: `findOneById`, `validateUniqueEmail`)
- **Constantes:** UPPER_SNAKE_CASE (ex: `EXPIRATION_IN_MILLISECONDS`)

### Validação

Todas as validações devem:

1. Ocorrer no modelo (não no handler)
2. Lançar `ValidationError` com mensagem e action clara
3. Incluir validação de tipo de dados
4. Usar queries parametrizadas para BD

### Middleware Obrigatório

Todo endpoint DEVE usar:

```javascript
router.use(controller.injectAnonymousOrUser);
```

E endpoints protegidos DEVEM usar:

```javascript
router.patch(
  controller.canRequest(userFeatures.READ_ACTIVATION_TOKEN),
  patchHandler,
);
```

### Hash de Senha

Todas as operações com senha DEVEM usar `models/password.js`:

```javascript
import password from "models/password";

const hashedPassword = await password.hash(plainPassword);
const isValid = await password.compare(plainPassword, hashedPassword);
```

### Cookies de Sessão

Todos os cookies DEVEM usar:

```javascript
controller.setSessionCookie(newToken, response);
controller.clearSessionCookie(response);
```

Características:

- `httpOnly: true` (impede XSS)
- `sameSite: 'strict'` (impede CSRF)
- `secure: true` em produção (HTTPS only)
- `maxAge: 30 dias` (sessão)

---

## Próximos Passos

- ✅ Sistema de features (COMPLETO)
- ✅ Autenticação com sessão persistida (COMPLETO)
- ⏳ Paginação em endpoints de lista
- ⏳ Rate limiting por IP
- ⏳ Documentação Swagger/OpenAPI
- ⏳ Refresh tokens
- ⏳ Two-factor authentication
- ⏳ Recuperação de senha via email
