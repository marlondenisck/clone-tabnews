import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("Quando a sessão é válida", async () => {
      // Cria um usuário persistido para ser retornado pelo endpoint autenticado.
      const createdUser = await orchestrator.createUser({
        username: "userValidSession",
      });

      // Cria uma sessão válida para o usuário, gerando um token de autenticação.
      const sessionObj = await orchestrator.createSession(createdUser.id);

      // Envia o cookie session_id para simular um usuário já autenticado.
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      // Usuário com sessão ativa deve conseguir acessar o recurso.
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      // O payload deve corresponder ao usuário da sessão.
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "userValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      // Sanidade dos campos de identificação e data.
      expect(uuidVersion(createdUser.id)).toBe(4);
      expect(Date.parse(createdUser.created_at)).not.toBeNaN();
      expect(Date.parse(createdUser.updated_at)).not.toBeNaN();
    });

    test("Quando a sessão não existe", async () => {
      await orchestrator.createUser({
        username: "userNonExistentSession",
      });

      const fakeToken =
        "57aa1924f252665e09ba3b8b455857be575157baf018a9b05e9171b437a6d5fdb36162607a47f5fa66edf577fc729c6b";
      const response = await fetch("http://localhost:3000/api/v1/user", {
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
    });

    test("Quando sessão está expirada", async () => {
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
      const response = await fetch("http://localhost:3000/api/v1/user", {
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

      // Resumo do teste:
      // ele prova que cookie de sessão antiga não autentica mais, porque a validação depende de expiração real no banco (NOW()), não só da existência do token.
    });
  });
});
