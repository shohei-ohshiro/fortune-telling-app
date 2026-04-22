"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  type Meishiki,
  type DetailedChart,
  type DaiunResult,
  ELEMENT_COLORS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  getKanshiNumber,
} from "@/lib/shichusuimei";

/**
 * 鑑定書の「どこに何が書いてあるか」を視覚的にガイドする注釈カード。
 * 画像のパーツを小さく再現 → その右 or 下に意味を説明。
 */

function GuideCard({
  badge,
  title,
  preview,
  children,
}: {
  badge: string;
  title: string;
  preview: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="bg-white/[0.04] border-purple-500/30">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* ビジュアルプレビュー（紙の一部を切り取ったもの） */}
          <div className="md:col-span-2 bg-amber-50 border border-stone-300 rounded p-2 flex items-center justify-center">
            {preview}
          </div>
          {/* 説明 */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-rose-500/80 text-white font-bold tracking-wider">
                {badge}
              </span>
              <h3 className="text-white font-bold text-sm">{title}</h3>
            </div>
            <div className="text-purple-100 text-[13px] leading-relaxed">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  meishiki: Meishiki;
  detailed: DetailedChart;
  daiun: DaiunResult | null;
  approxAge: number;
  year: number;
  month: number;
  day: number;
  hour?: number;
}

/** プレビュー用のミニ柱セル */
function MiniPillar({
  label,
  stem,
  branch,
  top,
  bottom,
  dim,
}: {
  label: string;
  stem: string;
  branch: string;
  top?: string;
  bottom?: string;
  dim?: boolean;
}) {
  const stemEl = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchEl = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];
  return (
    <div className={`w-10 ${dim ? "opacity-50" : ""}`}>
      <div className="text-[8px] bg-stone-200 text-stone-700 border border-stone-400 text-center py-0.5">
        {label}
      </div>
      <div
        className="font-bold text-base text-center border-x border-b border-stone-400 bg-white"
        style={{ color: stemEl ? ELEMENT_COLORS[stemEl] : undefined, fontFamily: "serif" }}
      >
        {stem}
      </div>
      {top && (
        <div className="text-[8px] text-center border-x border-b border-stone-400 bg-stone-50">
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
        <div className="text-[8px] text-center border-x border-b border-stone-400 bg-stone-50">
          {bottom}
        </div>
      )}
    </div>
  );
}

