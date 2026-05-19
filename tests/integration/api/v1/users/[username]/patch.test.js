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

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("atualizar username unico", async () => {
      const uniqueUser = await orchestrator.createUser({
        username: "uniqueuser",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueuser2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você nao tem permissão para executar esta ação.",
        action: "Verifique se seu usuário possui a feature update:user",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("impedir atualizar um username nao existente", async () => {
      const createdUser = await orchestrator.createUser();
      // console.log("createdUser", createdUser);
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/usuarioinexistente`,
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(404);
      const responseBody = await response.json();
      // console.log("responseBody", responseBody);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username informado e tente novamente.",
        status_code: 404,
      });
    });

    test("impedir atualizar username duplicado", async () => {
      await orchestrator.createUser({
        username: "user1",
        email: "user1@example.com",
      });

      const user2 = await orchestrator.createUser({
        username: "user2",
        email: "user2@example.com",
      });

      const activatedUser2 = await orchestrator.activateUser(user2);
      const sessionObject2 = await orchestrator.createSession(activatedUser2);

      const response = await fetch(`${webserver.origin}/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject2.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta ação.",
        status_code: 400,
      });
    });

    test("impedir atualizar email duplicado", async () => {
      await orchestrator.createUser({
        email: "email1@example.com",
      });

      const user2 = await orchestrator.createUser({
        email: "email2@example.com",
      });

      const activatedUser2 = await orchestrator.activateUser(user2);
      const sessionObject2 = await orchestrator.createSession(activatedUser2);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${user2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            email: "email1@example.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta ação.",
        status_code: 400,
      });
    });

    test("atualizar username unico", async () => {
      const uniqueUser = await orchestrator.createUser({
        username: "uniqueuser1",
      });

      const activatedUniqueUser = await orchestrator.activateUser(uniqueUser);
      const sessionObject =
        await orchestrator.createSession(activatedUniqueUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueuser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuser2",
        email: responseBody.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("atualizar email unico", async () => {
      const uniqueUserResponse = await orchestrator.createUser({
        email: "uniqueemailuser@example.com",
      });

      const activatedUniqueUser =
        await orchestrator.activateUser(uniqueUserResponse);
      const sessionObject =
        await orchestrator.createSession(activatedUniqueUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${uniqueUserResponse.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueemailuser2@example.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "uniqueemailuser2@example.com",
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("atualizar nova senha", async () => {
      const passwordUserResponse = await orchestrator.createUser({
        password: "newpassword1",
      });
      const activatedUniqueUser =
        await orchestrator.activateUser(passwordUserResponse);
      const sessionObject =
        await orchestrator.createSession(activatedUniqueUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${passwordUserResponse.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "newpassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: passwordUserResponse.username,
        email: passwordUserResponse.email,
        password: responseBody.password,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        passwordUserResponse.username,
      );
      const correctPasswordMatch = await password.compare(
        "newpassword2",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newpassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
