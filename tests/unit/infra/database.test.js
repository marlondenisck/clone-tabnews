import database from "infra/database";
import { ServiceError } from "infra/errors";

const mockEnd = jest.fn();
const mockClientQuery = jest.fn();
const mockConnect = jest.fn();

jest.mock("pg", () => {
  return {
    Client: jest.fn(() => ({
      connect: mockConnect,
      query: mockClientQuery,
      end: mockEnd,
    })),
  };
});

describe("database.query()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue();
    mockEnd.mockResolvedValue();
  });

  describe("quando a query falha", () => {
    test("deve lançar um ServiceError", async () => {
      mockClientQuery.mockRejectedValue(new Error("falha simulada no banco"));

      await expect(database.query("SELECT 1")).rejects.toThrow(ServiceError);
    });

    test("deve ter a mensagem correta", async () => {
      mockClientQuery.mockRejectedValue(new Error("falha simulada no banco"));

      await expect(database.query("SELECT 1")).rejects.toMatchObject({
        name: "ServiceError",
        message: "Erro na conexão com Banco ou na Query.",
      });
    });

    test("deve preservar o erro original no 'cause'", async () => {
      const originalError = new Error("falha simulada no banco");
      mockClientQuery.mockRejectedValue(originalError);

      await expect(database.query("SELECT 1")).rejects.toMatchObject({
        cause: originalError,
      });
    });

    test("deve encerrar o client mesmo após a falha", async () => {
      mockClientQuery.mockRejectedValue(new Error("falha simulada no banco"));

      await expect(database.query("SELECT 1")).rejects.toThrow();

      expect(mockEnd).toHaveBeenCalledTimes(1);
    });
  });
});
