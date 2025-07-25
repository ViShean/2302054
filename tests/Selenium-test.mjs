// tests/selenium-test.mjs
/* eslint-env mocha */

import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js"; // ← note “.js”
import chai, { expect } from "chai";

chai.should(); // optional, keeps chai initialised

const SELENIUM_HUB = "http://localhost:4444/wd/hub";
const APP_URL = "http://localhost:3350/";

async function runSearch(term) {
  // headless Chrome options
  const chromeOpts = new Options().headless();

  const driver = await new Builder()
    .forBrowser("chrome")
    .usingServer(SELENIUM_HUB)
    .setChromeOptions(chromeOpts)
    .build();

  try {
    await driver.get(APP_URL);
    await driver.findElement(By.id("term")).sendKeys(term);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // wait until either success <h1> or red error banner appears
    await driver.wait(
      until.elementLocated(By.css('h1, p[style*="color:red"]')),
      3_000
    );

    return driver.getPageSource();
  } finally {
    await driver.quit();
  }
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */
describe("Secure Search – Selenium flow", () => {
  it("shows the result page for safe input", async () => {
    const page = await runSearch("selenium rocks");
    expect(page).to.include("You searched for: selenium rocks");
  });

  it("displays validation banner for XSS payload", async () => {
    const page = await runSearch("<img src=x onerror=alert(1)>");
    expect(page).to.include("Potential XSS detected.");
  });
});
