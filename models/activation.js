import email from "@/infra/email";
import database from "@/infra/database";
import webserver from "@/infra/webserver";
import { NotFoundError, ForbiddenError } from "@/infra/errors";

import user from "@/models/user";
import authorization from "./authorization";
import availableFeatures from "@/infra/features";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutos

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Contato <contato@example.com>",
    to: user.email,
    subject: "Ative sua conta",
    text: `Olá ${user.username}.\n\nPor favor, ative sua conta clicando no link abaixo:\n\n ${webserver.origin}/cadastro/ativar/${activationToken.id}"\n\nObrigado!`,
  });
}

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      `,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro",
      });
    }

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [activationTokenId],
    });
    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  // busca o usuário relacionado ao token
  const userToActivate = await user.findOneById(userId);

  // verifica se o usuário já tem acesso ao recurso de leitura de token de ativação, ou seja, se ele já está ativo
  if (
    !authorization.can(userToActivate, availableFeatures.READ_ACTIVATION_TOKEN)
  ) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  // ativa o usuário adicionando as features de criação e leitura de sessão, ou seja, dando acesso ao recurso de login
  const activatedUser = await user.setFeatures(userId, [
    availableFeatures.CREATE_SESSION,
    availableFeatures.READ_SESSION,
    availableFeatures.UPDATE_USER,
  ]);

  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
