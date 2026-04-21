import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動物占い | あなたの動物キャラと性格を本格診断",
  description: "生年月日から動物占いで性格・恋愛・キャリアを診断。60タイプの動物キャラから「あなただけの」性格分析。基本診断は無料、恋愛・金運など詳細版も。",
};

export default function AnimalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
