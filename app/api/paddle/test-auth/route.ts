import { NextResponse } from 'next/server';

// Test Paddle Classic API to see what's required
export async function GET() {
  try {
    // Test with just vendor ID to see what error we get
    const payload = new URLSearchParams({
      vendor_id: '36720',
      // vendor_auth_code: 'test', // Let's see what happens without this
      product_id: 'pro_01k392e1angt6e8vb3nybgj0mz',
      customer_email: 'test@example.com',
      prices: 'USD:100.00'
    });

    const response = await fetch('https://vendors.paddle.com/api/2.0/product/generate_pay_link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload
    });

    const data = await response.json();

    return NextResponse.json({
      test: 'Testing without auth code to see required fields',
      status: response.status,
      statusText: response.statusText,
      data: data,
      message: 'This will show us what fields are required'
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
