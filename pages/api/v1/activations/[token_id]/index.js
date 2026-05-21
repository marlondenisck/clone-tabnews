import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import authorization from "@/models/authorization";
import availableFeatures from "@/infra/features";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .patch(
    controller.canRequest(availableFeatures.READ_ACTIVATION_TOKEN),
    patchHandler,
  )
  .handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const userTryingToPatch = request.context.user;
  // pega o token_id dos params da rota
  const activationTokenId = request.query.token_id;

  // busca o token pelo id
  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  // ativa o usuário relacionado ao token
  await activation.activateUserByUserId(validActivationToken.user_id);

  // marca o token como usado
  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  const secureOutputValue = authorization.filterOutput(
    userTryingToPatch,
    availableFeatures.READ_ACTIVATION_TOKEN,
    usedActivationToken,
  );

  return response.status(200).json(secureOutputValue);
}
