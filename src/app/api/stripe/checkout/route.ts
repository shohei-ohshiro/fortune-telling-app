import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PRODUCTS, type ProductId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json();

    if (!productId || !PRODUCTS[productId as ProductId]) {
      return NextResponse.json({ error: '無効な商品です' }, { status: 400 });
    }

    const product = PRODUCTS[productId as ProductId];
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceYen,
            ...(product.mode === 'subscription' ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      mode: product.mode,
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        productId,
        userId: userId || '',
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: '決済ページの作成に失敗しました' },
      { status: 500 }
    );
  }
}
