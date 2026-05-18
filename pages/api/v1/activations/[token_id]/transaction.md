## O que são Transactions?

Uma **transaction** (transação) é um conjunto de operações de banco de dados que são executadas como uma **unidade atômica**. Isso significa: **ou todas as operações são executadas e salvas (COMMIT), ou nenhuma é executada (ROLLBACK)**.

### Por que é importante neste caso?

Seu código faz 3 operações críticas:

1. Busca o token válido
2. Marca o token como usado
3. Ativa o usuário

Se algo falhar entre elas, seu banco fica em **estado inconsistente**. Por exemplo:

- ❌ Token marcado como usado, mas usuário não ativado
- ❌ Usuário ativado, mas token não marcado

## Como Funciona?

```
BEGIN TRANSACTION
  [Operação 1]
  [Operação 2]
  [Operação 3]
COMMIT (tudo sucede) ou ROLLBACK (tudo desfaz)
```

## Implementação no Seu Projeto

Primeiro, crie uma função utilitária em database.js:

```javascript
async function transaction(callback) {
  let client;

  try {
    client = await getNewClient();

    // Inicia a transação
    await client.query("BEGIN");

    // Executa o callback passando o client
    const result = await callback(client);

    // Se tudo correu bem, faz commit
    await client.query("COMMIT");

    return result;
  } catch (error) {
    // Se algo deu errado, faz rollback
    if (client) {
      await client.query("ROLLBACK");
    }

    const serviceErrorObject = new ServiceError({
      message: "Erro na transação de banco de dados.",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

const database = {
  query: query,
  getNewClient,
  transaction, // Adiciona a função de transação
};
```

Depois, atualize activation.js para aceitar um cliente opcional:

```javascript
async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `...`,
      values: [activationTokenId],
    });
    return results.rows[0];
  }
}

// Versão com suporte a transações
async function markTokenAsUsedWithClient(activationTokenId, client) {
  const results = await client.query({
    text: `
      UPDATE user_activation_tokens
      SET used_at = timezone('utc', now()), updated_at = timezone('utc', now())
      WHERE id = $1
      RETURNING *
    `,
    values: [activationTokenId],
  });
  return results.rows[0];
}

async function findOneValidByIdWithClient(tokenId, client) {
  const results = await client.query({
    text: `
      SELECT *
      FROM user_activation_tokens
      WHERE id = $1 AND expires_at > NOW() AND used_at IS NULL
      LIMIT 1
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
```

Finalmente, atualize seu endpoint para usar a transação:

```javascript
async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const usedActivationToken = await database.transaction(async (client) => {
    // Busca o token válido
    const validActivationToken = await findOneValidByIdWithClient(
      activationTokenId,
      client,
    );

    // Marca o token como usado
    const usedToken = await markTokenAsUsedWithClient(
      validActivationToken.id,
      client,
    );

    // Ativa o usuário relacionado ao token
    await activation.activatedUserByUserId(validActivationToken.user_id);

    return usedToken;
  });

  return response.status(200).json(usedActivationToken);
}
```

## Benefícios

✅ **Consistência**: Se qualquer operação falhar, tudo é desfeito  
✅ **Integridade**: O banco nunca fica em estado inconsistente  
✅ **Confiabilidade**: Falhas não deixam dados "órfãos"

Isso é especialmente crítico em fluxos de segurança como ativação de conta!
