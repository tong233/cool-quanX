/**
 * 文体通体育场馆票预约检查脚本，接口加了签名校验，只能爬网页了
 */
const CronJob = require("cron").CronJob;
const notifier = require("node-notifier");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const CHECK_URL =
  "https://bawtt.ydmap.cn/booking/schedule/102824?salesItemId=100908";

// 从第几个时间段开始检查 start from 0
const CHECK_START_INDEX = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkTickets() {
  const browser = await puppeteer.launch({ headless: "new",args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true); 
  console.log("开始查询页面");
  await page.goto(CHECK_URL);

  try {
    // 等待页面加载完成
    await page.waitForSelector(".schedule-table-compact");

    // 获取所有时间段信息
    const timeCells = await page.$$(".schedule-table-compact td");
    for (let index = 0; index < timeCells.length; index++) {
      const cell = timeCells[index];
      
      if (index >= CHECK_START_INDEX) {
        const ticketText = await cell.evaluate((el) => el.textContent);
        if (ticketText.includes("可约")) {
          console.log(
            `[${new Date().toLocaleTimeString()}]`,
            ticketText,
            CHECK_URL
          );

          notifier.notify({
            title: "发现可预约",
            message: ticketText,
            wait: true,
          });
        } else if (index === timeCells.length - 1) {
          console.log(`[${new Date().toLocaleTimeString()}]`, "约满了");
        }
      }
    }

    await browser.close();
  } catch (error) {
  
    
    console.error("出现错误：", error);
    await browser.close();
  }
}

// 8-19点每1分钟检查一次
const job = new CronJob("*/1 8-19 * * *", checkTickets, null, true);
job.start();

checkTickets();
