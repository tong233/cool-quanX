const url = $request.url;
const body = JSON.parse($response.body);

const lastYearTime = new Date().setFullYear(new Date().getFullYear() - 1);
if (url.includes("/server_time/unix")) {
  const timeStamp = lastYearTime - 1000 * 60; // 多减1分钟
  body.data.now = timeStamp;
} else if (url.includes("/Daka/wechat")) {
  body.data.check_time = Math.round(lastYearTime / 1000).toString(); // 时间戳精度秒
}

$done({ body: JSON.stringify(body) });
