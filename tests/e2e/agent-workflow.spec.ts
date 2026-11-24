
import { test, expect } from "@playwright/test";
import { loginAsAgent } from "../helpers/auth";

test.describe("Support Agent Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAgent(page);
  });

  test("displays dashboard statistics", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Support Dashboard",
      })
    ).toBeVisible();

    await expect(
      page.getByText("Total Tickets", { exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Tickets by Status",
      })
    ).toBeVisible();
  });

  test("displays ticket inbox", async ({ page }) => {
    await page.goto("/tickets");

    await expect(
      page.getByRole("heading", {
        name: "Ticket Inbox",
      })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Search by subject or ticket ID...")
    ).toBeVisible();
  });

  test("opens ticket details", async ({ page }) => {
    const ticketId = process.env.TEST_TICKET_ID;

    if (!ticketId) {
      throw new Error("TEST_TICKET_ID is missing.");
    }

    await page.goto(`/tickets/${ticketId}`);

    await expect(
      page.getByRole("heading", {
        name: "Customer Conversation",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Update Ticket Status",
      })
    ).toBeVisible();
  });

  test("displays automation jobs panel", async ({ page }) => {
    const ticketId = process.env.TEST_TICKET_ID;

    if (!ticketId) {
      throw new Error("TEST_TICKET_ID is missing.");
    }

    await page.goto(`/tickets/${ticketId}`);

    await expect(
      page.getByRole("heading", {
        name: "AI Automation Jobs",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Refresh Jobs",
      })
    ).toBeVisible();
  });
});
