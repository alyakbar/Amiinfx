# Transaction Recording System

This system processes and records all payment transactions from M-Pesa and Paystack into a unified Firestore database.

## Features

- ✅ Process existing M-Pesa payments from JSON file
- ✅ Unified transaction format for all payment providers
- ✅ Real-time transaction recording for new payments
- ✅ Web interface for viewing transactions
- ✅ Duplicate detection and prevention
- ✅ Comprehensive transaction metadata

## Setup

### 1. Configure Firebase

Set up your Firebase service account credentials in one of these ways:

**Option A: Environment Variable (Recommended)**
```bash
# Set the service account JSON as an environment variable
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
```

**Option B: Service Account File**
```bash
# Set the path to your service account file
FIREBASE_SERVICE_ACCOUNT_PATH='/path/to/serviceAccount.json'
```

### 2. Process Existing Payments

Run the command to process all existing M-Pesa payments:

```bash
npm run process-payments
```

This will:
- Read all payments from `data/mpesa-payments.json`
- Convert them to standardized transaction format
- Save to Firestore `transactions` collection
- Remove duplicates based on transaction IDs

### 3. View Transactions

Access the admin interface at:
```
http://localhost:3000/admin/transactions
```

Or use the API endpoint:
```
GET /api/transactions
```

## Transaction Schema

Each transaction record contains:

```typescript
{
  id: string;                    // Unique transaction ID
  type: 'mpesa' | 'paystack' | 'paddle';    // Payment provider
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  amount: number;                // Amount in actual currency (not cents)
  currency: string;              // Currency code (KES, NGN, etc.)
  email?: string;                // Customer email
  phone?: string;                // Customer phone
  name?: string;                 // Customer name
  reference: string;             // Payment reference
  metadata: object;              // Provider-specific metadata
  paid_at: string;               // Payment timestamp
  raw_data: object;              // Original payment data
  createdAt: timestamp;          // Firestore timestamp
  updatedAt: timestamp;          // Firestore timestamp
}
```

## API Endpoints

### GET /api/transactions
Fetch all transactions from the database.

Response:
```json
{
  "transactions": [...],
  "count": 123,
  "success": true
}
```

### POST /api/transactions
Process existing M-Pesa payments.

Request:
```json
{
  "action": "process_mpesa_payments"
}
```

## Transaction Status Mapping

### M-Pesa Result Codes
- `0` → `success` (Transaction successful)
- `1032` → `cancelled` (Request cancelled by user)
- `1037` → `failed` (No response from user)
- Other codes → `failed`

### Paystack Status
- `success` → `success`
- Other status → `failed`

## Files Structure

```
├── scripts/
│   ├── process-mpesa-payments.ts  # Main processing logic
│   └── run-processing.ts          # CLI runner
├── app/
│   ├── api/
│   │   ├── transactions/route.ts  # Transactions API
│   │   ├── mpesa/callback/route.ts # M-Pesa webhook (updated)
│   │   └── paystack/verify/route.ts # Paystack verification (updated)
│   └── admin/
│       └── transactions/page.tsx  # Admin interface
├── lib/
│   └── firestore-admin.ts         # Database functions
└── data/
    └── mpesa-payments.json        # Source M-Pesa data
```

## Troubleshooting

### Firebase Configuration Issues
- Ensure service account has Firestore permissions
- Check that project ID matches your Firebase project
- Verify JSON format if using environment variable

### Processing Issues
- Ensure `data/mpesa-payments.json` exists and is valid JSON
- Check console output for specific error messages
- Verify internet connection for Firestore access

### No Transactions Showing
- Run the processing script first: `npm run process-payments`
- Check browser console for API errors
- Verify Firestore rules allow read access
