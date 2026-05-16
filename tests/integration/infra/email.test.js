import email from "@/infra/email";
import orchestrator from "@/tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email", () => {
  test("send email", async () => {
    await email.send({
      from: "Remetente <remetente@example.com>",
      to: "Destinatário <destinatario@example.com>",
      subject: "Assunto do email",
      text: "Corpo do email",
    });

    await email.send({
      from: "Remetente <remetente@example.com>",
      to: "Destinatário <destinatario@example.com>",
      subject: "Ultimo email enviado",
      text: "Corpo do ultimo email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    // console.log("lastEmail", lastEmail);
    expect(lastEmail.sender).toBe("<remetente@example.com>");
    expect(lastEmail.recipients[0]).toBe("<destinatario@example.com>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text.trim()).toBe("Corpo do ultimo email");
  });
});
