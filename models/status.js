import database from "@/infra/database";

async function databaseVersion() {
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;
  return databaseVersion;
}

async function maxConnections() {
  const selectMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = selectMaxConnections.rows[0].max_connections;
  return maxConnections;
}

async function usedConnections() {
  const dataBaseName = process.env.POSTGRES_DB;
  const selectUsedConnections = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1 AND state = 'active';",
    values: [dataBaseName],
  });
  const usedConnections = selectUsedConnections.rows[0].count;
  return usedConnections;
}

const status = {
  databaseVersion,
  maxConnections,
  usedConnections,
};

export default status;
