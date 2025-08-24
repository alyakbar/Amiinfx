# Course Name and Phone Number Tracking Update

This document summarizes the updates made to ensure proper tracking of course names and phone numbers in all payment transactions.

## Updates Made

### 1. Crypto Payment Initialize API (`/api/crypto/initialize`)

#### Enhanced Data Capture
- Added `courseName` and `phone` to the request body type
- Updated all transaction records to include:
  - `courseName`: Course being purchased
  - `phone`: Customer phone number (for tracking purposes)
  - `service`: Service/product name (fallback for course name)

#### Coinbase Commerce Integration
- **Metadata Enhancement**: Updated charge creation to include:
  ```javascript
  metadata: {
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    service: service,
    course_name: courseName
  }
  ```

#### Database Records
All transaction records (success, failed, pending) now include:
- `courseName`: Primary course identifier
- `phone`: Customer phone number
- Enhanced metadata for better tracking

### 2. Crypto Payment Verify API (`/api/crypto/verify`)

#### Customer Data Extraction
- **From Coinbase Metadata**: Extracts customer information from charge metadata
- **Success Records**: Include full customer details and course information
- **Pending Records**: Track incomplete payments with customer context

#### Enhanced Verification Tracking
```javascript
{
  provider: "coinbase",
  stage: "verify_success",
  name: customerName,
  email: customerEmail,
  phone: customerPhone,
  courseName: courseName,
  service: courseName
}
```

### 3. M-Pesa STK Push API (`/api/mpesa/stkpush`)

#### Request Data Capture
Enhanced initial record to capture all course information:
```javascript
request: {
  amount,
  phone,
  name,
  email,
  accountReference, // Course name from checkout
  description,      // Course description
  courseName        // Derived course name
}
```

### 4. M-Pesa Callback API (`/api/mpesa/callback`)

#### Course Name Resolution
Improved course name extraction with fallback hierarchy:
1. `courseName` (explicit course name)
2. `accountReference` (from STK push)
3. `description` (payment description)
4. `service` (service name)
5. `"Course Purchase"` (default fallback)

#### Enhanced Transaction Records
```javascript
await saveTransaction({
  // ... other fields
  metadata: {
    merchantRequestID,
    resultCode,
    resultDesc,
    mpesaReceiptNumber,
    transactionDate,
    accountReference,  // Course reference
    description,       // Payment description
    courseName        // Resolved course name
  }
})
```

### 5. Checkout Page Updates (`/app/checkout/[slug]/page.tsx`)

#### Request Enhancement
Both crypto payment handlers now send complete information:
```javascript
{
  name,
  email,
  phone,           // Phone number for tracking
  amountUSD,
  service: courseName,
  courseName,      // Explicit course name
  provider: "coinbase|binance"
}
```

## Data Flow Summary

### M-Pesa Payment Flow
1. **Checkout Page** → Sends course name as `accountReference` and `description`
2. **STK Push** → Stores course info in request record
3. **Callback** → Extracts and records course name in transaction metadata
4. **Database** → Course name available in transaction metadata

### Crypto Payment Flow
1. **Checkout Page** → Sends explicit `courseName` and `phone`
2. **Initialize** → Includes course/phone in provider metadata and database record
3. **Verify** → Extracts customer info from provider metadata
4. **Database** → Complete customer and course information recorded

## Database Schema Impact

### Transaction Records Now Include
```javascript
{
  // Standard fields
  id, type, status, amount, currency, email, phone, name, reference,
  
  // Enhanced metadata
  metadata: {
    courseName: "Course Name",           // Course being purchased
    accountReference: "Course Ref",     // M-Pesa account reference
    description: "Payment description", // Payment description
    // ... other provider-specific fields
  },
  
  // Raw provider data
  raw_data: { /* Provider response */ }
}
```

### M-Pesa Transaction Records
```javascript
{
  provider: "mpesa",
  stage: "init|callback",
  courseName: "Extracted Course Name",
  phone: "Customer Phone",
  name: "Customer Name",
  email: "Customer Email",
  // ... other fields
}
```

### Crypto Transaction Records
```javascript
{
  provider: "coinbase|binance",
  stage: "init|verify_success|verify_pending|init_failed",
  courseName: "Course Name",
  phone: "Customer Phone", 
  name: "Customer Name",
  email: "Customer Email",
  // ... other fields
}
```

## Benefits Achieved

### 1. Complete Transaction Tracking
- ✅ **Course Information**: Every transaction records which course was purchased
- ✅ **Customer Contact**: Phone numbers captured for follow-up/support
- ✅ **Failed Payments**: Even failed payments record customer and course intent

### 2. Better Customer Support
- 📞 **Direct Contact**: Phone numbers available for payment issues
- 📚 **Course Context**: Support knows exactly which course customer tried to purchase
- 🔍 **Transaction History**: Complete audit trail for each customer

### 3. Enhanced Analytics
- 📊 **Course Performance**: Track which courses generate most payment attempts
- 📈 **Conversion Rates**: Success rates by course and payment method
- 🎯 **Customer Insights**: Demographics and preferences by course type

### 4. Improved Email Notifications
- 📧 **Course-Specific**: Confirmation emails reference correct course
- 🎓 **Personalized**: Customer support can reference specific purchases
- 📝 **Accurate Records**: Database contains complete purchase history

## Verification Steps

### To Verify Implementation Works:

1. **Test M-Pesa Payment**:
   - Go to checkout page
   - Select a course
   - Initiate M-Pesa payment
   - Check database for course name in metadata

2. **Test Crypto Payment**:
   - Go to checkout page
   - Select a course
   - Try Coinbase/Binance payment
   - Verify course info in transaction records

3. **Check Database Records**:
   ```javascript
   // Query recent transactions
   db.transactions.find().sort({createdAt: -1}).limit(10)
   
   // Verify metadata includes courseName
   db.transactions.find({"metadata.courseName": {$exists: true}})
   ```

## Next Steps

1. **Monitor Implementation**: Check that course names are being captured correctly
2. **Update Reports**: Modify admin dashboards to show course information
3. **Customer Support**: Train support team to use new customer/course data
4. **Analytics Enhancement**: Build reports using course and customer data

This implementation ensures that no transaction occurs without proper course and customer context, making support, analytics, and follow-up much more effective.
