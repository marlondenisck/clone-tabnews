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

function filterOutput(user, feature, output) {
  if (feature === userFeatures.READ_USER) {
    return {
      id: output.id,
      username: output.username,
      features: output.features,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
