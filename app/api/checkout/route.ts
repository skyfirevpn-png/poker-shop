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

    // Safely parse dynamic amount sent from cart
    let rawAmount = body?.amount;

    if (typeof rawAmount === 'object' && rawAmount !== null) {
      rawAmount = rawAmount.amount || rawAmount.value || rawAmount.total;
    }

    const parsedNumber = parseFloat(
      String(rawAmount ?? '').replace(/[^0-9.]/g, '')
    );

    // Use dynamic amount if valid, otherwise fallback
    const finalAmount = !isNaN(parsedNumber) && parsedNumber > 0 ? parsedNumber : 389.00;

    // Send both FPX and DuitNow QR as accepted payment methods
    const payload = {
      amount: finalAmount,
      currency: body?.currency || 'MYR',
      payment_methods: ['fpx', 'duitnow_qr'],
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
      console.error('HitPay API Response Error:', data);
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
