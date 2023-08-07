/**
 * 文体通体育场馆票预约检查脚本，接口加了签名校验，只能爬网页了
 */
const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const notifier = require("node-notifier");

const CHECK_URL =
  "https://bawtt.ydmap.cn/booking/schedule/102824?salesItemId=100908";

// 从第几个时间段开始检查 start from 1
const CHECK_START_INDEX = 3;

async function checkTickets() {
  console.log("开始查询页面");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(CHECK_URL);

  try {
    // 等待页面加载完成
    await page.waitForSelector(".tablecell");

    // 获取所有时间段信息
    const timeCells = await page.$$(".tablecell");

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

// 0-19点每5分钟检查一次
const job = new CronJob("*/1 0-19 * * *", checkTickets, null, true);
job.start();

checkTickets();
