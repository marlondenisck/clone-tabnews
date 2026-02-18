import database from "infra/database";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  // Execute a consulta SQL para obter a versão do PostgreSQL
  const selectVersion = await database.query("SELECT version()");
  const postgresVersion = selectVersion.rows[0].version;

  // Execute a consulta SQL para obter o número máximo de conexões
  const selectMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = selectMaxConnections.rows[0].max_connections;

  // Execute a consulta SQL para obter o número de conexões atualmente usadas
  const selectUsedConnections = await database.query(
    "SELECT COUNT(*) FROM pg_stat_activity;",
  );
  const usedConnections = selectUsedConnections.rows[0].count;

  response.status(200).json({
    update_at: updateAt,
    postgres_version: postgresVersion,
    max_connections: +maxConnections,
    used_connections: +usedConnections,
  });
}
export default status;
