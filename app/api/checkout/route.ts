import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.HITPAY_API_KEY;
    if (!apiKey) {
      console.error('HITPAY_API_KEY is missing from environment variables.');
      return NextResponse.json(
        { error: 'HITPAY_API_KEY environment variable is not set.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://poker-shop-two.vercel.app';

    // Parse amount strictly to a 2-decimal number string (e.g. 389.00 -> "389.00")
    const numericAmount = typeof body.amount === 'number' 
      ? body.amount.toFixed(2) 
      : parseFloat(String(body.amount).replace(/[^0-9.]/g, '')).toFixed(2);

    if (isNaN(Number(numericAmount)) || Number(numericAmount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid checkout amount provided.' },
        { status: 400 }
      );
    }

    // Build form parameters
    const params = new URLSearchParams();
    params.append('amount', numericAmount);
    params.append('currency', 'MYR');
    params.append('redirect_url', `${baseUrl}/order/success`);
    params.append('webhook', `${baseUrl}/api/webhook/hitpay`);
    params.append('reference_number', `ORDER-${Date.now()}`);

    // Pass only 'fpx' (which is enabled on all MYR Sandbox accounts)
    params.append('payment_methods[]', 'fpx');

    const response = await fetch('https://api.sandbox.hit-pay.com/v1/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-BUSINESS-API-KEY': apiKey,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      console.error('HitPay API Error:', data);
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
