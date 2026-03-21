"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HomePage() {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day) return;
    const params = new URLSearchParams({ year, month, day });
    if (hour) params.set("hour", hour);
    router.push(`/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-white">四柱推命</h1>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-purple-200">
              ログイン
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              無料登録
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center px-4 pt-16 pb-24">
        <div className="text-center mb-12">
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

        {/* 入力フォーム */}
        <Card className="w-full max-w-md bg-white/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              無料で占う
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6"
              >
                無料で占う
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 特徴 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl w-full">
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
