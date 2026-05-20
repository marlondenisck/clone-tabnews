import userFeatures from "@/utils/userFeatures";

function can(user, feature, resource) {
  let authorized = false; // inicialmente, o usuário não é autorizado

  // percorre as features do usuário para verificar se ele possui a feature necessária
  if (user.features.includes(feature)) {
    authorized = true; // se a feature for encontrada, o usuário é autorizado
  }

  // lógica adicional para verificar se o usuário pode atualizar o recurso específico
  if (feature === userFeatures.UPDATE_USER && resource) {
    authorized = false; // redefine a autorização para false, pois precisamos verificar o recurso

    // Verifica se o usuário é o mesmo que está tentando ser atualizado
    // Se for o mesmo usuário, ele pode atualizar seu próprio recurso. Caso contrário, ele precisa da permissão "update:user:others".
    if (user.id === resource.id || can(user, userFeatures.UPDATE_USER_OTHERS)) {
      authorized = true; // o usuário pode atualizar seu próprio recurso
    }
  }

  return authorized; // retorna true se o usuário for autorizado, ou false caso contrário
}

// função para filtrar os campos de saída com base na feature do usuário
function filterOutput(user, feature, resource) {
  if (feature === userFeatures.READ_USER) {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === userFeatures.READ_USER_SELF) {
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

  if (feature === userFeatures.READ_SESSION) {
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

  if (feature === userFeatures.READ_ACTIVATION_TOKEN) {
    return {
      id: resource.id,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
      used_at: resource.used_at,
    };
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
