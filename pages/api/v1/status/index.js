import { createRouter } from "next-connect";
import controller from "infra/controller";
import status from "@/models/status";
import authorization from "@/models/authorization";
import userFeatures from "@/utils/userFeatures";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;

  const updateAt = new Date().toISOString();
  const databaseVersion = await status.databaseVersion();
  const maxConnections = await status.maxConnections();
  const usedConnections = await status.usedConnections();

  const statusObject = {
    update_at: updateAt,
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
    userFeatures.READ_STATUS,
    statusObject,
  );

  return response.status(200).json(secureOutput);
}
