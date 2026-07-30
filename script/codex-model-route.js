/**
 * CC Switch 代理的 Codex 请求 —— 模型路由改写
 *
 * 命中条件（同时满足）：
 *   1. api key 包含 KEY_MATCH
 *   2. 请求模型为 SOURCE_MODEL
 * 命中后将请求体里的模型改写为 TARGET_MODEL
 *
 * CC Switch 路由服务地址：127.0.0.1:15721
 * rewrite 配置见 rewrite/ccswitch.conf
 */

// ===== 配置 =====
const KEY_MATCH = "yBDUUsmLEL"; // api key 需要包含的字符串
const SOURCE_MODEL = "codex-auto-review"; // 需要匹配的模型（全等，想模糊匹配可改成 .includes）
const TARGET_MODEL = "deepseek-v4-flash"; // 命中后改写的模型
// =================

const TAG = "[codex-model-route]";

// 大小写不敏感地读取 header
const getHeader = (headers, name) => {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key ? headers[key] : "";
};

// 从 Authorization / x-api-key 中取 api key
const getApiKey = (headers) =>
  getHeader(headers, "authorization") || getHeader(headers, "x-api-key") || "";

const headers = { ...($request.headers || {}) };
const apiKey = getApiKey(headers);
let body = $request.body || "";

// 传给 $done 的修改内容，空对象表示原样放行
let result = {};

if (apiKey.includes(KEY_MATCH)) {
  try {
    const json = JSON.parse(body);
    if (json && json.model === SOURCE_MODEL) {
      json.model = TARGET_MODEL;
      body = JSON.stringify(json);

      // body 变了，删掉 content-length 让 Quantumult X 重新计算，避免长度不一致导致请求挂起
      Object.keys(headers).forEach((k) => {
        if (k.toLowerCase() === "content-length") delete headers[k];
      });

      result = { body, headers };
      console.log(`${TAG} 命中：模型 ${SOURCE_MODEL} -> ${TARGET_MODEL}`);
    }
  } catch (e) {
    console.log(`${TAG} 请求体不是 JSON，跳过：${e}`);
  }
}

$done(result);
