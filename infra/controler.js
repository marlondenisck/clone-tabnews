import * as cookie from "cookie";
import session from "models/session";

import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(newSessionToken, response) {
  const setCookie = cookie.serialize("session_id", newSessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // maxAge é definido em segundos
    secure: process.env.NODE_ENV === "production", // Garante que o cookie seja enviado apenas em conexões seguras (HTTPS) em produção
    httpOnly: true, // Impede o acesso ao cookie via JavaScript, aumentando a segurança contra ataques XSS
    sameSite: "strict", // Impede o envio do cookie em requisições cross-site, aumentando a segurança contra ataques CSRF
  });

  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
