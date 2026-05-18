function can(user, feature) {
  let authorized = false; // inicialmente, o usuário não é autorizado

  // percorre as features do usuário para verificar se ele possui a feature necessária
  if (user.features.includes(feature)) {
    authorized = true; // se a feature for encontrada, o usuário é autorizado
  }

  return authorized; // retorna true se o usuário for autorizado, ou false caso contrário
}

const authorization = {
  can,
};

export default authorization;
