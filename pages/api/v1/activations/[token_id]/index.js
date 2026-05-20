import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";
import authorization from "@/models/authorization";
import userFeatures from "@/utils/userFeatures";

const router = createRouter();

router.use(controller.injectAnonymousOrUser); // middleware
router.patch(
  controller.canRequest(userFeatures.READ_ACTIVATION_TOKEN),
  patchHandler,
);

export default router.handler(controller.errorHandlers);

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
    userFeatures.READ_ACTIVATION_TOKEN,
    usedActivationToken,
  );

  return response.status(200).json(secureOutputValue);
}
