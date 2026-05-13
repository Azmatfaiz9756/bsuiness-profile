import puppeteer from 'puppeteer';

async function testPage() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Log all console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Log page errors (unhandled exceptions)
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });

  // Log requests that fail
  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log("Navigating to http://localhost:3000/");
  await page.goto('http://localhost:3000/');
  
  // wait 5 seconds
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Done checking.");
  await browser.close();
}

testPage();
