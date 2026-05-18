import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("Rodar user único pela primeira vez", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "testuser",
        email: "testuser@example.com",
        password: responseBody.password,
        features: ["read:activation_token"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("testuser");
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "wrongpassword",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("Impedir Email Duplicado", async () => {
      async function runFetch(params) {
        return await fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...params,
          }),
        });
      }

      const response1 = await runFetch({
        username: "duplicateuser",
        email: "duplicateuser@example.com",
        password: "password123",
      });

      expect(response1.status).toBe(201);

      const response2 = await runFetch({
        username: "duplicateuser2",
        email: "DuplicateUser@example.com",
        password: "password123",
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta ação.",
        status_code: 400,
      });
    });

    test("Impedir username Duplicado", async () => {
      async function runFetch(params) {
        return await fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...params,
          }),
        });
      }

      const response1 = await runFetch({
        username: "usernameduplicate",
        email: "usernameduplicate@example.com",
        password: "password123",
      });

      expect(response1.status).toBe(201);

      const response2 = await runFetch({
        username: "usernameduplicate",
        email: "usernameduplicate2@example.com",
        password: "password123",
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta ação.",
        status_code: 400,
      });
    });
  });

  describe("Default user", () => {
    test("Com dados únicos e válidos", async () => {
      const user1 = await orchestrator.createUser();
      await orchestrator.activateUser(user1);
      const user1SessionObject = await orchestrator.createSession(user1);

      const user2Response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${user1SessionObject.token}`,
        },
        body: JSON.stringify({
          username: "usuariologado",
          email: "usuariologado@curso.dev",
          password: "senha123",
        }),
      });

      expect(user2Response.status).toBe(403);

      const user2ResponseBody = await user2Response.json();

      expect(user2ResponseBody).toEqual({
        name: "ForbiddenError",
        message: "Você nao tem permissão para executar esta ação.",
        action: "Verifique se seu usuário possui a feature create:user",
        status_code: 403,
      });
    });
  });
});
