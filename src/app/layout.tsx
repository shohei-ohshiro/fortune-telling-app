import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fortune-telling-app-black.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "四柱推命 × 占術総合鑑定 | 無料で性格・運勢を本格診断",
    template: "%s | 四柱推命 占術総合鑑定",
  },
  description: "四柱推命・数秘術・動物占い・星座占いであなたの性格・強み・運勢を本格鑑定。命式から恋愛・キャリア・金運まで9項目をすべて無料で閲覧できます。",
  keywords: ["四柱推命", "数秘術", "動物占い", "星座占い", "性格診断", "運勢", "無料占い", "相性", "キャリア適性"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "四柱推命 占術総合鑑定",
    title: "四柱推命 × 占術総合鑑定 | 無料で性格・運勢を本格診断",
    description: "四柱推命・数秘術・動物占い・星座占いであなたの性格・強み・運勢を本格鑑定。命式から恋愛・キャリア・金運まで9項目をすべて無料で閲覧できます。",
    url: baseUrl,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "四柱推命 × 占術総合鑑定" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "四柱推命 × 占術総合鑑定 | 無料で性格・運勢を本格診断",
    description: "四柱推命・数秘術・動物占い・星座占いで性格・強み・運勢を本格鑑定。すべての項目を無料公開。",
    images: ["/opengraph-image"],
  },
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "四柱推命 占術総合鑑定",
  description: "四柱推命・数秘術・動物占い・星座占いであなたの性格・強み・運勢を本格鑑定",
  url: baseUrl,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    description: "すべての鑑定項目を無料公開",
  },
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
