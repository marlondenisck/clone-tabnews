import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "tests/orchestrator";
import session from "models/session";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("Contem email incorreto mas, senha correta", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email-errado@example.com",
          password: "senha-correta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Contem email correto mas, senha incorreta", async () => {
      await orchestrator.createUser({
        email: "email-correto1@example.com",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email-correto1@example.com",
          password: "senha-errada",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
        status_code: 401,
      });
    });

    test("Contem email e senha incorretos", async () => {
      await orchestrator.createUser();

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email-incorreto@example.com",
          password: "senha-incorreta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Contem credenciais corretas", async () => {
      const credentials = {
        email: "email.correto@example.com",
        password: "senha.correta",
      };
      const createdUser = await orchestrator.createUser(credentials);

      await orchestrator.activateUser(createdUser);

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN(); // Verifica se a data de expiração é válida
      expect(Date.parse(responseBody.created_at)).not.toBeNaN(); // Verifica se a data de criação é válida
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN(); // Verifica se a data de atualização é válida
      // `expires_at` é calculado na aplicação antes da persistência.
      // `created_at` é calculado depois na camada do banco de dados.
      // Por isso, o tempo real entre as duas datas pode ficar ligeiramente
      // menor do que o tempo de expiração configurado e não bater 30 dias nos
      // milissegundos caso seja calculado apenas `expires_at` - `created_at`.
      // Então a ideia é garantir que no momento `expires_at` seja maior que
      // `created_at`, e também que possa existir distância de até 5 segundo
      // entre as duas datas para cobrir o caso do banco sofrer algum load
      // inesperado nos testes.

      /**
       * Nos testes sobre criar uma sessão válida, a propriedade `expires_at`
        do objeto de sessão é calculada na camada da aplicação, antes da
        persistência. Já a propriedade `created_at` é calculada depois, lá na
        camada do banco de dados, o que faz uma sessão não ter exatamente
        30 dias de expiração em milissegundos que seriam `2592000000` e ficando
        então com valores muito próximos como `2591999991`, por exemplo, que
        são 30 dias menos 9 milissegundos.

        Os testes atuais já tentavam compensar esta diferença ao zerar os
        segundos das datas envolvidas, mas é uma alternativa que possui um furo
        dependendo de algumas condições como o virar do minuto. Tentei pegar
        este comportamento para mostrar em uma aula, mas não consegui e isto
        estava me agoniando ao pensar que algum aluno poderia ver o seu CI
        quebrando e não entender o motivo.

        Então para já evitar esta situação daqui para frente e depois de
        sugestões de vários alunos, optei por adicionar uma margem de erro de
        5 segundos entre o que é esperado (30 dias exatos de expiração) e o que
        o objeto de sessão de fato possui de tempo de expiração.
       */

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expect(expiresAt >= createdAt).toBe(true);

      const actualLifetimeInMilliseconds = expiresAt - createdAt;
      const lifetimeDifferenceInMilliseconds =
        session.EXPIRATION_IN_MILLISECONDS - actualLifetimeInMilliseconds;
      expect(lifetimeDifferenceInMilliseconds).toBeLessThanOrEqual(5000);

      const parsedSetCookie = setCookieParser(response, {
        map: true, // Retorna um objeto mapeado em vez de um array
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });

      const setCookieHeader = response.headers.get("set-cookie");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader).toContain("SameSite=Strict");
      expect(setCookieHeader).not.toContain("Secure");
    });
  });
});
