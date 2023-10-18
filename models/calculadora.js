function somar(arg1, arg2) {
  if (typeof arg1 !== "number") return "Erro";
  return arg1 + arg2;
}

function subtrair(arg1, arg2) {
  return arg1 - arg2;
}

function dividir(arg1, arg2) {
  return arg1 / arg2;
}

function multiplicar(arg1, arg2) {
  return arg1 * arg2;
}

module.exports = {
  somar,
  subtrair,
  dividir,
  multiplicar,
};
