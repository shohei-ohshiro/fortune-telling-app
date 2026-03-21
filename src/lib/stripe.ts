import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover',
});

/** 商品定義 */
export const PRODUCTS = {
  subscription: {
    name: 'プレミアムプラン',
    description: '全機能使い放題（日運、AI鑑定、全占術）',
    priceYen: 980,
    mode: 'subscription' as const,
  },
  yearly_reading: {
    name: '2026年の運勢',
    description: '今年1年間の詳細な運勢鑑定',
    priceYen: 500,
    mode: 'payment' as const,
  },
  love_reading: {
    name: '恋愛運の深掘り',
    description: 'AI が恋愛運を徹底的に分析',
    priceYen: 300,
    mode: 'payment' as const,
  },
  career_reading: {
    name: '適職診断',
    description: 'AI があなたに最適な仕事を分析',
    priceYen: 400,
    mode: 'payment' as const,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
