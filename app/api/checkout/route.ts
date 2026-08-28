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

    // Build URL-encoded string manually to ensure correct HitPay array syntax
    const payloadParts: string[] = [
      `amount=${encodeURIComponent(String(body.amount))}`,
      `currency=${encodeURIComponent(body.currency || 'MYR')}`,
      `redirect_url=${encodeURIComponent(`${baseUrl}/order/success`)}`,
      `webhook=${encodeURIComponent(`${baseUrl}/api/webhook/hitpay`)}`,
      `reference_number=${encodeURIComponent(`ORDER-${Date.now()}`)}`,
      // Repeated array parameters for HitPay form-urlencoded endpoint
      'payment_methods[]=fpx',
      'payment_methods[]=duitnow_qr',
      'payment_methods[]=card',
    ];

    const requestBody = payloadParts.join('&');

    const response = await fetch('https://api.sandbox.hit-pay.com/v1/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-BUSINESS-API-KEY': apiKey,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: requestBody,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('HitPay API Returned Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Checkout Exception:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout.' },
      { status: 500 }
    );
  }
}
