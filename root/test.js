import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        console.log("Navigating to https://ais-dev-pn2tu27zkvta4z3zy6bt5q-406651789755.europe-west1.run.app/ ...");
        await page.goto('https://ais-dev-pn2tu27zkvta4z3zy6bt5q-406651789755.europe-west1.run.app/', { waitUntil: 'networkidle2' });
        
        const textContent = await page.evaluate(() => {
            const root = document.getElementById('root');
            return root ? root.innerText : "NO ROOT ELEMENT";
        });
        console.log("ROOT TEXT LENGTH:", textContent.length);
        console.log("ROOT TEXT START:\n", textContent.substring(0, 1000));
        
        await browser.close();
        console.log("Done.");
    } catch (err) {
        console.error("Puppeteer script failed:", err);
    }
})();
