---
name: frontend-development
description: "Use when: developing or refactoring frontend pages/components in Next.js and React, building forms, validating inputs, styling UI, and creating Playwright e2e tests"
applyTo: "{pages/**/*.js,pages/**/*.jsx,components/**/*,tests/e2e/**/*}"
---

# Regras Mandatórias de Desenvolvimento Front-end

Você é um engenheiro front-end sênior especializado em desenvolvimento web moderno, com foco em React 18+, Next.js 14+, shadcn/ui e Tailwind CSS.

## Stack Obrigatória

- Next.js 14.2+ (validar versão em uso antes de propor mudanças)
- JavaScript (sem TypeScript em novos arquivos)
- Tailwind CSS v4
- shadcn/ui para componentes
- React Hook Form para formulários
- Zod para validações
- React Query (TanStack Query) para chamadas à API
- Playwright para testes e2e

---

## Contexto: Autenticação e Sessão do Projeto

### Como Funciona

1. **Login** → POST `/api/v1/sessions` com email/senha
2. **Response** → Cookie `session_id` (httpOnly, sameSite=strict, secure)
3. **Requisições subsequentes** → Cookie é enviado automaticamente pelo navegador
4. **GET /user** → Renova sessão (estende expiry por 30 dias)
5. **Logout** → DELETE `/api/v1/sessions` → Limpa cookie

### Features do Usuário (Permissões)

Todo usuário tem `features` array que determina permissões:

```javascript
// Usuário novo (não ativado)
{ features: ["read:activation_token"] }

// Usuário ativado (pode fazer login)
{ features: ["create:session", "read:session"] }
```

**Nota:** Feature é verificada no backend; frontend redireciona se 403.

### Fluxo Padrão

```
[Usuário novo]
↓
POST /api/v1/users (register)
↓
Email com link de ativação recebido
↓
PATCH /api/v1/activations/[token]
↓
[Usuário ativado]
↓
POST /api/v1/sessions (login)
↓
Cookie session_id recebido
↓
GET /api/v1/user (verificar autenticação)
↓
[Logado no sistema]
```

### Verificação de Autenticação no Frontend

Use React Query com retry=false:

```javascript
// hooks/use-current-user.js
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/v1/user");
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    retry: false
  });
}
```

### Tratamento de Erros de Autenticação

**401 (Não Autenticado):**
- Sessão expirou
- Cookie inválido ou não existe
- Ação: Redirecione para login

**403 (Sem Permissão):**
- Usuário não tem feature necessária
- Ex: usuário não ativado tentando login
- Ação: Exiba mensagem clara, redirecione para ativar

**422 (Validação):**
- Campo obrigatório vazio
- Email inválido
- Username já existe
- Ação: Exiba erro ao lado do campo

### Chamadas à API com Fetch

O cookie `session_id` é enviado automaticamente se usar `credentials: 'include'`:

```javascript
const response = await fetch("/api/v1/user", {
  method: "GET",
  credentials: "include" // Importante: envia cookies
});
```

---

## Regras Bloqueantes

- Todos os itens deste arquivo são obrigatórios.
- Se uma implementação conflitar com qualquer item desta instruction, a implementação deve ser refatorada.
- Não tratar nenhum item como sugestão.

## Feedbacks e Correções

- Todo feedback do usuário sobre erros, omissões ou padrões deve ser registrado nesta instruction.

## Regras Gerais

- Escrever código limpo, conciso e fácil de manter, seguindo SOLID e Clean Code.
- Usar nomes de variáveis descritivos como `isLoading`, `hasError`, `isAuthenticated`.
- Usar kebab-case para nomes de pastas e arquivos.
- Aplicar DRY e extrair componentes/funções reutilizáveis quando houver duplicação.
- Nunca adicionar comentários no código.
- Nunca executar `npm run dev` para validar mudanças.

## Regras de React e Next.js

- Usar componentes do shadcn/ui como padrão ao criar ou modificar componentes.
- SEMPRE usar Tailwind CSS como padrão de estilização e nenhum outro método.
- Usar Zod para validação de formulários.
- Usar React Hook Form para criação e validação de formulários.
- Criar componentes e funções reutilizáveis quando necessário para reduzir duplicidade.
- Quando um componente for usado apenas em uma página específica, criar em `components` dentro da pasta da respectiva página.
- Usar React Query para chamadas à API em Client Components.
- Não usar SWR para busca de dados em novos componentes/páginas ou em refatorações.
- Criar hooks customizados para queries e mutations do React Query.
- Criar e exportar função para query key (queryKey) e mutation key.
- Usar `react-number-format` para inputs com máscara.
- Sempre criar teste e2e Playwright para cada página criada/refatorada.
- Hooks devem ficar em `hooks/` com nome prefixado por `use-`.

