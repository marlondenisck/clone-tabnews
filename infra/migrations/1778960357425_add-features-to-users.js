exports.up = (pgm) => {
  pgm.addColumn("users", {
    features: {
      type: "varchar[]", // Array de strings
      notNull: true,
      default: "{}",
    },
  });
};

exports.down = false;
