import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import userFeatures from "@/utils/userFeatures";
import authorization from "@/models/authorization";
import { ForbiddenError } from "@/infra/errors";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest(userFeatures.UPDATE_USER), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    userFeatures.READ_USER,
    userFound,
  );
  return response.status(200).json(secureOutputValues);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  // sequencia -> user, feature, resource (recurso alvo)
  const userTryingToPatch = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  // verificar se o usuário não tem permissão para atualizar o recurso alvo
  if (
    !authorization.can(userTryingToPatch, userFeatures.UPDATE_USER, targetUser)
  ) {
    throw new ForbiddenError({
      message: "Você nao tem permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature para atualizar outro usuário.",
    });
  }

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
