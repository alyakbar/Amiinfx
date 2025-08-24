# Crypto Payment Setup Guide

This document explains how to set up cryptocurrency payments with both Coinbase Commerce and Binance Pay for AmiinFX.

## Environment Variables Required

### Coinbase Commerce
Add these environment variables to your `.env.local` file:

```env
COINBASE_COMMERCE_API_KEY=your_coinbase_commerce_api_key_here
```

**How to get Coinbase Commerce API Key:**
1. Go to [Coinbase Commerce](https://commerce.coinbase.com/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the API key and add it to your environment variables

### Binance Pay
Add these environment variables to your `.env.local` file:

```env
BINANCE_PAY_MERCHANT_ID=your_binance_merchant_id
BINANCE_PAY_API_KEY=your_binance_api_key
BINANCE_PAY_API_SECRET=your_binance_api_secret
BINANCE_PAY_API_HOST=https://bpay.binanceapi.com
```

**How to get Binance Pay credentials:**
1. Go to [Binance Pay for Business](https://pay.binance.com/en/business)
2. Apply for merchant account
3. Once approved, access your merchant dashboard
4. Get your API credentials from the developer section

## Payment Flow

### Coinbase Commerce
- Supports: Bitcoin (BTC), Ethereum (ETH), USD Coin (USDC), and other major cryptocurrencies
- User is redirected to Coinbase hosted payment page
- Automatic conversion from USD to crypto
- Real-time payment confirmation

### Binance Pay
- Supports: Multiple cryptocurrencies through Binance ecosystem
- User is redirected to Binance Pay hosted page
- Direct crypto payments from Binance wallet
- Fast settlement

## Button Configuration

The checkout page now has two separate crypto payment buttons:

1. **Coinbase Button** (Blue) - Uses Bitcoin icon
   - Text: "Pay with Coinbase (BTC, ETH, USDC)"
   - Provider: `coinbase`

2. **Binance Button** (Yellow) - Uses Coins icon
   - Text: "Pay with Binance Pay (Crypto)"
   - Provider: `binance`

## Testing

### Coinbase Commerce Testing
- Use Coinbase Commerce sandbox environment
- Test with small amounts first
- Verify webhook endpoints

### Binance Pay Testing
- Use Binance Pay testnet/sandbox
- Test different cryptocurrencies
- Verify API responses

## Security Notes

1. **Never commit API keys to version control**
2. **Use different keys for development and production**
3. **Regularly rotate API keys**
4. **Monitor API usage and set rate limits**
5. **Implement proper error handling**

## Troubleshooting

### Common Issues

1. **"Missing API key" error**
   - Check environment variables are properly set
   - Verify variable names match exactly

2. **"Invalid signature" error (Binance)**
   - Check API secret is correct
   - Verify timestamp and nonce generation

3. **"Charge creation failed" (Coinbase)**
   - Check API key permissions
   - Verify account is in good standing

### Support

- **Coinbase Commerce**: [Documentation](https://commerce.coinbase.com/docs/)
- **Binance Pay**: [Developer Documentation](https://developers.binance.com/docs/binance-pay)

## Next Steps

1. Set up environment variables
2. Test in development environment
3. Configure webhooks for payment confirmations
4. Deploy to production with production API keys
