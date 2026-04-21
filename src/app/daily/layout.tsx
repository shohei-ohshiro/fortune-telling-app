import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "日運 | 今日の運勢を四柱推命で占う",
  description: "四柱推命の日主から算出する今日の運勢。仕事・恋愛・金運・健康の運気スコアとアドバイスを毎日更新。",
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
