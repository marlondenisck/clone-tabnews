import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Fluxo de registro de usuário", () => {
  test("Cria conta de usuario", async () => {
    const createdUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
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

    const createdUserResponseBody = await createdUserResponse.json();
    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registrationflow@example.com",
      password: createdUserResponseBody.password,
      features: ["read:activation_token"], // acao:objeto:modificador
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });

    expect(uuidVersion(createdUserResponseBody.id)).toBe(4);
    expect(Date.parse(createdUserResponseBody.created_at)).not.toBeNaN();
    expect(Date.parse(createdUserResponseBody.updated_at)).not.toBeNaN();
  });

  test("Recebe email de ativação", async () => {
    const lastEmail = await orchestrator.getLastEmail();
    console.log("lastEmail", lastEmail);

    expect(lastEmail.sender).toBe("<contato@example.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationflow@example.com>");
    expect(lastEmail.subject).toBe("Ative sua conta");
    expect(lastEmail.text).toContain("RegistrationFlow");
  });

  test("Ativa conta de usuário", async () => {});

  test("Faz login com conta ativada", async () => {});

  test("Buscar usuário", async () => {});
});
