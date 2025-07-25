// tests/SeleniumSearchTest.mjs
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import chai from "chai";
const { expect } = chai;

// point to the standalone-chrome container that Lab 07 spins up
const SELENIUM_HUB = "http://localhost:4444/wd/hub";
const APP_URL = "http://localhost:3350/"; // your live dev server

async function runSearch(term) {
  const driver = await new Builder()
    .forBrowser("chrome")
    .usingServer(SELENIUM_HUB)
    .setChromeOptions(new chrome.Options().headless())
    .build();

  try {
    // Load index.html
    await driver.get(APP_URL);

    // Fill & submit the form
    const input = await driver.findElement(By.id("term"));
    await input.sendKeys(term);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait until either the H1 (success) or error banner appears
    await driver.wait(
      until.elementLocated(By.css('h1, p[style*="color:red"]')),
      3_000
    );

    // Return page source for assertion
    return { page: await driver.getPageSource() };
  } finally {
    await driver.quit();
  }
}

describe("Secure Search UI (Selenium)", () => {
  it("shows result page for safe search", async () => {
    const { page } = await runSearch("selenium rocks");
    expect(page).to.include("You searched for: selenium rocks");
  });

  it("shows validation banner for XSS payload", async () => {
    const { page } = await runSearch("<img src=x onerror=alert(1)>");
    expect(page).to.include("Potential XSS detected.");
  });
});
