# ✅ Paddle Sandbox Credentials Checklist

## Go to: https://sandbox-vendors.paddle.com/

### Step 1: Get Vendor ID & Auth Code
- [ ] Navigate to **Developer Tools** → **API Keys**
- [ ] Copy **Vendor ID** (numbers like: 12345)
- [ ] Copy **Vendor Auth Code** (string like: abc123def456)
- [ ] Update PADDLE_VENDOR_ID in .env.local
- [ ] Update PADDLE_VENDOR_AUTH_CODE in .env.local

### Step 2: Get Public Key
- [ ] Navigate to **Developer Tools** → **Public Keys**
- [ ] Copy the ENTIRE public key (including -----BEGIN and -----END lines)
- [ ] Update PADDLE_PUBLIC_KEY in .env.local (keep quotes and line breaks)

### Step 3: Create Webhook & Get Secret
- [ ] Navigate to **Developer Tools** → **Webhooks**
- [ ] Click **Create Webhook**
- [ ] Enter URL: `https://1e95e0b15600.ngrok-free.app/api/paddle/webhook`
- [ ] Select these events:
  - [ ] subscription.activated
  - [ ] subscription.updated
  - [ ] subscription.canceled
  - [ ] transaction.completed
  - [ ] transaction.paid
- [ ] Save webhook
- [ ] Copy the **Webhook Secret** from webhook details
- [ ] Update PADDLE_WEBHOOK_SECRET in .env.local

### Step 4: Final Check
- [ ] All four values filled in .env.local
- [ ] No "your_xyz_here" placeholders remaining
- [ ] Public key has proper format with quotes
- [ ] Restart development server

### Your completed .env.local should have:
```bash
PADDLE_VENDOR_ID=12345
PADDLE_VENDOR_AUTH_CODE=abc123def456789
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIICIjANBg... (your actual key)
-----END PUBLIC KEY-----"
PADDLE_WEBHOOK_SECRET=whsec_abc123def456
```
