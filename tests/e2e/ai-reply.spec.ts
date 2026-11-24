
import { test, expect } from "@playwright/test";
import { loginAsAgent } from "../helpers/auth";

test("generates an AI reply suggestion", async ({ page }) => {
  test.setTimeout(120000);

  await loginAsAgent(page);

  const ticketId = process.env.TEST_TICKET_ID;

  if (!ticketId) {
    throw new Error("TEST_TICKET_ID is missing.");
  }

  await page.goto(`/tickets/${ticketId}`);

  const generateButton = page.getByRole("button", {
    name: /generate ai reply|generate suggestion/i,
  });

  await expect(generateButton).toBeVisible();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(
        `/tickets/${ticketId}/suggest-reply`
      ) &&
      response.request().method() === "POST",
    { timeout: 90000 }
  );

  await generateButton.click();

  const response = await responsePromise;

  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  expect(data.suggested_reply).toBeTruthy();

  await expect(
    page.getByRole("button", {
      name: "Approve",
      exact: true,
    }).last()
  ).toBeVisible();
});
