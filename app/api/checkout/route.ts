import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let payload: Record<string, any> = {};

    const contentType = req.headers.get('content-type') || '';

    // Parse URL-encoded or JSON webhook payload from HitPay
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

    // Filter for successful payment status
    const status = payload.status || payload.payment_status;
    if (status === 'completed' || status === 'paid') {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (telegramToken && chatId) {
        // Dynamically detect the payment method from HitPay's response
        const rawMethod = (
          payload.payment_method || 
          payload.payment_type || 
          payload.payment_method_type || 
          'FPX'
        ).toString().toLowerCase();

        let displayMethod = 'FPX (Online Banking)';
        if (rawMethod.includes('qr') || rawMethod.includes('duitnow')) {
          displayMethod = 'DuitNow QR';
        } else if (rawMethod.includes('card') || rawMethod.includes('visa') || rawMethod.includes('master')) {
          displayMethod = 'Credit / Debit Card';
        } else if (rawMethod.includes('fpx')) {
          displayMethod = 'FPX (Online Banking)';
        } else {
          displayMethod = rawMethod.toUpperCase();
        }

        const message = 
`🎰 *New Order Completed!*

💵 *Amount:* ${payload.currency || 'MYR'} ${payload.amount}
🆔 *Reference:* \`${payload.reference_number || payload.id || 'N/A'}\`
💳 *Payment Method:* ${displayMethod}
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

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('HitPay Webhook Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
