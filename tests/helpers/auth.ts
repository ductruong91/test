// tests/helpers/auth.ts
import { expect, Page } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("https://beta.alohomora.caremaker.jp/auth/login/");
  await page.locator('input[name="username"]').fill("ctybcd_1");
  await page.locator('input[name="password"]').fill("Abcd@123");
  await page.getByRole("button", { name: "ログイン " }).click();
  await expect(page).not.toHaveURL(
    "https://beta.alohomora.caremaker.jp/auth/login/"
  );
}
