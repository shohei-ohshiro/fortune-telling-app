"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";

function PricingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    setLoading(productId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "エラーが発生しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pb-16 space-y-8">
        {success && (
          <Card className="bg-green-900/30 border-green-500/30">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-green-200 font-semibold">お支払いが完了しました！</p>
              <p className="text-green-300 text-sm mt-1">機能が解放されました。</p>
            </CardContent>
          </Card>
        )}

        {canceled && (
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardContent className="pt-6 text-center">
              <p className="text-yellow-200">お支払いがキャンセルされました。</p>
            </CardContent>
          </Card>
        )}

        {/* サブスクプラン */}
        <div>
          <h2 className="text-white text-2xl font-bold text-center mb-6">プレミアムプラン</h2>
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-400/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg">おすすめ</div>
            <CardHeader>
              <CardTitle className="text-white text-center">
                <span className="text-4xl font-bold">¥980</span>
                <span className="text-purple-300 text-lg">/月</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  '全占術の結果が見放題（四柱推命・数秘術・動物占い）',
                  'AI総合鑑定が何度でも利用可能',
                  '毎日の日運を詳細表示',
                  '買い切りコンテンツも全て含む',
                  '新しい占術の追加にも対応',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-purple-100">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleCheckout("subscription")}
                disabled={loading === "subscription"}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6"
              >
                {loading === "subscription" ? "処理中..." : "プレミアムに登録する"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-purple-500/30" />
          <span className="text-purple-400 text-sm">または個別に購入</span>
          <Separator className="flex-1 bg-purple-500/30" />
        </div>

        {/* 買い切り商品 */}
        <div>
          <h2 className="text-white text-xl font-bold text-center mb-4">個別鑑定</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'yearly_reading', emoji: '📅', name: '2026年の運勢', price: 500 },
              { id: 'love_reading', emoji: '💕', name: '恋愛運の深掘り', price: 300 },
              { id: 'career_reading', emoji: '💼', name: '適職診断', price: 400 },
            ].map((item) => (
              <Card key={item.id} className="bg-white/10 border-purple-500/30">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="text-3xl">{item.emoji}</div>
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <Badge className="bg-purple-900/50 text-purple-200">¥{item.price}</Badge>
                  <Button
                    onClick={() => handleCheckout(item.id)}
                    disabled={loading === item.id}
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-900/50"
                  >
                    {loading === item.id ? "処理中..." : "購入する"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 無料プラン */}
        <Card className="bg-white/5 border-purple-500/20">
          <CardContent className="pt-6 text-center space-y-2">
            <h3 className="text-purple-300 font-semibold">無料プラン</h3>
            <p className="text-purple-400 text-sm">基本的な命式表示・簡易性格診断は無料でご利用いただけます</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center"><p className="text-purple-300">読み込み中...</p></div>}>
      <PricingContent />
    </Suspense>
  );
}
