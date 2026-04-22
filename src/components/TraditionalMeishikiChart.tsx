"use client";

import {
  type Meishiki,
  type DetailedChart,
  type DaiunResult,
  type PillarDetail,
  type RyuunenPillar,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_COLORS,
  getTentoku,
  getGettoku,
  getKanshiNumber,
  getMeigu,
  toJapaneseEra,
  buildRyuunenPillar,
  toRadarPoints,
  ELEMENT_STROKE,
} from "@/lib/shichusuimei";

type Gender = "男" | "女";

interface Props {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  gender?: Gender;
  meishiki: Meishiki;
  detailed: DetailedChart;
  daiun: DaiunResult | null;
  approxAge: number;
}

/** 一つの柱カラム（天干／通変／地支／十二運／蔵干通変） */
function PillarColumn({
  header,
  stem,
  branch,
  tsuhensei,
  juuniun,
  hiddenStems,
  highlighted,
  dim,
}: {
  header: string;
  stem: string;
  branch: string;
  tsuhensei: string;
  juuniun: string;
  hiddenStems: { stem: string; tsuhensei: string }[];
  highlighted?: boolean;
  dim?: boolean;
}) {
  const stemEl = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchEl = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];
  return (
    <div
      className={`flex flex-col items-stretch ${dim ? "opacity-70" : ""} ${
        highlighted ? "ring-2 ring-rose-500 rounded-sm" : ""
      }`}
    >
      <div className="text-center text-[10px] bg-stone-200 text-stone-700 border border-stone-400 py-0.5 tracking-widest">
        {header}
      </div>
      <div
        className="text-center font-bold text-xl border-x border-b border-stone-400 py-1"
        style={{ color: stemEl ? ELEMENT_COLORS[stemEl] : undefined, fontFamily: "serif" }}
      >
        {stem}
      </div>
      <div className="text-center text-[10px] border-x border-b border-stone-400 py-0.5 bg-stone-50">
        {tsuhensei || "—"}
      </div>
      <div
        className="text-center font-bold text-xl border-x border-b border-stone-400 py-1"
        style={{ color: branchEl ? ELEMENT_COLORS[branchEl] : undefined, fontFamily: "serif" }}
      >
        {branch}
      </div>
      <div className="text-center text-[10px] border-x border-b border-stone-400 py-0.5 bg-stone-50">
        {juuniun}
      </div>
      <div className="text-center text-[10px] border-x border-b border-stone-400 py-0.5 leading-tight bg-white">
        {hiddenStems.map((h) => (
          <div key={h.stem}>{h.tsuhensei}</div>
        ))}
      </div>
    </div>
  );
}

