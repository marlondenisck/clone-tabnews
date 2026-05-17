import email from "@/infra/email";

async function sendEmailToUser(user) {
  await email.send({
    from: "Contato <contato@example.com>",
    to: user.email,
    subject: "Ative sua conta",
    text: `Olá ${user.username}.\n\nPor favor, ative sua conta clicando no link abaixo:\n\n http://example.com/activate?token=${user.activation_token}"\n\nObrigado!`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
