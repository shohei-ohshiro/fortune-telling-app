"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { PremiumText } from "@/components/PremiumText";
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
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <h1 className="text-center text-white text-2xl font-bold">数秘術 鑑定結果</h1>
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日 生まれ
        </div>
        <p className="text-center text-purple-400 text-sm px-4">
          生年月日を1桁に還元した「ライフパスナンバー」が、あなたの本質・才能・人生テーマを映し出します。
        </p>

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

        {/* 数字の意味 */}
        <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-400/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🔢</span>
              ナンバー「{result.lifePathNumber}」の意味
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed text-[15px]">{result.numberMeaning}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white">ナンバー{result.lifePathNumber}の本質</CardTitle></CardHeader>
          <CardContent><p className="text-purple-100 leading-relaxed">{result.description}</p></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🔥</span>気質・本質
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-purple-100 leading-relaxed">{result.temperament}</p></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white">強み・弱み</CardTitle></CardHeader>
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

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">⚡</span>行動パターン
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-purple-100 leading-relaxed">{result.behaviorPattern}</p></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">💬</span>対人傾向・コミュニケーション
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-purple-100 leading-relaxed">{result.interpersonal}</p></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white">相性の良いナンバー</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-purple-300 text-xs text-center">「{result.title}」と補完・共鳴しやすいナンバーです</p>
            <div className="flex gap-4 justify-center">
              {result.compatibility.map((n) => (
                <div key={n} className="w-14 h-14 rounded-full bg-purple-600/50 flex items-center justify-center text-white text-xl font-bold border border-purple-400/50">
                  {n}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ─── 詳細鑑定 ─── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-purple-500/30" />
          <Badge className="bg-purple-900/50 text-purple-200 text-sm px-4 py-1">🔮 詳細鑑定レポート</Badge>
          <div className="flex-1 h-px bg-purple-500/30" />
        </div>

        <Card className="bg-gradient-to-br from-rose-900/30 to-pink-900/30 border-rose-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💕</span>恋愛傾向</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.loveAnalysis} /></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💑</span>相性の良いタイプ</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.compatibleType} /></CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💼</span>キャリア適性分析</CardTitle></CardHeader>
          <CardContent>
            <PremiumText text={result.careerAnalysis} />
            <div className="mt-4">
              <h4 className="text-amber-400 font-semibold mb-2">向いている職種</h4>
              <div className="flex flex-wrap gap-2">
                {result.suitableCareers.map((c) => (
                  <Badge key={c} className="bg-amber-900/50 text-amber-200">{c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">✨</span>隠れた才能</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.hiddenTalent} /></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">💰</span>金運傾向</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.moneyFortune} /></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">🧭</span>人生の方向性</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.lifeDirection} /></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">🔄</span>今年の転機</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.yearlyTurningPoint} /></CardContent>
        </Card>

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">📈</span>今後の伸ばし方</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.growthAdvice} /></CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><span className="text-xl">👑</span>人を惹きつける強み</CardTitle></CardHeader>
          <CardContent><PremiumText text={result.attractionStrength} /></CardContent>
        </Card>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/result?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">四柱推命 &rarr;</Button>
          </Link>
          <Link href={`/animal?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">動物占い &rarr;</Button>
          </Link>
          <Link href={`/zodiac?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">星座占い &rarr;</Button>
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
