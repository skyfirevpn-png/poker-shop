import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if HitPay API key is configured
    const apiKey = process.env.HITPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HitPay API key is missing from environment variables.' },
        { status: 500 }
      );
    }

    // HitPay payment request payload with payment_methods formatted as an array
    const hitpayPayload = {
      amount: body.amount,
      currency: body.currency || 'MYR',
      payment_methods: ['fpx', 'duitnow_qr', 'card'], // Passed explicitly as an array
      email: body.email || undefined,
      name: body.name || undefined,
      purpose: body.purpose || 'Poker Shop Purchase',
      reference_number: body.reference_number || `ORDER-${Date.now()}`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success`,
      webhook: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook/hitpay`,
    };

    const response = await fetch('https://api.sandbox.hit-pay.com/v1/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': apiKey,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(hitpayPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request.' },
      { status: 500 }
    );
  }
}
