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

    console.log('HitPay Webhook Full Payload:', JSON.stringify(payload, null, 2));

    // Filter for successful payment status
    const status = (payload.status || payload.payment_status || '').toString().toLowerCase();

    if (status === 'completed' || status === 'paid') {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (telegramToken && chatId) {
        // Search across all possible keys HitPay uses for payment methods
        const rawMethod = (
          payload.payment_method ||
          payload.payment_type ||
          payload.payment_method_type ||
          payload.channel ||
          payload.payment_option ||
          payload.payment_request?.payment_method ||
          payload.payment_request?.channel ||
          ''
        ).toString().toLowerCase();

        let displayMethod = 'FPX (Online Banking)';

        // Comprehensive check for QR & E-Wallets vs FPX vs Cards
        if (rawMethod.includes('tng') || rawMethod.includes('touch')) {
          displayMethod = 'Touch \'n Go eWallet';
        } else if (rawMethod.includes('qr') || rawMethod.includes('duitnow')) {
          displayMethod = 'DuitNow QR';
        } else if (rawMethod.includes('grab')) {
          displayMethod = 'GrabPay';
        } else if (rawMethod.includes('boost')) {
          displayMethod = 'Boost';
        } else if (rawMethod.includes('card') || rawMethod.includes('visa') || rawMethod.includes('master')) {
          displayMethod = 'Credit / Debit Card';
        } else if (rawMethod.includes('fpx')) {
          displayMethod = 'FPX (Online Banking)';
        } else if (rawMethod) {
          displayMethod = rawMethod.toUpperCase();
        }

        const amount = payload.amount || payload.payment_request?.amount || '0.00';
        const currency = payload.currency || payload.payment_request?.currency || 'MYR';
        const reference = payload.reference_number || payload.id || payload.payment_request?.reference_number || 'N/A';

        const message = 
`🎰 *New Order Completed!*

💵 *Amount:* ${currency} ${amount}
🆔 *Reference:* \`${reference}\`
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
