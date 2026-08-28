# The Vault — Poker Shop

Next.js storefront for poker chip sets. Checkout via HitPay (FPX), order
notifications pushed to Telegram the moment a payment completes.

## What's in here

- `app/page.tsx` — storefront (product grid + cart drawer)
- `lib/products.ts` — your product catalog (edit this to add/change items)
- `app/api/checkout/route.ts` — creates a HitPay payment request from the cart
- `app/api/webhook/hitpay/route.ts` — verifies HitPay's webhook signature, sends you a Telegram message on successful payment
- `app/order/success/page.tsx` — page customers land on after paying

## 1. Set up HitPay

1. Sign up at https://www.hitpayapp.com (use the **sandbox** dashboard first: https://dashboard.sandbox.hitpayapp.com to test without real money)
2. Go to **Payment Gateway → API Keys**, copy your API key
3. Go to **Payment Gateway → Webhooks**, add a webhook pointing at:
   `https://your-site.vercel.app/api/webhook/hitpay`
   (you can only fill this in after your first deploy — see step 3)
4. HitPay will show you a **webhook salt** — copy it
5. In your HitPay account settings, make sure **FPX** is enabled as a payment method (Malaysian bank account required to receive payouts)

## 2. Set up Telegram notifications

1. Message **@BotFather** on Telegram, send `/newbot`, follow the prompts — you'll get a **bot token**
2. Message your new bot anything (so it can message you back), then visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   and find your numeric `chat.id` in the response — that's your **chat ID**
   (or just message **@userinfobot** to get your own chat ID directly)

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new, import the repo
3. Before the first deploy, add these environment variables (Project Settings → Environment Variables):

   | Variable | Value |
   |---|---|
   | `HITPAY_API_KEY` | from step 1 |
   | `HITPAY_WEBHOOK_SALT` | from step 1 |
   | `HITPAY_API_BASE` | `https://api.sandbox.hitpayapp.com` while testing, `https://api.hitpayapp.com` when live |
   | `TELEGRAM_BOT_TOKEN` | from step 2 |
   | `TELEGRAM_CHAT_ID` | from step 2 |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://the-vault.vercel.app` |

4. Deploy
5. Go back to HitPay and set the webhook URL to `https://<your-vercel-url>/api/webhook/hitpay`

## 4. Test end-to-end (sandbox)

1. With `HITPAY_API_BASE` set to the sandbox URL, place a test order on your live site
2. HitPay's sandbox checkout lets you simulate a successful FPX payment
3. Confirm you get a Telegram message and land on the success page
4. Check Vercel's function logs (`Project → Deployments → Functions`) if something doesn't fire

## 5. Go live

1. Complete HitPay's business verification (needed to accept real payments and receive payouts)
2. Swap `HITPAY_API_BASE` to `https://api.hitpayapp.com` and `HITPAY_API_KEY` to your **live** key in Vercel env vars
3. Re-add the webhook in your **live** HitPay dashboard (sandbox and live are separate)
4. Redeploy

## Editing products

Open `lib/products.ts` — each entry is one product card. `price` is in MYR,
`stripeColor` controls the chip-badge color on the card, `pieces` is the
label shown (e.g. `"300pc set"`).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your sandbox keys
npm run dev
```

Visit http://localhost:3000

## Notes

- The webhook does its own de-dupe (in-memory) so retries don't send you
  duplicate Telegram messages, but this resets on cold start. For real order
  bookkeeping, don't rely on Telegram messages alone — consider adding a
  database (even a simple one) to log orders, since this starter doesn't
  include one.
- Prices are recalculated server-side from `lib/products.ts` at checkout —
  never trust an amount sent from the browser.
- Regional buyers (SG/BN/ID): FPX is Malaysia-only. If you want to accept
  cards for those customers too, add `'fpx,card'` to `payment_methods` in
  `app/api/checkout/route.ts` (requires cards enabled on your HitPay account).
