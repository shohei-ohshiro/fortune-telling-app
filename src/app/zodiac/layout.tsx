import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "星座占い | 36タイプ分類の詳細な星座性格診断",
  description: "12星座×3デカン（36タイプ）の詳細な星座占い。誕生日から支配惑星・エレメントを解析し、性格・恋愛・運勢を本格診断。",
};

export default function ZodiacLayout({ children }: { children: React.ReactNode }) {
  return children;
}
