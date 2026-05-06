import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("impedir atualizar um username nao existente", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioinexistente",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username informado e tente novamente.",
        status_code: 404,
      });
    });

    test("impedir atualizar username duplicado", async () => {
      const user1Response = await fetch(`http://localhost:3000/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@example.com",
          password: "password123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch(`http://localhost:3000/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@example.com",
          password: "password123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const response = await fetch(`http://localhost:3000/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta ação.",
        status_code: 400,
      });
    });

    test("impedir atualizar email duplicado", async () => {
      const user1Response = await fetch(`http://localhost:3000/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@example.com",
          password: "password123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch(`http://localhost:3000/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@example.com",
          password: "password123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/email2`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@example.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta ação.",
        status_code: 400,
      });
    });
  });
});
