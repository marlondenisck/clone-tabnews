import { createRouter } from "next-connect";
import database from "infra/database";
import controller from "infra/controler";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;

  const selectMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = selectMaxConnections.rows[0].max_connections;

  const dataBaseName = process.env.POSTGRES_DB;
  const selectUsedConnections = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1 AND state = 'active';",
    values: [dataBaseName],
  });
  const usedConnections = selectUsedConnections.rows[0].count;

  response.status(200).json({
    update_at: updateAt,
    postgres_version: databaseVersion,
    max_connections: +maxConnections,
    used_connections: +usedConnections,
  });
}
