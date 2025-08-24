import { NextResponse } from 'next/server';

// Test using modern API key with Classic API endpoint
export async function GET() {
  try {
    // Try using your modern API key as Bearer token with Classic API
    const payload = new URLSearchParams({
      vendor_id: '36720',
      product_id: 'pro_01k392e1angt6e8vb3nybgj0mz',
      customer_email: 'test@example.com',
      prices: 'USD:100.00'
    });

    const response = await fetch('https://vendors.paddle.com/api/2.0/product/generate_pay_link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` // Try using your modern API key
      },
      body: payload
    });

    const data = await response.json();

    return NextResponse.json({
      test: 'Testing Classic API with modern Bearer token',
      status: response.status,
      statusText: response.statusText,
      data: data,
      apiKeyUsed: process.env.PADDLE_API_KEY?.substring(0, 20) + '...'
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
