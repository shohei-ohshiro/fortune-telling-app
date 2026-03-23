"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
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
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日 生まれ
        </div>

        {/* 動物タイプ */}
        <Card className={`bg-gradient-to-br ${result.color} border-0`}>
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <div className="text-8xl">{result.emoji}</div>
            <p className="text-white/80 text-sm">あなたの動物キャラは（No.{result.characterNumber}）</p>
            <h2 className="text-white text-4xl font-bold">{result.animal}</h2>
            <p className="text-white text-lg">{result.title}</p>
          </CardContent>
        </Card>

        {/* 60分類 固有の解説 */}
        <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border-purple-400/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">{result.emoji}</span>
              「{result.title}」のあなた
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed text-[15px]">{result.uniqueDescription}</p>
          </CardContent>
        </Card>

        {/* 基本性格の詳細解説 */}
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

        {/* 対人傾向・コミュニケーション */}
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
              {result.compatibility.map((name) => {
                const emojiMap: Record<string, string> = {
                  'ペガサス': '🦄', 'こじか': '🦌', '黒ひょう': '🐈‍⬛',
                  'たぬき': '🦝', '狼': '🐺', 'コアラ': '🐨',
                  '猿': '🐵', 'チータ': '🐆', 'ライオン': '🦁',
                  '虎': '🐯', 'ゾウ': '🐘', 'ひつじ': '🐑',
                };
                return (
                  <div key={name} className="text-center">
                    <div className="text-3xl mb-1">{emojiMap[name] || '🐾'}</div>
                    <span className="text-purple-200 text-sm">{name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-purple-500/30" />

        {/* キャリア分析（プレミアム - ぼかし表示） */}
        <div className="relative">
          <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">💼</span>キャリア適性分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ぼかし部分 */}
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

                {/* オーバーレイ */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-purple-950/60 to-purple-950/80 rounded-lg">
                  <div className="text-center space-y-3 px-4">
                    <div className="text-4xl">🔒</div>
                    <p className="text-white font-semibold text-lg">プレミアム限定コンテンツ</p>
                    <p className="text-purple-200 text-sm">
                      あなたの動物キャラに基づいた<br />
                      詳細なキャリア適性分析を閲覧できます
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* リーダーシップスタイル（プレミアム - ぼかし表示） */}
        <div className="relative">
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-xl">👑</span>リーダーシップスタイル
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="blur-[6px] select-none pointer-events-none" aria-hidden="true">
                  <p className="text-purple-100 leading-relaxed">{result.leadershipStyle}</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-purple-950/60 to-purple-950/80 rounded-lg">
                  <div className="text-center space-y-2 px-4">
                    <div className="text-3xl">🔒</div>
                    <p className="text-white font-semibold">プレミアムで解放</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 課金CTA */}
        <Card className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-purple-400/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg">おすすめ</div>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-4xl">✨</div>
            <h3 className="text-white text-xl font-bold">
              もっと深く自分を知りませんか？
            </h3>
            <p className="text-purple-200 text-sm leading-relaxed max-w-md mx-auto">
              プレミアムプランでは、あなたの動物キャラに基づいた
              <span className="text-amber-300 font-semibold">キャリア適性分析</span>、
              <span className="text-amber-300 font-semibold">向いている職種</span>、
              <span className="text-amber-300 font-semibold">リーダーシップスタイル</span>
              など、仕事や人生に役立つ深い分析が見放題になります。
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="text-white">
                <span className="text-3xl font-bold">¥980</span>
                <span className="text-purple-300 text-sm">/月</span>
              </div>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg">
                  プレミアムプランを見る
                </Button>
              </Link>
              <p className="text-purple-400 text-xs">四柱推命・数秘術・AI総合鑑定も全て含まれます</p>
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
