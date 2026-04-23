"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import {
  calculateMeishiki,
  analyzeCompatibility,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_COLORS,
  STEM_READINGS,
  BRANCH_READINGS,
  type Meishiki,
  type Element,
  type CompatibilityBond,
} from "@/lib/shichusuimei";

type Gender = "男" | "女" | "";

interface PersonInput {
  year: string; month: string; day: string;
  hour: string; minute: string;
  gender: Gender;
}

const LS_SELF = "compat_self";
const LS_OTHER = "compat_other";

const emptyInput: PersonInput = {
  year: "", month: "", day: "", hour: "", minute: "", gender: "",
};

/* ------------------------------------------------------------
 * 入力欄（自分 or 相手）
 * ------------------------------------------------------------ */
function PersonForm({
  title, color, value, onChange,
}: {
  title: string;
  color: "blue" | "rose";
  value: PersonInput;
  onChange: (v: PersonInput) => void;
}) {
  const palette = color === "blue"
    ? { ring: "border-blue-400/40", title: "text-blue-200", chip: "bg-blue-500/20 text-blue-100" }
    : { ring: "border-rose-400/40", title: "text-rose-200", chip: "bg-rose-500/20 text-rose-100" };

  const set = (k: keyof PersonInput, v: string) => onChange({ ...value, [k]: v });

  return (
    <Card className={`bg-white/5 ${palette.ring}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base ${palette.title}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-purple-200 text-xs">生年月日</Label>
          <Input
            type="date"
            value={value.year && value.month && value.day
              ? `${value.year.padStart(4, "0")}-${value.month.padStart(2, "0")}-${value.day.padStart(2, "0")}`
              : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) { onChange({ ...value, year: "", month: "", day: "" }); return; }
              const [y, m, d] = v.split("-");
              onChange({ ...value, year: String(Number(y)), month: String(Number(m)), day: String(Number(d)) });
            }}
            min="1920-01-01" max="2030-12-31"
            className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 text-sm mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-purple-200 text-xs">出生時刻</Label>
            <span className="text-purple-500 text-[10px]">任意</span>
          </div>
          <Input
            type="time"
            value={value.hour !== ""
              ? `${String(Number(value.hour)).padStart(2, "0")}:${String(Number(value.minute || "0")).padStart(2, "0")}`
              : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) { onChange({ ...value, hour: "", minute: "" }); return; }
              const [h, m] = v.split(":");
              onChange({ ...value, hour: String(Number(h)), minute: String(Number(m)) });
            }}
            className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 text-sm mt-1"
          />
        </div>

        <div>
          <Label className="text-purple-200 text-xs">性別</Label>
          <div className="flex gap-1.5 mt-1">
            {(["男", "女"] as const).map((g) => (
              <button key={g} type="button"
                onClick={() => set("gender", value.gender === g ? "" : g)}
                className={`flex-1 py-1.5 rounded-md border text-xs font-medium transition ${
                  value.gender === g ? palette.chip + " border-white/30"
                    : "bg-white/5 border-white/10 text-purple-400 hover:bg-white/10"
                }`}
              >
                {g === "男" ? "♂ 男性" : "♀ 女性"}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------
 * コンパクト命式カード（左右比較用）
 * ------------------------------------------------------------ */
function MeishikiCompactCard({
  title, accent, meishiki, dateLabel,
}: {
  title: string;
  accent: "blue" | "rose";
  meishiki: Meishiki;
  dateLabel: string;
}) {
  const accentBorder = accent === "blue" ? "border-blue-400/40" : "border-rose-400/40";
  const accentTitle = accent === "blue" ? "text-blue-200" : "text-rose-200";

  type Col = { label: string; stem: string; branch: string };
  const cols: Col[] = [
    ...(meishiki.hourStem && meishiki.hourBranch
      ? [{ label: "時柱", stem: meishiki.hourStem, branch: meishiki.hourBranch }]
      : []),
    { label: "日柱", stem: meishiki.dayStem, branch: meishiki.dayBranch },
    { label: "月柱", stem: meishiki.monthStem, branch: meishiki.monthBranch },
    { label: "年柱", stem: meishiki.yearStem, branch: meishiki.yearBranch },
  ];

  const total = Object.values(meishiki.elements).reduce((a, b) => a + b, 0) || 1;

  return (
    <Card className={`bg-white/5 ${accentBorder}`}>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <CardTitle className={`text-sm ${accentTitle}`}>{title}</CardTitle>
          <span className="text-purple-400 text-[10px]">{dateLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 柱ブロック */}
        <div className={`grid gap-1.5 ${cols.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {cols.map((c) => {
            const se = STEM_ELEMENTS[c.stem as keyof typeof STEM_ELEMENTS];
            const be = BRANCH_ELEMENTS[c.branch as keyof typeof BRANCH_ELEMENTS];
            const isDay = c.label === "日柱";
            return (
              <div key={c.label}
                className={`rounded border text-center py-1.5 px-0.5 ${
                  isDay ? "bg-amber-500/10 border-amber-400/40" : "bg-white/5 border-white/10"
                }`}>
                <div className="text-[9px] text-purple-400">{c.label}</div>
                <div className="font-bold text-lg leading-tight" style={{ color: ELEMENT_COLORS[se], fontFamily: "serif" }}>{c.stem}</div>
                <div className="text-[9px] text-purple-500">{STEM_READINGS[c.stem as keyof typeof STEM_READINGS]}</div>
                <div className="font-bold text-lg leading-tight" style={{ color: ELEMENT_COLORS[be], fontFamily: "serif" }}>{c.branch}</div>
                <div className="text-[9px] text-purple-500">{BRANCH_READINGS[c.branch as keyof typeof BRANCH_READINGS]}</div>
              </div>
            );
          })}
        </div>

        {/* 五行バー */}
        <div className="space-y-1">
          <div className="text-[10px] text-purple-400">五行バランス</div>
          {(Object.entries(meishiki.elements) as [Element, number][]).map(([el, n]) => (
            <div key={el} className="flex items-center gap-1.5">
              <span className="text-[10px] w-3 font-bold" style={{ color: ELEMENT_COLORS[el] }}>{el}</span>
              <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${(n / total) * 100}%`,
                  backgroundColor: ELEMENT_COLORS[el],
                  minWidth: n > 0 ? "4px" : "0",
                }} />
              </div>
              <span className="text-[10px] text-purple-300 w-3 text-right">{n}</span>
            </div>
          ))}
        </div>

        {/* 日主 */}
        <div className="text-center bg-amber-500/10 border border-amber-400/30 rounded py-1.5">
          <div className="text-[10px] text-amber-300">日主（あなたの本質）</div>
          <div className="text-amber-100 font-bold text-sm">
            {meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------
 * 因縁バッジ色
 * ------------------------------------------------------------ */
function bondBadgeClass(b: CompatibilityBond) {
  if (b.polarity === "吉") return "bg-emerald-900/60 text-emerald-100 border border-emerald-400/40";
  if (b.polarity === "凶") return "bg-rose-900/60 text-rose-100 border border-rose-400/40";
  return "bg-amber-900/60 text-amber-100 border border-amber-400/40";
}

/* ------------------------------------------------------------
 * メインビュー
 * ------------------------------------------------------------ */
function CompatibilityInner() {
  const [self, setSelf] = useState<PersonInput>(emptyInput);
  const [other, setOther] = useState<PersonInput>(emptyInput);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // 初期値の復元
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_SELF);
      if (s) setSelf(JSON.parse(s));
      const o = localStorage.getItem(LS_OTHER);
      if (o) setOther(JSON.parse(o));
      // ホームの fortune_input からも初回の自分側をデフォルト復元
      if (!s) {
        const fromHome = localStorage.getItem("fortune_input");
        if (fromHome) {
          const d = JSON.parse(fromHome);
          setSelf({
            year: d.year ?? "", month: d.month ?? "", day: d.day ?? "",
            hour: d.hour ?? "", minute: d.minute ?? "", gender: (d.gender as Gender) ?? "",
          });
        }
      }
    } catch {}
  }, []);

  const computed = useMemo(() => {
    const valid = (p: PersonInput) =>
      p.year !== "" && p.month !== "" && p.day !== "" &&
      !isNaN(Number(p.year)) && !isNaN(Number(p.month)) && !isNaN(Number(p.day));
    if (!valid(self) || !valid(other)) return null;

    const toMei = (p: PersonInput): Meishiki => {
      const h = p.hour !== "" && !isNaN(Number(p.hour)) ? Number(p.hour) : undefined;
      const m = p.minute !== "" && !isNaN(Number(p.minute)) ? Number(p.minute) : 0;
      return calculateMeishiki(Number(p.year), Number(p.month), Number(p.day), h, m);
    };
    const selfMei = toMei(self);
    const otherMei = toMei(other);
    const result = analyzeCompatibility(selfMei, otherMei);
    return { selfMei, otherMei, result };
  }, [self, other]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!self.year || !self.month || !self.day) {
      setError("あなたの生年月日を入力してください");
      return;
    }
    if (!other.year || !other.month || !other.day) {
      setError("相手の生年月日を入力してください");
      return;
    }
    if (!computed) {
      setError("入力値に誤りがあります");
      return;
    }
    try {
      localStorage.setItem(LS_SELF, JSON.stringify(self));
      localStorage.setItem(LS_OTHER, JSON.stringify(other));
    } catch {}
    setSubmitted(true);
    // 結果エリアへスクロール
    setTimeout(() => {
      document.getElementById("compat-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const reset = () => {
    setSubmitted(false);
    setError("");
  };

  const dateLabel = (p: PersonInput, gender: Gender) => {
    const date = `${p.year}.${p.month}.${p.day}`;
    const time = p.hour !== ""
      ? ` ${String(Number(p.hour)).padStart(2, "0")}:${String(Number(p.minute || "0")).padStart(2, "0")}`
      : "";
    const g = gender ? `・${gender}` : "";
    return `${date}${time}${g}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center space-y-2 pt-2">
          <h1 className="text-white text-2xl sm:text-3xl font-bold">💞 相性・因縁 鑑定</h1>
          <p className="text-purple-300 text-sm max-w-2xl mx-auto">
            お二人の四柱推命を左右に並べて比較し、干合・三合・六合・沖・刑・害などの「因縁」を読み解きます。
            いい面・気をつける面・異なる面を細かく分析してコメントします。
          </p>
        </div>

        {/* ── 入力フォーム ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonForm title="👤 あなた（左側）" color="blue" value={self} onChange={setSelf} />
            <PersonForm title="🧑 相手（右側）" color="rose" value={other} onChange={setOther} />
          </div>

          {error && (
            <div className="text-center text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg py-2">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-5 text-lg">
              💞 相性を鑑定する
            </Button>
            {submitted && (
              <Button type="button" variant="outline" onClick={reset}
                className="border-purple-500/30 text-purple-200 hover:bg-purple-900/50">
                入力をやり直す
              </Button>
            )}
          </div>
        </form>

        {/* ── 結果 ── */}
        {submitted && computed && (
          <div id="compat-result" className="space-y-6 scroll-mt-8">
            {/* 総評カード */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/40 border-pink-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <span>🔮</span>総合鑑定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/30 rounded-lg py-3">
                    <div className="text-purple-300 text-xs">相性スコア</div>
                    <div className="text-pink-200 font-bold text-3xl">{computed.result.overallScore}</div>
                    <div className="text-purple-400 text-[10px]">/100</div>
                  </div>
                  <div className="bg-black/30 rounded-lg py-3">
                    <div className="text-purple-300 text-xs">因縁の数</div>
                    <div className="text-amber-200 font-bold text-3xl">{computed.result.bonds.length}</div>
                    <div className="text-purple-400 text-[10px]">件</div>
                  </div>
                  <div className="bg-black/30 rounded-lg py-3">
                    <div className="text-purple-300 text-xs">結びつき</div>
                    <div className="text-emerald-200 font-bold text-lg pt-1.5">{computed.result.karmaStrength}</div>
                  </div>
                </div>
                <p className="text-purple-100 leading-relaxed text-sm">
                  {computed.result.summary}
                </p>
                <div className="bg-white/5 rounded-lg p-3 text-xs">
                  <p className="text-purple-300 font-semibold mb-1">日干関係（二人の核同士の関係）</p>
                  <p className="text-purple-100 leading-relaxed">
                    {computed.result.dayStarRelation.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 左右の命式比較 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white text-base font-semibold">📜 命式比較</span>
                <span className="text-purple-400 text-xs">左があなた・右が相手</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MeishikiCompactCard
                  title="👤 あなた"
                  accent="blue"
                  meishiki={computed.selfMei}
                  dateLabel={dateLabel(self, self.gender)}
                />
                <MeishikiCompactCard
                  title="🧑 相手"
                  accent="rose"
                  meishiki={computed.otherMei}
                  dateLabel={dateLabel(other, other.gender)}
                />
              </div>
            </div>

            {/* 深掘り鑑定（800字前後の詳細分析） */}
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-400/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <span>📖</span>深掘り鑑定（{computed.result.deepDive.totalChars}字）
                </CardTitle>
                <p className="text-purple-300 text-xs leading-relaxed">
                  日常・衝突時・価値観・コミュニケーション・長期展望の5観点から、具体的なシーンを例に二人の相性を詳細に鑑定します。
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { icon: "🌤️", title: "日常シーンでの相性", color: "sky", body: computed.result.deepDive.daily },
                  { icon: "⚔️", title: "衝突したときの傾向と対処", color: "rose", body: computed.result.deepDive.conflict },
                  { icon: "🏡", title: "価値観・ライフスタイルの重なりと違い", color: "emerald", body: computed.result.deepDive.values },
                  { icon: "💬", title: "コミュニケーションスタイル", color: "amber", body: computed.result.deepDive.communication },
                  { icon: "🌱", title: "長期的な展望（3年・5年・10年）", color: "violet", body: computed.result.deepDive.longTerm },
                ] as const).map((sec) => {
                  const colorMap: Record<string, { bar: string; title: string; box: string }> = {
                    sky:     { bar: "border-sky-400/70",     title: "text-sky-200",     box: "bg-sky-900/20" },
                    rose:    { bar: "border-rose-400/70",    title: "text-rose-200",    box: "bg-rose-900/20" },
                    emerald: { bar: "border-emerald-400/70", title: "text-emerald-200", box: "bg-emerald-900/20" },
                    amber:   { bar: "border-amber-400/70",   title: "text-amber-200",   box: "bg-amber-900/20" },
                    violet:  { bar: "border-violet-400/70",  title: "text-violet-200",  box: "bg-violet-900/20" },
                  };
                  const c = colorMap[sec.color];
                  return (
                    <div key={sec.title} className={`${c.box} rounded-lg p-4 border-l-4 ${c.bar}`}>
                      <div className={`${c.title} font-semibold text-sm mb-2 flex items-center gap-1.5`}>
                        <span className="text-base">{sec.icon}</span>{sec.title}
                      </div>
                      <p className="text-purple-50 text-sm leading-relaxed whitespace-pre-line">
                        {sec.body}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 因縁の一覧 */}
            <Card className="bg-white/5 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>🔗</span>検出された因縁（{computed.result.bonds.length}件）
                </CardTitle>
                <p className="text-purple-400 text-xs">
                  お二人の年柱・月柱・日柱・時柱を総当たりで照合し、干合・三合・六合・沖・刑・害・破などの結びつきを抽出しました。
                </p>
              </CardHeader>
              <CardContent>
                {computed.result.bonds.length === 0 ? (
                  <p className="text-purple-300 text-sm">
                    目立った因縁（合・沖・刑・害など）は検出されませんでした。
                    独立した関係で、お互いに負担の少ない距離感で付き合えるでしょう。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {computed.result.bonds.map((b, i) => (
                      <div key={i} className="flex flex-wrap items-start gap-2 py-2 px-3 rounded-lg bg-white/5">
                        <Badge className={`shrink-0 text-[10px] ${bondBadgeClass(b)}`}>
                          {b.polarity}｜{b.kind}
                        </Badge>
                        <div className="flex-1 min-w-[200px]">
                          <div className="text-white text-sm font-semibold">
                            {b.label}
                            <span className="text-purple-400 text-[11px] ml-2 font-normal">
                              （あなたの{b.selfPos}柱 × 相手の{b.otherPos}柱）
                            </span>
                          </div>
                          <p className="text-purple-200 text-xs mt-0.5 leading-relaxed">{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 五行バランス比較 */}
            <Card className="bg-white/5 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>🌿</span>五行バランス比較
                </CardTitle>
                <p className="text-purple-400 text-xs">
                  お二人の五行量を並べて比較。相手にあって自分に無いもの（＝補い合える要素）が最大の強みになります。
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {computed.result.elementCompare.map((row) => (
                  <div key={row.element} className="grid grid-cols-[28px_1fr_28px_1fr_28px] items-center gap-2">
                    <span className="text-xs text-blue-200 text-right">{row.self}</span>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden flex justify-end">
                      <div className="h-full" style={{
                        width: `${Math.min(100, row.self * 20)}%`,
                        backgroundColor: ELEMENT_COLORS[row.element],
                        opacity: 0.8,
                      }} />
                    </div>
                    <span className="font-bold text-sm text-center"
                      style={{ color: ELEMENT_COLORS[row.element] }}>
                      {row.element}
                    </span>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full" style={{
                        width: `${Math.min(100, row.other * 20)}%`,
                        backgroundColor: ELEMENT_COLORS[row.element],
                        opacity: 0.8,
                      }} />
                    </div>
                    <span className="text-xs text-rose-200">{row.other}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[10px] text-purple-400 px-1 pt-1">
                  <span>← あなた</span>
                  <span>相手 →</span>
                </div>
                <div className="pt-3 space-y-1.5">
                  {computed.result.elementCompare.map((row) => (
                    <div key={`c-${row.element}`} className="text-xs">
                      <span className="font-bold mr-2" style={{ color: ELEMENT_COLORS[row.element] }}>
                        {row.element}
                      </span>
                      <span className="text-purple-200">{row.comment}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 良い面 */}
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-100 flex items-center gap-2">
                  <span>✅</span>いい面（合う面）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {computed.result.goodPoints.map((t, i) => (
                    <li key={i} className="text-emerald-50 text-sm leading-relaxed pl-3 border-l-2 border-emerald-400/50">
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 気をつける面 */}
            <Card className="bg-gradient-to-br from-rose-900/30 to-pink-900/20 border-rose-500/30">
              <CardHeader>
                <CardTitle className="text-rose-100 flex items-center gap-2">
                  <span>⚠️</span>気をつける面
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {computed.result.cautionPoints.map((t, i) => (
                    <li key={i} className="text-rose-50 text-sm leading-relaxed pl-3 border-l-2 border-rose-400/50">
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 異なる面 */}
            <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-100 flex items-center gap-2">
                  <span>🔀</span>異なる面（個性の違い）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {computed.result.differentPoints.map((t, i) => (
                    <li key={i} className="text-amber-50 text-sm leading-relaxed pl-3 border-l-2 border-amber-400/50">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="text-amber-300/80 text-[11px] mt-3 leading-relaxed">
                  ※ 五行の違いは短所ではなく「お互いの役割分担」の材料。違いを尊重できると、関係は長く深まります。
                </p>
              </CardContent>
            </Card>

            {/* 次のアクション */}
            <div className="text-center pt-4">
              <Link href="/">
                <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-900/50">
                  トップに戻る
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <p className="text-purple-300">読み込み中...</p>
      </div>
    }>
      <CompatibilityInner />
    </Suspense>
  );
}
