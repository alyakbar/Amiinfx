# 🏖️ Paddle Sandbox Setup Guide

## Step 1: Access Paddle Sandbox

1. **Go to Paddle Sandbox**: https://sandbox-vendors.paddle.com/
2. **Log in** with your Paddle account
3. **Switch to Sandbox mode** (should show "Sandbox" in the top navigation)

## Step 2: Get API Credentials

### A. Get Sandbox API Key (for new Billing API v4)
1. Go to **Developer Tools > Authentication**
2. Click **"Create API Key"**
3. Give it a name like "AmiinFX Sandbox"
4. Select permissions:
   - ✅ Read customers
   - ✅ Read subscriptions  
   - ✅ Read transactions
   - ✅ Write checkout sessions
5. **Copy the API key** and replace `your_paddle_sandbox_api_key_here` in `.env.local`

### B. Get Legacy Vendor Credentials (for existing v2 setup)
1. Go to **Developer Tools > API Keys** (or Account Settings)
2. Find your **Vendor ID** and **Vendor Auth Code**
3. Replace `your_sandbox_vendor_id_here` and `your_sandbox_vendor_auth_code_here` in `.env.local`

### C. Get Public Key for Webhook Verification
1. Go to **Developer Tools > Public Keys**
2. **Copy the Public Key** (the long text starting with -----BEGIN PUBLIC KEY-----)
3. Replace the public key section in `.env.local`

## Step 3: Create Subscription Products

### A. Navigate to Products
1. Go to **Catalog > Products**
2. Click **"Create Product"**

### B. Create 1-Month Subscription Plan
1. **Product Name**: "Trading Signals - 1 Month"
2. **Description**: "Monthly trading signals subscription"
3. **Type**: Subscription
4. **Billing Cycle**: Monthly
5. **Price**: $100.00 USD
6. **Trial Period**: None (or set if desired)
7. **Save** and copy the **Price ID** (starts with `pri_`)
8. Replace `pri_sandbox_1month_plan_id_here` in `.env.local`

### C. Create 3-Months Subscription Plan  
1. **Product Name**: "Trading Signals - 3 Months"
2. **Description**: "Quarterly trading signals subscription"
3. **Type**: Subscription
4. **Billing Cycle**: Every 3 months
5. **Price**: $199.00 USD
6. **Save** and copy the **Price ID**
7. Replace `pri_sandbox_3months_plan_id_here` in `.env.local`

### D. Create Lifetime Plan
1. **Product Name**: "Trading Signals - Lifetime"
2. **Description**: "Lifetime access to trading signals"
3. **Type**: One-time purchase (or subscription with very long interval)
4. **Price**: $599.00 USD
5. **Save** and copy the **Price ID**
6. Replace `pri_sandbox_lifetime_plan_id_here` in `.env.local`

## Step 4: Configure Webhooks

### A. Create Webhook Endpoint
1. Go to **Developer Tools > Webhooks**
2. Click **"Create Webhook"**
3. **Endpoint URL**: `https://1e95e0b15600.ngrok-free.app/api/paddle/webhook`
   (Use your ngrok URL or actual domain)

### B. Select Events
Subscribe to these events:
- ✅ `transaction.completed`
- ✅ `transaction.paid`
- ✅ `subscription.activated`
- ✅ `subscription.updated`
- ✅ `subscription.canceled`
- ✅ `subscription.paused`
- ✅ `subscription.resumed`

### C. Get Webhook Secret
1. After creating the webhook, **copy the webhook secret**
2. Replace `your_webhook_secret_here` in `.env.local`

## Step 5: Test Configuration

### A. Test API Connection
Run this in your terminal to test:
```bash
curl -H "Authorization: Bearer your_paddle_sandbox_api_key_here" \
     https://api.paddle.com/products
```

### B. Test Subscription Flow
1. Start your Next.js app: `npm run dev`
2. Go to `/signals` page
3. Try subscribing to a plan
4. Use Paddle's test card numbers:
   - **Visa**: 4000 0000 0000 0002
   - **Mastercard**: 5555 5555 5555 4444
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits

## Step 6: Monitor Test Transactions

1. Go to **Transactions** in Paddle sandbox
2. Check that test subscriptions appear
3. Verify webhooks are being sent in **Developer Tools > Webhooks > Events**
4. Check your Firestore database for recorded transactions

## 🔧 Troubleshooting

### Common Issues:
1. **"Invalid API Key"**: Make sure you're using the sandbox API key
2. **"Product not found"**: Verify Price IDs are correct and from sandbox
3. **Webhook not received**: Check ngrok is running and URL is correct
4. **SSL errors**: Use ngrok HTTPS URL for webhooks

### Debug Mode:
Add this to `.env.local` for more detailed logs:
```bash
PADDLE_DEBUG=true
```

## 🎯 What You'll Have After Setup

- ✅ Paddle sandbox fully configured
- ✅ Three subscription plans ready for testing
- ✅ Webhook integration working
- ✅ Test payment flow functional
- ✅ Transaction recording in Firestore

## 🚀 Ready to Go Live?

When ready for production:
1. Switch to Paddle production dashboard
2. Create production API keys and plans
3. Update environment variables
4. Test thoroughly in production
5. Update webhook URLs to production domain

---

**Need Help?** Check Paddle's sandbox documentation or contact their support team.
