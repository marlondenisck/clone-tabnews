export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // para referencia o github utiliza 39 caracteres
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // referencia https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // https://security.stackexchange.com/a/39851
    password: {
      type: "varchar(72)",
      notNull: true,
    },
    // https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

export const down = false;
