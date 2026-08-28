import { NextRequest, NextResponse } from 'next/server';
import { findProduct } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: { id: string; qty: number }[] = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Recompute the total server-side from the product catalog.
    // Never trust a price sent from the browser.
    let total = 0;
    const lines: string[] = [];
    for (const item of items) {
      const product = findProduct(item.id);
      if (!product || !Number.isFinite(item.qty) || item.qty < 1) {
        return NextResponse.json({ error: `Invalid item: ${item.id}` }, { status: 400 });
      }
      total += product.price * item.qty;
      lines.push(`${item.qty}x ${product.name}`);
    }

    const apiKey = process.env.HITPAY_API_KEY;
    const apiBase = process.env.HITPAY_API_BASE || 'https://api.sandbox.hitpayapp.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (!apiKey) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const reference = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const params = new URLSearchParams({
      amount: total.toFixed(2),
      currency: 'MYR',
      // Restrict to FPX at checkout. Remove this line to let HitPay show all enabled methods.
      payment_methods[]: 'fpx',
      reference_number: reference,
      redirect_url: `${siteUrl}/order/success?ref=${reference}`,
      webhook: `${siteUrl}/api/webhook/hitpay`,
      name: 'The Vault — Poker Shop',
      purpose: lines.join(', ').slice(0, 250),
    });

    const res = await fetch(`${apiBase}/v1/payment-requests`, {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      return NextResponse.json(
        { error: data.message || 'HitPay could not create the payment request' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.url, reference });
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
