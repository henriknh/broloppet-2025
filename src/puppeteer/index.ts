import { chromium, Browser, Page } from "playwright";
import { exec } from "child_process";
import path from "path";

export class BrowserService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: false,
      });
    } catch (error) {
      console.error("Failed to initialize browser:", error);
      throw error;
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }
    return await this.browser.newPage();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Example usage
async function main() {
  const browserService = new BrowserService();

  const playSound = () => {
    const soundPath = path.join(__dirname, "ding.mp3");
    exec(`afplay "${soundPath}"`, (error) => {
      if (error) {
        console.error("Failed to play sound:", error);
      }
    });
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let clicked = false;
  try {
    await browserService.initialize();
    const page = await browserService.newPage();

    // Example: Navigate to a website
    await page.goto("https://www.sportstiming.dk/event/6583/resale");
    await page.evaluate(() => {
      window.scrollTo(0, 420);
    });

    try {
      await page.waitForSelector("#btnCookiesAcceptAll", { timeout: 5000 });
      await sleep(1000);
      await page.click("#btnCookiesAcceptAll");
      await sleep(1000);
    } catch (error) {
      console.error("Cookie button not found or not clickable:", error);
    }

    for (let i = 0; i < 3000; i++) {
      try {
        await page.goto("https://www.sportstiming.dk/event/6583/resale");
        await page.evaluate(() => {
          window.scrollTo(0, 420);
        });

        await page
          .getByRole("link", { name: "Purchase" })
          .first()
          .click({ timeout: 1000 });

        const button = await page
          .locator("button")
          .filter({ hasText: "Purchase" })
          .first();

        await button.click();

        playSound();

        clicked = true;
        return;
      } catch (error) {
        console.error("Error in main:", error);
      } finally {
        await sleep(2000);
      }
    }
  } catch (error) {
    console.error("Error in main:", error);
  } finally {
    if (!clicked) {
      await browserService.close();
    }
  }
}

main();
