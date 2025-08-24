# Email OTP Verification System

## Overview
This system implements email-based OTP (One-Time Password) verification for user registration in the Amiin FX platform.

## Features
- ✅ 6-digit OTP generation
- ✅ Email delivery with professional templates
- ✅ 10-minute expiration time
- ✅ Firestore storage for OTP data
- ✅ Resend functionality with cooldown
- ✅ Clean error handling
- ✅ Welcome email after successful registration

## Flow
1. User fills signup form
2. System sends OTP to email
3. User enters OTP on verification page
4. System verifies OTP
5. Firebase account is created
6. Welcome email is sent
7. User is redirected to dashboard

## API Endpoints
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/cleanup-otp` - Clean up OTP data
- `POST /api/auth/send-welcome` - Send welcome email

## Components
- `app/signup/page.tsx` - Updated signup form
- `app/verify-otp/page.tsx` - OTP verification page
- `hooks/useOTP.ts` - OTP management hook
- `lib/otp.ts` - OTP utility functions
- `lib/email-templates.ts` - Email templates

## Security Features
- OTP expires after 10 minutes
- Rate limiting with resend cooldown
- Email format validation
- Firestore cleanup after verification
- Error message sanitization

## Testing
To test the OTP system:
1. Navigate to `/signup`
2. Fill in the form
3. Check email for OTP
4. Enter OTP on verification page
5. Account should be created and user redirected

## Configuration
Required environment variables:
- `GMAIL_USER` - Gmail account for sending emails
- `GMAIL_PASS` - Gmail app password
- Firebase configuration in `lib/firebase.ts`
