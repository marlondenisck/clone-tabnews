import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import activation from "@/models/activation";
import user from "@/models/user";
import webserver from "@/infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Fluxo de registro de usuário", () => {
  let createdUserResponseBody;
  let activationTokenId;

  test("Cria conta de usuario", async () => {
    const createdUserResponse = await fetch(
      `${webserver.origin}/api/v1/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registrationflow@example.com",
          password: "password123",
        }),
      },
    );

    expect(createdUserResponse.status).toBe(201);

    createdUserResponseBody = await createdUserResponse.json();
    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      username: "RegistrationFlow",
      features: ["read:activation_token"],
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });

    expect(uuidVersion(createdUserResponseBody.id)).toBe(4);
    expect(Date.parse(createdUserResponseBody.created_at)).not.toBeNaN();
    expect(Date.parse(createdUserResponseBody.updated_at)).not.toBeNaN();
  });

  test("Recebe email de ativação", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@example.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationflow@example.com>");
    expect(lastEmail.subject).toBe("Ative sua conta");
    expect(lastEmail.text).toContain("RegistrationFlow");

    activationTokenId = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    const activationTokenObject =
      await activation.findOneValidById(activationTokenId);

    expect(activationTokenObject.user_id).toBe(createdUserResponseBody.id);
    expect(activationTokenObject.used_at).toBeNull();
  });

  test("Ativa conta de usuário", async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();
    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual([
      "create:session",
      "read:session",
      "update:user",
    ]);
  });

  let createSessionResponseBody;
  test("Faz login apos a conta ativada", async () => {
    const createSessionResponse = await fetch(
      `${webserver.origin}/api/v1/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registrationflow@example.com",
          password: "password123",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    createSessionResponseBody = await createSessionResponse.json();
    expect(createSessionResponseBody.user_id).toEqual(
      createdUserResponseBody.id,
    );
  });

  test("Buscar usuário", async () => {
    const userResponse = await fetch(`${webserver.origin}/api/v1/user`, {
      headers: {
        cookie: `session_id=${createSessionResponseBody.token}`,
      },
    });

    const userResponseBody = await userResponse.json();
    expect(userResponse.status).toBe(200);
    expect(userResponseBody.id).toBe(createdUserResponseBody.id);
  });
});
