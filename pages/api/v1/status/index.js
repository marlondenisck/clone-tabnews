import { createRouter } from "next-connect";
import controller from "infra/controller";
import status from "@/models/status";
import authorization from "@/models/authorization";
import availableFeatures from "@/infra/features";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;

  const updateAt = new Date().toISOString();
  const databaseVersion = await status.databaseVersion();
  const maxConnections = await status.maxConnections();
  const usedConnections = await status.usedConnections();

  const statusObject = {
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: +maxConnections,
        used_connections: +usedConnections,
      },
    },
  };

  const secureOutput = authorization.filterOutput(
    userTryingToGet,
    availableFeatures.READ_STATUS,
    statusObject,
  );

  return response.status(200).json(secureOutput);
}
