import { createRouter } from "next-connect";
import controller from "infra/controller";

import user from "models/user";
import session from "models/session";
import authorization from "@/models/authorization";

import availableFeatures from "@/infra/features";

const router = createRouter();
router.use(controller.injectAnonymousOrUser); // middleware
router.get(controller.canRequest(availableFeatures.READ_SESSION), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const userTryingToGet = request.context.user;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renewedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renewedSession.token, response);

  const userFound = await user.findOneById(sessionObj.user_id);
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet, // usuário que está tentando acessar
    availableFeatures.READ_USER, // feature necessária para ler os dados do usuário
    userFound, // recurso encontrado que será filtrado
  );

  return response.status(200).json(secureOutputValues);
}
