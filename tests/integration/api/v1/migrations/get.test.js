import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

describe("GET to /api/v1/migrations ", () => {
  test("deve retornar status 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations");
    expect(response.status).toBe(200);

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("application/json");

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);

    responseBody.forEach((migration) => {
      expect(migration).toEqual(
        expect.objectContaining({
          path: expect.any(String),
          name: expect.any(String),
          timestamp: expect.any(Number),
        }),
      );
    });
  });

  test("deve retornar 405 para metodo nao suportado", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "DELETE",
    });

    expect(response.status).toBe(405);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ error: "Method not allowed" });
  });
});
