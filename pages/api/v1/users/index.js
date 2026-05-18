import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";
import userFeatures from "@/utils/userFeatures";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest(userFeatures.CREATE_USER), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  // 1- criar token de ativação
  const activationToken = await activation.create(newUser.id);

  // 2- enviar email com token de ativação
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(newUser);
}
