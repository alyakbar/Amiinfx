# 🔑 How to Get Paddle Sandbox Credentials

## Step 1: Access Paddle Sandbox Dashboard

1. **Go to**: https://sandbox-vendors.paddle.com/
2. **Log in** with your Paddle account credentials
3. **Verify** you see "Sandbox" in the top navigation bar

---

## Step 2: Get PADDLE_VENDOR_ID and PADDLE_VENDOR_AUTH_CODE

### Option A: From Developer Tools > API Keys
1. In the sidebar, click **"Developer Tools"**
2. Click **"API Keys"**
3. You'll see:
   - **Vendor ID**: Copy this number (e.g., `12345`)
   - **Vendor Auth Code**: Copy this string (e.g., `abc123def456`)

### Option B: From Account Settings
1. Click your profile icon in top right
2. Go to **"Account Settings"**
3. Look for **"API Authentication"** section
4. Find:
   - **Vendor ID**: Your numeric vendor ID
   - **Auth Code**: Your vendor authentication code

**Update your .env.local:**
```bash
PADDLE_VENDOR_ID=12345  # Replace with your actual vendor ID
PADDLE_VENDOR_AUTH_CODE=abc123def456  # Replace with your actual auth code
```

---

## Step 3: Get PADDLE_PUBLIC_KEY

1. In the sidebar, go to **"Developer Tools"**
2. Click **"Public Keys"**
3. You'll see a text area with your public key that looks like:

```
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA1234567890abcdef...
(many lines of random characters)
...xyz789
-----END PUBLIC KEY-----
```

4. **Copy the ENTIRE key** including the BEGIN and END lines
5. **Update your .env.local:**

```bash
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA1234567890abcdef
AAABBBCCCDDDEEEFFFGGGHHHIIIJJJKKKLLLMMMNNNOOOPPPQQQRRRSSSTTTUUU
VVVWWWXXXYYYZZZ111222333444555666777888999000aaabbbcccdddeeeef
... (paste your actual key here - it will be many lines)
-----END PUBLIC KEY-----"
```

⚠️ **Important**: Make sure to include the quotes and keep the line breaks exactly as shown.

---

## Step 4: Get PADDLE_WEBHOOK_SECRET

### A. Create a Webhook First
1. Go to **"Developer Tools"** → **"Webhooks"**
2. Click **"Create Webhook"** or **"Add Endpoint"**
3. Fill in the webhook details:
   - **Endpoint URL**: `https://1e95e0b15600.ngrok-free.app/api/paddle/webhook`
     (Use your actual ngrok URL or domain)
   - **Description**: "AmiinFX Subscription Webhooks"

### B. Select Events to Subscribe To
Check these events:
- ✅ `subscription.activated`
- ✅ `subscription.updated` 
- ✅ `subscription.canceled`
- ✅ `subscription.paused`
- ✅ `subscription.resumed`
- ✅ `transaction.completed`
- ✅ `transaction.paid`
- ✅ `transaction.updated`

### C. Get the Webhook Secret
1. After creating the webhook, click on it to open details
2. Look for **"Webhook Secret"** or **"Signing Secret"**
3. Copy the secret (it looks like: `whsec_1234567890abcdef...`)

**Update your .env.local:**
```bash
PADDLE_WEBHOOK_SECRET=whsec_1234567890abcdef1234567890abcdef
```

---

## 📸 Visual Guide Screenshots

### Where to find Vendor ID & Auth Code:
```
Paddle Dashboard → Developer Tools → API Keys
┌─────────────────────────────────────┐
│ Vendor ID: 12345                    │
│ Vendor Auth Code: abc123def456      │
└─────────────────────────────────────┘
```

### Where to find Public Key:
```
Paddle Dashboard → Developer Tools → Public Keys
┌─────────────────────────────────────┐
│ -----BEGIN PUBLIC KEY-----          │
│ MIICIjANBgkqhkiG9w0BAQEFAAOCAg8A │
│ ... (copy all lines) ...            │
│ -----END PUBLIC KEY-----            │
└─────────────────────────────────────┘
```

### Where to find Webhook Secret:
```
Paddle Dashboard → Developer Tools → Webhooks → [Your Webhook]
┌─────────────────────────────────────┐
│ Webhook Secret: whsec_abc123...     │
└─────────────────────────────────────┘
```

---

## 🔍 Quick Verification

After getting all credentials, your .env.local should look like:

```bash
# Paddle Legacy Configuration
PADDLE_VENDOR_ID=12345
PADDLE_VENDOR_AUTH_CODE=abc123def456789
PADDLE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyour_actual_key_here
many_lines_of_key_data_here
-----END PUBLIC KEY-----"

# Webhook Configuration  
PADDLE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

---

## ❗ Troubleshooting

### "Can't find API Keys section"
- Make sure you're in **Sandbox** mode (check top navigation)
- Try **Developer Tools** → **Authentication** instead

### "Public key is empty"
- Go to **Developer Tools** → **Public Keys**
- If empty, contact Paddle support to generate one

### "Webhook secret not showing"
- Make sure you **created the webhook first**
- Click on the webhook name to see details
- Look for "Signing Secret" or "Webhook Secret"

### "Invalid credentials" error
- Double-check you're using **sandbox** credentials
- Ensure no extra spaces in the values
- Verify the public key includes BEGIN/END lines

---

## ✅ Ready to Test

Once you have all four credentials:
1. Save your .env.local file
2. Restart your Next.js development server
3. Test the subscription flow at `/signals`
