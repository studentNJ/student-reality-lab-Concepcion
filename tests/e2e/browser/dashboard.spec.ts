import { expect, test } from "@playwright/test";

test("dashboard and metro detail render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The 30% Problem" })).toBeVisible();
  await expect(page.getByLabel("Year")).toBeVisible();
  await expect(page.getByText("Showing the rent-burden snapshot for 2025.")).toBeVisible();
  await page.getByLabel("Year").selectOption("2021");
  await expect(page.getByText("Showing the rent-burden snapshot for 2021.")).toBeVisible();
  await expect(page.getByText("10 metros available in the selected year.")).toBeVisible();

  await page.goto("/metro/35620");
  await expect(page.getByRole("heading", { name: "Metro Detail" })).toBeVisible();
  await expect(page.getByLabel("Start year")).toBeVisible();
  await expect(page.getByLabel("End year")).toBeVisible();
  await page.getByLabel("Start year").selectOption("2018");
  await page.getByLabel("End year").selectOption("2022");
  await expect(page.getByText("Trend line from API for 2018 to 2022.")).toBeVisible();
  await expect(page.getByText("Affordability Calculator")).toBeVisible();
});

test("calculator computes and shows result", async ({ page }) => {
  await page.goto("/metro/35620");
  await page.getByLabel("Annual salary").fill("90000");
  await page.getByLabel("Monthly student loan (optional)").fill("300");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.getByText("Rent burden:")).toBeVisible();
  await expect(page.getByText("Monthly disposable income:")).toBeVisible();
  await expect(page.getByText("Risk:")).toBeVisible();
});

test("invalid metro shows recoverable error", async ({ page }) => {
  await page.goto("/metro/00000");
  await expect(page.getByText("Unable to load trend data for this metro.")).toBeVisible();
});
