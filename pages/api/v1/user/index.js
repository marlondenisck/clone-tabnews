import { createRouter } from "next-connect";
import controller from "infra/controler";

import user from "models/user";
import session from "models/session";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renewedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renewedSession.token, response);

  const userFound = await user.findOneById(sessionObj.user_id);
  return response.status(200).json(userFound);
}
