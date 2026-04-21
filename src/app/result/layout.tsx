import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "四柱推命 鑑定結果 | 日主タイプ・性格・運勢を本格鑑定",
  description: "四柱推命であなたの日主タイプ・基本性格・気質・行動パターン・強み弱みを無料鑑定。恋愛・キャリア・金運など9項目の詳細鑑定も。",
  robots: { index: false, follow: false },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
