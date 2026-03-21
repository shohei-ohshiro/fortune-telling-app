"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getNumerologyResult } from "@/lib/numerology";

function NumerologyContent() {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));

  if (!year || !month || !day) {
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

  const result = getNumerologyResult(year, month, day);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/result?year=${year}&month=${month}&day=${day}`} className="text-purple-300 hover:text-white text-sm">
          &larr; 命式に戻る
        </Link>
        <h1 className="text-xl font-bold text-white">数秘術</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日 生まれ
        </div>

        {/* ライフパスナンバー */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-purple-300 text-sm">あなたのライフパスナンバー</p>
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {result.lifePathNumber}
            </div>
            <p className="text-white text-2xl font-semibold">{result.title}</p>
            {result.lifePathNumber >= 11 && (
              <Badge className="bg-yellow-900/50 text-yellow-200">マスターナンバー</Badge>
            )}
          </CardContent>
        </Card>

        {/* 性格解説 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">あなたの本質</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{result.description}</p>
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

        {/* 相性の良いナンバー */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">相性の良いナンバー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {result.compatibility.map((n) => (
                <div key={n} className="w-14 h-14 rounded-full bg-purple-600/50 flex items-center justify-center text-white text-xl font-bold border border-purple-400/50">
                  {n}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 他の占術リンク */}
        <div className="flex gap-3 justify-center">
          <Link href={`/animal?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">動物占い &rarr;</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function NumerologyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <NumerologyContent />
    </Suspense>
  );
}
