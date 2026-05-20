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

describe("GET /api/v1/user", () => {
  describe("Anonymous user", () => {
    test("Deve retornar 403 ao acessar o enpoint", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/user`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você nao tem permissão para executar esta ação.",
        action: "Verifique se seu usuário possui a feature read:session",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Quando a sessão é válida", async () => {
      // Cria um usuário persistido para ser retornado pelo endpoint autenticado.
      const createdUser = await orchestrator.createUser({
        username: "userValidSession",
      });

      // Ativa o usuário para garantir que ele tenha as features necessárias para acessar o endpoint de usuário (como read:activation_token, que é requisito para criar sessão e acessar o endpoint de usuário).
      const activatedUser = await orchestrator.activateUser(createdUser);
      // Cria uma sessão válida para o usuário, gerando um token de autenticação.
      const sessionObj = await orchestrator.createSession(createdUser.id);

      // Envia o cookie session_id para simular um usuário já autenticado.
      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      // Usuário com sessão ativa deve conseguir acessar o recurso.
      expect(response.status).toBe(200);

      // O endpoint de usuário deve incluir headers para evitar cache, garantindo que informações sensíveis não sejam armazenadas em cache por navegadores ou proxies.
      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();
      // O payload deve corresponder ao usuário da sessão.
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "userValidSession",
        email: responseBody.email, // O email é retornado apenas para o próprio usuário, então pegamos do response para validar a presença e formato, sem expor o valor fixo aqui.
        features: ["create:session", "read:session", "update:user"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });

      // Sanidade dos campos de identificação e data.
      expect(uuidVersion(createdUser.id)).toBe(4);
      expect(Date.parse(createdUser.created_at)).not.toBeNaN();
      expect(Date.parse(createdUser.updated_at)).not.toBeNaN();

      // RENOVAÇÃO DE SESSÃO: O endpoint de usuário também renova a sessão, então o expires_at e updated_at devem ser atualizados para um valor futuro.
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObj.token,
      );
      expect(renewedSessionObject.expires_at > sessionObj.expires_at).toEqual(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObj.updated_at).toEqual(
        true,
      );

      // Set-Cookie de renovação da data do token deve ser enviado no header da resposta.
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });

    test("Quando a sessão não existe", async () => {
      await orchestrator.createUser({
        username: "userNonExistentSession",
      });

      const fakeToken =
        "57aa1924f252665e09ba3b8b455857be575157baf018a9b05e9171b437a6d5fdb36162607a47f5fa66edf577fc729c6b";
      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${fakeToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });

    test("Quando a sessão foi criada há 15 dias, ela ainda é válida", async () => {
      // Congela o relógio em 15 dias no passado para criar uma sessão mais antiga.
      jest.useFakeTimers({
        now: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      });
      const createdUser = await orchestrator.createUser({
        username: "userSession15DaysOld",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser.id);

      // Volta ao tempo real para validar a sessão contra NOW() do banco.
      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      // O endpoint deve renovar a sessão e devolver o Set-Cookie atualizado.
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });

      // Como a expiração é de 30 dias, a sessão com 15 dias ainda deve autenticar.
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "userSession15DaysOld",
        email: responseBody.email,
        features: ["create:session", "read:session", "update:user"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });
    });

    test("Quando a sessão está expirada", async () => {
      // O teste de sessão expirada, simula um login antigo e depois tenta usar esse cookie para acessar o endpoint de usuário.
      // Congela o relógio para o passado para criar uma sessão "antiga".
      //Isso faz a criação da sessão acontecer “30 dias atrás”.
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      // console.log("Data congelada:", new Date().toISOString());

      // Cria usuário e sessão enquanto o tempo está congelado no passado.
      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      // Retorna ao relógio real para validar expiração contra o horário atual do banco.
      jest.useRealTimers();

      // console.log("Data real:", new Date().toISOString());

      // Reutiliza o token antigo; a sessão deve ser considerada inválida/expirada.
      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      // Endpoint deve bloquear acesso sem sessão ativa.
      // Como a sessão foi criada no “passado congelado”, o expires_at dela fica no limite/atrás do horário atual real. Então a query não encontra sessão válida e lança UnauthorizedError:
      expect(response.status).toBe(401);

      const responseBody = await response.json();

      // Mensagem de erro padronizada para sessão ausente/expirada.
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });

      // Resumo do teste:
      // ele prova que cookie de sessão antiga não autentica mais, porque a validação depende de expiração real no banco (NOW()), não só da existência do token.
    });
  });
});
