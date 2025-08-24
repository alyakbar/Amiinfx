import { NextRequest, NextResponse } from 'next/server';
import { saveMpesaTransaction, saveTransaction } from '@/lib/firestore-admin';
import { verifyPaddleSignature } from '@/lib/paddle';
import { sendPurchaseConfirmationEmail, recordPurchaseInDatabase } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  const text = await req.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    // Paddle sends form-encoded payloads for webhooks; try to parse as JSON
    payload = JSON.parse(text);
  } catch {
    // Fallback: parse urlencoded
    const params = new URLSearchParams(text);
    payload = {} as Record<string, unknown>;
    for (const [k, v] of params.entries()) {
      // Try to parse JSON values if present
      try { payload[k] = JSON.parse(v); } catch { payload[k] = v; }
    }
  }

  const signature = (payload?.p_signature) || '';
  const publicKey = process.env.PADDLE_PUBLIC_KEY || '';

  let verified = false;
  try {
    verified = verifyPaddleSignature(payload, signature, publicKey);
  } catch (err) {
    console.warn('Paddle webhook verification error', err);
  }

  // Save raw webhook for audit
  try {
    await saveMpesaTransaction({ provider: 'paddle', stage: 'webhook', initData: payload, verified });
  } catch (err) {
    console.warn('Failed to save paddle webhook to Firestore', err);
  }

  // Handle both one-time payments and subscription events
  try {
    const status = (payload?.status || payload?.alert_name || payload?.event_type || '').toString();
    const email = payload?.email || payload?.customer_email || payload?.data?.customer?.email || null;
    const amount = parseFloat((payload?.amount || payload?.sale_gross || payload?.data?.details?.totals?.total || 0).toString()) || 0;
    const currency = (payload?.currency || payload?.sale_currency || payload?.data?.currency_code || 'USD').toString();
    const reference = (payload?.order_id || payload?.checkout_id || payload?.sale_id || payload?.data?.id || payload?.subscription_id || '').toString();

    // Handle subscription events (Paddle Billing API v4)
    const isSubscriptionEvent = payload?.event_type && (
      payload.event_type.includes('subscription') || 
      payload.event_type.includes('transaction.completed') ||
      payload.event_type === 'transaction.paid'
    );

    // Handle legacy one-time payments and new subscription events
    const isSuccessfulPayment = 
      status.toLowerCase().includes('filled') || 
      status.toLowerCase().includes('completed') || 
      payload?.alert_name === 'payment_succeeded' ||
      payload?.event_type === 'transaction.completed' ||
      payload?.event_type === 'transaction.paid' ||
      payload?.event_type === 'subscription.activated';

    if (isSuccessfulPayment) {
      const transactionData = {
        id: `paddle_${reference || Date.now()}`,
        type: 'paddle' as const,
        status: 'success' as const,
        amount,
        currency: currency || 'USD',
        email: email || undefined,
        phone: undefined,
        name: payload?.customer_name || payload?.data?.customer?.name || undefined,
        reference: reference || '',
        paid_at: new Date().toISOString(),
        metadata: {
          ...payload,
          is_subscription: isSubscriptionEvent,
          plan_type: payload?.data?.custom_data?.plan_type || payload?.passthrough?.plan_type || null,
          subscription_id: payload?.subscription_id || payload?.data?.subscription_id || null
        },
        raw_data: payload,
      };

      await saveTransaction(transactionData);

      // Send purchase confirmation email and record purchase
      if (email && transactionData.name) {
        try {
          // Extract course name from metadata or use service name
          const courseName = transactionData.metadata?.service || 
                           payload?.service || 
                           payload?.data?.custom_data?.course_name ||
                           'Course Purchase';

          // Send confirmation email
          await sendPurchaseConfirmationEmail(
            email,
            transactionData.name,
            courseName,
            amount,
            currency,
            reference
          );

          // Record purchase in database
          await recordPurchaseInDatabase(
            email,
            transactionData.name,
            courseName,
            amount,
            currency,
            reference,
            'paddle'
          );

          console.log(`Purchase confirmation sent for ${courseName} to ${email}`);
        } catch (emailError) {
          console.error('Failed to send purchase confirmation:', emailError);
          // Don't fail the webhook if email fails
        }
      }

      // For subscription events, also save subscription-specific data
      if (isSubscriptionEvent) {
        await saveMpesaTransaction({ 
          provider: 'paddle', 
          stage: 'subscription_webhook', 
          initData: payload,
          email: email as string | null,
          amount,
          name: payload?.customer_name || payload?.data?.customer?.name || null,
          service: 'Trading Signals Subscription',
          metadata: {
            event_type: payload?.event_type,
            subscription_id: payload?.subscription_id || payload?.data?.subscription_id,
            plan_type: payload?.data?.custom_data?.plan_type || payload?.passthrough?.plan_type
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to save paddle unified transaction', err);
  }

  return NextResponse.json({ success: true, verified });
}
