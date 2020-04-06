const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const tempfile = require('tempfile')
const fs = require('fs');
const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  var url = ctx.request.query.url;
  if(url == undefined || url == null || url == "") {
    var data = {
      "status": "error",
      "message": "url was not specified", 
    };
    console.log(data)
    ctx.body = data;
    return
  }
  var width = ctx.request.query.width ? parseInt(ctx.request.query.width, 10) : 1024;
  var pngfile = tempfile('.png');
  console.log(pngfile);

  await crawler(url, width, pngfile);

  var content = fs.readFileSync(pngfile, 'base64');
  jsonData = { 'png': content };
  ctx.body = jsonData;
  console.log("body is set");

  console.log("delete " + pngfile);
  fs.unlinkSync(pngfile);
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());
app.listen(process.env.PORT || 3000);

// ここからはクローラーのロジック
const puppeteer = require('puppeteer');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: false };

function show_err(e) {
  console.error("error:");
  console.error(e)
}

const crawler = async (url, w, pngfile) => {
  const browser = await puppeteer.launch(LAUNCH_OPTION); // Launch Optionの追加
  const page = await browser.newPage();

  await page.setViewport({
    width: w,
    height: 800
  }).catch(e => show_err(e));

  await page.goto(url, {
    waitUntil: 'networkidle2'
  }).catch(e => show_err(e));

  await page.screenshot({
    path: pngfile,
    fullPage: true
  }).catch(e => show_err(e));

  await browser.close();
  return
}
