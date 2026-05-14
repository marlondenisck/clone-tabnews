import { createRouter } from "next-connect";
import * as cookie from "cookie";

import controller from "infra/controler";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const authenticateUser = await authentication.getAuthenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticateUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // maxAge é definido em segundos
    secure: process.env.NODE_ENV === "production", // Garante que o cookie seja enviado apenas em conexões seguras (HTTPS) em produção
    httpOnly: true, // Impede o acesso ao cookie via JavaScript, aumentando a segurança contra ataques XSS
    sameSite: "strict", // Impede o envio do cookie em requisições cross-site, aumentando a segurança contra ataques CSRF
  });
  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(newSession);
}
