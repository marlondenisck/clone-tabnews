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
    if (
      typeof providedPassword !== "string" ||
      providedPassword.trim().length === 0
    ) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados enviados estão corretos.",
      });
      /*
        O if aqui faz:
      1.Ele verifica se providedPassword é realmente texto.
      Se não for string (por exemplo null, objeto, número, array, undefined), ele interrompe o fluxo e lança UnauthorizedError com 401.

      2.Por que isso é importante
      Sem essa checagem, a chamada de comparação de senha pode quebrar com erro interno (como já vimos: Illegal arguments), gerando 500.
      500 é erro de servidor; nesse caso o problema é credencial inválida do cliente, então o correto é 401.

      3.Benefício de segurança
      Ele evita vazar detalhes técnicos (stack de biblioteca) e mantém resposta controlada.
      Também ajuda a reduzir enumeração de comportamento estranho para payloads malformados.

      4.Por que a mensagem é genérica nesse caso
      Quando o tipo está inválido, faz sentido responder com Dados de autenticação não conferem.
      Isso não confirma nada sobre usuário existente ou senha correta, então expõe menos informação.

      5.Limitação atual
      Esse if valida tipo, mas não conteúdo.
      */
    }

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
