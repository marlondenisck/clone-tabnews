import { createRouter } from "next-connect";
import { runner } from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controler";

const defaultMigrationOptions = {
  dryRun: true, // modo simulação para não aplicar as migrações de fato
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient(); // Obter um cliente de banco de dados para as migrações

    const pendingMigrations = await runner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end(); // Fechar a conexão com o banco de dados após obter as migrações pendentes
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient(); // Obter um cliente de banco de dados para as migrações

    const migratedMigrations = await runner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false, // aplicar as migrações de fato
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end(); // Fechar a conexão com o banco de dados após obter as migrações pendentes
  }
}
