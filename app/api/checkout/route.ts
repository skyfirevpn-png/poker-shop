import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.HITPAY_API_KEY;
    if (!apiKey) {
      console.error('HITPAY_API_KEY is missing from environment variables.');
      return NextResponse.json(
        { error: 'HITPAY_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build URL-encoded parameters required by HitPay API
    const params = new URLSearchParams();
    params.append('amount', String(body.amount));
    params.append('currency', body.currency || 'MYR');
    params.append('redirect_url', `${baseUrl}/order/success`);
    params.append('webhook', `${baseUrl}/api/webhook/hitpay`);
    params.append('reference_number', `ORDER-${Date.now()}`);

    // Append each payment method using the payment_methods[] key
    const paymentMethods = ['fpx', 'duitnow_qr'];
    paymentMethods.forEach((method) => {
      params.append('payment_methods[]', method);
    });

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

    if (!response.ok) {
      console.error('HitPay API Response Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Checkout API Exception:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request.' },
      { status: 500 }
    );
  }
}
