import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import webserver from "@/infra/webserver";

import migrator from "models/migrator";
import user from "models/user";
import session from "models/session";
import activation from "models/activation";

const emailHttpURL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailService();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function waitForEmailService() {
  return retry(fetchEmailStatus, {
    retries: 100,
    maxTimeout: 1000,
  });

  async function fetchEmailStatus() {
    const response = await fetch(`${emailHttpURL}`);

    if (response.status !== 200) {
      throw Error();
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  return await user.create({
    username:
      userObject.username ||
      faker.internet.displayName().toLowerCase().replace(/\s/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "password123",
  });
}

async function createSession(userObjectId) {
  return await session.create(userObjectId);
}

async function activateUser(inactiveUser) {
  return await activation.activateUserByUserId(inactiveUser.id);
}

async function addFeaturesToUser(userObject, features) {
  const updatedUser = await user.addFeatures(userObject.id, features);
  return updatedUser;
}

async function deleteAllEmails() {
  await fetch(`${emailHttpURL}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpURL}/messages`);
  const emailsListBody = await emailListResponse.json();
  const lastEmailItem = emailsListBody.pop();

  if (!lastEmailItem) {
    return null;
  }

  const emailTextResponse = await fetch(
    `${emailHttpURL}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

function extractUUID(text) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  activateUser,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  addFeaturesToUser,
};

export default orchestrator;
