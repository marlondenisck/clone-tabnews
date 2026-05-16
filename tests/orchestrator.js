import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";

import migrator from "models/migrator";
import user from "models/user";
import session from "models/session";

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
      const response = await fetch("http://localhost:3000/api/v1/status");

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

async function createSession(userId) {
  return session.create(userId);
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

  const emailTextResponse = await fetch(
    `${emailHttpURL}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();
  lastEmailItem.text = emailTextBody;

  return lastEmailItem;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
