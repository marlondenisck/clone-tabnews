import { createRouter } from "next-connect";
import controller from "infra/controler";
import user from "models/user";
import password from "models/password";

import { UnauthorizedError } from "infra/errors";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  let storedUser;

  try {
    storedUser = await user.findOneByEmail(userInputValues.email);
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autenticação não conferem.",
      action: "Verifique os dados enviados estão corretos.",
    });
  }

  const passwordMatch = await password.compare(
    userInputValues.password,
    storedUser.password,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Senha não confere.",
      action: "Verifique se este dado está correto.",
    });
  }

  return response.status(201).json({});
}
