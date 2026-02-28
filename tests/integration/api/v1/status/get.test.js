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

  test("deve retornar a versão 16.0 do postgres", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.postgres_version).toBeDefined();
    // expect(typeof responseBody.postgres_version).toBe("string");
    expect(responseBody.postgres_version).toEqual("16.0");
  });

  test("deve retornar a quantidade maxima de conexões do banco", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    expect(responseBody.max_connections).toBeDefined();
    expect(typeof responseBody.max_connections).toBe("number");
    expect(responseBody.max_connections).toBeGreaterThanOrEqual(
      responseBody.used_connections,
    );
  });

  test("deve retornar a quantidade de conexões atualmente usadas no banco", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    const responseBody = await response.json();
    console.log("Used Connections:", responseBody.used_connections);
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

    expect(responseBody.used_connections).toBeDefined();
    expect(typeof responseBody.used_connections).toBe("number");
    expect(responseBody.used_connections).toEqual(1);
  });

  // test.only("Teste de SQL Injection", async () => {
  //   await fetch("http://localhost:3000/api/v1/status?datname='tabnews';");
  //   await fetch("http://localhost:3000/api/v1/status?datname=';");
  //   await fetch(
  //     "http://localhost:3000/api/v1/status?datname='; SELECT pg_sleep(4); --",
  //   );
  // });
});
