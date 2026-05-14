Titulos corretos para implementar no test

Given the user is not logged in
Dado que o usuário não está logado

When the user make a POST to /migrations endpoint
Quando o usuário faz um POST para o endpoint /migrations

Then the migrations should be executed successfully
Então as migrações devem ser executadas com sucesso

## **Jest/Vitest + React Testing Library**

**Escopo:** Testes unitários e de integração  
**Executam:** No Node.js (não abre navegador real)  
**Velocidade:** ⚡ Rápido (milissegundos)  
**Foco:** Comportamento dos componentes React

```javascript
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("botão exibe texto e clica", () => {
  render(<Button onClick={jest.fn()}>Clique</Button>);
  const button = screen.getByRole("button", { name: /clique/i });
  expect(button).toBeInTheDocument();
});
```

**Vantagens:**

- Rápido (CI/CD mais veloz)
- Testa lógica do componente isoladamente
- Ideal para coverage de código
- Menos recursos de máquina

**Limitações:**

- Não testa em navegador real
- Não pega bugs de CSS/layout
- Não testa interações complexas (drag, scroll)
- Pode passar no teste mas falhar em produção

---

## **Playwright**

**Escopo:** Testes end-to-end (E2E)  
**Executam:** Em navegador real (Chrome, Firefox, Safari)  
**Velocidade:** 🐢 Mais lento (segundos)  
**Foco:** Fluxo completo do usuário

```javascript
import { test, expect } from "@playwright/test";

test("usuário loga e vê dashboard", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('input[name="email"]', "user@test.com");
  await page.fill('input[name="password"]', "123456");
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL("/dashboard");
});
```

**Vantagens:**

- Testa em navegador real (deteta problemas reais)
- Testa fluxos completos (login → ações → logout)
- Detecta bugs de CSS, layout, responsividade
- Suporta múltiplos navegadores
- Pode testar APIs externas integradas

**Limitações:**

- Muito mais lento
- Mais frágil (mudanças UI quebram testes)
- Não é bom para testes unitários
- Consome mais recursos

---

## **Quando usar cada um?**

| Caso                             | Jest/Vitest | Playwright |
| -------------------------------- | ----------- | ---------- |
| Testar lógica de hook/componente | ✅          | ❌         |
| Testar função utilitária         | ✅          | ❌         |
| Testar fluxo do usuário completo | ❌          | ✅         |
| Testar responsividade            | ❌          | ✅         |
| Testar integração com API        | ✅          | ✅         |
| Coverage de código               | ✅          | ❌         |
| CI/CD rápido                     | ✅          | ❌         |

---

## **Estratégia Ideal (Pirâmide de Testes)**

```
        🔺 E2E (Playwright)  - 5-10%
       🔸 Integração        - 20-30%
      🔻 Unitários (Jest)   - 60-70%
```

**Exemplos:**

- **Unit:** Testa função `calculateDiscount()` ✅ Jest
- **Integration:** Testa `<CartForm>` com estado + mock API ✅ Jest + React Testing Library
- **E2E:** Testa "usuário adiciona produto ao carrinho e faz checkout" ✅ Playwright

# Comandos curl

## cria usuario

`curl -v -X POST http://localhost:3000/api/v1/users \
  --header "Content-Type: application/json" \
  --data '{"email": "cookie@curso.dev", "username": "cookie", "password": "cookie"}'`

## cria session

`   curl -v -X POST http://localhost:3000/api/v1/sessions \
  --header "Content-Type: application/json" \
  --data '{"email": "cookie@curso.dev", "password": "cookie"}'  `

## via console navegador

`
fetch('/api/v1/sessions', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON. stringify({
email: 'cookieacurso.dev',
password: "cookie"
})
})

`
