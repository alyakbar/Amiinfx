# Paddle Subscription Integration Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Paddle API Configuration (for new Billing API v4 - recommended for subscriptions)
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# Paddle Legacy Configuration (for existing setup - Vendor API v2)
PADDLE_VENDOR_ID=your_vendor_id_here
PADDLE_VENDOR_AUTH_CODE=your_vendor_auth_code_here
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
your_public_key_here
-----END PUBLIC KEY-----"

# Paddle Subscription Plan IDs (create these in your Paddle dashboard)
PADDLE_1_MONTH_PLAN_ID=pri_xxx_1month
PADDLE_3_MONTHS_PLAN_ID=pri_xxx_3months
PADDLE_LIFETIME_PLAN_ID=pri_xxx_lifetime

# Base URL for return URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setting up Paddle Subscription Plans

1. **Log into your Paddle Dashboard**
2. **Go to Catalog > Products**
3. **Create subscription products for each plan:**

### 1 Month Plan
- Name: "Trading Signals - 1 Month"
- Billing Cycle: Monthly
- Price: $100 USD
- Copy the Price ID (starts with `pri_`) to `PADDLE_1_MONTH_PLAN_ID`

### 3 Months Plan
- Name: "Trading Signals - 3 Months"
- Billing Cycle: Every 3 months
- Price: $199 USD
- Copy the Price ID to `PADDLE_3_MONTHS_PLAN_ID`

### Lifetime Plan
- Name: "Trading Signals - Lifetime"
- Billing Cycle: One-time
- Price: $599 USD
- Copy the Price ID to `PADDLE_LIFETIME_PLAN_ID`

## Webhook Configuration

1. **In Paddle Dashboard, go to Developer Tools > Webhooks**
2. **Create a new webhook endpoint:**
   - URL: `https://yourdomain.com/api/paddle/webhook`
   - Events to subscribe to:
     - `transaction.completed`
     - `transaction.paid`
     - `subscription.activated`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.paused`
     - `subscription.resumed`

3. **Copy the webhook secret to `PADDLE_WEBHOOK_SECRET`**

## API Keys

1. **Go to Developer Tools > Authentication**
2. **Create a new API key with these permissions:**
   - Read access to customers
   - Read access to subscriptions
   - Read access to transactions
   - Write access to checkouts (for creating checkout sessions)

## Testing

1. **Sandbox Mode**: Use Paddle's sandbox environment for testing
2. **Test Cards**: Use Paddle's test card numbers
3. **Webhook Testing**: Use tools like ngrok for local webhook testing

## Features Implemented

- ✅ Subscription checkout flow
- ✅ Webhook handling for subscription events
- ✅ Transaction recording in Firestore
- ✅ Success page handling
- ✅ Plan-based pricing
- ✅ Customer data collection
- ✅ Error handling and loading states

## Next Steps

1. Set up the environment variables above
2. Create the subscription plans in Paddle
3. Configure webhooks
4. Test the subscription flow
5. Customize the UI/UX as needed
6. Add subscription management features (cancel, upgrade, etc.)
