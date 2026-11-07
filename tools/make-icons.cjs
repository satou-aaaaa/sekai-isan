// アプリのアイコン（icon-192.png・icon-512.png）を作る。藍の地に、山の形と「遺」の字。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）。maskable でも欠けないよう、絵は真ん中の円（直径80%）に収める
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2b4a6f"/>
      <path d="M20 58 L40 24 L52 40 L62 30 L80 58 Z" fill="#7fbf8e"/>
      <text x="50" y="84" text-anchor="middle" font-size="22" font-weight="900" fill="#fffdf8" font-family="'Noto Sans CJK JP','IPAPGothic',sans-serif">遺</text></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
