"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TraditionalGogyoWheel } from "@/components/TraditionalGogyoWheel";
import {
  type Meishiki,
  type DetailedChart,
  type DaiunResult,
  type Element,
  ELEMENT_COLORS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  STEM_READINGS,
  TSUHENSEI_MEANINGS,
  JUUNIUN_MEANINGS,
  GETSUREI_DESCRIPTIONS,
  getKanshiNumber,
  buildRyuunenPillar,
  toJapaneseEra,
} from "@/lib/shichusuimei";

type Gender = "男" | "女";

interface Props {
  meishiki: Meishiki;
  detailed: DetailedChart;
  daiun: DaiunResult | null;
  approxAge: number;
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender?: Gender;
}

/* ───────────────────────── 解釈マップ ───────────────────────── */

/** 最強の五行が示す傾向 */
const DOMINANT_ELEMENT_MEANING: Record<Element, string> = {
  "木": "成長・挑戦・伸びる意欲の気が強い人。新規開拓や起業家精神、リーダー的な推進力を発揮しやすい。",
  "火": "情熱・表現・明るさの気が強い人。人を惹きつけ、舞台に立つとき最も輝くタイプ。",
  "土": "安定・堅実・信頼の気が強い人。腰を据えて育てる粘り強さ、調整役・縁の下の力持ちが得意。",
  "金": "決断・整理・洗練の気が強い人。論理的で切り替えが速く、質を見抜く鋭さを持つ。",
  "水": "知性・柔軟・内省の気が強い人。情報処理と臨機応変さに長け、戦略家・分析家肌。",
};

/** 最弱の五行が示す「補うべき方向」 */
const WEAKEST_ELEMENT_MEANING: Record<Element, string> = {
  "木": "前進・挑戦のエネルギーが弱め。新しいことを始める・自己主張する機会を意識的に増やすと運が開く。",
  "火": "情熱や自己表現が抑え気味。人前に出る・感情を表現する場を用意すると本来の光が灯る。",
  "土": "持続力・安定感が手薄。休息のリズムと仲間との絆を整えると、底が深くなる。",
  "金": "断ち切る力・整理整頓が苦手。取捨選択と決断を意識するだけで運気が整う。",
  "水": "思慮・情報収集が手薄。学びと静の時間を意識的に取り入れると、次の飛躍が見える。",
};

/** 柱ごとのライフステージと担当領域 */
const PILLAR_STAGE: Record<string, { stage: string; area: string }> = {
  "年柱": { stage: "0〜20代", area: "先祖・幼少期・社会との関わり" },
  "月柱": { stage: "20〜40代", area: "両親・青年期・仕事と適性" },
  "日柱": { stage: "40〜60代", area: "配偶者・本質・日常生活" },
  "時柱": { stage: "60代以降", area: "子孫・晩年・人生の志" },
};

/** 納音（日柱六十干支）のシンボルが示すニュアンス */
const NAYIN_HINTS: Record<string, string> = {
  "海中金": "深海に眠る金。秘めた才能が時を経て光る。",
  "炉中火": "炉の中の火。鍛錬を通じて本領発揮する情熱。",
  "大林木": "大きな林木。多くを抱き守る大らかさ。",
  "路傍土": "道端の土。人の通り道を支える縁の下。",
  "剣鋒金": "剣の切先。切れ味鋭い判断力。",
  "山頭火": "山頂の火。遠くから見つけられる先導者。",
  "澗下水": "谷川の水。清らかで賢く、細く長く流れる。",
  "城頭土": "城の土塁。守りの硬さと気品。",
  "白鑞金": "白鑞（はくろう）。目立たず役立つ職人気質。",
  "楊柳木": "柳の木。しなやかで折れない適応力。",
  "井泉水": "井戸水。枯れずに人を潤す奉仕の力。",
  "屋上土": "屋根の土。高みから守る責任感。",
  "霹靂火": "霹靂（雷）の火。一瞬で世界を変える衝撃。",
  "松柏木": "松柏（しょうはく）。風雪に耐え長寿・孤高の志。",
  "長流水": "長く流れる川。持続力と穏やかな知性。",
  "沙中金": "砂中の金。苦労を経て磨かれて輝く。",
  "山下火": "山の麓の火。静かに温もりを広げる。",
  "平地木": "平地の木。環境次第で大きく育つ可能性。",
  "壁上土": "壁土。守りと土台の堅さ。",
  "金箔金": "金箔。薄く広がり華やかさを添える。",
  "覆燈火": "覆い燈火。内に秘めた光、控えめな知性。",
  "天河水": "天の川。遥かな視点と高い理想。",
  "大駅土": "大きな駅舎の土台。多くの縁が集まる場。",
  "釵釧金": "かんざしの金。装飾性・美意識。",
  "桑柘木": "桑の木。地道な実りと勤勉さ。",
  "大渓水": "大きな渓流。勢いと清らかさ。",
  "沙中土": "砂中の土。時間をかけて固まる堅実さ。",
  "天上火": "天の火。広く人を照らす公的な力。",
  "石榴木": "石榴の木。多産・繁栄・集う力。",
  "大海水": "大海の水。器の大きさと包容力。",
};

