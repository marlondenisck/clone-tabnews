import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 dias

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
      `,
      values: [token, userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function findOneValidByToken(sessionToken) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
    `,
    values: [sessionToken],
  });

  if (result.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão ativa.",
      action: "Verifique se este usuário está logado e tente novamente.",
    });
  }

  return result.rows[0];
}

const session = { create, findOneValidByToken, EXPIRATION_IN_MILLISECONDS };

export default session;
