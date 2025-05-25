import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRound();
  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRound() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;

  //VERSÃO RESUMIDA
  //return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
