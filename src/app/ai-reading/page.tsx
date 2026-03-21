"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { calculateMeishiki, getPersonality } from "@/lib/shichusuimei";
import { getNumerologyResult } from "@/lib/numerology";
import { calculateAnimal } from "@/lib/animal";

function AIReadingContent() {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));
  const hourParam = searchParams.get("hour");
  const hour = hourParam ? Number(hourParam) : undefined;

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const meishiki = calculateMeishiki(year, month, day, hour);
  const personality = getPersonality(meishiki.dayStem);
  const numerology = getNumerologyResult(year, month, day);
  const animal = calculateAnimal(year, month, day);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: `${year}年${month}月${day}日`,
          meishiki: {
            dayStem: meishiki.dayStem,
            personalityTitle: personality.title,
            strengths: personality.strengths.join("、"),
            weaknesses: personality.weaknesses.join("、"),
            elements: meishiki.elements,
          },
          numerology: {
            lifePathNumber: numerology.lifePathNumber,
            title: numerology.title,
          },
          animal: {
            animal: animal.animal,
            title: animal.title,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReading(data.reading);
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const params = `year=${year}&month=${month}&day=${day}${hour !== undefined ? `&hour=${hour}` : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日 生まれ
        </div>

        {/* 鑑定元データサマリー */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">四柱推命</p>
              <p className="text-white font-semibold">{personality.title}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">数秘術</p>
              <p className="text-white font-semibold">No.{numerology.lifePathNumber}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <p className="text-purple-400 text-xs">動物占い</p>
              <p className="text-white font-semibold">{animal.emoji} {animal.animal}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI鑑定結果 */}
        {!reading && !loading && (
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-5xl">🤖</div>
              <h3 className="text-white text-xl font-semibold">AI総合鑑定</h3>
              <p className="text-purple-200 text-sm">
                3つの占術（四柱推命・数秘術・動物占い）の結果を
                <br />
                AIが統合して、あなただけの鑑定文を生成します。
              </p>
              <Button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg px-8 py-6"
              >
                AI鑑定を開始する
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="bg-white/10 border-purple-500/30">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-5xl animate-pulse">🔮</div>
              <p className="text-purple-200">AIが鑑定文を生成しています...</p>
              <p className="text-purple-400 text-sm">20〜30秒ほどお待ちください</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-red-300">{error}</p>
              <Button onClick={handleGenerate} className="mt-3 bg-purple-600 text-white">
                再試行する
              </Button>
            </CardContent>
          </Card>
        )}

        {reading && (
          <Card className="bg-white/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>🤖</span> AI総合鑑定結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                {reading}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function AIReadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <AIReadingContent />
    </Suspense>
  );
}
