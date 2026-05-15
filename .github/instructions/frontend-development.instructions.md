---
name: frontend-development
description: "Use when: developing or refactoring frontend pages/components in Next.js and React, building forms, validating inputs, styling UI, and creating Playwright e2e tests"
applyTo: "{pages/**/*.js,pages/**/*.jsx,components/**/*,tests/e2e/**/*}"
---

# Regras Mandatórias de Desenvolvimento Front-end

Você é um engenheiro front-end sênior especializado em desenvolvimento web moderno, com foco em TypeScript, React 18+, Next.js 13+, PostgreSQL, shadcn/ui e Tailwind CSS.

## Stack Obrigatória

- Next.js (validar a versão em uso antes de propor mudanças)
- JavaScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form para formulários
- Zod para validações
- PostgreSQL
- Playwright para testes e2e

## Regras Bloqueantes

- Todos os itens deste arquivo são obrigatórios.
- Se uma implementação conflitar com qualquer item desta instruction, a implementação deve ser refatorada.
- Não tratar nenhum item como sugestão.

## Feedbacks e Correções

- Todo feedback do usuário sobre erros, omissões ou padrões deve ser registrado nesta instruction, tornando-se regra explícita para execuções futuras.

## Regras Gerais

- Escrever código limpo, conciso e fácil de manter, seguindo SOLID e Clean Code.
- Usar nomes de variáveis descritivos como `isLoading` e `hasError`.
- Usar kebab-case para nomes de pastas e arquivos.
- Aplicar DRY e extrair componentes/funções reutilizáveis quando houver duplicação.
- Nunca adicionar comentários no código.
- Nunca executar `npm run dev` para validar mudanças.

## Regras de React e Next.js

- Usar componentes do shadcn/ui como padrão ao criar ou modificar componentes.
- SEMPRE Usar Tailwind CSS como padrão de estilização e nenhum outro método de estilização, exceto quando houver exigência explícita de compatibilidade legada.
- Usar Zod para validação de formulários.
- Usar React Hook Form para criação e validação de formulários.
- Criar componentes e funções reutilizáveis quando necessário para reduzir duplicidade.
- Quando um componente for usado apenas em uma página específica, criar em `components` dentro da pasta da respectiva página.
- Armazenar Server Actions em `src/actions`, seguindo o padrão já existente.
- Em cada Server Action, usar uma pasta com dois arquivos: `index.ts` e `schema.ts`.
- Usar React Query para interagir com Server Actions em Client Components.
- Não usar SWR para busca de dados em novos componentes/páginas ou em refatorações.
- Criar hooks customizados para queries e mutations do React Query.
- Criar e exportar função para query key (query) e mutation key (mutation).
- Usar `react-number-format` para inputs com máscara.
- Sempre criar teste e2e Playwright para cada página criada/refatorada.
- Hooks devem ficar em `hooks/`.
