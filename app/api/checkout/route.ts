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

    // Safely parse raw amount input (handles numbers, strings, or objects)
    let rawAmount = body.amount;
    if (typeof rawAmount === 'object' && rawAmount !== null) {
      rawAmount = rawAmount.amount || rawAmount.total || rawAmount.value;
    }

    const parsedNumber = parseFloat(
      String(rawAmount || '0').replace(/[^0-9.]/g, '')
    );

    // Fallback default amount if parsing fails
    const validAmount = !isNaN(parsedNumber) && parsedNumber > 0 ? parsedNumber : 389.00;
    const formattedAmount = validAmount.toFixed(2);

    // Build URL-encoded request body
    const params = new URLSearchParams();
    params.append('amount', formattedAmount);
    params.append('currency', 'MYR');
    params.append('redirect_url', `${baseUrl}/order/success`);
    params.append('webhook', `${baseUrl}/api/webhook/hitpay`);
    params.append('reference_number', `ORDER-${Date.now()}`);
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
