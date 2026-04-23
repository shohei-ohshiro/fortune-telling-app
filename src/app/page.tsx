"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Header } from "@/components/Header";

const LS_KEY = "fortune_input";

type FortuneType = "shichusuimei" | "numerology" | "animal" | "zodiac";

const FORTUNE_TYPES: { id: FortuneType; icon: string; name: string; desc: string; path: string }[] = [
  { id: "shichusuimei", icon: "🏛️", name: "四柱推命", desc: "生年月日から命式を算出", path: "/result" },
  { id: "numerology", icon: "🔢", name: "数秘術", desc: "ライフパスナンバーで診断", path: "/numerology" },
  { id: "animal", icon: "🐾", name: "動物占い", desc: "あなたの動物キャラは？", path: "/animal" },
  { id: "zodiac", icon: "⭐", name: "星座占い", desc: "12星座で性格診断", path: "/zodiac" },
];

export default function HomePage() {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [gender, setGender] = useState<"男" | "女" | "">("");
  const [selectedType, setSelectedType] = useState<FortuneType>("shichusuimei");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // マウント時: URLパラメータ → localStorage の優先度で前回値を復元
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("year")) {
      setYear(params.get("year")!);
      if (params.get("month")) setMonth(params.get("month")!);
      if (params.get("day")) setDay(params.get("day")!);
      if (params.get("hour") != null) setHour(params.get("hour")!);
      if (params.get("minute") != null) setMinute(params.get("minute")!);
      if (params.get("gender")) setGender(params.get("gender") as "男" | "女");
      return;
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.year) setYear(d.year);
        if (d.month) setMonth(d.month);
        if (d.day) setDay(d.day);
        if (d.hour !== undefined) setHour(d.hour);
        if (d.minute !== undefined) setMinute(d.minute);
        if (d.gender) setGender(d.gender);
      }
    } catch {}
  }, []);

  const handleHourChange = (val: string) => {
    setHour(val);
    // 時が消えたら分もリセット
    if (val === "") setMinute("");
    if (errors.hour) setErrors((e) => ({ ...e, hour: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day) return;

    // JS 側バリデーション（HTML min/max は脆弱なため）
    const newErrors: Record<string, string> = {};
    if (hour !== "") {
      const h = Number(hour);
      if (isNaN(h) || h < 0 || h > 23) newErrors.hour = "0〜23 の値を入力してください";
    }
    if (minute !== "" && hour !== "") {
      const m = Number(minute);
      if (isNaN(m) || m < 0 || m > 59) newErrors.minute = "0〜59 の値を入力してください";
    }
    if (Object.keys(newErrors).some((k) => newErrors[k])) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const params = new URLSearchParams({ year, month, day });
    // ★ hour = "0"（深夜0時）は falsy なので !== "" で判定
    if (hour !== "") {
      params.set("hour", String(Number(hour)));
      if (minute !== "") params.set("minute", String(Number(minute)));
    }
    if (selectedType === "shichusuimei" && gender) params.set("gender", gender);

    // 次回訪問時のために保存
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ year, month, day, hour, minute, gender }));
    } catch {}

    const fortune = FORTUNE_TYPES.find((f) => f.id === selectedType)!;
    router.push(`${fortune.path}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      {/* Hero */}
      <main className="flex flex-col items-center px-4 pt-12 pb-24">
        <div className="text-center mb-10">
          <p className="text-purple-300 text-lg mb-2">
            あなたの運命を読み解く
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            四柱推命 × 占術総合鑑定
          </h1>
          <p className="text-purple-200 max-w-md mx-auto">
            生年月日から、あなたの性格・強み・運勢を本格鑑定。
            <br />
            まずは無料でお試しください。
          </p>
        </div>

        {/* 占術選択 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-6">
          {FORTUNE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`rounded-xl p-3 text-center transition-all ${
                selectedType === type.id
                  ? "bg-purple-600/50 border-2 border-purple-400 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-2 border-transparent hover:bg-white/10"
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <p className="text-white font-semibold text-sm">{type.name}</p>
              <p className="text-purple-300 text-xs mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>

        {/* 入力フォーム */}
        <Card className="w-full max-w-md bg-white/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {FORTUNE_TYPES.find((f) => f.id === selectedType)?.icon}{" "}
              {FORTUNE_TYPES.find((f) => f.id === selectedType)?.name}で占う
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-purple-200">生年月日</Label>
                <Input
                  type="date"
                  value={year && month && day
                    ? `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                    : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) { setYear(""); setMonth(""); setDay(""); return; }
                    const [y, m, d] = v.split("-");
                    setYear(String(Number(y)));
                    setMonth(String(Number(m)));
                    setDay(String(Number(d)));
                  }}
                  min="1920-01-01"
                  max="2030-12-31"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 mt-1"
                  required
                />
              </div>

              {selectedType === "shichusuimei" && (
                <>
                  {/* 出生時刻 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-purple-200">出生時刻</Label>
                      <span className="text-purple-500 text-xs">わかる方のみ・任意</span>
                    </div>
                    <Input
                      type="time"
                      value={hour !== ""
                        ? `${String(Number(hour)).padStart(2, "0")}:${String(Number(minute || "0")).padStart(2, "0")}`
                        : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) {
                          setHour(""); setMinute("");
                          if (errors.hour) setErrors((er) => ({ ...er, hour: "" }));
                          if (errors.minute) setErrors((er) => ({ ...er, minute: "" }));
                          return;
                        }
                        const [h, m] = v.split(":");
                        handleHourChange(String(Number(h)));
                        setMinute(String(Number(m)));
                        if (errors.minute) setErrors((er) => ({ ...er, minute: "" }));
                      }}
                      className={`bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 ${errors.hour ? "border-red-500" : ""}`}
                    />
                    {(errors.hour || errors.minute) && (
                      <p className="text-red-400 text-xs mt-0.5">{errors.hour || errors.minute}</p>
                    )}
                  </div>

                  {/* 性別 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-purple-200">性別</Label>
                      <span className="text-purple-500 text-xs">大運（10年周期）の算出に必要</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGender(gender === "男" ? "" : "男")}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          gender === "男"
                            ? "bg-blue-600/50 border-blue-400 text-white"
                            : "bg-white/5 border-white/20 text-purple-300 hover:bg-white/10"
                        }`}
                      >
                        ♂ 男性
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender(gender === "女" ? "" : "女")}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          gender === "女"
                            ? "bg-pink-600/50 border-pink-400 text-white"
                            : "bg-white/5 border-white/20 text-purple-300 hover:bg-white/10"
                        }`}
                      >
                        ♀ 女性
                      </button>
                    </div>
                    {!gender && (
                      <p className="text-purple-500 text-xs mt-1">
                        未選択でも占えます（大運は表示されません）
                      </p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6"
              >
                無料で占う
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 相性・因縁鑑定 CTA */}
        <div className="mt-8 w-full max-w-md">
          <Link href="/compatibility" className="block">
            <div className="bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-purple-600/30 border border-pink-400/40 rounded-2xl p-5 hover:from-rose-600/40 hover:to-purple-600/40 transition">
              <div className="flex items-center gap-4">
                <div className="text-4xl">💞</div>
                <div className="flex-1">
                  <p className="text-white font-bold text-base">相性・因縁を鑑定</p>
                  <p className="text-pink-100 text-xs mt-0.5">
                    お二人の命式を並べて因縁・相性・合う面／気をつける面を分析
                  </p>
                </div>
                <span className="text-pink-200 text-xl">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 詳細鑑定レポートの紹介 */}
        <div className="mt-10 w-full max-w-2xl">
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="text-center mb-4">
              <p className="text-purple-200 text-sm font-medium mb-1">詳細鑑定レポート</p>
              <p className="text-white text-lg font-bold">9項目の本格レポートがすべて読めます</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "💕", name: "恋愛傾向" },
                { icon: "💼", name: "キャリア適性" },
                { icon: "💰", name: "金運・財運" },
                { icon: "🌟", name: "隠れた才能" },
                { icon: "⚠️", name: "注意すべき癖" },
                { icon: "🤝", name: "相性タイプ" },
                { icon: "📅", name: "今年の運勢" },
                { icon: "🔮", name: "5年の大運" },
                { icon: "🌙", name: "開運アドバイス" },
              ].map((item) => (
                <div key={item.name} className="bg-white/5 rounded-lg py-2 px-1">
                  <div className="text-lg mb-0.5">{item.icon}</div>
                  <p className="text-purple-200 text-xs">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 全占術一覧 */}
        <div className="mt-12 w-full max-w-2xl">
          <h2 className="text-white text-lg font-semibold text-center mb-4">すべての占術</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: "🏛️", name: "四柱推命", desc: "命式・性格・運勢", path: "/result" },
              { icon: "💞", name: "相性・因縁", desc: "お二人の因縁分析", path: "/compatibility" },
              { icon: "🔢", name: "数秘術", desc: "ライフパスナンバー", path: "/numerology" },
              { icon: "🐾", name: "動物占い", desc: "動物キャラ診断", path: "/animal" },
              { icon: "⭐", name: "星座占い", desc: "12星座で性格診断", path: "/zodiac" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition block"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.name}</p>
                <p className="text-purple-300 text-xs mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 特徴 */}
        <div className="mt-12 max-w-2xl w-full">
          <h2 className="text-white text-lg font-semibold text-center mb-6">このサービスの特徴</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📖", title: "本格四柱推命", desc: "伝統的な命術で鑑定" },
              { icon: "🔮", title: "4占術対応", desc: "四柱推命・数秘術・動物占い・星座占い" },
              { icon: "🔄", title: "毎日更新", desc: "日運を毎日チェック" },
              { icon: "🎁", title: "完全無料", desc: "すべての鑑定項目を公開" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-purple-300 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 w-full max-w-2xl">
          <h2 className="text-white text-xl font-bold text-center mb-6">よくある質問</h2>
          <div className="space-y-4">
            {[
              {
                q: "本当に無料で使えますか？",
                a: "はい、すべての鑑定項目を完全無料でご利用いただけます。四柱推命の命式・基本性格・気質・強み弱み・恋愛・キャリア・金運など9項目の詳細鑑定まで、追加料金なしで読めます。",
              },
              {
                q: "出生時刻がわからなくても占えますか？",
                a: "はい、占えます。出生時刻は四柱推命の「時柱」の算出に使用しますが、任意入力です。わからない場合は年・月・日のみで年柱・月柱・日柱を算出します。より詳細な命式を見たい方のみ時刻を入力してください。",
              },
              {
                q: "四柱推命とほかの占いの違いは？",
                a: "四柱推命は生年月日（＋時刻）から命式を算出する東洋の伝統占術で、性格・運勢・適性を多角的に読み解きます。当サービスでは四柱推命に加え、数秘術・動物占い・星座占いの4占術を組み合わせて、より立体的な自己理解をサポートします。",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-5 border border-purple-500/20">
                <p className="text-white font-semibold mb-2">Q. {item.q}</p>
                <p className="text-purple-200 text-sm leading-relaxed">A. {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "本当に無料で使えますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "はい、すべての鑑定項目を完全無料でご利用いただけます。四柱推命の命式・基本性格・気質・強み弱み・恋愛・キャリア・金運など9項目の詳細鑑定まで、追加料金なしで読めます。",
                },
              },
              {
                "@type": "Question",
                name: "出生時刻がわからなくても占えますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "はい、占えます。出生時刻は四柱推命の時柱の算出に使用しますが、任意入力です。わからない場合は年・月・日のみで年柱・月柱・日柱を算出します。",
                },
              },
              {
                "@type": "Question",
                name: "四柱推命とほかの占いの違いは？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "四柱推命は生年月日（＋時刻）から命式を算出する東洋の伝統占術で、性格・運勢・適性を多角的に読み解きます。当サービスでは四柱推命に加え、数秘術・動物占い・星座占いの4占術を組み合わせて、より立体的な自己理解をサポートします。",
                },
              },
            ],
          }),
        }}
      />

      {/* Footer */}
      <footer className="text-center py-6 text-purple-400 text-sm border-t border-purple-900">
        &copy; 2026 四柱推命 占術総合鑑定
      </footer>
    </div>
  );
}