export function TraditionalChartGuide({
  meishiki,
  detailed,
  daiun,
  approxAge,
  year,
  month,
  day,
  hour,
}: Props) {
  const dayPillar = detailed.pillars.find((p) => p.label === "日柱")!;
  const monthPillar = detailed.pillars.find((p) => p.label === "月柱")!;
  const yearPillar = detailed.pillars.find((p) => p.label === "年柱")!;
  const hourPillar = detailed.pillars.find((p) => p.label === "時柱");

  const currentDaiun =
    daiun?.periods.find((p) => p.startAge <= approxAge && approxAge <= p.endAge) ?? null;

  return (
    <div className="space-y-3">
      {/* 読み方の見出し */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-purple-500/30" />
        <span className="text-purple-200 text-sm px-3">📖 鑑定書の読み方</span>
        <div className="flex-1 h-px bg-purple-500/30" />
      </div>
      <p className="text-purple-400 text-xs leading-relaxed px-1">
        上の鑑定書は伝統的な紙の命式表と同じレイアウトで作成されています。
        情報量が多いので、ここでは <span className="text-rose-300">ラベル①〜⑦</span> に分けて
        「どこに何が書かれているか」を解説します。
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
      >
        <p>
          鑑定対象となる生年月日・時刻・性別を示します。
          時刻と性別が揃うと「時柱」「大運の順逆」が確定し、精度が最大になります。
        </p>
      </GuideCard>

      {/* ② 流年 */}
      <GuideCard
        badge="②"
        title={`流年ラベル：${new Date().getFullYear()}年の運勢基準点`}
        preview={
          <div className="text-stone-900 text-sm font-semibold">
            流年：{new Date().getFullYear()}
          </div>
        }
      >
        <p>
          「流年（りゅうねん）」はその年に回ってくる干支のこと。
          この年の干支と命式の干支の組み合わせで、
          <span className="text-rose-300 font-semibold">その年のテーマ</span>
          が決まります。
        </p>
      </GuideCard>

      {/* ③ 五行レーダー */}
      <GuideCard
        badge="③"
        title="五行レーダー：生まれ持った気のバランス"
        preview={
          <svg viewBox="0 0 160 160" className="w-full h-auto max-w-[150px]">
            {(() => {
              const pts = [
                { el: "木", a: -90 },
                { el: "火", a: -90 + 72 },
                { el: "土", a: -90 + 144 },
                { el: "金", a: -90 + 216 },
                { el: "水", a: -90 + 288 },
              ];
              const cx = 80, cy = 80, r = 50;
              const coords = pts.map(({ a }) => {
                const rad = (a * Math.PI) / 180;
                return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
              });
              return (
                <>
                  <polygon
                    points={coords.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="rgba(99,102,241,0.15)"
                    stroke="#6366f1"
                    strokeWidth="1"
                  />
                  {pts.map((p, i) => (
                    <text
                      key={p.el}
                      x={coords[i].x}
                      y={coords[i].y + 4}
                      textAnchor="middle"
                      fontSize="14"
                      fontFamily="serif"
                      fontWeight="bold"
                      fill={ELEMENT_COLORS[p.el as keyof typeof ELEMENT_COLORS]}
                      dy={coords[i].y < cy ? -8 : 14}
                    >
                      {p.el}
                    </text>
                  ))}
                </>
              );
            })()}
          </svg>
        }
      >
        <p>
          命式に現れる天干・地支を <span className="font-semibold">木・火・土・金・水</span>
          の5つに集計して五角形で可視化。
          <span className="text-rose-300">頂点が大きい＝その気が強い</span>、
          内側にへこんでいる＝その気が不足。
        </p>
        <p className="mt-1 text-[12px] text-purple-300">
          あなたの場合：
          {Object.entries(meishiki.elements)
            .sort((a, b) => b[1] - a[1])
            .map(([el, n]) => `${el}${n}`)
            .join("・")}
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
      >
        <p>
          鑑定書の心臓部。各柱は上から
          <span className="text-rose-300 font-semibold">
            「天干 → 通変星 → 地支 → 十二運 → 蔵干通変」
          </span>
          の順に積み上がっています。
        </p>
        <ul className="mt-1 list-disc list-inside text-[12px] text-purple-200 space-y-0.5">
          <li>
            <b>年柱</b>：先祖・幼少期・社会との関わり
          </li>
          <li>
            <b>月柱</b>：両親・青年期・仕事と適性
          </li>
          <li>
            <b>日柱</b>（中央＝あなた自身）：本質・配偶者
          </li>
          <li>
            <b>時柱</b>：子供・晩年・未来
          </li>
        </ul>
      </GuideCard>

      {/* ⑤ 大運+ / 流年+ */}
      <GuideCard
        badge="⑤"
        title="大運+／流年+：「今」の運勢柱"
        preview={
          <div className="flex gap-0.5">
            <MiniPillar
              label="流年+"
              stem={(() => {
                const y = new Date().getFullYear();
                const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
                return stems[((y - 4) % 10 + 10) % 10];
              })()}
              branch={(() => {
                const y = new Date().getFullYear();
                const br = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
                return br[((y - 4) % 12 + 12) % 12];
              })()}
            />
            {currentDaiun && (
              <MiniPillar
                label="大運+"
                stem={currentDaiun.stem}
                branch={currentDaiun.branch}
              />
            )}
          </div>
        }
      >
        <p>
          命式本体の左側にある2本の柱。
          <span className="text-rose-300 font-semibold">大運+</span>
          は今の10年サイクル、
          <span className="text-rose-300 font-semibold">流年+</span>
          はその年に巡る1年サイクル。
          {currentDaiun
            ? `あなたは現在 ${approxAge}歳、${currentDaiun.stem}${currentDaiun.branch} の大運に入っています。`
            : "性別を入力すると大運が算出されます。"}
        </p>
      </GuideCard>

      {/* ⑥ 大運一覧表 */}
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
                      isCurrent ? "ring-2 ring-rose-500 bg-rose-50" : "bg-white"
                    }`}
                  >
                    <div className="text-[8px] bg-stone-100 border-b border-stone-300">
                      {p.startAge}〜{p.endAge}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: ELEMENT_COLORS[STEM_ELEMENTS[p.stem]],
                        fontFamily: "serif",
                      }}
                    >
                      {p.stem}
                    </div>
                    <div
                      className="text-sm font-bold border-t border-stone-200"
                      style={{
                        color: ELEMENT_COLORS[BRANCH_ELEMENTS[p.branch]],
                        fontFamily: "serif",
                      }}
                    >
                      {p.branch}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        >
          <p>
            横一列に並ぶのは
            <span className="text-rose-300 font-semibold">10年ごとの「人生の季節」</span>
            を表した大運の一覧。
            <span className="bg-rose-500/30 px-1 rounded">赤枠</span>
            が現在の大運です。
          </p>
          <p className="mt-1 text-[12px] text-purple-300">
            ※ 男女・年干の陰陽で進む方向（順行／逆行）が決まり、
            スタート年齢は節入りまでの日数で算出されます。
            あなたは「{daiun.isForward ? "順行" : "逆行"}／{daiun.startAge}歳起算」です。
          </p>
        </GuideCard>
      )}

      {/* ⑦ 特殊星 */}
      <GuideCard
        badge="⑦"
        title="特殊星：天徳・天乙・羊刃・空亡"
        preview={
          <div className="text-[11px] bg-white border border-stone-400 p-2 space-y-0.5 w-full text-stone-900">
            <div>天乙：{detailed.tenotsu.join("")}</div>
            <div>羊刃：{detailed.youjin}</div>
            <div>空亡：{detailed.kuubou.join("")}</div>
            <div>干支番号：【{getKanshiNumber(meishiki.dayStem, meishiki.dayBranch)}】</div>
          </div>
        }
      >
        <ul className="list-disc list-inside space-y-0.5 text-[12px]">
          <li>
            <b className="text-amber-300">天徳・月徳</b>：困難に見舞われても守られる吉星。
          </li>
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
            <b className="text-emerald-300">納音／命宮</b>：本質を示す古典の表記。
          </li>
        </ul>
      </GuideCard>
    </div>
  );
}

export default TraditionalChartGuide;
