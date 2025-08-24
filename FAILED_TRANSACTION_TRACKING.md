# Failed Transaction Tracking

This document explains how failed crypto transactions are tracked and recorded in the AmiinFX database.

## Overview

The crypto payment system now comprehensively tracks all transaction attempts, including failures, to provide complete audit trails and help with debugging payment issues.

## Transaction Stages and Failure Points

### 1. Initialization Failures (`/api/crypto/initialize`)

#### Coinbase Commerce Failures
- **Missing API Key**: When `COINBASE_COMMERCE_API_KEY` is not configured
- **API Request Failed**: When Coinbase Commerce API returns an error
- **Exception During Init**: When an unexpected error occurs during initialization

#### Binance Pay Failures
- **Missing Environment Variables**: When Binance Pay credentials are incomplete
- **API Request Failed**: When Binance Pay API returns an error
- **Exception During Init**: When an unexpected error occurs during initialization

### 2. Verification Failures (`/api/crypto/verify`)

#### Coinbase Commerce Verification Failures
- **Missing Charge ID**: When verification request lacks charge identifier
- **Charge Not Found**: When the charge ID doesn't exist in Coinbase Commerce
- **Payment Pending**: When payment is initiated but not completed
- **Exception During Verify**: When an unexpected error occurs during verification

#### Binance Pay Verification Failures
- **Missing Parameters**: When `merchantTradeNo` or `orderId` is missing
- **Missing Environment Variables**: When Binance Pay credentials are incomplete
- **API Request Failed**: When Binance Pay query API returns an error
- **Payment Pending**: When payment status is not SUCCESS/COMPLETED/PAID
- **Exception During Verify**: When an unexpected error occurs during verification

## Database Records

All transaction attempts (successful and failed) are recorded with the following structure:

### Common Fields
```javascript
{
  provider: "coinbase" | "binance",
  stage: "init" | "init_failed" | "init_exception" | "verify_success" | "verify_failed" | "verify_pending" | "verify_exception",
  status: "initialized" | "success" | "failed" | "pending",
  timestamp: "2025-08-23T10:30:00.000Z",
  name: "Customer Name",
  email: "customer@email.com",
  amountUSD: 100.00,
  service: "Service Name"
}
```

### Failure-Specific Fields
```javascript
{
  error: "Error message or object",
  failureReason: "Human-readable failure description",
  raw: { /* Raw API response data */ }
}
```

### Provider-Specific Fields

#### Coinbase Commerce
```javascript
{
  chargeId: "charge_id_from_coinbase",
  hostUrl: "https://commerce.coinbase.com/charges/...",
  charge: { /* Full charge object from Coinbase */ }
}
```

#### Binance Pay
```javascript
{
  merchantTradeNo: "amiinfx_1692781234567_1234",
  orderId: "order_id_from_binance",
  hostUrl: "https://pay.binance.com/..."
}
```

## Transaction Status Flow

### Successful Flow
1. `init` (status: "initialized") → Payment page displayed
2. `verify_success` (status: "success") → Payment completed

### Failed Flows

#### Initialization Failures
1. `init_failed` (status: "failed") → API returned error
2. `init_exception` (status: "failed") → Code exception occurred

#### Verification Failures
1. `verify_failed` (status: "failed") → Verification request failed
2. `verify_pending` (status: "pending") → Payment not completed yet
3. `verify_exception` (status: "failed") → Code exception during verification

## Monitoring and Analytics

### Key Metrics to Track
- **Initialization Success Rate**: `init` / (`init` + `init_failed` + `init_exception`)
- **Payment Success Rate**: `verify_success` / total verification attempts
- **Failure Reasons**: Group by `failureReason` to identify common issues
- **Provider Performance**: Compare success rates between Coinbase and Binance

### Common Failure Patterns
1. **Configuration Issues**: Missing environment variables
2. **API Connectivity**: Network or API service issues
3. **User Abandonment**: Payments initiated but never completed
4. **Invalid Parameters**: Malformed requests or missing data

## Debugging Failed Transactions

### 1. Check Environment Variables
Ensure all required environment variables are set:
```bash
# Coinbase Commerce
COINBASE_COMMERCE_API_KEY=your_key_here

# Binance Pay
BINANCE_PAY_MERCHANT_ID=your_merchant_id
BINANCE_PAY_API_KEY=your_api_key
BINANCE_PAY_API_SECRET=your_secret
BINANCE_PAY_API_HOST=https://bpay.binanceapi.com
```

### 2. Review Error Logs
Check the database for failed transactions:
```javascript
// Query failed transactions
const failedTransactions = await getTransactions({
  status: "failed",
  provider: "coinbase", // or "binance"
  timeRange: "last_24_hours"
});
```

### 3. Common Solutions

#### API Key Issues
- Verify API keys are correct and active
- Check API key permissions in provider dashboard
- Ensure API keys are for the correct environment (sandbox vs production)

#### Network Issues
- Check API endpoint availability
- Verify firewall and proxy settings
- Test API connectivity manually

#### Data Issues
- Validate input parameters
- Check currency and amount formats
- Ensure customer data is complete

## Best Practices

### 1. Error Handling
- Always wrap payment operations in try-catch blocks
- Provide meaningful error messages to users
- Log detailed error information for debugging

### 2. User Experience
- Show appropriate loading states during payment processing
- Provide clear error messages for common failures
- Offer alternative payment methods when one fails

### 3. Monitoring
- Set up alerts for high failure rates
- Monitor API response times
- Track user abandonment patterns

### 4. Data Retention
- Keep failed transaction records for audit purposes
- Implement data archiving for old transactions
- Ensure compliance with data protection regulations

## Transaction Query Examples

### Find All Failed Transactions Today
```javascript
const today = new Date().toISOString().split('T')[0];
const failedToday = await getTransactions({
  status: "failed",
  timestamp: { $gte: `${today}T00:00:00.000Z` }
});
```

### Get Failure Reasons Summary
```javascript
const failureSummary = await aggregateTransactions([
  { $match: { status: "failed" } },
  { $group: { _id: "$failureReason", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### Compare Provider Success Rates
```javascript
const providerStats = await aggregateTransactions([
  { $group: {
    _id: { provider: "$provider", status: "$status" },
    count: { $sum: 1 }
  }},
  { $group: {
    _id: "$_id.provider",
    total: { $sum: "$count" },
    successful: {
      $sum: { $cond: [{ $eq: ["$_id.status", "success"] }, "$count", 0] }
    }
  }}
]);
```

This comprehensive tracking system ensures that no transaction attempt goes unrecorded, making it easier to debug issues, improve payment success rates, and provide better customer support.