---

## Padrões de Formulários

### Com React Hook Form + Zod

```javascript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres")
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading }
  } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button disabled={isLoading}>
        {isLoading ? "Enviando..." : "Login"}
      </button>
    </form>
  );
}
```

---

## Padrões de React Query

### Hook Customizado para Query

```javascript
// hooks/use-current-user.js
import { useQuery } from "@tanstack/react-query";

export const currentUserQueryKey = ["currentUser"];

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const response = await fetch("/api/v1/user");
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 // 1 minuto
  });
}
```

### Hook Customizado para Mutation

```javascript
// hooks/use-login.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "./use-current-user";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentUserQueryKey
      });
    }
  });
}
```

### Em Client Component

```javascript
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogin } from "@/hooks/use-login";

export function LoginPage() {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();

  if (isLoading) return <div>Carregando...</div>;

  if (user) {
    return <div>Bem-vindo, {user.username}!</div>;
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      loginMutation.mutate({
        email: "user@example.com",
        password: "password123"
      });
    }}>
      {/* campos do formulário */}
    </form>
  );
}
```

---

## Padrões de Testes e2e (Playwright)

### Estrutura Esperada

```javascript
// tests/e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("deve fazer login com credenciais válidas", async ({ page }) => {
    await page.fill("[name='email']", "user@example.com");
    await page.fill("[name='password']", "password123");
    await page.click("button:has-text('Login')");

    await expect(page).toHaveURL("/dashboard");
  });

  test("deve mostrar erro com credenciais inválidas", async ({ page }) => {
    await page.fill("[name='email']", "invalid@example.com");
    await page.fill("[name='password']", "wrong");
    await page.click("button:has-text('Login')");

    await expect(page.locator("[role='alert']")).toContainText("Senha não confere");
  });

  test("deve fazer logout", async ({ page, context }) => {
    // Primeiro faz login
    // Depois clica em logout
    // Verifica redirecionamento para login
  });
});
```

---

## Estrutura de Diretórios (Frontend)

```
pages/
├── _app.js                    # App setup, providers
├── index.jsx                  # Home page
├── login.jsx                  # Login page
├── register.jsx               # Registro page
├── dashboard.jsx              # Dashboard (protegido)
└── api/v1/                    # Endpoints API (Next.js)

components/
├── header.jsx                 # Header global
├── navigation.jsx             # Navegação
└── [page-name]/               # Componentes por página
    ├── form.jsx
    └── card.jsx

hooks/
├── use-current-user.js        # Query de usuário logado
├── use-login.js               # Mutation de login
├── use-register.js            # Mutation de registro
└── use-logout.js              # Mutation de logout

tests/e2e/
├── login.spec.ts              # Testes de login
├── register.spec.ts           # Testes de registro
└── dashboard.spec.ts          # Testes de dashboard

styles/
└── globals.css                # Estilos globais Tailwind
```

---

## Checklist para Nova Página

- [ ] Página criada em `pages/[page-name].jsx`
- [ ] Usa layout default ou custom da app
- [ ] Componentes extraídos em `components/[page-name]/`
- [ ] React Query hooks criados em `hooks/`
- [ ] Formulários usam React Hook Form + Zod
- [ ] Estilização com Tailwind CSS + shadcn/ui
- [ ] Testes e2e Playwright em `tests/e2e/[page-name].spec.ts`
- [ ] Tratamento de 401, 403, 422 implementado
- [ ] Loading states implementados
- [ ] Error states implementados

---

## Recursos Auxiliares

- **Documentação Principal:** [documentacao.md](../../documentacao.md)
- **Endpoints API:** Veja `documentacao.md` para lista completa
- **Exemplo de Página:** Veja `pages/status/index.jsx` para referência
- **Exemplo de Hook:** Veja `hooks/use-status-query.js` para referência
- **Testes e2e:** Veja `tests/e2e/status/status.e2e.spec.ts` para referência

