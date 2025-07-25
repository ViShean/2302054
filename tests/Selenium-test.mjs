/* tests/selenium-search.mjs
   Stand-alone Selenium test for the secure-search form                */

import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import assert from "node:assert/strict";

/* ------------------------------------------------------------------ */
/*  Environment detection                                             */
/* ------------------------------------------------------------------ */
const ENV = process.argv[2] ?? "local";
const SELENIUM_HUB =
  ENV === "github"
    ? "http://selenium:4444/wd/hub"
    : "http://localhost:4444/wd/hub";

const APP_URL =
  ENV === "github"
    ? "http://testserver:3350/" // ↖ change if your container uses a different port/name
    : "http://localhost:3350/";

console.log(`Running Selenium test in “${ENV}” mode`);
console.log(`  Hub:   ${SELENIUM_HUB}`);
console.log(`  App:   ${APP_URL}`);

/* ------------------------------------------------------------------ */
/*  Helper to execute one search attempt                              */
/* ------------------------------------------------------------------ */
async function submitSearch(term) {
  const driver = await new Builder()
    .forBrowser("chrome")
    .usingServer(SELENIUM_HUB)
    .setChromeOptions(new Options().headless())
    .build();

  try {
    await driver.get(APP_URL);

    // fill the form and submit
    await driver.findElement(By.id("term")).sendKeys(term);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // wait for either success <h1> or error <p style="color:red"> banner
    const node = await driver.wait(
      until.elementLocated(By.css('h1, p[style*="color:red"]')),
      3_000
    );
    return {
      html: await driver.getPageSource(),
      nodeText: await node.getText(),
    };
  } finally {
    await driver.quit();
  }
}

/* ------------------------------------------------------------------ */
/*  Test case 1 – safe input                                          */
/* ------------------------------------------------------------------ */
console.log("→ 1/2  Verifying safe input flow…");
{
  const { nodeText } = await submitSearch("hello world");
  assert.ok(
    nodeText.includes("You searched for: hello world"),
    "Safe input was not echoed back as expected"
  );
  console.log("   ✓ safe input passes");
}

/* ------------------------------------------------------------------ */
/*  Test case 2 – XSS payload                                         */
/* ------------------------------------------------------------------ */
console.log("→ 2/2  Verifying XSS defence…");
{
  const { nodeText } = await submitSearch("<script>alert(1)</script>");
  assert.ok(
    /Potential XSS detected/i.test(nodeText),
    "XSS banner not displayed for malicious payload"
  );
  console.log("   ✓ XSS payload rejected");
}

console.log("\n🎉  All Selenium checks passed.");
process.exit(0);
