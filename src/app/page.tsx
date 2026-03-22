"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

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
  const [selectedType, setSelectedType] = useState<FortuneType>("shichusuimei");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day) return;
    const params = new URLSearchParams({ year, month, day });
    if (hour) params.set("hour", hour);
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            四柱推命 × AI 鑑定
          </h2>
          <p className="text-purple-200 max-w-md mx-auto">
            生年月日から、あなたの性格・強み・運勢を本格鑑定。
            <br />
            まずは無料でお試しください。
          </p>
        </div>

        {/* 占術選択 */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-lg mb-6">
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
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <Input
                      type="number"
                      placeholder="1990"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      min="1920"
                      max="2030"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                      required
                    />
                    <span className="text-xs text-purple-300 mt-0.5 block text-center">年</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="1"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      min="1"
                      max="12"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                      required
                    />
                    <span className="text-xs text-purple-300 mt-0.5 block text-center">月</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="1"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      min="1"
                      max="31"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400"
                      required
                    />
                    <span className="text-xs text-purple-300 mt-0.5 block text-center">日</span>
                  </div>
                </div>
              </div>

              {selectedType === "shichusuimei" && (
                <div>
                  <Label className="text-purple-200">
                    出生時刻（わかる方のみ）
                  </Label>
                  <div className="mt-1">
                    <Input
                      type="number"
                      placeholder="例: 14"
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      min="0"
                      max="23"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 w-24"
                    />
                    <span className="text-xs text-purple-300 mt-0.5 block">時（0〜23時）</span>
                  </div>
                </div>
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

        {/* 全占術一覧 */}
        <div className="mt-12 w-full max-w-2xl">
          <h3 className="text-white text-lg font-semibold text-center mb-4">すべての占術</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🏛️", name: "四柱推命", desc: "命式・性格・運勢" },
              { icon: "🔢", name: "数秘術", desc: "ライフパスナンバー" },
              { icon: "🐾", name: "動物占い", desc: "動物キャラ診断" },
              { icon: "⭐", name: "星座占い", desc: "12星座で性格診断" },
              { icon: "🤖", name: "AI総合鑑定", desc: "全占術を統合分析" },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                <p className="text-purple-300 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 特徴 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl w-full">
          {[
            { icon: "📖", title: "本格四柱推命", desc: "伝統的な命術で鑑定" },
            { icon: "🔄", title: "毎日更新", desc: "日運を毎日チェック" },
            { icon: "🤖", title: "AI鑑定", desc: "AIが詳しく解説" },
            { icon: "💰", title: "無料で試せる", desc: "基本鑑定は無料" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="text-white font-semibold text-sm">{item.title}</h3>
              <p className="text-purple-300 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-purple-400 text-sm border-t border-purple-900">
        &copy; 2026 四柱推命 AI鑑定
      </footer>
    </div>
  );
}
