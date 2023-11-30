describe("GET to /api/v1/status", () => {
  test("deve retornar status 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    expect(response.status).toBe(200);
  });

  test("deve retornar a data", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.update_at).toBeDefined();
    const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
    expect(parsedUpdateAt).toEqual(responseBody.update_at);
  });

  test("deve retornar a versão do postgres", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.postgres_version).toBeDefined();
    expect(typeof responseBody.postgres_version).toBe("string");
  });

  test("deve retornar a quantidade maxima de conexões do banco", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.max_connections).toBeDefined();
    expect(typeof responseBody.max_connections).toBe("number"); 
    expect(responseBody.max_connections).toBeGreaterThanOrEqual(responseBody.used_connections);
  });

  test("deve retornar a quantidade de conexões atualmente usadas no banco", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.used_connections).toBeDefined();
    expect(typeof responseBody.used_connections).toBe("number");
  });
});
