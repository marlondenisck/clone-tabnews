import { createRouter } from "next-connect";

import controller from "infra/controller";
import migrator from "models/migrator";
import availableFeatures from "@/infra/features";
import authorization from "@/models/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest(availableFeatures.READ_MIGRATION), getHandler)
  .post(controller.canRequest(availableFeatures.CREATE_MIGRATION), postHandler)
  .handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;

  const pendingMigrations = await migrator.listPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    availableFeatures.READ_MIGRATION,
    pendingMigrations,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    availableFeatures.READ_MIGRATION,
    migratedMigrations,
  );

  if (migratedMigrations.length > 0) {
    return response.status(201).json(secureOutputValues);
  }

  return response.status(200).json(secureOutputValues);
}
