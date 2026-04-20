class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

function salvarUsuario(inputText) {
  if (!inputText)
    throw new ValidationError("é necessário fornecer um nome de usuário.");

  if (inputText?.username?.length < 3)
    throw new ValidationError(
      "O nome do usuário deve conter pelo menos 3 caracteres.",
    );

  if (!inputText?.username)
    throw new ValidationError("O nome do usuário é obrigatório.");

  // Simulação de salvamento do usuário
  console.log(`Usuário "${inputText.username}" salvo com sucesso!`);
}

try {
  salvarUsuario(); // Teste com nome vazio
} catch (error) {
  console.error(error);
}

try {
  salvarUsuario({ username: "Jo" }); // Teste com nome muito curto
} catch (error) {
  console.error(error);
}
try {
  salvarUsuario({ username: null }); // Teste com nome vazio
} catch (error) {
  console.error(error);
}

try {
  salvarUsuario({ username: "UsuarioValido123" }); // Teste com nome válido
} catch (error) {
  console.error(error);
}
