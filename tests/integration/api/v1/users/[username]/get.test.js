import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("Busca pelo username exato", async () => {
      await orchestrator.createUser({
        username: "MesmoCaseUser",
        email: "mesmo.case@example.com",
        password: "password123",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCaseUser",
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCaseUser",
        email: "mesmo.case@example.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("Busca pelo username escrito diferente", async () => {
      await orchestrator.createUser({
        username: "caseDiferenteUser",
        email: "case.diferente@example.com",
        password: "password123",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casediferenteuser",
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "caseDiferenteUser",
        email: "case.diferente@example.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test("Busca pelo username nao existente", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioinexistente",
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
  });
});
