"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { track } from "@vercel/analytics";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { PremiumText } from "@/components/PremiumText";
import { TraditionalMeishikiChart } from "@/components/TraditionalMeishikiChart";
import { TraditionalChartGuide } from "@/components/TraditionalChartGuide";
import {
  calculateMeishiki,
  calculateDaiun,
  getDaiunInsight,
  getPersonality,
  buildDetailedChart,
  STEM_READINGS,
  BRANCH_READINGS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_COLORS,
  TSUHENSEI_MEANINGS,
  JUUNIUN_MEANINGS,
  GETSUREI_DESCRIPTIONS,
  type Meishiki,
  type Element,
  type Gender,
  type DaiunResult,
  type DaiunInsight,
  type PillarDetail,
} from "@/lib/shichusuimei";

function ElementBar({ elements }: { elements: Record<Element, number> }) {
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const labels: Record<Element, string> = {
    '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
  };

  return (
    <div className="space-y-2">
      {(Object.entries(elements) as [Element, number][]).map(([el, count]) => (
        <div key={el} className="flex items-center gap-2">
          <span className="text-purple-200 w-8 text-center">{labels[el]}</span>
          <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: ELEMENT_COLORS[el],
                minWidth: count > 0 ? '8px' : '0',
              }}
            />
          </div>
          <span className="text-purple-300 text-sm w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function PillarCell({ stem, branch, star, label }: {
  stem: string;
  branch: string;
  star?: string | null;
  label: string;
}) {
  const stemElement = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchElement = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];

  return (
    <div className="text-center space-y-1">
      <div className="text-purple-300 text-xs mb-2">{label}</div>
      <div
        className="text-2xl font-bold py-2 rounded-lg"
        style={{ color: stemElement ? ELEMENT_COLORS[stemElement] : 'white' }}
      >
        {stem}
      </div>
      <div className="text-purple-400 text-xs">
        {STEM_READINGS[stem as keyof typeof STEM_READINGS]}
      </div>
      <Separator className="bg-purple-500/30" />
      <div
        className="text-2xl font-bold py-2 rounded-lg"
        style={{ color: branchElement ? ELEMENT_COLORS[branchElement] : 'white' }}
      >
        {branch}
      </div>
      <div className="text-purple-400 text-xs">
        {BRANCH_READINGS[branch as keyof typeof BRANCH_READINGS]}
      </div>
      {star && (
        <>
          <Separator className="bg-purple-500/30" />
          <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 text-xs">
            {star}
          </Badge>
        </>
      )}
    </div>
  );
}

