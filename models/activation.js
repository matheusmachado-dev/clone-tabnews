import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";
import { NotFoundError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutos

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      `,
      values: [tokenId],
    });

    return results.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Matheus Machado <contato@matheusmachado.blog.br>",
    to: user.email,
    subject: "Ative seu cadastro no blog!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no blog

${webserver.getOrigin()}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Matheus Machado`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
};

export default activation;
