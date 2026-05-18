import { createRouter } from "next-connect";

import controller from "infra/controller";

import authentication from "models/authentication";
import session from "models/session";
import authorization from "@/models/authorization";

import userFeatures from "@/utils/userFeatures";
import { ForbiddenError } from "@/infra/errors";

const router = createRouter();
router.use(controller.injectAnonymousOrUser); // middleware

router.post(controller.canRequest(userFeatures.CREATE_SESSION), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  // autentica o usuário usando as credenciais fornecidas (email e senha) e retorna o objeto do usuário autenticado
  const authenticateUser = await authentication.getAuthenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  // verifica se o usuário autenticado tem permissão para criar uma sessão
  if (!authorization.can(authenticateUser, userFeatures.CREATE_SESSION)) {
    throw new ForbiddenError({
      message: "Seu usuário não tem permissão para criar uma sessão.",
      action: "Entre em contato com o suporte para obter mais informações.",
    });
  }

  const newSession = await session.create(authenticateUser.id); // cria uma nova sessão para o usuário autenticado
  controller.setSessionCookie(newSession.token, response); // define o cookie de sessão no navegador do cliente usando o token da nova sessão criada

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
