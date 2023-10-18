const {
  somar,
  subtrair,
  dividir,
  multiplicar,
} = require("../models/calculadora");

describe("Calculadora", () => {
  describe("somar", () => {
    it("deve retornar a soma de dois números", () => {
      expect(somar(2, 3)).toBe(5);
      expect(somar(-2, 3)).toBe(1);
      expect(somar(0, 0)).toBe(0);
    });

    test("somar 'banana' + 100 deve retornar 'Erro'", () => {
      const result = somar("banana", 100);
      expect(result).toBe("Erro");
    });
  });

  describe("subtrair", () => {
    it("deve retornar a diferença de dois números", () => {
      expect(subtrair(5, 3)).toBe(2);
      expect(subtrair(-2, 3)).toBe(-5);
      expect(subtrair(0, 0)).toBe(0);
    });
  });

  describe("dividir", () => {
    it("deve retornar o quociente de dois números", () => {
      expect(dividir(6, 3)).toBe(2);
      expect(dividir(-6, 3)).toBe(-2);
    });
  });

  describe("multiplicar", () => {
    it("deve retornar a multiplicação de dois números", () => {
      expect(multiplicar(6, 3)).toBe(18);
    });
  });
});
