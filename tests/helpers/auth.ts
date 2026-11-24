
import { expect, type Page } from "@playwright/test";

export async function loginAsAgent(page: Page) {
  const email = process.env.TEST_AGENT_EMAIL;
  const password = process.env.TEST_AGENT_PASSWORD;

  if (!email || !password) {
    throw new Error("Test agent credentials are missing.");
  }

  await page.goto("/login");

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page
    .getByRole("button", { name: /login|log in|sign in/i })
    .click();

  await expect(page).toHaveURL(/\/dashboard\/?$/);
}
