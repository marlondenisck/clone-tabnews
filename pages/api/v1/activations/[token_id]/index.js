import { createRouter } from "next-connect";
import controller from "infra/controller";
import activation from "models/activation";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  // pega o token_id dos params da rota
  const activationTokenId = request.query.token_id;

  // busca o token pelo id
  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  // marca o token como usado
  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  // ativa o usuário relacionado ao token
  await activation.activatedUserByUserId(validActivationToken.user_id);

  return response.status(200).json(usedActivationToken);
}
