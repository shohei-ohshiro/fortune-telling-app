"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  calculateMeishiki,
  calculateDailyFortune,
  calculateWeeklyFortune,
  getPersonality,
  STEM_READINGS,
} from "@/lib/shichusuimei";
import type { Meishiki } from "@/lib/shichusuimei";
import { getNumerologyResult } from "@/lib/numerology";
import { calculateAnimal } from "@/lib/animal";
import { calculateZodiac } from "@/lib/zodiac";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // プロフィール入力
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [saving, setSaving] = useState(false);

  // 命式・日運データ
  const [meishiki, setMeishiki] = useState<Meishiki | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.birth_date) {
        setHasProfile(true);
        const [y, m, d] = profile.birth_date.split("-");
        setBirthYear(y);
        setBirthMonth(String(Number(m)));
        setBirthDay(String(Number(d)));
        if (profile.birth_time) {
          setBirthHour(String(Number(profile.birth_time.split(":")[0])));
        }

        const hour = profile.birth_time
          ? Number(profile.birth_time.split(":")[0])
          : undefined;
        const m2 = calculateMeishiki(Number(y), Number(m), Number(d), hour);
        setMeishiki(m2);
      }

      setProfileLoading(false);
    };

    loadProfile();
  }, [user, authLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !birthYear || !birthMonth || !birthDay) return;
    setSaving(true);

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
    const birthTime = birthHour ? `${birthHour.padStart(2, "0")}:00:00` : null;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      birth_date: birthDate,
      birth_time: birthTime,
    });

    if (error) {
      alert("保存に失敗しました: " + error.message);
      setSaving(false);
      return;
    }

    const hour = birthHour ? Number(birthHour) : undefined;
    const m = calculateMeishiki(
      Number(birthYear),
      Number(birthMonth),
      Number(birthDay),
      hour
    );
    setMeishiki(m);
    setHasProfile(true);
    setSaving(false);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <p className="text-purple-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 生年月日未入力 → 入力フォーム表示
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
        <Header />
        <main className="flex flex-col items-center px-4 pt-12">
          <Card className="w-full max-w-md bg-white/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-center">
                生年月日を入力してください
              </CardTitle>
              <p className="text-purple-300 text-center text-sm">
                鑑定に必要な情報です
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label className="text-purple-200">生年月日</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <Input type="number" placeholder="1990" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} min="1920" max="2030" className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400" required />
                      <span className="text-xs text-purple-300 block text-center">年</span>
                    </div>
                    <div>
                      <Input type="number" placeholder="1" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} min="1" max="12" className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400" required />
                      <span className="text-xs text-purple-300 block text-center">月</span>
                    </div>
                    <div>
                      <Input type="number" placeholder="1" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} min="1" max="31" className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400" required />
                      <span className="text-xs text-purple-300 block text-center">日</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-purple-200">出生時刻（任意）</Label>
                  <Input type="number" placeholder="例: 14" value={birthHour} onChange={(e) => setBirthHour(e.target.value)} min="0" max="23" className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 w-24 mt-1" />
                  <span className="text-xs text-purple-300 block">時（0〜23時）</span>
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  {saving ? "保存中..." : "保存して鑑定する"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ダッシュボード表示
  const personality = meishiki ? getPersonality(meishiki.dayStem) : null;
  const today = new Date();
  const todayFortune = meishiki
    ? calculateDailyFortune(meishiki.dayStem, today)
    : null;

  const startOfWeek = new Date(today);
  const dow = today.getDay();
  startOfWeek.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const weeklyFortunes = meishiki
    ? calculateWeeklyFortune(meishiki.dayStem, startOfWeek)
    : [];

  const resultParams = `year=${birthYear}&month=${birthMonth}&day=${birthDay}${birthHour ? `&hour=${birthHour}` : ""}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        <div className="text-purple-200 text-lg">
          こんにちは{user?.email ? `、${user.email.split("@")[0]}さん` : ""}
        </div>

        {/* 今日の運勢 */}
        {todayFortune && (
          <Link href={`/daily?${resultParams}`}>
            <Card className="bg-white/10 border-purple-500/30 hover:bg-white/15 transition cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-300 text-sm">
                      {today.getMonth() + 1}/{today.getDate()}（{WEEKDAY_LABELS[today.getDay()]}）の運勢
                    </div>
                    <div className="text-yellow-400 text-xl mt-1">
                      {"★".repeat(todayFortune.overall)}
                      {"☆".repeat(5 - todayFortune.overall)}
                    </div>
                    <p className="text-purple-100 text-sm mt-2">
                      「{todayFortune.advice}」
                    </p>
                  </div>
                  <span className="text-purple-400 text-2xl">&rarr;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 命式サマリー */}
        {meishiki && personality && (
          <Link href={`/result?${resultParams}`}>
            <Card className="bg-white/10 border-purple-500/30 hover:bg-white/15 transition cursor-pointer mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-300 text-sm">あなたの命式</div>
                    <div className="text-white text-lg font-semibold mt-1">
                      日主：{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）
                    </div>
                    <Badge className="bg-purple-900/50 text-purple-200 mt-1">
                      {personality.title}
                    </Badge>
                  </div>
                  <span className="text-purple-400 text-2xl">&rarr;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 全占術メニュー */}
        {birthYear && birthMonth && birthDay && (() => {
          const numResult = getNumerologyResult(Number(birthYear), Number(birthMonth), Number(birthDay));
          const animalResult = calculateAnimal(Number(birthYear), Number(birthMonth), Number(birthDay));
          const zodiacResult = calculateZodiac(Number(birthMonth), Number(birthDay));
          const baseParams = `year=${birthYear}&month=${birthMonth}&day=${birthDay}`;

          return (
            <Card className="bg-white/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">あなたの占い結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/numerology?${baseParams}`}>
                    <div className="bg-purple-900/30 rounded-xl p-4 text-center hover:bg-purple-800/40 transition">
                      <div className="text-2xl mb-1">🔢</div>
                      <p className="text-white font-semibold text-sm">数秘術</p>
                      <p className="text-purple-200 text-xs mt-1">No.{numResult.lifePathNumber}</p>
                      <p className="text-purple-300 text-xs">{numResult.title}</p>
                    </div>
                  </Link>
                  <Link href={`/animal?${baseParams}`}>
                    <div className="bg-purple-900/30 rounded-xl p-4 text-center hover:bg-purple-800/40 transition">
                      <div className="text-2xl mb-1">{animalResult.emoji}</div>
                      <p className="text-white font-semibold text-sm">動物占い</p>
                      <p className="text-purple-200 text-xs mt-1">{animalResult.animal}</p>
                      <p className="text-purple-300 text-xs">{animalResult.title}</p>
                    </div>
                  </Link>
                  <Link href={`/zodiac?${baseParams}`}>
                    <div className="bg-purple-900/30 rounded-xl p-4 text-center hover:bg-purple-800/40 transition">
                      <div className="text-2xl mb-1">{zodiacResult.emoji}</div>
                      <p className="text-white font-semibold text-sm">星座占い</p>
                      <p className="text-purple-200 text-xs mt-1">{zodiacResult.sign}</p>
                      <p className="text-purple-300 text-xs">{zodiacResult.title}</p>
                    </div>
                  </Link>
                  <Link href={`/ai-reading?${resultParams}`}>
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 text-center hover:from-purple-800/40 hover:to-pink-800/40 transition">
                      <div className="text-2xl mb-1">🤖</div>
                      <p className="text-white font-semibold text-sm">AI総合鑑定</p>
                      <p className="text-purple-200 text-xs mt-1">全占術を統合</p>
                      <p className="text-purple-300 text-xs">AIが分析</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 週間カレンダー */}
        {weeklyFortunes.length > 0 && (
          <Card className="bg-white/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg">今週の運勢</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weeklyFortunes.map((f, i) => {
                  const d = new Date(startOfWeek);
                  d.setDate(d.getDate() + i);
                  const isToday = d.toDateString() === today.toDateString();
                  const wIdx = d.getDay();
                  return (
                    <div
                      key={f.date}
                      className={`py-2 rounded-lg ${isToday ? "bg-purple-600/50 ring-1 ring-purple-400" : ""}`}
                    >
                      <div className={`text-xs ${wIdx === 0 ? "text-red-400" : wIdx === 6 ? "text-blue-400" : "text-purple-300"}`}>
                        {WEEKDAY_LABELS[wIdx]}
                      </div>
                      <div className="text-white text-sm font-semibold">{d.getDate()}</div>
                      <div className="text-yellow-400 text-xs mt-1">{"★".repeat(f.overall)}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
