// 世界遺産あて の問題（ブラウザと node の両方で使う）。
// 日本の世界遺産27件の、種類（文化・自然）・ある都道府県・登録の年・特徴・ふくまれる場所を当てる。
// 名前・所在地・記載の年・種類は文化庁「世界遺産一覧」、特徴は文化庁「文化遺産オンライン」の各資産の解説と、環境省「日本の世界自然遺産」の各地の顕著な普遍的価値から（出どころは SRC）。
// 問題は決まった種から全部ここで作る（BANK）。1問は「種類|番号」の key を持ち、同じ key ならいつも同じ問題になる。
// 作り方を変えると、過去の日の問題も変わる。変えた PR に一言書く。QA は表を別に持って答えを確かめる。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ日なら、どの端末でも同じ問題になる。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出どころ（短い名前と URL）
  const BK = "https://online.bunka.go.jp/special_content/", ENV = "https://www.env.go.jp/nature/isan/worldheritage/";
  const SRC = {
    list: ["文化庁「世界遺産一覧」", "https://www.bunka.go.jp/seisaku/bunkazai/shokai/sekai_isan/ichiran/"],
    bunka: ["文化庁「文化遺産オンライン」世界遺産の解説", BK + "world/"],
    env: ["環境省「日本の世界自然遺産」", ENV],
  };

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

  // 日本の世界遺産（文化庁の一覧の順）。n 短い名前・f 一覧の名前・p 都道府県・y 記載の年・t 文化/自然・e 絵文字（飾り）・x 特徴2つ・c ふくまれる場所（解説に名前が出るもの）・u 解説のページ
  const SITES = [
    { n: "法隆寺地域の仏教建造物", f: "法隆寺地域の仏教建造物", p: ["奈良県"], y: 1993, t: "文化", e: "🏯", x: ["法隆寺と法起寺の2つの寺から成る", "世界で最も古い時代の木造建築が多く残る"], c: ["法起寺"], u: BK + "hlink1" },
    { n: "姫路城", f: "姫路城", p: ["兵庫県"], y: 1993, t: "文化", e: "🏯", x: ["白い外観から「白鷺城」とも呼ばれる", "木造の城の建物と石垣・白壁の土塀が残る"], c: [], u: BK + "hlink2" },
    { n: "屋久島", f: "屋久島", p: ["鹿児島県"], y: 1993, t: "自然", e: "🌲", x: ["亜熱帯から亜高山帯まで、植物が高さごとに分かれて生える島", "樹齢1,000年をこえるヤクスギが多く育つ"], c: [], u: ENV + "yakushima/uiversal/index.html" },
    { n: "白神山地", f: "白神山地", p: ["青森県", "秋田県"], y: 1993, t: "自然", e: "🌳", x: ["東アジアで最大の、人の手の入っていないブナ林が広がる", "大昔の北の地方の森に近いブナ林が残る"], c: [], u: ENV + "shirakami/uiversal/index.html" },
    { n: "古都京都の文化財", f: "古都京都の文化財（京都市、宇治市、大津市）", p: ["京都府", "滋賀県"], y: 1994, t: "文化", e: "⛩️", x: ["794年から1868年まで、天皇の住む都だった", "17件の寺・神社・城などから成る"], c: [], u: BK + "hlink3" },
    { n: "白川郷・五箇山の合掌造り集落", f: "白川郷・五箇山の合掌造り集落", p: ["岐阜県", "富山県"], y: 1995, t: "文化", e: "🏠", x: ["茅葺きの合掌造りの、大きな木造の家が集まる", "18〜19世紀の家が今も暮らしの中に残る"], c: [], u: BK + "hlink4" },
    { n: "原爆ドーム", f: "原爆ドーム", p: ["広島県"], y: 1996, t: "文化", e: "🕊️", x: ["1915年に建てられた広島県物産陳列館の建物", "爆心地から約160mで被爆し、ドームの骨組みが残った"], c: [], u: BK + "hlink5" },
    { n: "厳島神社", f: "厳島神社", p: ["広島県"], y: 1996, t: "文化", e: "⛩️", x: ["海の中に木造の社殿が建ち並ぶ神社", "背後の島そのものが神聖な島とされた"], c: [], u: BK + "hlink6" },
    { n: "古都奈良の文化財", f: "古都奈良の文化財", p: ["奈良県"], y: 1998, t: "文化", e: "🦌", x: ["710年から784年の都・平城京の宮の跡をふくむ", "東大寺・興福寺・春日大社など8件から成る"], c: ["東大寺", "興福寺", "春日大社", "平城宮跡"], u: BK + "hlink7" },
    { n: "日光の社寺", f: "日光の社寺", p: ["栃木県"], y: 1999, t: "文化", e: "⛩️", x: ["徳川家康をまつる東照宮が中心", "彫刻や漆・色でかざられた社寺の建物"], c: ["東照宮"], u: BK + "hlink8" },
    { n: "琉球王国のグスク及び関連遺産群", f: "琉球王国のグスク及び関連遺産群", p: ["沖縄県"], y: 2000, t: "文化", e: "🏰", x: ["首里城跡など9件から成る", "サンゴの石灰岩を曲線に積んだ城壁"], c: ["首里城跡", "今帰仁城跡"], u: BK + "hlink9" },
    { n: "紀伊山地の霊場と参詣道", f: "紀伊山地の霊場と参詣道", p: ["三重県", "奈良県", "和歌山県"], y: 2004, t: "文化", e: "⛰️", x: ["吉野・大峯、熊野三山、高野山の3つの霊場", "霊場をお参りするための道もふくむ"], c: ["熊野三山", "高野山"], u: BK + "hlinkA" },
    { n: "知床", f: "知床", p: ["北海道"], y: 2005, t: "自然", e: "🦅", x: ["海の氷が栄養を運び、海と陸の食べ物のつながりの始まりになる", "北と南の生き物がまじり、シマフクロウなどがすむ"], c: [], u: ENV + "shiretoko/uiversal/index.html" },
    { n: "石見銀山遺跡", f: "石見銀山遺跡とその文化的景観", p: ["島根県"], y: 2007, t: "文化", e: "⛏️", x: ["銀の鉱山の跡・鉱山の町・港・街道から成る", "14件から成る、銀を掘って運んだ跡"], c: [], u: BK + "hlinkB" },
    { n: "小笠原諸島", f: "小笠原諸島", p: ["東京都"], y: 2011, t: "自然", e: "🐌", x: ["一度も大陸と陸続きになったことがない海の島々", "カタツムリの9割以上が、ここにしかいない種"], c: [], u: ENV + "ogasawara/uiversal/index.html" },
    { n: "平泉", f: "平泉‐仏国土（浄土）を表す建築・庭園及び考古学的遺跡群‐", p: ["岩手県"], y: 2011, t: "文化", e: "🏯", x: ["金鶏山を中心に、浄土を表す庭園が配された", "12世紀からの金色の仏堂が残る"], c: ["中尊寺"], u: BK + "hlinkC" },
    { n: "富士山", f: "富士山‐信仰の対象と芸術の源泉‐", p: ["山梨県", "静岡県"], y: 2013, t: "文化", e: "🗻", x: ["標高3,776mの円錐形の火山", "葛飾北斎の『富嶽三十六景』など多くの絵に描かれた"], c: [], u: BK + "hlinkD" },
    { n: "富岡製糸場と絹産業遺産群", f: "富岡製糸場と絹産業遺産群", p: ["群馬県"], y: 2014, t: "文化", e: "🧵", x: ["生糸づくりと蚕を育てる技術の進歩を示す4件", "田島弥平旧宅・高山社跡・荒船風穴をふくむ"], c: ["田島弥平旧宅", "高山社跡", "荒船風穴"], u: BK + "hlinkE" },
    { n: "明治日本の産業革命遺産", f: "明治日本の産業革命遺産　製鉄・製鋼、造船、石炭産業", p: ["福岡県", "佐賀県", "長崎県", "熊本県", "鹿児島県", "山口県", "岩手県", "静岡県"], y: 2015, t: "文化", e: "🏭", x: ["1850年代から1910年の、西洋の技術の取り入れを示す", "萩反射炉・端島炭坑など23件から成る"], c: ["萩反射炉", "端島炭坑"], u: BK + "hlinkF" },
    { n: "ル・コルビュジエの建築作品", f: "ル・コルビュジエの建築作品‐近代建築運動への顕著な貢献‐", p: ["東京都"], y: 2016, t: "文化", e: "🏛️", x: ["7か国の17の建築から成る", "日本からは国立西洋美術館が入る"], c: ["国立西洋美術館"], u: BK + "hlinkG" },
    { n: "宗像・沖ノ島と関連遺産群", f: "「神宿る島」宗像・沖ノ島と関連遺産群", p: ["福岡県"], y: 2017, t: "文化", e: "🏝️", x: ["4〜9世紀の祭りの跡が、ほぼ手つかずで残る島", "新原・奴山古墳群は宗像氏がいたことを物語る"], c: ["新原・奴山古墳群"], u: BK + "hlinkH" },
    { n: "長崎と天草地方の潜伏キリシタン関連遺産", f: "長崎と天草地方の潜伏キリシタン関連遺産", p: ["長崎県", "熊本県"], y: 2018, t: "文化", e: "⛪", x: ["禁じられた時代に、ひそかに信仰を続けた伝統を示す", "信仰を守るために移り住んだ離島の集落もふくむ"], c: [], u: BK + "hlinkI" },
    { n: "百舌鳥・古市古墳群", f: "百舌鳥・古市古墳群‐古代日本の墳墓群‐", p: ["大阪府"], y: 2019, t: "文化", e: "⚱️", x: ["4世紀後半から5世紀後半に築かれた古墳の群れ", "長さ500m近い前方後円墳をふくむ"], c: [], u: BK + "hlinkJ" },
    { n: "奄美大島、徳之島、沖縄島北部及び西表島", f: "奄美大島、徳之島、沖縄島北部及び西表島", p: ["鹿児島県", "沖縄県"], y: 2021, t: "自然", e: "🐇", x: ["陸の哺乳類の約6割、両生類の86%が、ここにしかいない種", "アマミノクロウサギなど、古い形を残す生き物がいる"], c: [], u: ENV + "amami/uiversal/index.html" },
    { n: "北海道・北東北の縄文遺跡群", f: "北海道・北東北の縄文遺跡群", p: ["北海道", "青森県", "岩手県", "秋田県"], y: 2021, t: "文化", e: "🏺", x: ["1万年以上、採集・漁・狩りで暮らし定住した人々の跡", "三内丸山遺跡など17の遺跡から成る"], c: ["三内丸山遺跡"], u: BK + "hlinkK" },
    { n: "佐渡島の金山", f: "佐渡島の金山", p: ["新潟県"], y: 2024, t: "文化", e: "🪙", x: ["17世紀に、世界で最も多く金をとった所だった", "西三川砂金山と相川鶴子金銀山から成る"], c: ["西三川砂金山", "相川鶴子金銀山"], u: BK + "hlinkL" },
    { n: "飛鳥・藤原の宮都", f: "飛鳥・藤原の宮都", p: ["奈良県"], y: 2026, t: "文化", e: "🏛️", x: ["6〜8世紀の都の移り変わりを示す遺跡の群れ", "日本列島で初めて生まれた古代の国家の都の跡"], c: [], u: BK + "hlink10_3" },
  ];
  const TYPES = ["文化", "自然"];
  const srcOf = (s) => (s.t === "自然" ? ["list", "env"] : ["list", "bunka"]);
  const PREFS = [...new Set(SITES.flatMap((s) => s.p))];
  const YEARS = [...new Set(SITES.map((s) => s.y))].sort((a, b) => a - b);

  // 問題をためる。key は「種類|番号」。同じ種類の中で、文と選び肢が同じ問題は入れない
  const B = [], seen = new Set();
  function add(kind, id, q) {
    const sig = kind + "|" + q.scene.text + "|" + q.opts.slice().sort().join("/");
    if (seen.has(sig)) return false; seen.add(sig);
    if (!q.opts.includes(q.ans) || new Set(q.opts).size !== q.opts.length) throw new Error("bad question " + kind + id);
    B.push({ key: kind + "|" + id, kind, ...q }); return true;
  }
  const Q = (text) => ({ t: "q", text });
  const where = (s) => s.p.length > 3 ? `${s.p.slice(0, 3).join("・")}など${s.p.length}県` : s.p.join("・");
  const info = (s) => `${s.n}（${where(s)}・${s.y}年・${s.t}遺産）`;

  // ── やさしい ──
  // 特徴 → 名前（選び肢はほかの遺産）
  SITES.forEach((s, i) => s.x.forEach((x, v) => { const R = rng(seedOf(`gen:toku:${i}:${v}`)), ds = pickN(R, SITES.filter((_, j) => j !== i), 3);
    add("toku", `${i}-${v}`, { scene: Q(`「${x}」。この世界遺産は？`), opts: [s.n, ...ds.map((d) => d.n)], ans: s.n, at: [i], src: srcOf(s),
      why: `${info(s)}です。` }); }));
  // 文化遺産か自然遺産か（2つ。並びはそのまま）
  SITES.forEach((s, i) => add("shurui", String(i), { scene: Q(`「${s.n}」は、文化遺産と自然遺産のどちら？`), opts: TYPES.map((t) => t + "遺産"), ans: s.t + "遺産", at: [i], src: ["list"], fix: 1,
    why: s.t === "自然" ? `${s.n}は自然遺産。日本の自然遺産は知床・白神山地・小笠原諸島・屋久島・奄美大島ほかの5件です。` : (i === 16 ? "富士山は、信仰の対象と芸術の源泉として文化遺産に登録されました。" : `${s.n}は文化遺産。人の歴史・信仰・暮らしを伝える建物や遺跡、景観が文化遺産です。`) }));
  // ある都道府県（いくつもの県にまたがる遺産は「その1つ」）
  SITES.forEach((s, i) => s.p.slice(0, 2).forEach((p, v) => { const R = rng(seedOf(`gen:ken:${i}:${v}`)), ds = pickN(R, PREFS.filter((x) => !s.p.includes(x)), 3);
    add("ken", `${i}-${v}`, { scene: Q(s.p.length > 1 ? `「${s.n}」は、いくつかの都道府県にまたがります。そのうちの1つは？` : `「${s.n}」がある都道府県は？`), opts: [p, ...ds], ans: p, at: [i], src: ["list"],
      why: `${s.n}は${s.p.join("・")}にあります。` }); }));
  // 4つのうち自然遺産はどれ（自然遺産5件 × 3通り）
  SITES.forEach((s, i) => { if (s.t !== "自然") return; for (let v = 0; v < 3; v++) { const R = rng(seedOf(`gen:shizen:${i}:${v}`)), ds = pickN(R, SITES.filter((x) => x.t === "文化"), 3);
    add("shizen", `${i}-${v}`, { scene: Q("次のうち、自然遺産はどれ？"), opts: [s.n, ...ds.map((d) => d.n)], ans: s.n, at: [i], src: ["list", "env"],
      why: `${s.n}は自然遺産です。ほかの3つは、人の歴史や信仰を伝える文化遺産です。` }); } });

  // ── ふつう ──
  // 登録（記載）の年（選び肢は年の順。答えの場所は種で決める）
  SITES.forEach((s, i) => { const R = rng(seedOf("gen:nen:" + i)), k = YEARS.indexOf(s.y), r = Math.floor(R() * 4); let st = k - r; st = Math.max(0, Math.min(YEARS.length - 4, st));
    const opts = YEARS.slice(st, st + 4).map((y) => y + "年");
    add("nen", String(i), { scene: Q(`「${s.n}」が世界遺産に登録された年は？`), opts, ans: s.y + "年", at: [i], src: ["list"], fix: 1,
      why: `${s.n}は${s.y}年に登録されました。日本で最初の登録は1993年の4件です。` }); });
  // 名前 → 特徴
  SITES.forEach((s, i) => s.x.forEach((x, v) => { const R = rng(seedOf(`gen:naiyo:${i}:${v}`)), ds = pickN(R, SITES.filter((_, j) => j !== i), 3).map((d) => d.x[Math.floor(R() * 2)]);
    add("naiyo", `${i}-${v}`, { scene: Q(`「${s.n}」の説明として正しいのは？`), opts: [x, ...ds], ans: x, at: [i], src: srcOf(s),
      why: `${s.n}は「${s.x[0]}」「${s.x[1]}」とされます。` }); }));
  // 都道府県 → 遺産（その県にある遺産ごとに1問）
  PREFS.forEach((p) => SITES.forEach((s, i) => { if (!s.p.includes(p)) return; const R = rng(seedOf(`gen:kenmei:${p}:${i}`)), ds = pickN(R, SITES.filter((x) => !x.p.includes(p)), 3);
    add("kenmei", `${p}-${i}`, { scene: Q(`${p}にある世界遺産はどれ？`), opts: [s.n, ...ds.map((d) => d.n)], ans: s.n, at: [i], src: ["list"],
      why: `${s.n}は${s.p.join("・")}にあります。` }); }));
  // どちらが先に登録された？（年がちがう2つ）
  SITES.forEach((s, i) => { const R = rng(seedOf("gen:saki:" + i)), os = pickN(R, SITES.filter((x) => x.y !== s.y), 2);
    os.forEach((o, v) => { const j = SITES.indexOf(o), first = s.y < o.y ? s : o, pair = pickN(R, [s, o], 2);
      add("saki", `${i}-${v}`, { scene: Q("先に世界遺産に登録されたのはどっち？"), opts: pair.map((x) => x.n), ans: first.n, at: [i, j], src: ["list"], fix: 1,
        why: `${s.n}は${s.y}年、${o.n}は${o.y}年に登録されました。` }); }); });

  // ── むずかしい ──
  // ふくまれる場所 → 遺産
  SITES.forEach((s, i) => s.c.forEach((c, v) => { const R = rng(seedOf(`gen:kosei:${i}:${v}`)), ds = pickN(R, SITES.filter((_, j) => j !== i), 3);
    add("kosei", `${i}-${v}`, { scene: Q(`「${c}」がふくまれる世界遺産は？`), opts: [s.n, ...ds.map((d) => d.n)], ans: s.n, at: [i], src: srcOf(s),
      why: `${c}は「${s.f}」の一部です。` }); }));
  // 登録の順に並べる（3つの年がちがう遺産。正しい順と、その並べ替え3つ）
  SITES.forEach((s, i) => { for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:narabe:${i}:${v}`)), os = pickN(R, SITES.filter((x) => x.y !== s.y), 8);
    const b = os.find((x) => x.y !== s.y), c = os.find((x) => x.y !== s.y && x.y !== b.y); const ok = [s, b, c].sort((p, q) => p.y - q.y); // 並べ替えは年で（乱数は引かない）
    const [a1, a2, a3] = ok.map((x) => x.n), wrong = [[a3, a2, a1], [a2, a1, a3], [a1, a3, a2]];
    add("narabe", `${i}-${v}`, { scene: Q("登録された順（古い → 新しい）に正しく並んでいるのは？"), opts: [ok.map((x) => x.n).join(" → "), ...wrong.map((w) => w.join(" → "))], ans: ok.map((x) => x.n).join(" → "), at: ok.map((x) => SITES.indexOf(x)), src: ["list"],
      why: ok.map((x) => `${x.n}（${x.y}年）`).join("→") + " の順です。" }); } });
  // 同じ年に登録された遺産（同じ年の仲間がいる遺産だけ）
  SITES.forEach((s, i) => { const mates = SITES.filter((x, j) => j !== i && x.y === s.y); if (!mates.length) return;
    mates.forEach((m, v) => { const R = rng(seedOf(`gen:onaji:${i}:${v}`)), ds = pickN(R, SITES.filter((x) => x.y !== s.y), 3);
      add("onaji", `${i}-${v}`, { scene: Q(`「${s.n}」と同じ年に登録されたのは？`), opts: [m.n, ...ds.map((d) => d.n)], ans: m.n, at: [i, SITES.indexOf(m)], src: ["list"],
        why: `どちらも${s.y}年の登録です。` + (s.y === 1993 ? "1993年は日本で最初の4件（法隆寺・姫路城・屋久島・白神山地）です。" : "") }); }); });
  // いくつから成る（解説に数が出る遺産だけ。選び肢は小さい順）
  const KAZU = [[0, 2], [4, 17], [8, 8], [10, 9], [13, 14], [17, 4], [18, 23], [19, 17], [24, 17], [25, 2]];
  KAZU.forEach(([i, n]) => { const s = SITES[i], R = rng(seedOf("gen:kazu:" + i)), cand = [2, 4, 6, 8, 9, 11, 14, 17, 20, 23, 26].filter((x) => x !== n), ds = pickN(R, cand, 3);
    const opts = [n, ...ds].sort((a, b) => a - b).map((x) => x + "件");
    add("kazu", String(i), { scene: Q(i === 19 ? `「${s.n}」は、7か国のいくつの建築から成る？` : `「${s.n}」は、いくつの構成資産から成る？`), opts, ans: n + "件", at: [i], src: srcOf(s), fix: 1,
      why: `${s.n}は${n}件から成ります。` + (s.c.length ? `たとえば${s.c.join("・")}。` : "") }); });

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）
  const KINDS = [
    { id: "toku", lv: 0, name: "特徴から当てる", look: "建物か、山や森か、島か。書いてあるものの形を思いうかべましょう。" },
    { id: "shurui", lv: 0, name: "文化か自然か", look: "人の歴史や信仰を伝える所なら文化遺産。生き物や地形の価値なら自然遺産です。" },
    { id: "ken", lv: 0, name: "ある都道府県", look: "名前に地名が入っていないか見てみましょう。" },
    { id: "shizen", lv: 0, name: "自然遺産はどれ", look: "日本の自然遺産は、北の森と海、南の島々の5件です。" },
    { id: "nen", lv: 1, name: "登録の年", look: "最初は1993年の4件。そのあと、ほぼ1〜2年に1件ずつ増えてきました。" },
    { id: "naiyo", lv: 1, name: "説明を選ぶ", look: "ほかの3つは、ほかの遺産の説明です。" },
    { id: "kenmei", lv: 1, name: "県から当てる", look: "その県の地名や、近くの名所を思い出しましょう。" },
    { id: "saki", lv: 1, name: "どっちが先", look: "1990年代の登録は、法隆寺・姫路城・屋久島・白神・京都・白川郷・広島の2件・奈良・日光。" },
    { id: "kosei", lv: 2, name: "ふくまれる場所", look: "寺・城・山・鉱山など、その場所の種類から考えましょう。" },
    { id: "narabe", lv: 2, name: "登録の順", look: "いちばん古いものと、いちばん新しいものを先に決めましょう。" },
    { id: "onaji", lv: 2, name: "同じ年の仲間", look: "1993年・1996年・2011年・2021年は、2件以上が登録されました。" },
    { id: "kazu", lv: 2, name: "いくつから成る", look: "寺1つではなく、まわりの場所もまとめて1つの遺産になります。" },
  ];
  B.forEach((q) => { q.lv = KINDS.find((k) => k.id === q.kind).lv; });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const BANK = Object.fromEntries(B.map((q) => [q.key, q]));
  const keysOf = (kind) => B.filter((q) => q.kind === kind).map((q) => q.key);

  // 1問を作る。tag は key（「種類|番号」）。選び肢は key の種で並べ替える（並びに意味のある選び肢 fix はそのまま）
  function make(tag) {
    const q = Object.prototype.hasOwnProperty.call(BANK, tag) ? BANK[tag] : null; if (!q) return null;
    const k = BY[q.kind], opts = q.opts.length === 2 || q.fix ? q.opts.slice() : pickN(rng(seedOf(tag)), q.opts, q.opts.length);
    return { tag, kind: q.kind, lv: k.lv, name: k.name, look: k.look, scene: q.scene, text: q.text || "", opts, ans: q.ans, why: q.why, at: q.at, src: q.src.map((s) => SRC[s]) };
  }
  const pickKey = (R, kind) => { const ks = keysOf(kind); return ks[Math.floor(R() * ks.length)]; };

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), m = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...m, ...h].map((id) => pickKey(R, id));
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = BANK[dailyTags(date)[4]].kind, R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id) => pickKey(R, id));
  }

  const G = { KINDS, BY, LV, SRC, SITES, TYPES, PREFS, YEARS, BANK, keysOf, kindsOf, seedOf, rng, make, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = G; else root.ISAN = G;
})(typeof self !== "undefined" ? self : this);
