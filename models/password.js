import bcryptjs from "bcryptjs";

async function hash(plainTextPassword) {
  const rounds = getNumberOfSaltRounds();
  return await bcryptjs.hash(plainTextPassword, rounds);
}

function getNumberOfSaltRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedHashedPassword) {
  return await bcryptjs.compare(providedPassword, storedHashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
