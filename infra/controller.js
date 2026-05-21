import * as cookie from "cookie";
import session from "models/session";

import user from "models/user";
import authorization from "@/models/authorization";

import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "infra/errors";
import availableFeatures from "@/infra/features";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function setSessionCookie(newSessionToken, response) {
  const setCookie = cookie.serialize("session_id", newSessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // maxAge é definido em segundos
    secure: process.env.NODE_ENV === "production", // Garante que o cookie seja enviado apenas em conexões seguras (HTTPS) em produção
    httpOnly: true, // Impede o acesso ao cookie via JavaScript, aumentando a segurança contra ataques XSS
    sameSite: "strict", // Impede o envio do cookie em requisições cross-site, aumentando a segurança contra ataques CSRF
  });

  response.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(request, response, next) {
  // 1 - se o cookie session_id existir, injeta usuario
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);
    return next();
  }

  // 2 - se o cookie session_id nao existir, injeta anonymous
  await injectAnonymousUser(request);
  return next();
}

async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies.session_id; // recupera o token da sessão a partir do cookie
  const sessionObject = await session.findOneValidByToken(sessionToken); // busca a sessão válida no banco de dados usando o token
  const userObject = await user.findOneById(sessionObject.user_id); // busca o usuário associado à sessão usando o user_id presente na sessão

  request.context = {
    ...request.context, // caso haja necessidade de adicionar mais propriedades no contexto futuramente, já temos a estrutura preparada
    user: userObject, // objeto do usuário autenticado
  };
}

async function injectAnonymousUser(request) {
  const anonymousUserObject = {
    features: [
      availableFeatures.READ_ACTIVATION_TOKEN,
      availableFeatures.CREATE_SESSION,
      availableFeatures.CREATE_USER,
    ], // permissões mínimas para um usuário anônimo
  };

  request.context = {
    ...request.context,
    user: anonymousUserObject,
  };
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user;

    if (authorization.can(userTryingToRequest, feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Você nao tem permissão para executar esta ação.",
      action: `Verifique se seu usuário possui a feature ${feature}`,
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest,
};

export default controller;
