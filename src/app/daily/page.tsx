"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import {
  calculateMeishiki,
  calculateDailyFortune,
  calculateWeeklyFortune,
  STEM_READINGS,
} from "@/lib/shichusuimei";

function Stars({ count }: { count: number }) {
  return (
    <span className="text-lg tracking-wider">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-yellow-400" : "text-purple-800"}>
          ★
        </span>
      ))}
    </span>
  );
}

function FortuneRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-purple-200">{label}</span>
      <Stars count={score} />
    </div>
  );
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function DailyContent() {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));
  const hourParam = searchParams.get("hour");
  const hour = hourParam ? Number(hourParam) : undefined;

  if (!year || !month || !day) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6">
            <p className="text-purple-200">生年月日を入力してください。</p>
            <Link href="/">
              <Button className="mt-4 bg-purple-600 hover:bg-purple-500 text-white">
                トップに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meishiki = calculateMeishiki(year, month, day, hour);
  const today = new Date();
  const fortune = calculateDailyFortune(meishiki.dayStem, today);

  // 週間の開始日（月曜日）を求める
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diff);
  const weeklyFortunes = calculateWeeklyFortune(meishiki.dayStem, startOfWeek);

  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${WEEKDAY_LABELS[today.getDay()]}）`;

  const scoreToText = (score: number) => {
    if (score >= 5) return "最高の一日！";
    if (score >= 4) return "良い流れの日";
    if (score >= 3) return "平穏な一日";
    if (score >= 2) return "慎重に過ごす日";
    return "無理をしない日";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        {/* 日付とタイプ */}
        <div className="text-center space-y-1">
          <p className="text-purple-300">{todayStr}</p>
          <p className="text-purple-400 text-sm">
            日主：{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）の人
          </p>
        </div>

        {/* 総合運 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="text-5xl">
              <Stars count={fortune.overall} />
            </div>
            <p className="text-white text-2xl font-bold">
              {fortune.overall * 20}点
            </p>
            <p className="text-purple-200 text-lg">
              {scoreToText(fortune.overall)}
            </p>
          </CardContent>
        </Card>

        {/* 各運勢 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">各運勢</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <FortuneRow label="仕事運" score={fortune.work} />
            <Separator className="bg-purple-500/20" />
            <FortuneRow label="恋愛運" score={fortune.love} />
            <Separator className="bg-purple-500/20" />
            <FortuneRow label="金運" score={fortune.money} />
            <Separator className="bg-purple-500/20" />
            <FortuneRow label="健康運" score={fortune.health} />
          </CardContent>
        </Card>

        {/* アドバイス */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">今日のアドバイス</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100 leading-relaxed text-lg">
              「{fortune.advice}」
            </p>
          </CardContent>
        </Card>

        {/* ラッキー情報 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">ラッキー情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-purple-400 text-xs mb-1">ラッキーカラー</div>
                <Badge className="bg-purple-900/50 text-purple-200">
                  {fortune.luckyColor}
                </Badge>
              </div>
              <div>
                <div className="text-purple-400 text-xs mb-1">ラッキー方角</div>
                <Badge className="bg-purple-900/50 text-purple-200">
                  {fortune.luckyDirection}
                </Badge>
              </div>
              <div>
                <div className="text-purple-400 text-xs mb-1">ラッキーナンバー</div>
                <Badge className="bg-purple-900/50 text-purple-200">
                  {fortune.luckyNumber}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 週間カレンダー */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">今週の運勢</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weeklyFortunes.map((f, i) => {
                const d = new Date(startOfWeek);
                d.setDate(d.getDate() + i);
                const isToday = d.toDateString() === today.toDateString();
                const weekdayIdx = d.getDay();

                return (
                  <div
                    key={f.date}
                    className={`py-2 rounded-lg ${isToday ? 'bg-purple-600/50 ring-1 ring-purple-400' : ''}`}
                  >
                    <div className={`text-xs ${weekdayIdx === 0 ? 'text-red-400' : weekdayIdx === 6 ? 'text-blue-400' : 'text-purple-300'}`}>
                      {WEEKDAY_LABELS[weekdayIdx]}
                    </div>
                    <div className="text-white text-sm font-semibold">
                      {d.getDate()}
                    </div>
                    <div className="text-yellow-400 text-xs mt-1">
                      {"★".repeat(f.overall)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI詳細（有料枠） */}
        <Card className="bg-white/5 border-purple-500/20 border-dashed">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="text-3xl">🔒</div>
            <h3 className="text-white font-semibold">AI詳細アドバイス</h3>
            <p className="text-purple-300 text-sm">
              AIがあなたの今日の運勢を詳しく分析し、
              <br />
              具体的な行動アドバイスを提案します。
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white">
              有料プランで解放する
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DailyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <p className="text-purple-300">読み込み中...</p>
      </div>
    }>
      <DailyContent />
    </Suspense>
  );
}
