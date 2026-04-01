import { test, expect } from "@playwright/test";

test.describe("Marketing pages", () => {
  test("homepage loads with all sections", async ({ page }) => {
    await page.goto("/");

    // Hero
    await expect(page.getByText("Never Miss a")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start Free Trial" }).first()
    ).toBeVisible();

    // Features section
    await expect(
      page.getByText("Everything You Need to Manage Reviews")
    ).toBeVisible();

    // Pricing section
    await expect(
      page.getByText("Simple, Transparent Pricing")
    ).toBeVisible();
  });

  test("auth error page shows error message", async ({ page }) => {
    await page.goto("/auth/error?error=CredentialsSignin");

    await expect(page.getByText("Authentication Error")).toBeVisible();
    await expect(
      page.getByText("Invalid email or password")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Try Again" })
    ).toBeVisible();
  });
});
