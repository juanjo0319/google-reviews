import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");

    // Check for key elements
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in with Google/i })
    ).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("Create your free account")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Work Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Free Account" })
    ).toBeVisible();
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword123");
    await page.getByRole("button", { name: "Log In" }).click();

    // Should show error message
    await expect(
      page.getByText(/Invalid email or password/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("signup validates required fields", async ({ page }) => {
    await page.goto("/signup");

    // Try to submit empty form
    await page.getByRole("button", { name: "Create Free Account" }).click();

    // Browser validation should prevent submission (required fields)
    const emailInput = page.getByLabel("Work Email");
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("shows verification banner on login page", async ({ page }) => {
    await page.goto("/login?verified=true");

    await expect(
      page.getByText("Email verified successfully")
    ).toBeVisible();
  });

  test("navigation between login and signup", async ({ page }) => {
    await page.goto("/login");

    // Click "Sign up free" link
    await page.getByRole("link", { name: "Sign up free" }).click();
    await expect(page).toHaveURL(/\/signup/);

    // Click "Log in" link from signup
    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated users are redirected from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
