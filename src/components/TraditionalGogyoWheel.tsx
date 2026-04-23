"use client";

import type React from "react";
import {
  type Meishiki,
  type Element,
  type Stem,
  type Branch,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  HIDDEN_STEMS,
} from "@/lib/shichusuimei";

/* =========================================================
 * 伝統命式書風の円形五行図
 * 画像参照: Image #3（手書き風の五行盤）
 * ========================================================= */

export interface TraditionalGogyoWheelProps {
  meishiki: Meishiki;
  /** 大運の天干（+ マーカー位置） */
  daiunStem?: Stem;
  /** 基準年（流年／平昭西の年表示に使用、省略時は今年） */
  referenceYear?: number;
  /** コンパクト表示（相性ページなど） */
  compact?: boolean;
  /** コーナーの平昭西ブロックを表示するか */
  showCorners?: boolean;
  /** 凡例を表示するか */
  showLegend?: boolean;
  /** ヘッダー文字列（上部に表示、指定時のみ） */
  headerText?: string;
  /** 流年ラベル（例: "2025(平成 37)"） */
  ryuunenLabel?: string;
}

/* ---------------------------------------------------------
 * 定数
 * --------------------------------------------------------- */

// 五行の位置（ペンタゴン：時計回りに 木→火→土→金→水）
// 書風に合わせ、木=12時、火=2時、土=5時、金=8時、水=10時
const ELEMENT_ANGLES: Record<Element, number> = {
  "木": -90,   // 12 o'clock
  "火": -18,   // ~2 o'clock
  "土": 54,    // ~5 o'clock
  "金": 126,   // ~7-8 o'clock
  "水": 198,   // ~10-11 o'clock
};

const ELEMENT_COLOR: Record<Element, string> = {
  "木": "#15803d",
  "火": "#b91c1c",
  "土": "#a16207",
  "金": "#6b7280",
  "水": "#1d4ed8",
};

// 要素 → その要素の天干（2種）
const ELEMENT_STEMS: Record<Element, [Stem, Stem]> = {
  "木": ["甲", "乙"],
  "火": ["丙", "丁"],
  "土": ["戊", "己"],
  "金": ["庚", "辛"],
  "水": ["壬", "癸"],
};

// 天干 index: 甲=0, 乙=1, ..., 癸=9
const STEM_INDEX: Record<Stem, number> = {
  "甲": 0, "乙": 1, "丙": 2, "丁": 3, "戊": 4,
  "己": 5, "庚": 6, "辛": 7, "壬": 8, "癸": 9,
};

/* ---------------------------------------------------------
 * ヘルパー
 * --------------------------------------------------------- */

