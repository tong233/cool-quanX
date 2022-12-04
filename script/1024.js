const $ = API("1024", true);

let COOKIE = "";

if (!COOKIE) {
  COOKIE = $.read("cookie");
}

const ARTICLE_CHE_KEY = "articles_log";

// 随机等待最大秒
const DELAY_TIME = 1000 * 100;

const headers = {
  connection: "keep-alive",
  cookie: COOKIE,
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
};

const getArticleList = async () => {
  try {
    const randomPage = randomRange(1, 2);
    console.log(`正在获取第${randomPage}页文章列表`);
    const res = await $.http.get({
      url: `https://cl.5297x.xyz/thread0806.php?fid=7&search=&page=${randomPage}`,
      timeout: 15000,
      headers: {
        ...headers,
        cookie: "ismob=1; ",
      },
    });
    const reg =
      /<a href="htm_(?:mob|data)\/\d+\/\d+\/(\d+?)\.html">(.+?)<\/a>/g;
    const list = [];

    while ((result = reg.exec(res.body)) !== null) {
      list.push({
        id: result[1],
        title: result[2],
      });
    }
    console.log(`获取成功，文章数量：${list.length}`);
    return list;
  } catch (error) {
    console.log("获取列表 error: ");
    console.log(error);
    $.done();
  }
};

const commentArticle = async (article) => {
  // 评论模板
  const COMMENT_TEMPLATE = [
    "感谢分享",
    "谢谢分享",
    "感谢分享~",
    "感谢分享啊",
    "感谢分享，勿忘提肛",
    "感谢大佬分享",
    "感谢作者分享",
    "支持发帖",
    "帖子不错",
    "发帖辛苦",
    "支持一下",
    "支持一下，感谢分享",
  ];

  const randomComment =
    COMMENT_TEMPLATE[randomRange(COMMENT_TEMPLATE.length - 1, 0)];

  const body = `atc_title=${encodeURI("Re:")}&atc_content=${encodeURI(
    randomComment
  )}&atc_usesign=1&atc_convert=1&atc_autourl=1&step=2&action=reply&fid=7&tid=${
    article.id
  }&page=h&pid=&article=&touid=&verify=verify&Submit=%E6%AD%A3%E5%9C%A8%E6%8F%90%E4%BA%A4%E5%9B%9E%E8%A6%86..`;

  try {
    const res = await $.http.post({
      url: "https://cl.5297x.xyz/post.php",
      timeout: 15000,
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    console.log(`${res.body.match(/<a.+?>(.+?)<\/a>/g)}`);
    console.log(`回复成功：${randomComment}，--《${article.title}》`);
    return randomComment;
  } catch (error) {
    console.error("回复 error: ", article);
    console.log(error);
    $.done();
  }
};

const doCommentTasks = async () => {
  if (!COOKIE) {
    $.notify("1024", "没有cookie", "");
    $.done();
    return;
  }
  let oldArticles = $.read(ARTICLE_CHE_KEY) || [];
  const todayArticles = oldArticles.filter(
    (item) => new Date(item.date).getTime() > new Date().setHours(0, 0, 0)
  ).length;

  console.log(`今日已评论文章：${todayArticles}`);
  if (todayArticles >= 200) {
    $.notify("1024", "今日评论已达上限", "");
    $.done();
    return;
  }

  try {
    const list = await getArticleList();
    const articles = list.slice(10);

    const unCommentArticles = uniqueBy(
      articles.filter((item) => {
        return !oldArticles.some((ele) => ele.id === item.id);
      }),
      (a, b) => a.id === b.id
    );

    console.log(`可评论文章：${unCommentArticles.length}`);

    const item =
      unCommentArticles[randomRange(0, unCommentArticles.length - 1)];

    const waitTime = randomRange(0, DELAY_TIME);
    await $.wait(waitTime);

    console.log(`等待${waitTime / 1000}秒`);

    const content = await commentArticle(item);
    oldArticles.push({ ...item, content, date: new Date().toLocaleString() });
    $.write(oldArticles, ARTICLE_CHE_KEY);
    $.done();
  } catch (error) {
    console.error("doCommentTask error");
    console.log(error);
    $.done();
  }
};

/**
 * 数组根据条件去重
 * @param {function} fn (a, b) => a.id == b.id
 */
function uniqueBy(arr, fn) {
  return arr.reduce((acc, v) => {
    if (!acc.some((x) => fn(v, x))) acc.push(v);
    return acc;
  }, []);
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min); //含最大值，含最小值
}

doCommentTasks();

// https://github.com/Peng-YM/QuanX/tree/master/Tools/OpenAPI
// prettier-ignore
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
// prettier-ignore
function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}
// prettier-ignore
function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
