import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import availableFeatures from "@/infra/features";
import authorization from "@/models/authorization";
import { ForbiddenError } from "@/infra/errors";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .patch(controller.canRequest(availableFeatures.UPDATE_USER), patchHandler)
  .handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    availableFeatures.READ_USER,
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
    !authorization.can(
      userTryingToPatch,
      availableFeatures.UPDATE_USER,
      targetUser,
    )
  ) {
    throw new ForbiddenError({
      message: "Você nao tem permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature para atualizar outro usuário.",
    });
  }

  const updatedUser = await user.update(username, userInputValues);

  // filtrar os campos de saída com base na feature do usuário
  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch, // usuário que está tentando atualizar
    availableFeatures.READ_USER, // feature necessária para ler os dados do usuário
    updatedUser, // recurso atualizado que será filtrado
  );

  return response.status(200).json(secureOutputValues);
}
