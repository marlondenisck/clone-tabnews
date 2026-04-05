import { runner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient(); // Obter um cliente de banco de dados para as migrações

  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: true, // modo simulação para não aplicar as migrações de fato
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await runner(defaultMigrationsOptions);
    await dbClient.end(); // Fechar a conexão com o banco de dados após obter as migrações pendentes
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await runner({
      ...defaultMigrationsOptions,
      dryRun: false, // aplicar as migrações de fato
    });

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).json({ error: "Method not allowed" });
}
