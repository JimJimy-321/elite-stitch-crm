const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const dir = '.qa-reports/2026-03-26-corte-caja/screenshots';
    fs.mkdirSync(dir, { recursive: true });
    
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1366, height: 768 }); // standard laptop

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/login', { timeout: 15000 });
        
        console.log('Filling login...');
        await page.fill('input[type="email"]', 'encargada@sastrepro.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');

        console.log('Waiting for login to complete...');
        await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(3000);
        
        console.log('Navigating to caja...');
        await page.goto('http://localhost:3000/caja', { timeout: 15000 });
        
        console.log('Waiting for data to load...');
        await page.waitForTimeout(5000); 
        
        console.log('Taking screenshot...');
        await page.screenshot({ path: `${dir}/caja-final.png` });

        console.log('QA script finished successfully');
    } catch (e) {
        console.error('QA Error:', e);
    } finally {
        await browser.close();
    }
})();
