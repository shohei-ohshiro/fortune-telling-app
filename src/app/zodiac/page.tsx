"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

        {/* デカン（個人別の詳細） */}
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

        {/* 性格の詳細解説 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">性格の特徴</CardTitle>
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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.compatibility.map((c) => (
                <Badge key={c} className="bg-pink-900/50 text-pink-200 text-sm">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-purple-500/30" />

        {/* キャリア適性分析（プレミアム - ぼかし） */}
        <div className="relative">
          <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">💼</span>キャリア適性分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="blur-[6px] select-none pointer-events-none" aria-hidden="true">
                  <p className="text-purple-100 leading-relaxed">{result.careerAnalysis}</p>
                  <div className="mt-4">
                    <h4 className="text-amber-400 font-semibold mb-2">向いている職種</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suitableCareers.map((c) => (
                        <Badge key={c} className="bg-amber-900/50 text-amber-200">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-purple-950/60 to-purple-950/80 rounded-lg">
                  <div className="text-center space-y-3 px-4">
                    <div className="text-4xl">🔒</div>
                    <p className="text-white font-semibold text-lg">プレミアム限定コンテンツ</p>
                    <p className="text-purple-200 text-sm">
                      あなたの星座に基づいた<br />
                      詳細なキャリア適性分析を閲覧できます
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* リーダーシップ & 隠れた才能（プレミアム - ぼかし） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <span>👑</span>リーダーシップ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="blur-[6px] select-none pointer-events-none" aria-hidden="true">
                    <p className="text-purple-100 text-sm leading-relaxed">{result.leadershipStyle}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-purple-950/60 to-purple-950/80 rounded-lg">
                    <div className="text-center space-y-1">
                      <div className="text-2xl">🔒</div>
                      <p className="text-white text-sm font-semibold">プレミアムで解放</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative">
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <span>✨</span>隠れた才能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="blur-[6px] select-none pointer-events-none" aria-hidden="true">
                    <p className="text-purple-100 text-sm leading-relaxed">{result.hiddenTalent}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-purple-950/60 to-purple-950/80 rounded-lg">
                    <div className="text-center space-y-1">
                      <div className="text-2xl">🔒</div>
                      <p className="text-white text-sm font-semibold">プレミアムで解放</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 課金CTA */}
        <Card className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-purple-400/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg">おすすめ</div>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-4xl">🔮</div>
            <h3 className="text-white text-xl font-bold">
              もっと深く自分を知りませんか？
            </h3>
            <p className="text-purple-200 text-sm leading-relaxed max-w-md mx-auto">
              プレミアムプランでは、あなたの星座とデカンに基づいた
              <span className="text-amber-300 font-semibold">キャリア適性分析</span>、
              <span className="text-amber-300 font-semibold">リーダーシップスタイル</span>、
              <span className="text-amber-300 font-semibold">隠れた才能</span>
              など、人生に役立つ深い鑑定が見放題になります。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              {/* サブスク */}
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-purple-300 text-xs mb-1">サブスク（全占術見放題）</p>
                <div className="text-white">
                  <span className="text-2xl font-bold">¥980</span>
                  <span className="text-purple-300 text-sm">/月</span>
                </div>
                <Link href="/pricing">
                  <Button className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white w-full">
                    プレミアムプランを見る
                  </Button>
                </Link>
              </div>

              <span className="text-purple-400 text-sm">or</span>

              {/* 買い切り */}
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-purple-300 text-xs mb-1">星座占い 深掘り鑑定</p>
                <div className="text-white">
                  <span className="text-2xl font-bold">¥400</span>
                  <span className="text-purple-300 text-sm">（買い切り）</span>
                </div>
                <Link href="/pricing">
                  <Button variant="outline" className="mt-2 border-purple-500/50 text-purple-200 hover:bg-purple-900/50 w-full">
                    個別に購入する
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-purple-400 text-xs">
              サブスクなら四柱推命・数秘術・動物占い・AI総合鑑定も全て含まれます
            </p>
          </CardContent>
        </Card>

        {/* 他の占術リンク */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/result?year=${year}&month=${month}&day=${day}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              四柱推命の結果を見る
            </Button>
          </Link>
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

export default function ZodiacPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <ZodiacContent />
    </Suspense>
  );
}
