"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAnimal } from "@/lib/animal";

function AnimalContent() {
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

  const result = calculateAnimal(year, month, day);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/result?year=${year}&month=${month}&day=${day}`} className="text-purple-300 hover:text-white text-sm">
          &larr; 命式に戻る
        </Link>
        <h1 className="text-xl font-bold text-white">動物占い</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日 生まれ
        </div>

        {/* 動物タイプ */}
        <Card className={`bg-gradient-to-br ${result.color} border-0`}>
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <div className="text-8xl">{result.emoji}</div>
            <p className="text-white/80 text-sm">あなたの動物キャラは</p>
            <h2 className="text-white text-4xl font-bold">{result.animal}</h2>
            <p className="text-white text-lg">{result.title}</p>
          </CardContent>
        </Card>

        {/* 性格解説 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">性格の特徴</CardTitle>
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

        {/* 相性の良い動物 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">相性の良い動物</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {result.compatibility.map((name) => (
                <div key={name} className="text-center">
                  <div className="text-3xl mb-1">
                    {name === 'ペガサス' ? '🦄' : name === 'コジカ' ? '🦌' : name === 'クロヒョウ' ? '🐈‍⬛' : name === 'タヌキ' ? '🦝' : name === 'オオカミ' ? '🐺' : name === 'コアラ' ? '🐨' : name === 'サル' ? '🐵' : name === 'チーター' ? '🐆' : name === 'ライオン' ? '🦁' : name === 'トラ' ? '🐯' : name === 'ゾウ' ? '🐘' : name === 'ヒツジ' ? '🐑' : '🐾'}
                  </div>
                  <span className="text-purple-200 text-sm">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI鑑定リンク */}
        <div className="flex gap-3 justify-center">
          <Link href={`/ai-reading?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white">
              AI総合鑑定を見る &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AnimalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <AnimalContent />
    </Suspense>
  );
}