/** 五行バランスの五角形レーダー */
function GogyoRadar({ meishiki }: { meishiki: Meishiki }) {
  const points = toRadarPoints(meishiki.elements);
  const max = Math.max(...points.map((p) => p.count), 1);

  const cx = 110, cy = 110, rMax = 75;

  const toXY = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const polygonPath = points
    .map((p) => toXY(p.angleDeg, (p.count / max) * rMax))
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(" ") + " Z";

  return (
    <svg viewBox="0 0 220 220" className="w-full h-auto">
      {/* ガイド五角形 */}
      {[0.33, 0.66, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={points
            .map((p) => {
              const { x, y } = toXY(p.angleDeg, rMax * ratio);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={0.6}
        />
      ))}
      {/* 軸 */}
      {points.map((p) => {
        const { x, y } = toXY(p.angleDeg, rMax);
        return (
          <line
            key={p.element}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#cbd5e1"
            strokeWidth={0.6}
          />
        );
      })}
      {/* 実データ */}
      <path d={polygonPath} fill="rgba(99,102,241,0.18)" stroke="#6366f1" strokeWidth={1.5} />
      {/* 点と数値 */}
      {points.map((p) => {
        const radius = (p.count / max) * rMax;
        const { x, y } = toXY(p.angleDeg, radius);
        return (
          <circle key={p.element} cx={x} cy={y} r={3} fill={ELEMENT_STROKE[p.element]} />
        );
      })}
      {/* ラベル（五行文字） */}
      {points.map((p) => {
        const { x, y } = toXY(p.angleDeg, rMax + 18);
        return (
          <g key={`label-${p.element}`}>
            <text
              x={x}
              y={y + 4}
              fontSize="14"
              textAnchor="middle"
              fontFamily="serif"
              fontWeight="bold"
              fill={ELEMENT_STROKE[p.element]}
            >
              {p.label}
            </text>
            <text
              x={x}
              y={y + 17}
              fontSize="9"
              textAnchor="middle"
              fill="#475569"
            >
              {p.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TraditionalMeishikiChart({
  year, month, day, hour, minute, gender,
  meishiki, detailed, daiun, approxAge,
}: Props) {
  const era = toJapaneseEra(year);
  const currentYear = new Date().getFullYear();
  const currentEra = toJapaneseEra(currentYear);
  const ryuunen: RyuunenPillar = buildRyuunenPillar(currentYear, meishiki.dayStem);

  // 現在の大運（10年単位）を1柱として表示
  const currentDaiun = daiun
    ? daiun.periods.find((p) => p.startAge <= approxAge && approxAge <= p.endAge) ?? null
    : null;

  const hhmm =
    hour !== undefined
      ? `${String(hour).padStart(2, "0")}時${String(minute ?? 0).padStart(2, "0")}分`
      : "時刻不明";

  // 現在の大運柱を PillarColumn 形式に変換
  const daiunPillar = currentDaiun
    ? {
        header: "大運+",
        stem: currentDaiun.stem,
        branch: currentDaiun.branch,
        tsuhensei: "",
        juuniun: "",
        hiddenStems: [] as { stem: string; tsuhensei: string }[],
      }
    : null;

  // 命宮（時柱がある場合のみ）
  const meigu =
    meishiki.hourBranch
      ? getMeigu(meishiki.monthBranch, meishiki.hourBranch, meishiki.yearStem, meishiki.dayStem)
      : null;

  // 特殊星
  const tentoku = getTentoku(meishiki.monthBranch);
  const gettoku = getGettoku(meishiki.monthBranch);

  // 通変星（十二運はすでに detailed から取れる）
  const pillarsOrdered: PillarDetail[] = [...detailed.pillars]; // 既存は 時日月年 の順
  // 画像と合わせるため、順序は右から「年月日時」→ ただし左詰めで「時日月年」の並び（既存通り）
  // レーダーの下の表：流年+ | 大運+ | 時 | 日 | 月 | 年
  const mainColumns = [
    {
      header: "流年+",
      stem: ryuunen.stem,
      branch: ryuunen.branch,
      tsuhensei: ryuunen.tsuhensei,
      juuniun: ryuunen.juuniun,
      hiddenStems: ryuunen.hiddenStems,
      highlighted: true,
    },
    daiunPillar
      ? {
          ...daiunPillar,
          tsuhensei: "",
          juuniun: "",
          hiddenStems: [],
          highlighted: true as const,
        }
      : null,
    ...pillarsOrdered.map((p, idx) => ({
      header: p.label.replace("柱", ""),
      stem: p.stem,
      branch: p.branch,
      tsuhensei: p.stemTsuhensei ?? "日主",
      juuniun: p.juuniun,
      hiddenStems: p.hiddenStems,
      highlighted: false,
      dim: false,
      // 日柱だけ強調
      isDay: p.label === "日柱",
      _idx: idx,
    })),
  ].filter(Boolean) as Array<{
    header: string;
    stem: string;
    branch: string;
    tsuhensei: string;
    juuniun: string;
    hiddenStems: { stem: string; tsuhensei: string }[];
    highlighted?: boolean;
    dim?: boolean;
  }>;

  return (
    <div className="bg-amber-50 text-stone-900 rounded-lg shadow-2xl border-2 border-stone-300 overflow-hidden">
      {/* ────────── ヘッダー ────────── */}
      <div className="border-b-2 border-stone-800 px-4 py-3 bg-stone-100">
        <h2 className="text-base sm:text-lg font-bold tracking-wider" style={{ fontFamily: "serif" }}>
          現在　四柱　{year}年{era.continuousHeiseiYear ? `（平成${era.continuousHeiseiYear}）` : ""}
          {month}月{day}日 {hhmm} {gender ? `${gender}命` : ""}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* 流年ラベル */}
        <div className="text-sm">
          流年：{currentYear}
          {currentEra.continuousHeiseiYear ? `（平成${currentEra.continuousHeiseiYear}）` : ""}
        </div>

        {/* ────────── 五行レーダー + 主命式表 ────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 flex flex-col">
            <div className="bg-white border border-stone-400 rounded-sm p-2">
              <GogyoRadar meishiki={meishiki} />
              <div className="text-[10px] text-stone-600 mt-1 space-y-0.5 leading-tight">
                <div>＋→大運の五行　　⊕→流年の五行</div>
                <div>＊→月令（季節）</div>
                <div className="flex flex-wrap gap-x-3 pt-1 text-[10px]">
                  {Object.entries(meishiki.elements).map(([el, n]) => (
                    <span key={el}>
                      <span
                        className="font-bold"
                        style={{ color: ELEMENT_STROKE[el as keyof typeof ELEMENT_STROKE] }}
                      >
                        {el}
                      </span>
                      ：{n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-stone-600 mt-1 px-1">
              ← 五行の多寡を五芒星で可視化
            </div>
          </div>

          {/* メイン命式表 */}
          <div className="md:col-span-3">
            <div className="flex items-start gap-3">
              {/* 左カラム：「体用」等のラベル */}
              <div className="flex flex-col text-[10px] text-stone-700 gap-2 pt-6 leading-tight">
                <div className="writing-vertical">用体</div>
                <div className="writing-vertical">従化</div>
              </div>

              <div
                className={`flex-1 grid gap-0 ${
                  daiunPillar ? "grid-cols-6" : "grid-cols-5"
                }`}
              >
                {mainColumns.map((col, i) => (
                  <PillarColumn key={i} {...col} />
                ))}
              </div>

              {/* 右カラム：「逆行N年運」「N歳」 */}
              <div className="flex flex-col items-center text-[10px] text-stone-700 pt-6 leading-tight gap-1">
                <div className="writing-vertical">
                  {daiun ? `${daiun.isForward ? "順行" : "逆行"}${daiun.startAge}年運` : ""}
                </div>
                <div className="pt-2 text-xs font-bold">{approxAge}歳</div>
              </div>
            </div>
          </div>
        </div>

        {/* ────────── 大運長期表（8本） ────────── */}
        {daiun && (
          <div className="border border-stone-400 bg-white">
            <div className="text-[10px] text-stone-600 bg-stone-100 border-b border-stone-400 px-2 py-0.5">
              大運一覧（10年周期）　{daiun.isForward ? "順行" : "逆行"}／{daiun.startAge}歳起算
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-0">
              {daiun.periods.map((p, idx) => {
                const isCurrent = currentDaiun?.startAge === p.startAge;
                const stemEl = STEM_ELEMENTS[p.stem];
                const branchEl = BRANCH_ELEMENTS[p.branch];
                return (
                  <div
                    key={idx}
                    className={`border-r border-b border-stone-400 text-center ${
                      isCurrent ? "bg-rose-50 ring-2 ring-rose-500 relative z-10" : ""
                    }`}
                  >
                    <div className="text-[10px] text-stone-600 border-b border-stone-300 py-0.5">
                      {String(p.startAge).padStart(2, "0")}〜{String(p.endAge).padStart(2, "0")}
                    </div>
                    <div
                      className="font-bold py-0.5"
                      style={{ color: ELEMENT_COLORS[stemEl], fontFamily: "serif" }}
                    >
                      {p.stem}
                    </div>
                    <div
                      className="font-bold py-0.5 border-t border-stone-200"
                      style={{ color: ELEMENT_COLORS[branchEl], fontFamily: "serif" }}
                    >
                      {p.branch}
                    </div>
                    <div className="text-[9px] text-stone-600 border-t border-stone-200 py-0.5">
                      {p.stemKeyword}
                    </div>
                    <div className="text-[9px] text-stone-600 border-t border-stone-200 py-0.5">
                      {p.branchKeyword}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────── サイドバー（特殊星 / 干支情報） ────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div className="border border-stone-400 bg-white p-2 space-y-0.5 leading-snug">
            <div>
              <span className="font-bold">天徳：</span>
              {tentoku}
            </div>
            <div>
              <span className="font-bold">月徳：</span>
              {gettoku}
            </div>
            <div>
              <span className="font-bold">天乙：</span>
              {detailed.tenotsu.join("")}
            </div>
            <div>
              <span className="font-bold">羊刃：</span>
              {detailed.youjin}
            </div>
            <div>
              <span className="font-bold">空亡：</span>
              {detailed.kuubou.join("")}
            </div>
          </div>

          <div className="border border-stone-400 bg-white p-2 space-y-0.5 leading-snug">
            <div>
              <span className="font-bold">干支番号：</span>
              【{getKanshiNumber(meishiki.dayStem, meishiki.dayBranch)}】
            </div>
            <div>
              <span className="font-bold">納音：</span>
              {detailed.nayin}
            </div>
            {meigu && (
              <div>
                <span className="font-bold">命宮：</span>
                {meigu.stem}
                {meigu.branch}
                <span className="ml-1 text-stone-600">
                  {meigu.tsuhensei}　{meigu.juuniun}
                </span>
              </div>
            )}
            <div>
              <span className="font-bold">月令：</span>
              {detailed.getsurei.state}令（{detailed.getsurei.label}）
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TraditionalMeishikiChart;
