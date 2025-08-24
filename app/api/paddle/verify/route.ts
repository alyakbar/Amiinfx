import { NextResponse } from 'next/server';
import { saveMpesaTransaction, saveTransaction } from '@/lib/firestore-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order');

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  try {
    // Paddle doesn't have a single 'verify order' endpoint like Paystack; use List Payments or Orders
    const payload = new URLSearchParams({
      vendor_id: process.env.PADDLE_VENDOR_ID || '',
      vendor_auth_code: process.env.PADDLE_VENDOR_AUTH_CODE || '',
      order_id: orderId,
    });

    const res = await fetch('https://vendors.paddle.com/api/2.0/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
    });

    const data = await res.json();

    if (!data || !data.success) {
      return NextResponse.json({ error: 'Payment not found or not successful' }, { status: 400 });
    }

    const order = data.response;

    try {
      // Save legacy record
      await saveMpesaTransaction({ provider: 'paddle', stage: 'verify', transaction: order, name: order?.passthrough?.name || null, email: order?.customer_email || null, amount: order?.total || null, currency: order?.currency || 'USD' });

      // Save to unified transactions collection
      const txId = `paddle_${orderId}`;
      await saveTransaction({
        id: txId,
        type: 'paddle',
        status: order?.status === 'paid' ? 'success' : 'failed',
        amount: Number(order?.total) || 0,
        currency: order?.currency || 'USD',
        email: order?.customer_email || '',
        phone: order?.customer_phone || '',
        name: order?.passthrough?.name || order?.customer_name || '',
        reference: String(orderId),
        metadata: order,
        paid_at: order?.paid_at || new Date().toISOString(),
        raw_data: order,
      });
    } catch (err) {
      console.warn('Failed to save paddle verify to Firestore', err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error verifying paddle order:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
