"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { PremiumText } from "@/components/PremiumText";
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
        <h1 className="text-center text-white text-2xl font-bold">星座占い 鑑定結果</h1>
        <div className="text-center text-purple-300">
          {year ? `${year}年` : ""}{month}月{day}日 生まれ
        </div>
        <p className="text-center text-purple-400 text-sm px-4">
          同じ星座でも10日区切りのデカンで性格が異なります。36タイプで読み解くあなたの星座エネルギーです。
        </p>

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

        {/* デカン */}
        <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-400/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🌟</span>
                第{result.decan.number}デカン（{result.decan.dateRange}）
              </CardTitle>
              <Badge className="bg-indigo-700/50 text-indigo-200 text-xs">
                副支配星: {result.decan.subRuler}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed text-[15px]">{result.decan.description}</p>
          </CardContent>
        </Card>

        {/* 性格の特徴 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">{result.sign}の性格</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{result.description}</p>
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
            <p className="text-purple-100 leading-relaxed">{result.temperament}</p>
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

        {/* 守護星の影響 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🪐</span>守護星「{result.rulingPlanet}」の影響
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{result.planetInfluence}</p>
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
            <p className="text-purple-100 leading-relaxed">{result.behaviorPattern}</p>
          </CardContent>
        </Card>

        {/* ラッキー情報 & 相性 */}
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

        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">相性の良い星座</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-purple-300 text-xs text-center">「{result.sign}」と特に波長が合いやすい星座です</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.compatibility.map((c) => (
                <Badge key={c} className="bg-pink-900/50 text-pink-200 text-sm">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 対人傾向 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-xl">💬</span>対人傾向・コミュニケーション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed">{result.interpersonal}</p>
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

        {/* 他の占術リンク */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/result?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">四柱推命 &rarr;</Button>
          </Link>
          <Link href={`/numerology?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">数秘術 &rarr;</Button>
          </Link>
          <Link href={`/animal?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">動物占い &rarr;</Button>
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
