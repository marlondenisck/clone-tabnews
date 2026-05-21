Usar o zod

Se vocês já usam Zod no front, ganharam 3 vantagens imediatas:

1. Mesma regra de validação nos dois lados.
2. Menos `if` manual espalhado.
3. Erros previsíveis e fáceis de mapear para `401`/`400`.

Sugestão prática para login:

1. Validar shape e tipos com Zod (`email` string válida, `password` string não vazia).
2. Normalizar `trim` no schema (ou logo após parse).
3. No endpoint de sessão, fazer `safeParse` antes de chamar autenticação.
4. Em login, manter mensagem genérica por segurança (evitar enumeração de usuário).

Exemplo direto:

```javascript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().trim().min(1).max(200),
});

function parseLoginInput(body) {
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
```

Depois no fluxo:

- se `parseLoginInput` retornar `null` -> responder erro genérico de autenticação.
- se válido -> segue para `getUser`.

Outras libs possíveis:

1. `joi`: madura, muito usada em backend.
2. `valibot`: bem performática e leve.
3. `class-validator`: boa em projetos orientados a classe (menos comum no seu stack atual).

Recomendação final:

- Ficar com Zod também no backend é o melhor custo-benefício para o teu projeto hoje.  
  Se quiser, eu já implemento isso no endpoint de sessões e ajusto os testes para cobrir parse inválido com payload malformado.

Sugestão de arquitetura limpa:

Validar no boundary da API
Coloque schema no nível de entrada HTTP, por exemplo em pages/api/v1/sessions/schema.js ou pages/api/v1/sessions/validator.js.
O handler em index.js faz parse/normalize e só então chama o model.

Manter model focado em regra de domínio
Em authentication.js, o model assume que recebeu dados minimamente válidos e cuida da autenticação (buscar usuário, comparar senha, lançar erro de auth).
Isso mantém o model reutilizável sem dependência de transporte/web.

Criar um módulo de contrato de entrada
Exemplo de pasta:

schemas/sessions.js para contratos Zod
index.js para aplicar safeParse
authentication.js só com regra de negócio
Padronizar mapeamento de erro
Se parse falhar no Zod, você converte para o erro de autenticação esperado (ou 400, se preferirem semântica estrita), mantendo resposta consistente.
Regra prática:

Zod: valida forma/tipo/sanitização de input.
Model: valida regra de negócio e credencial.
Infra/controller: serializa erros HTTP.
