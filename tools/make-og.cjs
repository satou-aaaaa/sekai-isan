// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、27件を文化・自然で色分けした札の並びだけ（名前は書かない）。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
const G = require("../gen.js");
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const tiles = G.SITES.map((x, i) => `<rect x="${(i % 6) * 78}" y="${Math.floor(i / 6) * 78}" width="66" height="66" rx="12" fill="${x.t === "自然" ? "#25734a" : "#2b4a6f"}"/>`).join("");
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:56px 64px;background:#f6f1e7;color:#2a2420;display:flex;gap:48px;align-items:center">
    <div style="flex:1">
      <div style="font-size:32px;color:#86291a;letter-spacing:.06em">日本の世界遺産を当てる1日5問</div>
      <div style="font-size:120px;font-weight:900;margin-top:8px;color:#1f3a5c;white-space:nowrap">世界遺産<span style="color:#b8402a">あて</span></div>
      <div style="font-size:31px;margin-top:14px;line-height:1.55;white-space:nowrap">ある所・登録の年・文化か自然か<br>文化庁・環境省の解説にもとづく</div>
    </div>
    <svg width="456" height="378" viewBox="0 0 456 378">${tiles}</svg>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
