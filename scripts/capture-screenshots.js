const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 900 });

  try {
    // Login
    await page.goto(`${adminUrl}/admin`, { waitUntil: 'networkidle2' });
    // Fill email / password fields
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 5000 });
    const emailHandle = await page.$('input[name="email"], input[type="email"]');
    await emailHandle.click({ clickCount: 3 });
    await emailHandle.type(email);

    const passHandle = await page.$('input[name="password"], input[type="password"]');
    await passHandle.click({ clickCount: 3 });
    await passHandle.type(password);

    // Submit - try button or form submit
    let submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) {
      const buttons = await page.$$('button');
      for (const b of buttons) {
        const prop = await b.getProperty('innerText');
        const txt = (await prop.jsonValue()) || '';
        if (typeof txt === 'string' && (txt.toLowerCase().includes('zalog') || txt.toLowerCase().includes('log'))) {
          submitBtn = b;
          break;
        }
      }
    }
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await page.goto(`${adminUrl}/admin/dashboard`, { waitUntil: 'networkidle2' });

    // Ensure screenshots dir exists
    const outDir = './docs/screenshots';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Dashboard
    await page.screenshot({ path: `${outDir}/real-dashboard.png`, fullPage: true });

    // Models list
    await page.goto(`${adminUrl}/admin/models`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `${outDir}/real-models-list.png`, fullPage: true });

    // Add model page
    await page.goto(`${adminUrl}/admin/models/new`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `${outDir}/real-add-model.png`, fullPage: true });

    // Try to go to edit page: click first edit button if present
    await page.goto(`${adminUrl}/admin/models`, { waitUntil: 'networkidle2' });
    let editLink = await page.$('a[href*="/edit"]');
    if (!editLink) {
      const anchors = await page.$$('a');
      for (const a of anchors) {
        const prop = await a.getProperty('innerText');
        const txt = (await prop.jsonValue()) || '';
        if (typeof txt === 'string' && txt.toLowerCase().includes('edyt')) {
          editLink = a;
          break;
        }
      }
    }
    if (editLink) {
      await editLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await page.screenshot({ path: `${outDir}/real-edit-model.png`, fullPage: true });
    } else {
      console.warn('No edit link found on models list. Skipping edit screenshot.');
    }

    console.log('Screenshots saved to', outDir);
  } catch (err) {
    console.error('Error capturing screenshots:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
}

run();
