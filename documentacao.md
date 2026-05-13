# Documentação da API - Clone TabNews

## Visão Geral

A API do Clone TabNews é uma REST API construída com Next.js que fornece endpoints para gerenciar usuários, verificar o status do banco de dados e executar migrações.

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

### 3. Usuários

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

## Tratamento de Erros

Todos os endpoints utilizam um manipulador de erros centralizado (`controller.errorHandlers`) que padroniza as respostas de erro.

**Formato padrão de erro:**

```json
{
  "status_code": 400,
  "message": "Descrição do erro",
  "details": {}
}
```

---

## Arquitetura

### Estrutura de Diretórios

```
pages/api/
└── v1/
    ├── migrations/
    │   └── index.js
    ├── status/
    │   └── index.js
    └── users/
        ├── index.js
        └── [username]/
            └── index.js
```

### Componentes Principais

- **Router:** Utiliza `next-connect` para roteamento
- **Controller:** Manipulador centralizado de erros em `infra/controler`
- **Models:** Lógica de negócio em `models/`
  - `user.js`: Operações com usuários
  - `migrator.js`: Gerenciamento de migrações
  - `password.js`: Operações com senhas

---

## Variáveis de Ambiente

- `POSTGRES_DB`: Nome do banco de dados PostgreSQL

---

## Testes

Os testes da API estão organizados em `tests/integration/api/v1/`:

- `migrations/get.test.js`: Testes para GET /migrations
- `migrations/post.test.js`: Testes para POST /migrations
- `status/get.test.js`: Testes para GET /status
- `users/post.test.js`: Testes para POST /users
- `users/[username]/get.test.js`: Testes para GET /users/[username]
- `users/[username]/patch.test.js`: Testes para PATCH /users/[username]

Para executar os testes:

```bash
npm test
```

---

## Próximos Passos

- Adicionar autenticação (JWT/Sessions)
- Implementar paginação em endpoints de lista
- Adicionar validação mais robusta de inputs
- Implementar rate limiting
- Adicionar documentação interativa (Swagger/OpenAPI)
