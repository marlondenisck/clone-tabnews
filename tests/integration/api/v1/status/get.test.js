import orchestrator from "tests/orchestrator";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("deve executar com NODE_ENV=test", () => {
      expect(process.env.NODE_ENV).toBe("test");
    });

    test("deve retornar status 200", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.dependencies).not.toHaveProperty("version");
    });

    test("deve retornar a data", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();
      expect(responseBody.update_at).toBeDefined();
      const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(parsedUpdateAt).toEqual(responseBody.update_at);
    });
  });

  describe("Privileged user", () => {
    test("deve retornar a versão 16.0 do postgres", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:status:all"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();
      expect(responseBody.dependencies.database.version).toBeDefined();
      expect(typeof responseBody.dependencies.database.version).toBe("string");

      const parsedVersion = Number.parseFloat(
        responseBody.dependencies.database.version,
      );
      expect(Number.isNaN(parsedVersion)).toBe(false);
      expect(parsedVersion).toBeGreaterThanOrEqual(16.0);
    });

    test("deve retornar a quantidade maxima de conexões do banco", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:status"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      const responseBody = await response.json();
      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(typeof responseBody.dependencies.database.max_connections).toBe(
        "number",
      );
      // expect(responseBody.dependencies.database.max_connections).toBeGreaterThanOrEqual(
      //   responseBody.dependencies.database.used_connections,
      // );
    });

    test("deve retornar a quantidade de conexões atualmente usadas no banco", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:status"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      const responseBody = await response.json();
      // console.log("Used Connections:", responseBody.used_connections);
      //  Por que está mostrando 27 conexões:
      // Cada requisição abre 3 conexões - No endpoint index.js, são feitas 3 queries (linhas 7, 13 e 22):
      // SHOW server_version
      // SHOW max_connections
      // SELECT COUNT(*)::int FROM pg_stat_activity
      // Cada query cria um novo Client - Em database.js:3-13, a função query() cria um novo Client do zero a cada chamada, ao invés de reutilizar conexões.
      // 5 testes × 3 conexões = 15 conexões mínimas - Como você tem 5 testes rodando sequencialmente, isso gera muitas conexões.

      // Conexões não fecham instantaneamente - Mesmo chamando client.end(), o PostgreSQL pode manter essas conexões em estado "idle" ou "terminando" por alguns segundos. Quando o último teste roda (linha 35), ele conta TODAS as conexões que ainda não foram completamente fechadas.
      // A solução correta é usar um Pool de conexões:
      // O problema está em database.js. Ao invés de criar um novo Client a cada query, você deveria usar um Pool que reutiliza conexões.

      expect(responseBody.dependencies.database.used_connections).toBeDefined();
      expect(typeof responseBody.dependencies.database.used_connections).toBe(
        "number",
      );
      expect(responseBody.dependencies.database.used_connections).toEqual(1);
    });
  });
});
