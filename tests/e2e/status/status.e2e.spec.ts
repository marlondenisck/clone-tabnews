import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const envFilePath =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenvExpand.expand(dotenv.config({ path: envFilePath }));

const url = process.env.URL;
console.log("URL:", url);

test.describe("Página de Status", () => {
  test("deve exibir os dados principais do status", async ({ page }) => {
    await page.goto(`${url}/status`);
    await expect(
      page.getByRole("heading", { name: /status da plataforma/i }),
    ).toBeVisible();
    await expect(page.getByText(/conexões em uso/i)).toBeVisible();
    await expect(page.getByText(/máximo de conexões/i)).toBeVisible();
    await expect(page.getByText(/atualizado em/i)).toBeVisible();
  });

  test("deve exibir mensagem de carregando", async ({ page }) => {
    await page.route(`${url}/api/v1/status`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          used_connections: 1,
          max_connections: 10,
          updated_at: new Date().toISOString(),
        }),
      });
    });
    await page.goto(`${url}/status`);
    await expect(page.getByText(/carregando informações/i)).toBeVisible();
  });
});
