import { NextResponse } from 'next/server';
import { saveMpesaTransaction } from '@/lib/firestore-admin';

// Paddle initialization: create a checkout link using Paddle Vendor API (server-side)
export async function POST(req: Request) {
  try {
    const { email, amount, name, service, planCode } = await req.json();

    // Paddle uses vendor_id + vendor_auth_code or the Checkout API for creating checkout links.
    // Here we call Paddle's /2.0/product/generate_pay_link (server-side) and return the URL to client.
    const payload: Record<string, unknown> = {
      vendor_id: process.env.PADDLE_VENDOR_ID,
      vendor_auth_code: process.env.PADDLE_VENDOR_AUTH_CODE,
      title: service || 'Purchase',
      prices: [`USD:${(Number(amount) / 100).toFixed(2)}`],
      customer_email: email || undefined,
      passthrough: JSON.stringify({ name, service }),
      // You may include return_url/cancel_url here
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    };

    const res = await fetch('https://vendors.paddle.com/api/2.0/product/generate_pay_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(Object.entries(payload).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)),
    });

    const data = await res.json();

    try {
      await saveMpesaTransaction({ provider: 'paddle', stage: 'init', initData: data, email, amount, name, service });
    } catch (err) {
      console.warn('Failed to save paddle init to Firestore', err);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Paddle init error', err);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
