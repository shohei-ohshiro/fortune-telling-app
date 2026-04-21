import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数秘術 | ライフパスナンバーで性格・運勢を診断",
  description: "生年月日からライフパスナンバーを算出し、本質的な性格・使命・才能を読み解く数秘術。基本診断は無料、恋愛・キャリア・金運など9項目の詳細版も。",
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
