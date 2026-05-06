import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM 
          users 
        WHERE 
          LOWER(username) = LOWER($1)
        LIMIT
          1
      `,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado.",
        action: "Verifique o username informado e tente novamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password) 
      VALUES 
        ($1, $2, $3)
      RETURNING *
      `,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(
      userInputValues.username,
      currentUser.username,
    );
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;
}

async function runUpdateQuery(userWithNewValues) {
  const results = await database.query({
    text: `
      UPDATE 
        users 
      SET 
        username = $2,
        email = $3,
        password = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = $1
      RETURNING *
      `,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  });

  return results.rows[0];
}

async function validateUniqueUsername(username, currentUsername = null) {
  const result = await database.query({
    text: `
        SELECT
          username
        FROM 
          users 
        WHERE 
          LOWER(username) = LOWER($1)
          AND ($2::text IS NULL OR LOWER(username) != LOWER($2))
      `,
    /**
       * LOWER(username) = LOWER($1)
Procura registros cujo username seja igual ao novo username informado, ignorando maiúsculas/minúsculas.

AND (...)
Além de encontrar username igual ao novo, aplicamos uma segunda regra de filtro.

$2::text IS NULL OR LOWER(username) != LOWER($2)
Essa segunda regra tem dois comportamentos:

Se $2 for NULL (caso de criação), a condição já é verdadeira e ninguém é excluído da checagem.
Se $2 tiver valor (caso de atualização), excluímos da busca o usuário atual (o próprio dono), para não dar falso positivo.
Como isso funciona na prática:

No create:

$1 = username novo
$2 = NULL
Resultado: qualquer registro com username igual conta como duplicado.
No update:

$1 = username que o usuário quer usar
$2 = username atual do próprio usuário
Resultado: se encontrar só ele mesmo, não acusa erro.
Se encontrar outro usuário com esse username, acusa duplicado.
Exemplo rápido:

Usuário atual: joao
Ele envia update com username: joao
A consulta encontra joao, mas a parte LOWER(username) != LOWER($2) vira falso para ele mesmo, então esse registro é ignorado.
Não há duplicado real, então passa.
       */
    values: [username, currentUsername],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta ação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
        SELECT
          email
        FROM 
          users 
        WHERE 
          LOWER(email) = LOWER($1)
      `,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta ação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
