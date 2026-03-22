"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { calculateZodiac, ELEMENT_COLORS } from "@/lib/zodiac";

function ZodiacContent() {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));

  if (!month || !day) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6">
            <p className="text-purple-200">生年月日を入力してください。</p>
            <Link href="/"><Button className="mt-4 bg-purple-600 text-white">トップに戻る</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = calculateZodiac(month, day);
  const elementColor = ELEMENT_COLORS[result.element] || '#a78bfa';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center text-purple-300">
          {year ? `${year}年` : ""}{month}月{day}日 生まれ
        </div>

        {/* 星座カード */}
        <Card className="bg-white/10 border-purple-500/30 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-8 text-center">
            <div className="text-7xl mb-3">{result.emoji}</div>
            <h2 className="text-3xl font-bold text-white">{result.sign}</h2>
            <p className="text-purple-200 text-lg mt-1">{result.title}</p>
            <p className="text-purple-400 text-sm mt-2">{result.dateRange}</p>
          </div>
        </Card>

        {/* 基本情報 */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">エレメント</p>
              <p className="text-lg font-bold mt-1" style={{ color: elementColor }}>
                {result.element}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">クオリティ</p>
              <p className="text-white font-semibold mt-1">{result.quality}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">守護星</p>
              <p className="text-white font-semibold mt-1">{result.rulingPlanet}</p>
            </CardContent>
          </Card>
        </div>

        {/* 性格解説 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">性格</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{result.description}</p>
          </CardContent>
        </Card>

        {/* 強み・弱み */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="text-green-400 font-semibold mb-2">強み</h4>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((s) => (
                  <Badge key={s} className="bg-green-900/50 text-green-200">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-orange-400 font-semibold mb-2">弱み</h4>
              <div className="flex flex-wrap gap-2">
                {result.weaknesses.map((w) => (
                  <Badge key={w} className="bg-orange-900/50 text-orange-200">{w}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ラッキー情報 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">ラッキーカラー</p>
              <p className="text-white font-semibold mt-1">{result.luckyColor}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">ラッキーナンバー</p>
              <p className="text-white font-semibold mt-1">{result.luckyNumber}</p>
            </CardContent>
          </Card>
        </div>

        {/* 相性 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">相性の良い星座</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.compatibility.map((c) => (
                <Badge key={c} className="bg-pink-900/50 text-pink-200 text-sm">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 他の占術リンク */}
        <div className="text-center space-y-3">
          <Link href={`/result?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              四柱推命の結果を見る &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ZodiacPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <ZodiacContent />
    </Suspense>
  );
}
