import puppeteer from 'puppeteer';

async function testPage() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Log all console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/');
  
  await new Promise(r => setTimeout(r, 5000));
  
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log("ROOT HTML LENGTH:", rootHTML?.length);
  if (rootHTML?.length > 0) {
      console.log("ROOT HTML START:", rootHTML.substring(0, 500));
  } else {
      console.log("ROOT IS EMPTY!");
  }
  
  await browser.close();
}

testPage();
