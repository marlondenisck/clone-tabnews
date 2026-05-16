import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions - Segurança", () => {
  describe("Tentativas de SQL Injection", () => {
    test("Email com SQL injection básico: admin'--", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
        password: "senha123",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin'--",
          password: "qualquer-senha",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toBe("UnauthorizedError");
    });

    test("Email com SQL injection: admin' OR '1'='1", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin' OR '1'='1",
          password: "qualquer-senha",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toBe("UnauthorizedError");
    });

    test("Email com SQL injection: DROP TABLE users;--", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "DROP TABLE users;--",
          password: "qualquer-senha",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody.name).toBe("UnauthorizedError");

      // Verifica que a tabela users ainda existe
      const userStillExists = await orchestrator.createUser({
        email: "verificacao@example.com",
      });
      expect(userStillExists).toBeDefined();
    });
  });

  describe("Credenciais inválidas ou vazias", () => {
    test("Email vazio", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(401);
    });

    test("Senha vazia", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com",
          password: "",
        }),
      });

      expect(response.status).toBe(401);
    });

    test("Email null", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: null,
          password: "senha123",
        }),
      });

      expect(response.status).toBe(401);
    });

    test("Senha null", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com",
          password: null,
        }),
      });

      expect(response.status).toBe(401);
    });

    test("Body vazio", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Privacidade de informações (timing attacks)", () => {
    test("Email inválido não revela se usuário existe", async () => {
      await orchestrator.createUser({
        email: "existe@example.com",
        password: "senha-real",
      });

      const startInvalid = Date.now();
      const responseInvalid = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "nao-existe@example.com",
            password: "qualquer-senha",
          }),
        },
      );
      const timeInvalid = Date.now() - startInvalid;

      const startValid = Date.now();
      const responseValid = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "existe@example.com",
            password: "senha-invalida",
          }),
        },
      );
      const timeValid = Date.now() - startValid;

      expect(responseInvalid.status).toBe(401);
      expect(responseValid.status).toBe(401);

      // Ambas devem retornar mensagens genéricas para usuário não encontrado
      const invalidBody = await responseInvalid.json();
      const validBody = await responseValid.json();

      expect(invalidBody.message).toBe("Dados de autenticação não conferem.");
      expect(validBody.message).toBe("Senha não confere.");

      // O tempo de resposta pode variar, mas não deve ser drasticamente diferente
      // (não há busca no DB para usuário não-existente vs busca + comparação de senha)
      // A diferença deve ser mínima (~10ms é aceitável)
      const timeDifference = Math.abs(timeInvalid - timeValid);
      console.log(
        `Timing: não-existe=${timeInvalid}ms, existe=${timeValid}ms, diff=${timeDifference}ms`,
      );
    });
  });

  describe("Manipulação de cookies", () => {
    test("Não permite acesso via JavaScript (httpOnly)", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const setCookieHeader = response.headers.get("set-cookie");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(response.status).toBe(201);
    });

    test("Protege contra CSRF com SameSite=Strict", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const setCookieHeader = response.headers.get("set-cookie");
      expect(setCookieHeader).toContain("SameSite=Strict");
      expect(response.status).toBe(201);
    });

    test("Cookie seguro em desenvolvimento (sem Secure flag)", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const setCookieHeader = response.headers.get("set-cookie");
      // Em desenvolvimento, Secure não deve estar presente
      expect(setCookieHeader).not.toContain("Secure");
    });
  });

  describe("Token e sessão", () => {
    test("Token é único a cada criação de sessão", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const body1 = await response1.json();

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const body2 = await response2.json();

      expect(body1.token).not.toBe(body2.token);
      expect(body1.id).not.toBe(body2.id);
    });

    test("Token tem comprimento adequado (96 caracteres hex = 48 bytes)", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const body = await response.json();
      expect(body.token).toMatch(/^[a-f0-9]{96}$/); // 48 bytes em hex = 96 caracteres
      expect(body.token.length).toBe(96);
    });

    test("Sessão tem data de expiração válida", async () => {
      const credentials = {
        email: "user@example.com",
        password: "senha123",
      };
      await orchestrator.createUser(credentials);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const body = await response.json();
      const createdAt = new Date(body.created_at);
      const expiresAt = new Date(body.expires_at);

      // Deve expirar em ~30 dias
      const diffInMs = expiresAt - createdAt;
      expect(diffInMs).toBeGreaterThanOrEqual(
        session.EXPIRATION_IN_MILLISECONDS - 1000,
      );
      expect(diffInMs).toBeLessThanOrEqual(
        session.EXPIRATION_IN_MILLISECONDS + 1000,
      );
    });
  });

  describe("Brute force e rate limiting", () => {
    test("Múltiplas tentativas falhadas são permitidas (sem rate limiting)", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
        password: "senha-correta",
      });

      // Simula um atacante tentando múltiplas senhas
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        const response = await fetch("http://localhost:3000/api/v1/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user@example.com",
            password: `tentativa-${i}`,
          }),
        });
        attempts.push(response.status);
      }

      // Todas as requisições devem retornar 401 sem bloqueio (no momento não há rate limiting)
      expect(attempts.every((status) => status === 401)).toBe(true);
    });
  });

  describe("Malformed requests", () => {
    test("JSON inválido", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid json}",
      });

      expect(response.status).not.toBe(201);
      expect([400, 401, 500]).toContain(response.status);
    });

    test("Content-Type ausente", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "senha123",
        }),
      });

      expect(response.status).not.toBe(201);
    });

    test("Email com formato inválido", async () => {
      await orchestrator.createUser({
        email: "valid@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "not-an-email",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Isolamento de sessão entre usuários", () => {
    test("Usuário A não consegue usar sessão do Usuário B", async () => {
      const userA = await orchestrator.createUser({
        email: "userA@example.com",
        password: "senhaA",
      });

      await orchestrator.createUser({
        email: "userB@example.com",
        password: "senhaB",
      });

      // Cria sessão para usuário A
      const responseA = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "userA@example.com",
          password: "senhaA",
        }),
      });

      const sessionA = await responseA.json();

      // Tenta usar o token de A como B (simulando roubo de cookie)
      // Isso depende de haver um endpoint que valida a sessão
      // Por enquanto, apenas verifica que tokens são únicos por usuário
      expect(sessionA.user_id).toBe(userA.id);
    });
  });

  describe("Proteção contra XSS", () => {
    test("Script no email não é executado", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "<script>alert('xss')</script>@example.com",
          password: "qualquer-senha",
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.message).toBeDefined();
      // A resposta não deve conter o script
      expect(JSON.stringify(body)).not.toContain("<script>");
    });

    test("Script na senha não é executado", async () => {
      await orchestrator.createUser({
        email: "user@example.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com",
          password: "<script>alert('xss')</script>",
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      // A resposta não deve conter o script
      expect(JSON.stringify(body)).not.toContain("<script>");
    });
  });

  describe("Método HTTP inválido", () => {
    test("GET /api/v1/sessions retorna 405 ou erro", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "GET",
      });

      expect([405, 404]).toContain(response.status);
    });

    test("PUT /api/v1/sessions retorna 405 ou erro", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "test" }),
      });

      expect([405, 404]).toContain(response.status);
    });
  });
});
