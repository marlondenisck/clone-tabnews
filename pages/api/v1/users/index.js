import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  // 1- criar token de ativação
  await activation.sendEmailToUser(newUser);

  // 2- enviar email com token de ativação

  return response.status(201).json(newUser);
}