/* ───────────────────────── 汎用カード ───────────────────────── */

function GuideCard({
  badge,
  title,
  preview,
  children,
  yourCase,
}: {
  badge: string;
  title: string;
  preview: ReactNode;
  children: ReactNode;
  yourCase: ReactNode;
}) {
  return (
    <Card className="bg-white/[0.04] border-purple-500/30">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 bg-amber-50 border border-stone-300 rounded p-2 flex items-center justify-center">
            {preview}
          </div>
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-rose-500/80 text-white font-bold tracking-wider">
                {badge}
              </span>
              <h3 className="text-white font-bold text-sm">{title}</h3>
            </div>
            <div className="text-purple-100 text-[13px] leading-relaxed">{children}</div>

            <div className="bg-gradient-to-r from-rose-950/40 to-purple-950/30 border-l-2 border-rose-400 px-3 py-2 rounded-sm">
              <div className="text-rose-200 text-[10px] font-bold tracking-[0.2em] mb-1">
                ▶ あなたの場合
              </div>
              <div className="text-purple-50 text-[12.5px] leading-relaxed space-y-1">
                {yourCase}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniPillar({
  label, stem, branch, top, bottom, dim, accent,
}: {
  label: string;
  stem: string;
  branch: string;
  top?: string;
  bottom?: string;
  dim?: boolean;
  accent?: "rose" | "indigo";
}) {
  const stemEl = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchEl = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];
  const headerClass =
    accent === "rose"
      ? "bg-rose-700 text-white border-rose-800"
      : accent === "indigo"
      ? "bg-indigo-700 text-white border-indigo-800"
      : "bg-stone-200 text-stone-700 border-stone-400";
  const tintedCellClass =
    accent === "rose"
      ? "bg-rose-50/60"
      : accent === "indigo"
      ? "bg-indigo-50/60"
      : "bg-stone-50";
  return (
    <div className={`w-10 ${dim ? "opacity-50" : ""}`}>
      <div className={`text-[8px] text-center py-0.5 font-semibold border ${headerClass}`}>
        {label}
      </div>
      <div
        className="font-bold text-base text-center border-x border-b border-stone-400 bg-white"
        style={{ color: stemEl ? ELEMENT_COLORS[stemEl] : undefined, fontFamily: "serif" }}
      >
        {stem}
      </div>
      {top && (
        <div className={`text-[8px] text-center border-x border-b border-stone-400 ${tintedCellClass}`}>
          {top}
        </div>
      )}
      <div
        className="font-bold text-base text-center border-x border-b border-stone-400 bg-white"
        style={{ color: branchEl ? ELEMENT_COLORS[branchEl] : undefined, fontFamily: "serif" }}
      >
        {branch}
      </div>
      {bottom && (
        <div className={`text-[8px] text-center border-x border-b border-stone-400 ${tintedCellClass}`}>
          {bottom}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 本体 ───────────────────────── */

export function TraditionalChartGuide({
  meishiki, detailed, daiun, approxAge,
  year, month, day, hour, gender,
}: Props) {
  const dayPillar = detailed.pillars.find((p) => p.label === "日柱")!;
  const monthPillar = detailed.pillars.find((p) => p.label === "月柱")!;
  const yearPillar = detailed.pillars.find((p) => p.label === "年柱")!;
  const hourPillar = detailed.pillars.find((p) => p.label === "時柱");

  const currentDaiun =
    daiun?.periods.find((p) => p.startAge <= approxAge && approxAge <= p.endAge) ?? null;
  const nextDaiun =
    daiun && currentDaiun
      ? daiun.periods.find((p) => p.startAge === currentDaiun.endAge + 1) ?? null
      : null;
  const currentIndex =
    daiun?.periods.findIndex((p) => p.startAge === currentDaiun?.startAge) ?? -1;

  // 流年（今年の干支）
  const currentYear = new Date().getFullYear();
  const currentEra = toJapaneseEra(currentYear);
  const ryuunen = buildRyuunenPillar(currentYear, meishiki.dayStem);

  // 五行バランス解析
  const elementEntries = Object.entries(meishiki.elements) as [Element, number][];
  const sortedElements = [...elementEntries].sort((a, b) => b[1] - a[1]);
  const dominant = sortedElements[0];
  const weakest = sortedElements[sortedElements.length - 1];
  const total = elementEntries.reduce((s, [, n]) => s + n, 0);

  // 特殊星が命式のどこに出ているか
  const userBranches = new Set(
    [
      meishiki.yearBranch,
      meishiki.monthBranch,
      meishiki.dayBranch,
      meishiki.hourBranch,
    ].filter(Boolean),
  );
  const tenotsuHits = detailed.tenotsu.filter((b) => userBranches.has(b));
  const youjinHit = userBranches.has(detailed.youjin) ? detailed.youjin : null;
  const kuubouHits = detailed.kuubou.filter((b) => userBranches.has(b));

  const tsuhenseiInfo = TSUHENSEI_MEANINGS[ryuunen.tsuhensei];
  const juuniunInfo = JUUNIUN_MEANINGS[ryuunen.juuniun as keyof typeof JUUNIUN_MEANINGS];

  const nayinHint = NAYIN_HINTS[detailed.nayin] ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-purple-500/30" />
        <span className="text-purple-200 text-sm px-3">📖 鑑定書の読み方</span>
        <div className="flex-1 h-px bg-purple-500/30" />
      </div>
      <p className="text-purple-400 text-xs leading-relaxed px-1">
        上の鑑定書は伝統的な紙の命式表と同じレイアウトで作成されています。
        情報量が多いので、ここでは <span className="text-rose-300">ラベル①〜⑦</span>{" "}
        に分けて「どこに何が書かれているか」と「<span className="text-rose-300">あなたの場合はどう読めるか</span>」を並べて解説します。
      </p>

      {/* ① ヘッダー */}
      <GuideCard
        badge="①"
        title="ヘッダー：生年月日＋性別"
        preview={
          <div className="text-center w-full">
            <div className="text-[11px] text-stone-900 font-bold leading-tight px-1">
              現在 四柱 {year}年{month}月{day}日
              <br />
              {hour !== undefined ? `${hour}時 ` : ""}男命／女命
            </div>
          </div>
        }
        yourCase={
          <>
            <p>
              <b>{year}年{month}月{day}日</b>
              {hour !== undefined ? (
                <>
                  <b> {hour}時</b>生まれ、
                </>
              ) : (
                <>（時刻未入力）、</>
              )}
              {gender ? <><b>{gender}命</b>として算出しました。</> : <>性別未入力。</>}
            </p>
            <p className="text-purple-200/80">
              {hour !== undefined ? (
                <>時柱「{hourPillar?.stem}{hourPillar?.branch}」が確定し、命宮も算出可能な <b>最高精度モード</b>で鑑定されています。</>
              ) : (
                <>時刻が不明のため時柱と命宮は省略され、年・月・日の3柱ベースで読み解いています。時刻が分かれば晩年運や隠れた才能の精度が上がります。</>
              )}
              {gender ? (
                <>大運（10年サイクル）は{daiun?.isForward ? "順行" : "逆行"}で{daiun?.startAge}歳起算で進みます。</>
              ) : (
                <>性別が分かると大運の順逆が確定し、人生の季節図が表示されます。</>
              )}
            </p>
          </>
        }
      >
        <p>
          鑑定対象の<b>生年月日・時刻・性別</b>を示します。
          時刻と性別の両方が揃うと「時柱」「大運の順逆」「命宮」が確定し、鑑定精度が最大になります。
        </p>
      </GuideCard>

      {/* ② 流年 */}
      <GuideCard
        badge="②"
        title={`流年ラベル：${currentYear}年の運勢基準点`}
        preview={
          <div className="text-stone-900 text-xs font-semibold text-center leading-tight">
            <div>流年：{currentYear}</div>
            {currentEra.continuousHeiseiYear && (
              <div className="text-stone-600">（平成{currentEra.continuousHeiseiYear}）</div>
            )}
            <div className="mt-1 flex justify-center">
              <MiniPillar label="流年+" stem={ryuunen.stem} branch={ryuunen.branch} accent="rose" />
            </div>
          </div>
        }
        yourCase={
          <>
            <p>
              {currentYear}年の干支は<b className="text-rose-300">{ryuunen.stem}{ryuunen.branch}</b>。
              あなたの日主「<b>{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）</b>」から見ると、
              通変星は「<b>{ryuunen.tsuhensei}</b>」、十二運は「<b>{ryuunen.juuniun}</b>」の年にあたります。
            </p>
            {tsuhenseiInfo && (
              <p className="text-purple-200/80">
                <span className="text-amber-200">「{ryuunen.tsuhensei}」のテーマ：</span>
                {tsuhenseiInfo.description}
              </p>
            )}
            {juuniunInfo && (
              <p className="text-purple-200/80">
                <span className="text-amber-200">「{ryuunen.juuniun}」のエネルギー：</span>
                {juuniunInfo.description}
              </p>
            )}
          </>
        }
      >
        <p>
          「流年（りゅうねん）」は<b>その年に回ってくる干支</b>のこと。
          命式の日主と組み合わせることで、
          <span className="text-rose-300 font-semibold">その年のテーマ・注意点・追い風</span>
          が読み取れます。
        </p>
      </GuideCard>

      {/* ③ 五行円盤 */}
      <GuideCard
        badge="③"
        title="五行円盤：生まれ持った気のバランス"
        preview={
          <div className="w-full max-w-[220px]">
            <TraditionalGogyoWheel
              meishiki={meishiki}
              daiunStem={currentDaiun?.stem}
              referenceYear={currentYear}
              compact
              showCorners={false}
              showLegend={false}
            />
          </div>
        }
        yourCase={
          <>
            <p>
              集計結果：
              {sortedElements.map(([el, n], i) => (
                <span key={el}>
                  <b style={{ color: ELEMENT_COLORS[el] }}>{el}</b>
                  <span className="text-purple-300">{n}</span>
                  {i < sortedElements.length - 1 ? "・" : ""}
                </span>
              ))}
              （全{total}気）
            </p>
            <p className="text-purple-200/80">
              <span className="text-amber-200">最強は「{dominant[0]}」（{dominant[1]}個）：</span>
              {DOMINANT_ELEMENT_MEANING[dominant[0]]}
            </p>
            <p className="text-purple-200/80">
              <span className="text-amber-200">最弱は「{weakest[0]}」（{weakest[1]}個）：</span>
              {WEAKEST_ELEMENT_MEANING[weakest[0]]}
            </p>
            <p className="text-purple-300/80 text-[11px] leading-relaxed pt-1">
              円盤内の
              <span className="text-purple-100"> ● </span>は天干・地支の<b>本気</b>の数、
              <span className="text-purple-100"> △ </span>は地支内に隠れる<b>蔵干</b>の数。
              <span className="text-purple-100">＋</span>＝現在の大運、
              <span className="text-purple-100">⊕</span>＝今年の流年、
              <span className="text-blue-200">＊</span>＝月令（季節）の位置を示します。
            </p>
          </>
        }
      >
        <p>
          命式に現れる天干・地支を<b>木（上）・火（右上）・土（右下）・金（左下）・水（左上）</b>の5つの位置に集計して円盤で可視化。
          <span className="text-rose-300">●が多い＝その気が強い</span>、●が無い＝その気が不足。
          強い気＝得意な性質、弱い気＝補うべき方向です。
        </p>
      </GuideCard>

      {/* ④ 主命式表 */}
      <GuideCard
        badge="④"
        title="主命式表：年・月・日・時の四柱"
        preview={
          <div className="flex gap-0.5">
            {hourPillar && (
              <MiniPillar
                label="時"
                stem={hourPillar.stem}
                branch={hourPillar.branch}
                top={hourPillar.stemTsuhensei ?? ""}
                bottom={hourPillar.juuniun}
              />
            )}
            <MiniPillar
              label="日"
              stem={dayPillar.stem}
              branch={dayPillar.branch}
              top="日主"
              bottom={dayPillar.juuniun}
            />
            <MiniPillar
              label="月"
              stem={monthPillar.stem}
              branch={monthPillar.branch}
              top={monthPillar.stemTsuhensei ?? ""}
              bottom={monthPillar.juuniun}
            />
            <MiniPillar
              label="年"
              stem={yearPillar.stem}
              branch={yearPillar.branch}
              top={yearPillar.stemTsuhensei ?? ""}
              bottom={yearPillar.juuniun}
            />
          </div>
        }
        yourCase={
          <>
            <p>
              中央の<b className="text-rose-300">日柱「{dayPillar.stem}{dayPillar.branch}」</b>
              があなた自身。日主「{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）」を軸に他の柱との関係を読みます。
            </p>
            <ul className="space-y-1 text-[12px]">
              {[yearPillar, monthPillar, dayPillar, ...(hourPillar ? [hourPillar] : [])].map((p) => {
                const stage = PILLAR_STAGE[p.label];
                return (
                  <li key={p.label} className="flex gap-2">
                    <span className="shrink-0 text-amber-200 w-16">
                      {p.label}
                      <span className="block text-[10px] text-purple-400">{stage?.stage}</span>
                    </span>
                    <span>
                      <b style={{ color: ELEMENT_COLORS[STEM_ELEMENTS[p.stem]] }}>{p.stem}</b>
                      <b style={{ color: ELEMENT_COLORS[BRANCH_ELEMENTS[p.branch]] }}>{p.branch}</b>
                      <span className="text-purple-300">
                        {" "}
                        ／ 通変{p.stemTsuhensei ?? "日主"} ／ 十二運{p.juuniun}
                      </span>
                      <span className="block text-purple-400 text-[11px]">
                        → {stage?.area}。
                        {p.label !== "日柱" && p.stemTsuhensei
                          ? `「${p.stemTsuhensei}」(${TSUHENSEI_MEANINGS[p.stemTsuhensei]?.label}) の要素が色濃い。`
                          : "あなた自身の本質。"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        }
      >
        <p>
          鑑定書の心臓部。各柱は上から
          <span className="text-rose-300 font-semibold">
            「天干 → 通変星 → 地支 → 十二運 → 蔵干通変」
          </span>
          の順に積み上がっており、それぞれが<b>人生の時期</b>と<b>担当領域</b>を表します。
        </p>
      </GuideCard>

      {/* ⑤ 大運+ / 流年+ */}
      <GuideCard
        badge="⑤"
        title="大運+／流年+：「今」の運勢柱"
        preview={
          <div className="flex gap-0.5">
            <MiniPillar label="流年+" stem={ryuunen.stem} branch={ryuunen.branch} accent="rose" />
            {currentDaiun && (
              <MiniPillar label="大運+" stem={currentDaiun.stem} branch={currentDaiun.branch} accent="indigo" />
            )}
          </div>
        }
        yourCase={
          <>
            <p>
              あなたは現在 <b>{approxAge}歳</b>。
              {currentDaiun ? (
                <>
                  第{currentIndex + 1}大運「<b className="text-rose-300">{currentDaiun.stem}{currentDaiun.branch}</b>
                  （{currentDaiun.stemKeyword}・{currentDaiun.branchKeyword}）」の中にいます。
                </>
              ) : (
                <>性別を入力すると現在の大運（10年サイクル）が表示されます。</>
              )}
            </p>
            <p className="text-purple-200/80">
              今年 {currentYear} 年の流年は「<b>{ryuunen.stem}{ryuunen.branch}</b>」。
              通変星「{ryuunen.tsuhensei}」・十二運「{ryuunen.juuniun}」のエネルギーが巡っています。
              {currentDaiun
                ? `大運「${currentDaiun.stem}${currentDaiun.branch}」と流年「${ryuunen.stem}${ryuunen.branch}」を掛け合わせた年になります。`
                : ""}
            </p>
          </>
        }
      >
        <p>
          命式本体の左側にある2本の柱。
          <span className="text-rose-300 font-semibold">大運+</span>は<b>今の10年サイクル</b>、
          <span className="text-rose-300 font-semibold">流年+</span>は<b>今年1年のサイクル</b>。
          この2本と生まれ持った四柱がどう絡むかで、直近の運勢が決まります。
        </p>
      </GuideCard>

      {/* ⑥ 大運一覧 */}
      {daiun && (
        <GuideCard
          badge="⑥"
          title="大運一覧表：人生の10年サイクル"
          preview={
            <div className="grid grid-cols-4 gap-0 w-full max-w-[200px]">
              {daiun.periods.slice(0, 4).map((p) => {
                const isCurrent = currentDaiun?.startAge === p.startAge;
                return (
                  <div
                    key={p.startAge}
                    className={`border border-stone-400 text-center ${
                      isCurrent ? "ring-2 ring-indigo-500 bg-indigo-50" : "bg-white"
                    }`}
                  >
                    <div className="text-[8px] bg-stone-100 border-b border-stone-300">
                      {p.startAge}〜{p.endAge}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: ELEMENT_COLORS[STEM_ELEMENTS[p.stem]], fontFamily: "serif" }}
                    >
                      {p.stem}
                    </div>
                    <div
                      className="text-sm font-bold border-t border-stone-200"
                      style={{ color: ELEMENT_COLORS[BRANCH_ELEMENTS[p.branch]], fontFamily: "serif" }}
                    >
                      {p.branch}
                    </div>
                  </div>
                );
              })}
            </div>
          }
          yourCase={
            <>
              <p>
                あなたは「<b>{daiun.isForward ? "順行" : "逆行"}／{daiun.startAge}歳起算</b>」。
                {daiun.isForward
                  ? "若い頃は王道の学び、中〜後半にかけてエネルギーが広がる進み方です。"
                  : "早くから大人びた視点を持ち、人生の前半〜中盤に本質が際立つ進み方です。"}
              </p>
              {currentDaiun && (
                <p className="text-purple-200/80">
                  現在は<b className="text-rose-300">第{currentIndex + 1}大運「{currentDaiun.stem}{currentDaiun.branch}」</b>
                  （{currentDaiun.startAge}〜{currentDaiun.endAge}歳／{currentDaiun.stemKeyword}・{currentDaiun.branchKeyword}）。
                  {nextDaiun ? (
                    <>
                      {" "}次の切替は<b>{nextDaiun.startAge}歳</b>で、
                      <b className="text-amber-200">{nextDaiun.stem}{nextDaiun.branch}</b>
                      （{nextDaiun.stemKeyword}・{nextDaiun.branchKeyword}）へ。ライフステージが切り替わるタイミングです。
                    </>
                  ) : (
                    <> 大運の後半期にあり、これまでの積み重ねが形になる時期です。</>
                  )}
                </p>
              )}
            </>
          }
        >
          <p>
            横一列に並ぶのは
            <span className="text-rose-300 font-semibold">10年ごとの「人生の季節」</span>を表した大運の一覧。
            <span className="bg-indigo-500/30 px-1 rounded">藍の枠</span>が現在の大運です。
            男女・年干の陰陽で進む方向（順行／逆行）が決まり、スタート年齢は節入りまでの日数で算出されます。
          </p>
        </GuideCard>
      )}

      {/* ⑦ 特殊星 */}
      <GuideCard
        badge="⑦"
        title="特殊星：天乙・羊刃・空亡・納音・月令"
        preview={
          <div className="text-[11px] bg-white border border-stone-400 p-2 space-y-0.5 w-full text-stone-900">
            <div>天乙：{detailed.tenotsu.join("")}</div>
            <div>羊刃：{detailed.youjin}</div>
            <div>空亡：{detailed.kuubou.join("")}</div>
            <div>納音：{detailed.nayin}</div>
            <div>干支番号：【{getKanshiNumber(meishiki.dayStem, meishiki.dayBranch)}】</div>
          </div>
        }
        yourCase={
          <ul className="space-y-1.5 text-[12px]">
            <li>
              <b className="text-amber-300">天乙貴人（{detailed.tenotsu.join("・")}）：</b>
              {tenotsuHits.length > 0 ? (
                <>
                  命式の地支 <b>{tenotsuHits.join("・")}</b> に該当しています。
                  困難の時に<b>助け手や貴人が現れやすい</b>、最大の守りの星が命式内に活きています。
                </>
              ) : (
                <>命式の地支には直接出ていませんが、流年・大運で巡ると助けを得やすい時期になります。</>
              )}
            </li>
            <li>
              <b className="text-red-300">羊刃（{detailed.youjin}）：</b>
              {youjinHit ? (
                <>
                  命式の地支 <b>{youjinHit}</b> に該当。
                  <b>強い決断力・瞬発力・行動力</b>を秘める一方、暴走しやすい面もあるので、感情より先に動かない工夫が鍵。
                </>
              ) : (
                <>命式の地支には現れていません。羊刃の激しさよりも穏やかな進み方が持ち味です。</>
              )}
            </li>
            <li>
              <b className="text-slate-300">空亡（{detailed.kuubou.join("・")}）：</b>
              {kuubouHits.length > 0 ? (
                <>
                  命式の地支 <b>{kuubouHits.join("・")}</b> が空亡にかかっています。該当する柱の担当領域（仕事／家庭など）では <b>縁が薄く感じやすい</b>反面、内省・学び・精神性を深める修行期となります。
                </>
              ) : (
                <>命式の地支は空亡から外れています。空亡の影響は流年・大運で巡る時のみ意識すればOK。</>
              )}
            </li>
            <li>
              <b className="text-emerald-300">納音「{detailed.nayin}」：</b>
              {nayinHint}
            </li>
            <li>
              <b className="text-indigo-300">月令（{detailed.getsurei.label}）：</b>
              {GETSUREI_DESCRIPTIONS[detailed.getsurei.state]}
            </li>
          </ul>
        }
      >
        <ul className="list-disc list-inside space-y-0.5 text-[12px]">
          <li>
            <b className="text-amber-300">天乙貴人</b>：最大の吉星。危機に助け手が現れる支。
          </li>
          <li>
            <b className="text-red-300">羊刃</b>：決断力と衝動の刃。強すぎると暴走。
          </li>
          <li>
            <b className="text-slate-200">空亡（天中殺）</b>：縁が薄い時期。内省・修行の星。
          </li>
          <li>
            <b className="text-emerald-300">納音</b>：日柱六十干支の象徴名。本質を詩的に表す。
          </li>
          <li>
            <b className="text-indigo-300">月令</b>：生まれ月から見た日主の強さ（身旺／身弱）。
          </li>
        </ul>
      </GuideCard>
    </div>
  );
}

export default TraditionalChartGuide;
