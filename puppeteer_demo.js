const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com', { waitUntil: 'networkidle2' });
  const newsTitles = await page.evaluate(() => {
    const elenemts = document.querySelectorAll('.itemlist .title > a');
    return [].map.call(elenemts, el => el.innerText);
  });
  console.log(newsTitles.slice(0, 5));
  await browser.close();
})();