function toXY(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** 指定要素の天干を持つ年のうち、refYear 以下で最も近いペアを返す */
function findElementYearPair(element: Element, refYear: number): [number, number] {
  // year → stem index: (year - 4) mod 10
  // want: (year - 4) % 10 == STEM_INDEX[firstStem]
  const [stem1] = ELEMENT_STEMS[element];
  const targetIdx = STEM_INDEX[stem1];
  const diff = ((refYear - 4 - targetIdx) % 10 + 10) % 10;
  const y1 = refYear - diff;
  return [y1, y1 + 1];
}

/** 年を 平・昭・西 の1桁表示に変換（chart内の通例） */
function yearToEraDigits(year: number): { hei: number; sho: number; sei: number } {
  // 平成連続カウント（平成1 = 1989、それ以降も継続でカウント）
  const hei = ((year - 1988) % 10 + 10) % 10;
  // 昭和連続カウント（昭和1 = 1926）
  const sho = ((year - 1925) % 10 + 10) % 10;
  // 西暦下1桁
  const sei = ((year % 10) + 10) % 10;
  return { hei, sho, sei };
}

/** 蔵干（余気・中気など）の五行カウント: 主気を除く */
function countHiddenElements(meishiki: Meishiki): Record<Element, number> {
  const counts: Record<Element, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  const branches: (Branch | null)[] = [
    meishiki.yearBranch,
    meishiki.monthBranch,
    meishiki.dayBranch,
    meishiki.hourBranch,
  ];
  for (const b of branches) {
    if (!b) continue;
    const hidden = HIDDEN_STEMS[b];
    // 主気（最初の1要素）は BRANCH_ELEMENTS で既にカウント済みなのでスキップ
    hidden.slice(1).forEach((stem) => {
      counts[STEM_ELEMENTS[stem]]++;
    });
  }
  return counts;
}

/* ---------------------------------------------------------
 * メインコンポーネント
 * --------------------------------------------------------- */

export function TraditionalGogyoWheel({
  meishiki,
  daiunStem,
  referenceYear,
  compact = false,
  showCorners = true,
  showLegend = true,
  headerText,
  ryuunenLabel,
}: TraditionalGogyoWheelProps) {
  const refYear = referenceYear ?? new Date().getFullYear();

  // 各要素の本気・蔵干カウント
  const mainCounts = meishiki.elements;
  const hiddenCounts = countHiddenElements(meishiki);

  // 特殊マーカーの位置を決める要素
  const daiunElement: Element | undefined = daiunStem ? STEM_ELEMENTS[daiunStem] : undefined;
  // 流年：基準年の天干の五行
  const ryuunenStemIdx = ((refYear - 4) % 10 + 10) % 10;
  const ryuunenStem = (Object.keys(STEM_INDEX) as Stem[]).find(
    (s) => STEM_INDEX[s] === ryuunenStemIdx,
  )!;
  const ryuunenElement: Element = STEM_ELEMENTS[ryuunenStem];
  // 月令：生まれ月の地支の五行
  const getsureiElement: Element = BRANCH_ELEMENTS[meishiki.monthBranch];

  // SVG dimension
  const vb = compact ? 380 : 560;
  const cx = vb / 2;
  const cy = compact ? 180 : 260;
  const rMain = compact ? 90 : 120;
  const rLabelRing = compact ? 58 : 78;     // 要素ラベルの配置半径
  const rMarkerRing = compact ? 112 : 150;  // +/⊕ の配置半径（円の外側）

  // 各要素ラベル中心位置
  const elementLabelPos = (el: Element) => toXY(cx, cy, ELEMENT_ANGLES[el], rLabelRing);

  /* ----------------------------------
   * 本気・蔵干ドット配置
   * ラベル周辺に ● / △ を散らす
   * ---------------------------------- */
  function renderDots(el: Element): React.ReactElement[] {
    const main = mainCounts[el];
    const hidden = hiddenCounts[el];
    const angle = ELEMENT_ANGLES[el];
    const labelPos = elementLabelPos(el);
    // ラベル上方向に ● を並べ、下方向に △ を並べる
    // 半径方向の内側／外側で 2 列にするとにぎやか
    const out: React.ReactElement[] = [];

    // ●：ラベルの円中心寄りに 2 列で配置
    const dotR = compact ? 3 : 3.5;
    const sideAngle = angle + 90; // 接線方向
    const rad = (sideAngle * Math.PI) / 180;
    const sx = Math.cos(rad);
    const sy = Math.sin(rad);

    for (let i = 0; i < main; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const offsetSide = (col - 1) * (compact ? 7 : 9);
      const offsetRadial = -row * (compact ? 9 : 11) - (compact ? 12 : 14);
      const rPos = rLabelRing + offsetRadial;
      const basePos = toXY(cx, cy, angle, rPos);
      const x = basePos.x + offsetSide * sx;
      const y = basePos.y + offsetSide * sy;
      out.push(
        <circle key={`m-${el}-${i}`} cx={x} cy={y} r={dotR} fill="#111" />,
      );
    }

    // △：ラベル外側方向に配置
    const triSize = compact ? 4 : 4.5;
    for (let i = 0; i < hidden; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const offsetSide = (col - 1) * (compact ? 7 : 9);
      const offsetRadial = row * (compact ? 9 : 11) + (compact ? 14 : 18);
      const rPos = rLabelRing + offsetRadial;
      const basePos = toXY(cx, cy, angle, rPos);
      const x = basePos.x + offsetSide * sx;
      const y = basePos.y + offsetSide * sy;
      out.push(
        <polygon
          key={`h-${el}-${i}`}
          points={`${x},${y - triSize} ${x - triSize},${y + triSize * 0.9} ${x + triSize},${y + triSize * 0.9}`}
          fill="none"
          stroke="#333"
          strokeWidth={1.2}
        />,
      );
    }

    // 無印時もラベル残しやすい
    void labelPos;
    return out;
  }

  /* ----------------------------------
   * 要素ラベル
   * ---------------------------------- */
  function renderLabels(): React.ReactElement[] {
    return (Object.keys(ELEMENT_ANGLES) as Element[]).map((el) => {
      const { x, y } = elementLabelPos(el);
      return (
        <text
          key={`lab-${el}`}
          x={x}
          y={y + (compact ? 6 : 8)}
          textAnchor="middle"
          fontSize={compact ? 20 : 26}
          fontFamily="serif"
          fontWeight={700}
          fill={ELEMENT_COLOR[el]}
        >
          {el}
        </text>
      );
    });
  }

  /* ----------------------------------
   * 特殊マーカー +, ⊕, *
   * ---------------------------------- */
  function renderMarkers(): React.ReactElement[] {
    const out: React.ReactElement[] = [];

    if (daiunElement) {
      const p = toXY(cx, cy, ELEMENT_ANGLES[daiunElement] - 10, rMarkerRing - (compact ? 20 : 30));
      out.push(
        <text
          key="m-daiun"
          x={p.x}
          y={p.y + 5}
          textAnchor="middle"
          fontSize={compact ? 14 : 18}
          fontFamily="serif"
          fontWeight={700}
          fill="#111"
        >
          +
        </text>,
      );
    }

    // ⊕ 流年
    const rp = toXY(cx, cy, ELEMENT_ANGLES[ryuunenElement] + 10, rMarkerRing - (compact ? 20 : 30));
    out.push(
      <text
        key="m-ryuunen"
        x={rp.x}
        y={rp.y + 4}
        textAnchor="middle"
        fontSize={compact ? 13 : 16}
        fontFamily="serif"
        fill="#111"
      >
        ⊕
      </text>,
    );

    // * 月令
    const gp = toXY(cx, cy, ELEMENT_ANGLES[getsureiElement] + 20, rLabelRing - 6);
    out.push(
      <text
        key="m-getsurei"
        x={gp.x}
        y={gp.y + 5}
        textAnchor="middle"
        fontSize={compact ? 14 : 18}
        fontFamily="serif"
        fontWeight={700}
        fill="#1d4ed8"
      >
        *
      </text>,
    );

    return out;
  }

  /* ----------------------------------
   * 斜め分割線（陰陽の参考線、装飾）
   * ---------------------------------- */
  function renderDivider(): React.ReactElement {
    // 水(上左)と金(下左)の中間から土(下右)方向へ
    const startAngle = 162;  // 水〜金の間寄り
    const endAngle = 30;
    const start = toXY(cx, cy, startAngle, rMain);
    const end = toXY(cx, cy, endAngle, rMain);
    // 円の中心を経由してから水の下あたりへ分岐
    const midBreak = toXY(cx, cy, 180, rMain * 0.2);
    return (
      <path
        d={`M ${start.x} ${start.y} L ${midBreak.x} ${midBreak.y} L ${cx} ${cy + rMain * 0.25} L ${end.x} ${end.y}`}
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
    );
  }

  /* ----------------------------------
   * 4 コーナー：平昭西 × 2年
   * ---------------------------------- */
  interface CornerSpec {
    el: Element;
    // ラベル順（上→下にどの順で era を並べるか）
    labelOrder: [string, string, string];
    // SVG 上の配置
    anchorX: number;
    anchorY: number;
    textAnchor: "start" | "middle" | "end";
  }

  function renderCorners(): React.ReactElement[] {
    if (!showCorners) return [];
    const specs: CornerSpec[] = [
      // 上：木（中央上、別枠で表示するので ここでは割愛）
      // 左上：水
      { el: "水", labelOrder: ["平", "昭", "西"], anchorX: compact ? 40 : 50, anchorY: compact ? 58 : 80, textAnchor: "start" },
      // 右上：火（ラベル順は 西昭平）
      { el: "火", labelOrder: ["西", "昭", "平"], anchorX: vb - (compact ? 40 : 50), anchorY: compact ? 58 : 80, textAnchor: "end" },
      // 左下：金
      { el: "金", labelOrder: ["平", "昭", "西"], anchorX: compact ? 40 : 50, anchorY: cy + rMain + (compact ? 20 : 30), textAnchor: "start" },
      // 右下：土（ラベル順は 西昭平）
      { el: "土", labelOrder: ["西", "昭", "平"], anchorX: vb - (compact ? 40 : 50), anchorY: cy + rMain + (compact ? 20 : 30), textAnchor: "end" },
    ];

    const nodes: React.ReactElement[] = [];
    for (const sp of specs) {
      const [y1, y2] = findElementYearPair(sp.el, refYear);
      const d1 = yearToEraDigits(y1);
      const d2 = yearToEraDigits(y2);
      // 3 行（ラベル順に対応した数字）
      const rows = sp.labelOrder.map((lab) => {
        const k = lab === "平" ? "hei" : lab === "昭" ? "sho" : "sei";
        return { label: lab, left: (d1 as Record<string, number>)[k], right: (d2 as Record<string, number>)[k] };
      });

      const rowHeight = compact ? 11 : 14;
      const labelWidth = compact ? 12 : 16;
      const numGap = compact ? 18 : 26;

      nodes.push(
        <g key={`corner-${sp.el}`} transform={`translate(${sp.anchorX}, ${sp.anchorY})`}>
          {/* 縦のラベル列 */}
          {rows.map((r, i) => (
            <text
              key={`lab-${i}`}
              x={sp.textAnchor === "end" ? labelWidth : 0}
              y={i * rowHeight}
              textAnchor={sp.textAnchor === "end" ? "end" : "start"}
              fontSize={compact ? 9 : 11}
              fontFamily="serif"
              fill="#333"
            >
              {r.label}
            </text>
          ))}
          {/* 左（古い年）／右（新しい年）の数字 */}
          {rows.map((r, i) => {
            const lx = sp.textAnchor === "end" ? -numGap - labelWidth : labelWidth;
            const rx = sp.textAnchor === "end" ? -labelWidth - 4 : labelWidth + numGap;
            return (
              <g key={`nums-${i}`}>
                <text
                  x={lx}
                  y={i * rowHeight}
                  textAnchor="middle"
                  fontSize={compact ? 9 : 11}
                  fontFamily="serif"
                  fill="#333"
                >
                  {r.left}
                </text>
                <text
                  x={rx}
                  y={i * rowHeight}
                  textAnchor="middle"
                  fontSize={compact ? 9 : 11}
                  fontFamily="serif"
                  fill="#333"
                >
                  {r.right}
                </text>
              </g>
            );
          })}
          {/* 中央の点（・・・） */}
          {[0, 1, 2].map((i) => (
            <circle
              key={`dot-${i}`}
              cx={sp.textAnchor === "end" ? -labelWidth - 12 - numGap / 2 : labelWidth + numGap / 2}
              cy={i * rowHeight - 3}
              r={0.8}
              fill="#666"
            />
          ))}
        </g>,
      );
    }

    // 上中央：木
    const [my1, my2] = findElementYearPair("木", refYear);
    const mdigits1 = yearToEraDigits(my1);
    const mdigits2 = yearToEraDigits(my2);
    const topLabels: [string, "hei" | "sho" | "sei"][] = [
      ["平", "hei"],
      ["昭", "sho"],
      ["西", "sei"],
    ];
    const topCX = cx - (compact ? 30 : 40);
    const topY0 = compact ? 10 : 14;
    const topRowH = compact ? 11 : 14;
    nodes.push(
      <g key="corner-木" transform={`translate(${topCX}, ${topY0})`}>
        {topLabels.map(([lab, key], i) => (
          <g key={`top-${i}`}>
            <text
              x={0}
              y={i * topRowH}
              textAnchor="start"
              fontSize={compact ? 9 : 11}
              fontFamily="serif"
              fill="#333"
            >
              {lab}
            </text>
            <text
              x={compact ? 20 : 26}
              y={i * topRowH}
              textAnchor="middle"
              fontSize={compact ? 9 : 11}
              fontFamily="serif"
              fill="#333"
            >
              {mdigits1[key]}:{mdigits2[key]}
            </text>
          </g>
        ))}
      </g>,
    );

    return nodes;
  }

  /* ----------------------------------
   * 凡例（右上）
   * ---------------------------------- */
  function renderLegend(): React.ReactElement | null {
    if (!showLegend) return null;
    const x = vb - (compact ? 140 : 170);
    const y = compact ? 10 : 16;
    const lineH = compact ? 13 : 16;
    return (
      <g transform={`translate(${x}, ${y})`}>
        <text x={0} y={0} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#111">+</text>
        <text x={compact ? 14 : 18} y={0} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#111">→大運の五行</text>
        <text x={0} y={lineH} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#111">⊕</text>
        <text x={compact ? 14 : 18} y={lineH} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#111">→流年の五行</text>
        <text x={0} y={lineH * 2} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#1d4ed8">＊</text>
        <text x={compact ? 14 : 18} y={lineH * 2} fontSize={compact ? 10 : 12} fontFamily="serif" fill="#111">→月令（季節）</text>
      </g>
    );
  }

  /* ----------------------------------
   * 五行カウント一覧（下部）
   * ---------------------------------- */
  function renderCountSummary(): React.ReactElement {
    const y = cy + rMain + (compact ? 52 : 70);
    return (
      <g>
        {(Object.keys(ELEMENT_ANGLES) as Element[]).map((el, i) => {
          const span = compact ? 60 : 80;
          const startX = cx - (span * 5) / 2 + i * span + span / 2;
          return (
            <g key={`sum-${el}`}>
              <text
                x={startX}
                y={y}
                textAnchor="middle"
                fontSize={compact ? 11 : 13}
                fontFamily="serif"
                fontWeight={700}
                fill={ELEMENT_COLOR[el]}
              >
                {el}
              </text>
              <text
                x={startX}
                y={y + (compact ? 13 : 16)}
                textAnchor="middle"
                fontSize={compact ? 9 : 11}
                fontFamily="serif"
                fill="#333"
              >
                本{mainCounts[el]}・蔵{hiddenCounts[el]}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  const totalHeight = cy + rMain + (compact ? 90 : 120);

  return (
    <div className="bg-white text-stone-900 rounded-md border border-stone-400 overflow-hidden">
      {headerText && (
        <div className="border-b border-stone-400 px-3 py-2 bg-stone-50">
          <h3 className="text-sm sm:text-base font-bold tracking-wider" style={{ fontFamily: "serif" }}>
            {headerText}
          </h3>
          {ryuunenLabel && (
            <p className="text-[11px] text-stone-600 mt-0.5" style={{ fontFamily: "serif" }}>
              流年：{ryuunenLabel}
            </p>
          )}
        </div>
      )}
      <svg
        viewBox={`0 0 ${vb} ${totalHeight}`}
        className="w-full h-auto block"
        style={{ backgroundColor: "#fffdf8" }}
      >
        {/* コーナー & 凡例（最下層） */}
        {renderCorners()}
        {renderLegend()}

        {/* 円 */}
        <circle cx={cx} cy={cy} r={rMain} fill="#ffffff" stroke="#222" strokeWidth={1.5} />

        {/* 陰陽分割線（装飾） */}
        {renderDivider()}

        {/* 要素ラベル */}
        {renderLabels()}

        {/* ドット／三角 */}
        {(Object.keys(ELEMENT_ANGLES) as Element[]).flatMap((el) => renderDots(el))}

        {/* 特殊マーカー */}
        {renderMarkers()}

        {/* 下部の五行カウント */}
        {renderCountSummary()}
      </svg>
    </div>
  );
}

export default TraditionalGogyoWheel;
