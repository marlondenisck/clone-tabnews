import orchestrator from "tests/orchestrator";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("impedir migrações pendentes", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se seu usuário possui a feature read:migration",
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
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      console.log("Response status:", response.status);

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se seu usuário possui a feature read:migration",
        message: "Você nao tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("permitir migrações pendentes com a feature `read:migration`", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);

      await orchestrator.addFeaturesToUser(createdUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
