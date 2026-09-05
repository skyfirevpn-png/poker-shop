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

    console.log('HitPay Webhook Raw Payload:', payload);

    const status = (payload.status || payload.payment_status || '').toString().toLowerCase();

    if (status === 'completed' || status === 'paid') {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const apiKey = process.env.HITPAY_API_KEY;

      let rawMethod = '';

      // If webhook didn't include the payment method, fetch full details via HitPay API
      if (payload.payment_id && apiKey) {
        try {
          // Check Sandbox or Production endpoint based on key setup
          const isSandbox = true; // Set to false when moving to live Production URL
          const apiDomain = isSandbox ? 'api.sandbox.hit-pay.com' : 'api.hit-pay.com';

          const res = await fetch(`https://${apiDomain}/v1/payment-requests/${payload.payment_request_id || payload.payment_id}`, {
            headers: {
              'X-BUSINESS-API-KEY': apiKey,
            },
          });

          if (res.ok) {
            const details = await res.json();
            console.log('HitPay API Detailed Transaction Response:', details);

            // Extract method from the payment record inside details
            const payments = details.payments || [];
            if (payments.length > 0) {
              rawMethod = (payments[0].payment_type || payments[0].payment_method || payments[0].channel || '').toString();
            } else {
              rawMethod = (details.payment_type || details.payment_method || details.channel || '').toString();
            }
          }
        } catch (fetchErr) {
          console.error('Failed to fetch payment details from HitPay API:', fetchErr);
        }
      }

      // Fallback to payload keys if API lookup was empty
      if (!rawMethod) {
        rawMethod = (
          payload.payment_method ||
          payload.payment_type ||
          payload.channel ||
          'fpx'
        ).toString();
      }

      rawMethod = rawMethod.toLowerCase();

      // Format payment method display name
      let displayMethod = 'FPX (Online Banking)';
      if (rawMethod.includes('tng') || rawMethod.includes('touch') || rawMethod.includes('ewallet')) {
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

      if (telegramToken && chatId) {
        const message = 
`🎰 *New Order Completed!*

💵 *Amount:* ${payload.currency || 'MYR'} ${payload.amount}
🆔 *Reference:* \`${payload.reference_number || payload.payment_id || 'N/A'}\`
💳 *Payment Method:* ${displayMethod}
📌 *Status:* ${status.toUpperCase()}
📅 *Date:* ${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}`;

        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('HitPay Webhook Exception:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
