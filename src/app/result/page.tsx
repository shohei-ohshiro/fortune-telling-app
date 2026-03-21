"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calculateMeishiki,
  getPersonality,
  STEM_READINGS,
  BRANCH_READINGS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_COLORS,
  type Meishiki,
  type Element,
} from "@/lib/shichusuimei";

function ElementBar({ elements }: { elements: Record<Element, number> }) {
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const labels: Record<Element, string> = {
    '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
  };

  return (
    <div className="space-y-2">
      {(Object.entries(elements) as [Element, number][]).map(([el, count]) => (
        <div key={el} className="flex items-center gap-2">
          <span className="text-purple-200 w-8 text-center">{labels[el]}</span>
          <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: ELEMENT_COLORS[el],
                minWidth: count > 0 ? '8px' : '0',
              }}
            />
          </div>
          <span className="text-purple-300 text-sm w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function PillarCell({ stem, branch, star, label }: {
  stem: string;
  branch: string;
  star?: string | null;
  label: string;
}) {
  const stemElement = STEM_ELEMENTS[stem as keyof typeof STEM_ELEMENTS];
  const branchElement = BRANCH_ELEMENTS[branch as keyof typeof BRANCH_ELEMENTS];

  return (
    <div className="text-center space-y-1">
      <div className="text-purple-300 text-xs mb-2">{label}</div>
      <div
        className="text-2xl font-bold py-2 rounded-lg"
        style={{ color: stemElement ? ELEMENT_COLORS[stemElement] : 'white' }}
      >
        {stem}
      </div>
      <div className="text-purple-400 text-xs">
        {STEM_READINGS[stem as keyof typeof STEM_READINGS]}
      </div>
      <Separator className="bg-purple-500/30" />
      <div
        className="text-2xl font-bold py-2 rounded-lg"
        style={{ color: branchElement ? ELEMENT_COLORS[branchElement] : 'white' }}
      >
        {branch}
      </div>
      <div className="text-purple-400 text-xs">
        {BRANCH_READINGS[branch as keyof typeof BRANCH_READINGS]}
      </div>
      {star && (
        <>
          <Separator className="bg-purple-500/30" />
          <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 text-xs">
            {star}
          </Badge>
        </>
      )}
    </div>
  );
}

function ResultContent() {
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

  const meishiki: Meishiki = calculateMeishiki(year, month, day, hour);
  const personality = getPersonality(meishiki.dayStem);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-purple-300 hover:text-white text-sm">
          &larr; トップに戻る
        </Link>
        <h1 className="text-xl font-bold text-white">命式詳細</h1>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6">
        {/* 生年月日 */}
        <div className="text-center text-purple-300">
          {year}年{month}月{day}日{hour !== undefined ? ` ${hour}時` : ""} 生まれ
        </div>

        {/* 日主タイプ */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              あなたは「{meishiki.dayStem}（{STEM_READINGS[meishiki.dayStem]}）」の人
            </CardTitle>
            <p className="text-purple-300 text-center text-lg">
              {personality.title}
            </p>
          </CardHeader>
        </Card>

        {/* 四柱命式表 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">四柱命式表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${hour !== undefined ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}>
              {hour !== undefined && meishiki.hourStem && meishiki.hourBranch && (
                <PillarCell
                  stem={meishiki.hourStem}
                  branch={meishiki.hourBranch}
                  star={meishiki.hourStar}
                  label="時柱"
                />
              )}
              <PillarCell
                stem={meishiki.dayStem}
                branch={meishiki.dayBranch}
                star={null}
                label="日柱（日主）"
              />
              <PillarCell
                stem={meishiki.monthStem}
                branch={meishiki.monthBranch}
                star={meishiki.monthStar}
                label="月柱"
              />
              <PillarCell
                stem={meishiki.yearStem}
                branch={meishiki.yearBranch}
                star={meishiki.yearStar}
                label="年柱"
              />
            </div>
          </CardContent>
        </Card>

        {/* 五行バランス */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">五行バランス</CardTitle>
          </CardHeader>
          <CardContent>
            <ElementBar elements={meishiki.elements} />
          </CardContent>
        </Card>

        {/* 基本性格 */}
        <Card className="bg-white/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">基本性格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-purple-100 leading-relaxed">
              {personality.description}
            </p>

            <div>
              <h4 className="text-green-400 font-semibold mb-2">強み</h4>
              <div className="flex flex-wrap gap-2">
                {personality.strengths.map((s) => (
                  <Badge key={s} className="bg-green-900/50 text-green-200">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-orange-400 font-semibold mb-2">弱み</h4>
              <div className="flex flex-wrap gap-2">
                {personality.weaknesses.map((w) => (
                  <Badge key={w} className="bg-orange-900/50 text-orange-200">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI鑑定（有料枠） */}
        <Card className="bg-white/5 border-purple-500/20 border-dashed">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="text-3xl">🔒</div>
            <h3 className="text-white font-semibold">AI詳細鑑定</h3>
            <p className="text-purple-300 text-sm">
              AIがあなた専用の詳しい鑑定文を生成します。
              <br />
              適職・恋愛傾向・人生のテーマなどを深掘り。
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white">
              有料プランで解放する
            </Button>
          </CardContent>
        </Card>

        {/* 日運リンク */}
        <div className="text-center">
          <Link href={`/daily?year=${year}&month=${month}&day=${day}${hour !== undefined ? `&hour=${hour}` : ''}`}>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              今日の運勢を見る &rarr;
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <p className="text-purple-300">読み込み中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
