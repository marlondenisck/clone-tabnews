export const up = (pgm) => {
  pgm.addColumn("users", {
    features: {
      type: "varchar[]", // Array de strings
      notNull: true,
      default: "{}",
    },
  });
};

export const down = false;
