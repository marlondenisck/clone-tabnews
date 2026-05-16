import email from "@/infra/email";

describe("infra/email", () => {
  it("send email", async () => {
    const result = await email.send({
      from: "Remetente <remetente@example.com>",
      to: "Destinatário <destinatario@example.com>",
      subject: "Assunto do email",
      text: "Corpo do email",
    });
  });
});
