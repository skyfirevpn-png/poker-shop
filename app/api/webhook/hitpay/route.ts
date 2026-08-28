import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let payload: Record<string, any> = {};

    const contentType = req.headers.get('content-type') || '';

    // HitPay Webhook v1 delivers payloads as x-www-form-urlencoded
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const bodyText = await req.text();
      const params = new URLSearchParams(bodyText);
      params.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      payload = await req.json();
    }

    console.log('HitPay Webhook Payload Received:', payload);

    // Filter for successful payment status ('completed' or 'paid')
    const status = payload.status || payload.payment_status;
    if (status === 'completed' || status === 'paid') {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (telegramToken && chatId) {
        const message = 
`🎰 *New Order Completed!*

💵 *Amount:* ${payload.currency || 'MYR'} ${payload.amount}
🆔 *Reference:* \`${payload.reference_number || payload.id || 'N/A'}\`
💳 *Payment Method:* ${payload.payment_method || 'FPX'}
📌 *Status:* ${status.toUpperCase()}
📅 *Date:* ${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}`;

        // Dispatch message to Telegram Bot API
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      } else {
        console.warn('Telegram Bot Token or Chat ID is missing from environment variables.');
      }
    }

    // Always acknowledge HitPay with HTTP 200 OK
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('HitPay Webhook Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
