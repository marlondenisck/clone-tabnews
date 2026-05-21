import { createRouter } from "next-connect";
import controller from "infra/controller";

import user from "models/user";
import activation from "models/activation";
import authorization from "@/models/authorization";

import availableFeatures from "@/infra/features";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest(availableFeatures.CREATE_USER), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const userInputValues = request.body;

  const newUser = await user.create(userInputValues);

  // 1- criar token de ativação
  const activationToken = await activation.create(newUser.id);

  // 2- enviar email com token de ativação
  await activation.sendEmailToUser(newUser, activationToken);

  // 3- filtrar os campos de saída com base na feature do usuário
  const secureOutputValues = authorization.filterOutput(
    userTryingToPost, // usuário que está tentando criar
    availableFeatures.READ_USER, // quando user usa recurso
    newUser, // recurso criado que será filtrado
  );

  return response.status(201).json(secureOutputValues);
}
