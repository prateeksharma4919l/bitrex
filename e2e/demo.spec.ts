import { test, expect } from "@playwright/test";
test("demo send asks for confirmation and records only simulated activity", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("DEMO MODE")).toBeVisible();
  await expect(page.getByText(/No funds are deposited/)).toBeVisible();
  await page.getByRole("button", { name: "Send" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Simulated only");
  await expect(dialog).toContainText("Recipient address");
  await dialog
    .getByPlaceholder("Address (demo validation only)")
    .fill("demo-recipient");
  await dialog.locator('input[type="number"]').fill("0.25");
  await dialog.getByRole("button", { name: "Review request" }).click();
  await expect(dialog).toContainText("Review simulated request");
  await dialog
    .getByRole("button", { name: "Confirm simulated request" })
    .click();
  await expect(page.locator(".toast")).toContainText(
    "Simulated request recorded",
  );
  await page.getByRole("button", { name: "All activity" }).click();
  await expect(page.getByRole("table")).toContainText("Sent");
  await expect(page.getByRole("table")).toContainText("Simulated");
});
