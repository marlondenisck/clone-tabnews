import { createRouter } from "next-connect";
import controller from "infra/controler";
import authentication from "models/authentication";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  await authentication.getAuthenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  return response.status(201).json({});
}
