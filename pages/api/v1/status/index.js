import database from "infra/database";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  // Execute a consulta SQL para obter a versão do PostgreSQL
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;
  // outra forma de fazer a mesma coisa
  // const selectVersion = await database.query("SELECT version()");
  // const postgresVersion = selectVersion.rows[0].version;

  // Execute a consulta SQL para obter o número máximo de conexões
  const selectMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = selectMaxConnections.rows[0].max_connections;

  // Execute a consulta SQL para obter o número de conexões atualmente usadas
  // o ::int é para converter o resultado para inteiro, pois o COUNT retorna uma string
  // o datname = 'tabnews' é para filtrar apenas as conexões do banco de dados tabnews, caso contrário, ele contaria todas as conexões de todos os bancos de dados
  const selectUsedConnections = await database.query(
    "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = 'tabnews';",
  );
  const usedConnections = selectUsedConnections.rows[0].count;

  response.status(200).json({
    update_at: updateAt,
    postgres_version: databaseVersion,
    max_connections: +maxConnections,
    used_connections: +usedConnections,
  });
}
export default status;
