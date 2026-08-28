import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.HITPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HITPAY_API_KEY is missing from environment variables.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://poker-shop-two.vercel.app';

    // Parse amount strictly as a float number to satisfy HitPay's JSON validation
    const rawAmount = body?.amount ?? 389.00;
    const numericAmount = parseFloat(
      String(
        typeof rawAmount === 'object' && rawAmount !== null 
          ? (rawAmount.amount || rawAmount.value || 389) 
          : rawAmount
      ).replace(/[^0-9.]/g, '')
    );
    const finalAmount = isNaN(numericAmount) || numericAmount <= 0 ? 389.00 : numericAmount;

    // HitPay API expects a standard JSON payload with a numeric amount and array payment methods
    const payload = {
      amount: finalAmount, 
      currency: 'MYR',
      payment_methods: ['fpx'], 
      redirect_url: `${baseUrl}/order/success`,
      webhook: `${baseUrl}/api/webhook/hitpay`,
      reference_number: `ORDER-${Date.now()}`,
    };

    const response = await fetch('https://api.sandbox.hit-pay.com/v1/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      console.error('HitPay API Error Response:', data);
      return NextResponse.json(
        { error: data.message || 'Payment creation failed.', details: data },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error('Checkout Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process checkout.' },
      { status: 500 }
    );
  }
}
