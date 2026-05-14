import user from "models/user";
import password from "models/password";
import { UnauthorizedError, NotFoundError } from "infra/errors";

async function getAuthenticateUser(providedEmail, providedPassword) {
  const storedUser = await findUserByEmail(providedEmail);
  await validadePassword(providedPassword, storedUser.password);

  return storedUser;

  async function findUserByEmail(providedEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Dados de autenticação não conferem.",
          action: "Verifique os dados enviados estão corretos.",
        });
      }
      throw error;
    }
    return storedUser;
  }

  async function validadePassword(providedPassword, storedPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = { getAuthenticateUser };

export default authentication;
