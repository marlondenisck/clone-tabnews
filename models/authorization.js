import availableFeatures from "@/infra/features";
import { InternalServerError } from "@/infra/errors";

function can(user, feature, resource) {
  validateUser(user); // valida o usuário antes de verificar as permissões
  validateFeature(feature); // valida a feature antes de verificar as permissões

  let authorized = false; // inicialmente, o usuário não é autorizado

  // percorre as features do usuário para verificar se ele possui a feature necessária
  if (user.features.includes(feature)) {
    authorized = true; // se a feature for encontrada, o usuário é autorizado
  }

  // lógica adicional para verificar se o usuário pode atualizar o recurso específico
  if (feature === availableFeatures.UPDATE_USER && resource) {
    authorized = false; // redefine a autorização para false, pois precisamos verificar o recurso

    // Verifica se o usuário é o mesmo que está tentando ser atualizado
    // Se for o mesmo usuário, ele pode atualizar seu próprio recurso. Caso contrário, ele precisa da permissão "update:user:others".
    if (
      user.id === resource.id ||
      can(user, availableFeatures.UPDATE_USER_OTHERS)
    ) {
      authorized = true; // o usuário pode atualizar seu próprio recurso
    }
  }

  return authorized; // retorna true se o usuário for autorizado, ou false caso contrário
}

function filterOutput(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature === availableFeatures.READ_USER) {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === availableFeatures.READ_USER_SELF) {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        email: resource.email,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }

  if (feature === availableFeatures.READ_SESSION) {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === availableFeatures.READ_ACTIVATION_TOKEN) {
    return {
      id: resource.id,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
      used_at: resource.used_at,
    };
  }

  if (feature === availableFeatures.READ_MIGRATION) {
    return resource.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === availableFeatures.READ_STATUS) {
    const output = {
      update_at: resource.update_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          used_connections: resource.dependencies.database.used_connections,
        },
      },
    };

    if (can(user, availableFeatures.READ_STATUS_ALL)) {
      output.dependencies.database.version =
        resource.dependencies.database.version;
    }

    return output;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer um `user` no model `authorization`.",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !Object.values(availableFeatures).includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`.",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um `resource` no model `authorization.filterOutput`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
