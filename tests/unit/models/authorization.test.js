import authorization from "@/models/authorization";
import { InternalServerError } from "@/infra/errors";

describe("modals/authorization", () => {
  describe("método .can()", () => {
    test("quando não envia `user` na interface publica", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("quando não envia `user.features` na interface publica", () => {
      const createUser = {
        username: "userSemFeatures",
      };

      expect(() => {
        authorization.can(createUser);
      }).toThrow(InternalServerError);
    });

    test("quando feature é desconhecida", () => {
      const createUser = {
        features: ["feature:desconhecida"],
      };

      expect(() => {
        authorization.can(createUser);
      }).toThrow(InternalServerError);
    });

    test("quando user é valido e a feature é conhecida", () => {
      const createUser = {
        features: ["create:user"],
      };

      expect(authorization.can(createUser, "create:user")).toBe(true);
    });
  });

  describe("método .filterOutput()", () => {
    test("quando não envia `user` na interface publica", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("quando não envia `user.features` na interface publica", () => {
      const createUser = {
        username: "userSemFeatures",
      };

      expect(() => {
        authorization.filterOutput(createUser);
      }).toThrow(InternalServerError);
    });

    test("quando feature é desconhecida", () => {
      const createUser = {
        features: ["feature:desconhecida"],
      };

      expect(() => {
        authorization.filterOutput(createUser);
      }).toThrow(InternalServerError);
    });

    test("quando user é valido, feature e o resource sao conhecidos", () => {
      const createUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "user1",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        email: "resource@email.com",
        password: "senha123",
      };
      const result = authorization.filterOutput(
        createUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: resource.id,
        username: resource.username,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      });
    });

    test("quando valid user  com feature conhecida mas sem resource", () => {
      const createUser = {
        features: ["read:user"],
      };

      expect(() => {
        authorization.filterOutput(createUser, "read:user", null);
      }).toThrow(InternalServerError);
    });
  });
});
