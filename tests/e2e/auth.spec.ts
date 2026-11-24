
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [],
    },
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.remove("access_token");
    });
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login\/?$/);
  });

  test("displays the login page", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByText("Sign in to your support account")
     ).toBeVisible();
  });
});

 