/** PDF風の詳細命式表セル（通変星・十二運・蔵干通変・特殊星） */
function DetailedPillarCell({ pillar, isDayPillar }: { pillar: PillarDetail; isDayPillar: boolean }) {
  const stemEl = STEM_ELEMENTS[pillar.stem];
  const branchEl = BRANCH_ELEMENTS[pillar.branch];
  return (
    <div className="rounded-lg border border-purple-500/30 bg-white/5 px-1.5 py-2 flex flex-col items-center gap-1.5 text-center">
      <div className="text-purple-400 text-[11px]">{pillar.label}</div>
      <div className="text-purple-200 text-[11px] min-h-[1em]">
        {pillar.stemTsuhensei ?? (isDayPillar ? '日主' : '')}
      </div>
      <div
        className="text-xl font-bold leading-none"
        style={{ color: ELEMENT_COLORS[stemEl] }}
      >
        {pillar.stem}
      </div>
      <div
        className="text-xl font-bold leading-none"
        style={{ color: ELEMENT_COLORS[branchEl] }}
      >
        {pillar.branch}
      </div>
      <div className="text-indigo-300 text-[11px]">{pillar.juuniun}</div>
      <div className="w-full border-t border-purple-500/20 pt-1 space-y-0.5">
        <div className="text-purple-500 text-[10px]">蔵干</div>
        {pillar.hiddenStems.map(({ stem, tsuhensei }, i) => (
          <div key={`${stem}-${i}`} className="flex items-center justify-center gap-1 text-[11px]">
            <span
              className="font-semibold"
              style={{ color: ELEMENT_COLORS[STEM_ELEMENTS[stem]] }}
            >
              {stem}
            </span>
            <span className="text-purple-300">{tsuhensei}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-0.5 pt-1">
        {pillar.isKuubou && <Badge className="bg-slate-700/60 text-slate-200 text-[9px] px-1 py-0">空亡</Badge>}
        {pillar.isYoujin && <Badge className="bg-red-900/60 text-red-200 text-[9px] px-1 py-0">羊刃</Badge>}
        {pillar.isTenotsu && <Badge className="bg-amber-900/60 text-amber-200 text-[9px] px-1 py-0">天乙</Badge>}
      </div>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));
  const hourParam = searchParams.get("hour");
  const rawHour = hourParam !== null ? Number(hourParam) : undefined;
  const hour = rawHour !== undefined && !isNaN(rawHour) && rawHour >= 0 && rawHour <= 23 ? rawHour : undefined;
  const minuteParam = searchParams.get("minute");
  const rawMinute = minuteParam !== null ? Number(minuteParam) : 0;
  const minute = !isNaN(rawMinute) && rawMinute >= 0 && rawMinute <= 59 ? rawMinute : 0;
  const genderParam = searchParams.get("gender") as Gender | null;

  useEffect(() => {
    if (year && month && day) {
      track("result_viewed", { has_time: hour !== undefined, has_gender: !!genderParam });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!year || !month || !day) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6">
            <p className="text-purple-200">生年月日を入力してください。</p>
            <Link href="/">
              <Button className="mt-4 bg-purple-600 hover:bg-purple-500 text-white">
                トップに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meishiki: Meishiki = calculateMeishiki(year, month, day, hour, minute);
  const personality = getPersonality(meishiki.dayStem);
  const detailed = buildDetailedChart(meishiki);
  void pathname;

  const daiun: DaiunResult | null = genderParam
    ? calculateDaiun(
        year, month, day,
        hour ?? 12, minute,
        genderParam,
        meishiki.yearStem,
        meishiki.monthStem,
        meishiki.monthBranch,
      )
    : null;

  const today = new Date();
  const hasBirthdayPassed = today >= new Date(today.getFullYear(), month - 1, day);
  const approxAge = today.getFullYear() - year - (hasBirthdayPassed ? 0 : 1);
  const currentPeriodIndex = daiun?.periods.findIndex(
    (p) => p.startAge <= approxAge && approxAge <= p.endAge,
  ) ?? -1;

  const daiunInsight: DaiunInsight | null =
    daiun && currentPeriodIndex >= 0
      ? getDaiunInsight(daiun.periods[currentPeriodIndex], approxAge, hour !== undefined)
      : null;

  const reEntryUrl = `/?year=${year}&month=${month}&day=${day}${
    hour !== undefined ? `&hour=${hour}${minute > 0 ? `&minute=${minute}` : ""}` : ""
  }${genderParam ? `&gender=${genderParam}` : ""}`;

  const timeDisplay = hour !== undefined
    ? ` ${hour}時${minute > 0 ? `${String(minute).padStart(2, "0")}分` : ""}`
    : "";

  // この命式に現れる通変星の一覧（解説を絞り込み表示するため）
  const appearedTsuhensei = new Set<string>();
  detailed.pillars.forEach((p) => {
    if (p.stemTsuhensei) appearedTsuhensei.add(p.stemTsuhensei);
    p.hiddenStems.forEach((h) => appearedTsuhensei.add(h.tsuhensei));
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <h1 className="text-center text-white text-2xl font-bold">四柱推命 鑑定結果</h1>
        <div className="text-center space-y-2">
          <div className="text-purple-300 text-lg">
            {year}年{month}月{day}日{timeDisplay} 生まれ
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className={`text-xs ${hour !== undefined ? "bg-indigo-900/60 text-indigo-200" : "bg-white/5 text-purple-500"}`}>
              {hour !== undefined ? `⏰ ${hour}時${minute > 0 ? `${String(minute).padStart(2, "0")}分` : ""}（精密）` : "⏰ 時刻なし"}
            </Badge>
            <Badge className={`text-xs ${genderParam ? "bg-purple-900/60 text-purple-200" : "bg-white/5 text-purple-500"}`}>
              {genderParam ? `${genderParam === "男" ? "♂" : "♀"} ${genderParam}性` : "性別なし"}
            </Badge>
            <Link href={reEntryUrl} className="text-purple-500 text-xs hover:text-purple-300 underline underline-offset-2">
              条件を変更 →
            </Link>
          </div>
        </div>
        <p className="text-center text-purple-400 text-sm px-4">
          生年月日から命式を算出し、持って生まれた気質・才能・行動パターンを五行の観点で読み解きます。
        </p>

        {/* ─── 伝統的な紙の鑑定書スタイル ─── */}
        <TraditionalMeishikiChart
          year={year}
          month={month}
          day={day}
          hour={hour}
          minute={minute}
          gender={genderParam ?? undefined}
          meishiki={meishiki}
          detailed={detailed}
          daiun={daiun}
          approxAge={approxAge}
        />

        {/* 画像の各要素を解説する視覚ガイド */}
        <TraditionalChartGuide
          year={year}
          month={month}
          day={day}
          hour={hour}
          gender={genderParam ?? undefined}
          meishiki={meishiki}
          detailed={detailed}
          daiun={daiun}
          approxAge={approxAge}
        />

        {/* 日主タイプ */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              あなたは「{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）」の人
            </CardTitle>
            <p className="text-purple-300 text-center text-lg">
              {personality.title}
            </p>
          </CardHeader>
        </Card>

        {/* 四柱命式表（サマリ） */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">四柱命式表</CardTitle>
            <p className="text-purple-400 text-xs leading-relaxed">
              四柱推命では、生年月日時を「年柱・月柱・日柱・時柱」の4本の柱に分解し、それぞれに天干（天の気）と地支（地の気）を割り当てます。
              中央の「日柱（日主）」があなた自身を表す最重要ポイントで、他の柱との関係から人生の傾向を読み解きます。
            </p>
          </CardHeader>
          <CardContent>
            <div className={`grid ${hour !== undefined ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}>
              {hour !== undefined && meishiki.hourStem && meishiki.hourBranch && (
                <PillarCell
                  stem={meishiki.hourStem}
                  branch={meishiki.hourBranch}
                  star={meishiki.hourStar}
                  label="時柱"
                />
              )}
              <PillarCell
                stem={meishiki.dayStem}
                branch={meishiki.dayBranch}
                star={null}
                label="日柱（日主）"
              />
              <PillarCell
                stem={meishiki.monthStem}
                branch={meishiki.monthBranch}
                star={meishiki.monthStar}
                label="月柱"
              />
              <PillarCell
                stem={meishiki.yearStem}
                branch={meishiki.yearBranch}
                star={meishiki.yearStar}
                label="年柱"
              />
            </div>
          </CardContent>
        </Card>

        {/* 詳細命式（PDF風の本格表記） */}
        <Card className="bg-gradient-to-br from-slate-900/60 to-indigo-950/60 border-indigo-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">📜</span>詳細命式（本格鑑定表）
            </CardTitle>
            <p className="text-purple-400 text-xs leading-relaxed">
              紙の鑑定書と同じレイアウトで、各柱の「通変星・天干・地支・十二運・蔵干」を一覧化しました。
              蔵干は地支の内側に潜む天干で、表に出ないが影響する「隠れた力」を示します。
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`grid ${detailed.pillars.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
              {detailed.pillars.map((p) => (
                <DetailedPillarCell
                  key={p.label}
                  pillar={p}
                  isDayPillar={p.label === '日柱'}
                />
              ))}
            </div>

            {/* 表の読み方 */}
            <div className="bg-black/20 rounded-lg p-3 space-y-1.5 text-xs leading-relaxed">
              <p className="text-indigo-300 font-semibold">📖 表の読み方</p>
              <ul className="text-purple-200 space-y-0.5 list-disc list-inside">
                <li><span className="text-purple-100 font-semibold">通変星</span>：日主（自分）と、その柱の天干との関係性。性格や運勢のテーマを示す。</li>
                <li><span className="text-purple-100 font-semibold">天干／地支</span>：その柱の表に現れる気。色は五行（木=緑 / 火=赤 / 土=黄 / 金=白 / 水=青）。</li>
                <li><span className="text-purple-100 font-semibold">十二運</span>：日主がその地支でどの成長段階にあるかを示す「人生のバイオリズム」。</li>
                <li><span className="text-purple-100 font-semibold">蔵干</span>：地支の中に隠れる天干。表の天干と合わせて、その柱の持つエネルギーを立体的に示す。</li>
                <li>バッジ「<span className="text-slate-200">空亡</span>／<span className="text-red-200">羊刃</span>／<span className="text-amber-200">天乙</span>」は、その地支が特殊星に該当することを示します。</li>
              </ul>
            </div>

            {/* 特殊星のサマリ */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-amber-300 font-semibold mb-1">天乙貴人</p>
                <p className="text-purple-200 text-[11px]">
                  {detailed.tenotsu.join('・')}
                </p>
                <p className="text-purple-500 text-[10px] mt-1">最大の吉星。困難な時に助けてくれる支。</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-red-300 font-semibold mb-1">羊刃</p>
                <p className="text-purple-200 text-[11px]">{detailed.youjin}</p>
                <p className="text-purple-500 text-[10px] mt-1">強すぎる刃のエネルギー。決断力と衝動の星。</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-slate-300 font-semibold mb-1">空亡（天中殺）</p>
                <p className="text-purple-200 text-[11px]">{detailed.kuubou.join('・')}</p>
                <p className="text-purple-500 text-[10px] mt-1">縁が薄い支。人生で内省や修行の時期を示す。</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-emerald-300 font-semibold mb-1">納音（日柱）</p>
                <p className="text-purple-200 text-[11px]">{detailed.nayin}</p>
                <p className="text-purple-500 text-[10px] mt-1">あなたの本質を象徴する六十干支の雅名。</p>
              </div>
            </div>

            {/* 月令 */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg px-3 py-2.5">
              <div className="flex items-baseline gap-2">
                <p className="text-indigo-300 font-semibold text-sm">月令（身の強さ）</p>
                <p className="text-white font-bold text-lg">
                  {detailed.getsurei.state}
                </p>
                <p className="text-purple-300 text-xs">{detailed.getsurei.label}</p>
              </div>
              <p className="text-purple-200 text-xs leading-relaxed mt-1">
                {GETSUREI_DESCRIPTIONS[detailed.getsurei.state]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 通変星の解説（実際に出現したものを優先表示） */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🔯</span>通変星（十神）の意味
            </CardTitle>
            <p className="text-purple-400 text-xs leading-relaxed">
              通変星は、日主と各柱の天干・蔵干との関係から導かれる10種の星です。
              あなたの命式に現れている星を先頭にハイライトしています。
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(TSUHENSEI_MEANINGS)
              .sort(([a], [b]) => {
                const aHas = appearedTsuhensei.has(a) ? 0 : 1;
                const bHas = appearedTsuhensei.has(b) ? 0 : 1;
                return aHas - bHas;
              })
              .map(([name, info]) => {
                const isInChart = appearedTsuhensei.has(name);
                return (
                  <div
                    key={name}
                    className={`flex gap-3 rounded-lg px-3 py-2 ${isInChart ? 'bg-purple-900/40 border border-purple-500/30' : 'bg-white/5'}`}
                  >
                    <div className="shrink-0 w-14 text-center">
                      <div className={`font-bold ${isInChart ? 'text-white' : 'text-purple-300'}`}>{name}</div>
                      <div className="text-purple-400 text-[10px]">{info.label}</div>
                    </div>
                    <p className="text-purple-100 text-xs leading-relaxed flex-1">{info.description}</p>
                    {isInChart && (
                      <span className="text-amber-300 text-[10px] self-start shrink-0">◀ 命式に有</span>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* 十二運の解説 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🌀</span>十二運の意味
            </CardTitle>
            <p className="text-purple-400 text-xs leading-relaxed">
              十二運は、人の一生（誕生→成長→衰退→再生）を12段階に分けた指標です。
              各柱の十二運を組み合わせることで、人生の各時期や場面で発揮されるエネルギーの性質が分かります。
            </p>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(() => {
              const chartJuuniun = new Set(detailed.pillars.map((p) => p.juuniun));
              return Object.entries(JUUNIUN_MEANINGS).map(([name, info]) => {
                const isInChart = chartJuuniun.has(name as keyof typeof JUUNIUN_MEANINGS);
                return (
                  <div
                    key={name}
                    className={`flex gap-3 rounded-lg px-3 py-2 ${isInChart ? 'bg-indigo-900/40 border border-indigo-500/30' : 'bg-white/5'}`}
                  >
                    <div className="shrink-0 w-14 text-center">
                      <div className={`font-bold ${isInChart ? 'text-white' : 'text-purple-300'}`}>{name}</div>
                      <div className="text-purple-400 text-[10px]">{info.label}</div>
                    </div>
                    <p className="text-purple-100 text-xs leading-relaxed flex-1">{info.description}</p>
                    {isInChart && (
                      <span className="text-amber-300 text-[10px] self-start shrink-0">◀ 命式に有</span>
                    )}
                  </div>
                );
              });
            })()}
          </CardContent>
        </Card>

        {/* 五行バランス */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">五行バランス</CardTitle>
            <p className="text-purple-400 text-xs leading-relaxed">
              命式に現れる8つ（時柱あれば8つ、なければ6つ）の気を五行（木・火・土・金・水）で集計しました。
              多い五行があなたの「得意な気」、少ない五行が「補うべき気」を示します。
            </p>
          </CardHeader>
          <CardContent>
            <ElementBar elements={meishiki.elements} />
          </CardContent>
        </Card>

        {/* 大運表 */}
        {daiun && (
          <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🔮</span>大運（10年周期の運勢サイクル）
              </CardTitle>
              <p className="text-indigo-300 text-sm">
                {genderParam}性・{daiun.isForward ? "順行" : "逆行"}｜{daiun.startAge}歳から起算
                {hour === undefined && <span className="text-purple-500">（時刻未入力のため正午で概算）</span>}
              </p>
              <p className="text-purple-400 text-xs leading-relaxed">
                大運は、月柱を基準に10年ごとに移り変わる「人生の季節」です。
                性別と陰陽から進む方向（順行／逆行）が決まり、それぞれの10年でテーマとなる干支が変わります。
              </p>
            </CardHeader>
            <CardContent>
              {currentPeriodIndex >= 0 && (
                <div className="bg-indigo-600/20 border border-indigo-400/30 rounded-lg px-3 py-2 mb-3 text-sm text-indigo-200">
                  現在（約{approxAge}歳）は第{currentPeriodIndex + 1}大運
                  ｜{daiun.periods[currentPeriodIndex].stem}{daiun.periods[currentPeriodIndex].branch}
                  の時期です
                </div>
              )}
              <div className="space-y-1.5">
                {daiun.periods.map((period, i) => {
                  const isCurrent = i === currentPeriodIndex;
                  const isPast = period.endAge < approxAge;
                  const stemEl = STEM_ELEMENTS[period.stem];
                  const branchEl = BRANCH_ELEMENTS[period.branch];
                  return (
                    <div
                      key={period.startAge}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-indigo-600/40 border border-indigo-400/50"
                          : isPast
                          ? "bg-white/3 opacity-40"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="text-purple-400 text-xs w-16 shrink-0 leading-tight">
                        {period.startAge}〜{period.endAge}歳
                        {isCurrent && <span className="block text-indigo-300 font-bold text-[10px]">◀ 現在</span>}
                        {isPast && <span className="block text-purple-600 text-[10px]">経過</span>}
                      </div>
                      <div className="flex gap-0.5 w-10 shrink-0 items-baseline">
                        <span
                          className="text-xl font-bold leading-none"
                          style={{ color: stemEl ? ELEMENT_COLORS[stemEl] : "white" }}
                        >
                          {period.stem}
                        </span>
                        <span
                          className="text-xl font-bold leading-none"
                          style={{ color: branchEl ? ELEMENT_COLORS[branchEl] : "white" }}
                        >
                          {period.branch}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap flex-1 min-w-0">
                        <Badge className="bg-purple-900/60 text-purple-200 text-[10px] px-1 py-0">
                          {period.stemKeyword}
                        </Badge>
                        <Badge className="bg-indigo-900/60 text-indigo-200 text-[10px] px-1 py-0">
                          {period.branchKeyword}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!daiun && (
          <Card className="bg-white/5 border-dashed border-indigo-400/30">
            <CardContent className="pt-5 pb-5 text-center space-y-2">
              <p className="text-indigo-300 text-sm font-semibold">🔮 大運（10年周期の運勢サイクル）</p>
              <p className="text-purple-400 text-xs">
                性別を入力すると、月柱から算出する<br/>
                10年ごとの大運サイクルが表示されます。
              </p>
              <Link href={`${reEntryUrl}&focus=gender`}>
                <Button variant="outline" className="mt-1 border-indigo-400/50 text-indigo-300 hover:bg-indigo-900/30 text-sm">
                  性別を追加して再鑑定 →
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 今の大運テーマ */}
        {daiunInsight && daiun && currentPeriodIndex >= 0 && (
          <Card className="bg-gradient-to-br from-indigo-900/50 to-blue-900/40 border-indigo-400/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span>🌊</span>今の大運が示すテーマ
              </CardTitle>
              <p className="text-indigo-300 text-sm">
                現在（約{approxAge}歳）：
                <span
                  className="font-bold mx-1"
                  style={{ color: ELEMENT_COLORS[daiunInsight.element] }}
                >
                  {daiun.periods[currentPeriodIndex].stem}{daiun.periods[currentPeriodIndex].branch}
                </span>
                「{daiun.periods[currentPeriodIndex].stemKeyword}・{daiun.periods[currentPeriodIndex].branchKeyword}」の10年
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-purple-100 leading-relaxed text-sm">
                {daiunInsight.currentTheme}
              </p>
              {daiunInsight.timeNote && (
                <p className="text-purple-500 text-xs">{daiunInsight.timeNote}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 基本性格 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）の性格</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">
              {personality.description}
            </p>
          </CardContent>
        </Card>

        {/* 気質・本質 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🔥</span>気質・本質
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{personality.temperament}</p>
          </CardContent>
        </Card>

        {/* 強み・弱み */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">強み・弱み</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-green-400 font-semibold mb-2">強み</h4>
              <div className="flex flex-wrap gap-2">
                {personality.strengths.map((s) => (
                  <Badge key={s} className="bg-green-900/50 text-green-200">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-orange-400 font-semibold mb-2">弱み</h4>
              <div className="flex flex-wrap gap-2">
                {personality.weaknesses.map((w) => (
                  <Badge key={w} className="bg-orange-900/50 text-orange-200">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 行動パターン */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">⚡</span>行動パターン
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{personality.behaviorPattern}</p>
          </CardContent>
        </Card>

        {/* 対人傾向・コミュニケーション */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">💬</span>対人傾向・コミュニケーション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{personality.interpersonal}</p>
          </CardContent>
        </Card>

        {/* ─── 詳細鑑定 ─── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-purple-500/30" />
          <Badge className="bg-purple-900/50 text-purple-200 text-sm px-4 py-1">🔮 詳細鑑定レポート</Badge>
          <div className="flex-1 h-px bg-purple-500/30" />
        </div>

        {/* 恋愛傾向 */}
        <Card className="bg-gradient-to-br from-rose-900/30 to-pink-900/30 border-rose-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💕</span>恋愛傾向</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.loveAnalysis} />
          </CardContent>
        </Card>

        {/* 相性の良いタイプ */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💑</span>相性の良いタイプ</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.compatibleType} />
          </CardContent>
        </Card>

        {/* キャリア適性分析 */}
        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💼</span>キャリア適性分析</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.careerAnalysis} />
            <div className="mt-4">
              <h4 className="text-amber-400 font-semibold mb-2">向いている職種</h4>
              <div className="flex flex-wrap gap-2">
                {personality.suitableCareers.map((c) => (
                  <Badge key={c} className="bg-amber-900/50 text-amber-200">{c}</Badge>
                ))}
              </div>
            </div>
            {daiunInsight && (
              <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-1.5">
                <p className="text-indigo-400 text-xs font-semibold tracking-wide">▶ 今の大運（10年運）の視点</p>
                <p className="text-indigo-200 text-sm leading-relaxed">{daiunInsight.career}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 隠れた才能 */}
        <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">✨</span>隠れた才能</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.hiddenTalent} />
          </CardContent>
        </Card>

        {/* 金運傾向 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💰</span>金運傾向</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.moneyFortune} />
            {daiunInsight && (
              <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-1.5">
                <p className="text-indigo-400 text-xs font-semibold tracking-wide">▶ 今の大運（10年運）の視点</p>
                <p className="text-indigo-200 text-sm leading-relaxed">{daiunInsight.money}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 人生の方向性 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">🧭</span>人生の方向性</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.lifeDirection} />
            {daiunInsight && (
              <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-1.5">
                <p className="text-indigo-400 text-xs font-semibold tracking-wide">▶ 今の大運（10年運）の視点</p>
                <p className="text-indigo-200 text-sm leading-relaxed">{daiunInsight.lifeDirection}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今年の転機 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">🔄</span>今年の転機</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.yearlyTurningPoint} />
            {daiunInsight && (
              <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-1.5">
                <p className="text-indigo-400 text-xs font-semibold tracking-wide">▶ 今の大運（10年運）の視点</p>
                <p className="text-indigo-200 text-sm leading-relaxed">{daiunInsight.turningPoint}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今後の伸ばし方 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">📈</span>今後の伸ばし方</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.growthAdvice} />
            {daiunInsight && (
              <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-1.5">
                <p className="text-indigo-400 text-xs font-semibold tracking-wide">▶ 今の大運（10年運）の視点</p>
                <p className="text-indigo-200 text-sm leading-relaxed">{daiunInsight.growth}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 人を惹きつける強み */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><span className="text-xl">👑</span>人を惹きつける強み</CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumText text={personality.attractionStrength} />
          </CardContent>
        </Card>

        {/* 他の占術 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">他の占術で見る</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Link href={`/numerology?year=${year}&month=${month}&day=${day}`}>
                <div className="bg-purple-900/50 rounded-lg p-4 text-center hover:bg-purple-800/50 transition">
                  <div className="text-2xl mb-1">🔢</div>
                  <p className="text-white font-semibold text-sm">数秘術</p>
                  <p className="text-purple-300 text-xs">ライフパスナンバー</p>
                </div>
              </Link>
              <Link href={`/animal?year=${year}&month=${month}&day=${day}`}>
                <div className="bg-purple-900/50 rounded-lg p-4 text-center hover:bg-purple-800/50 transition">
                  <div className="text-2xl mb-1">🐾</div>
                  <p className="text-white font-semibold text-sm">動物占い</p>
                  <p className="text-purple-300 text-xs">あなたの動物キャラ</p>
                </div>
              </Link>
              <Link href={`/zodiac?year=${year}&month=${month}&day=${day}`}>
                <div className="bg-purple-900/50 rounded-lg p-4 text-center hover:bg-purple-800/50 transition">
                  <div className="text-2xl mb-1">⭐</div>
                  <p className="text-white font-semibold text-sm">星座占い</p>
                  <p className="text-purple-300 text-xs">12星座で診断</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <Link href={`/daily?year=${year}&month=${month}&day=${day}${hour !== undefined ? `&hour=${hour}` : ''}${minute > 0 ? `&minute=${minute}` : ''}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              今日の運勢を見る &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <p className="text-purple-300">読み込み中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
