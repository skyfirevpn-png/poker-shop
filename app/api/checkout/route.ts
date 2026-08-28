import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// HitPay signs webhook payloads by taking every field except `hmac`,
// sorting the keys alphabetically, concatenating `key + value` for each,
// and HMAC-SHA256 hashing the result with your webhook salt.
// Verify this against HitPay's current docs before going live —
// gateways occasionally tweak the exact signing recipe.
function verifyHitPaySignature(fields: Record<string, string>, salt: string): boolean {
  const { hmac, ...rest } = fields;
  if (!hmac) return false;

  const sortedKeys = Object.keys(rest).sort();
  const concatenated = sortedKeys.map((k) => `${k}${rest[k]}`).join('');
  const expected = crypto.createHmac('sha256', salt).update(concatenated).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hmac));
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Telegram not configured — skipping notification');
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

// naive in-memory de-dupe so a webhook retry doesn't double-notify you.
// Resets on cold start — fine for a low-volume shop. For higher volume,
// swap this for a real store (e.g. a KV table keyed by payment_id).
const seenPayments = new Set<string>();

export async function POST(req: NextRequest) {
  const salt = process.env.HITPAY_WEBHOOK_SALT;
  if (!salt) {
    console.error('HITPAY_WEBHOOK_SALT not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const form = await req.formData();
  const fields: Record<string, string> = {};
  form.forEach((value, key) => {
    fields[key] = String(value);
  });

  const valid = verifyHitPaySignature(fields, salt);
  if (!valid) {
    console.error('HitPay webhook signature mismatch', fields.reference_number);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const {
    status,
    reference_number,
    amount,
    currency,
    payment_id,
    payment_type,
  } = fields;

  if (payment_id && seenPayments.has(payment_id)) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  if (payment_id) seenPayments.add(payment_id);

  if (status === 'completed') {
    const message = [
      '✅ *New order paid*',
      `Reference: \`${reference_number}\``,
      `Amount: ${currency} ${amount}`,
      `Method: ${payment_type || 'fpx'}`,
      `Payment ID: \`${payment_id}\``,
    ].join('\n');

    await sendTelegramMessage(message);
  } else {
    console.log('HitPay webhook received non-completed status:', status, reference_number);
  }

  return NextResponse.json({ ok: true });
}
