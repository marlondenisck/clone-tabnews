import orchestrator from "tests/orchestrator";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Rodar migrations pendentes", async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response1.status).toBe(403);
      const responseBody = await response1.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se seu usuário possui a feature create:migration",
        message: "Você nao tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("impedir migrações pendentes", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se seu usuário possui a feature create:migration",
        message: "Você nao tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("pode rodar migrations pendentes com a feature `create:migration`", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["create:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });

    test("Não deve rodar migrations novamente se já estiverem rodadas", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["create:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(Array.isArray(response2Body)).toBe(true);
      expect(response2Body.length).toBe(0);
    });
  });
});
