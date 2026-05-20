import { createRouter } from "next-connect";
import controller from "infra/controller";
import status from "@/models/status";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updateAt = await status.getStatusDate();
  const databaseVersion = await status.databaseVersion();
  const maxConnections = await status.maxConnections();
  const usedConnections = await status.usedConnections();

  return response.status(200).json({
    update_at: updateAt,
    postgres_version: databaseVersion,
    max_connections: +maxConnections,
    used_connections: +usedConnections,
  });
}
