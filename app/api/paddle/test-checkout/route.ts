import { NextResponse } from 'next/server';

// Test creating a checkout session with multiple endpoint attempts
export async function POST() {
  try {
    const testPayload = {
      items: [{
        price_id: 'pri_01k394ag7myqvk6r711b4vwr73', // 1 month plan
        quantity: 1
      }],
      customer_email: 'test@example.com',
      custom_data: {
        customer_name: 'Test User',
        plan_type: '1-month',
        service: 'Trading Signals Subscription'
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?paddle=true&plan=1-month`
    };

    // Try multiple possible endpoints
    const endpoints = [
      'https://sandbox-api.paddle.com/checkout-sessions',
      'https://sandbox-api.paddle.com/transactions',
      'https://sandbox-api.paddle.com/checkout',
      'https://sandbox-api.paddle.com/subscriptions',
      'https://api.paddle.com/checkout-sessions',
      'https://checkout.paddle.com/api/2.0/checkout',
      'https://vendors.paddle.com/api/2.0/product/generate_pay_link'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log('Testing endpoint:', endpoint);
        
        // Adjust payload based on endpoint
        let payload = testPayload;
        let headers: Record<string, string> = {
          'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json'
        };

        // For legacy endpoints, try form-encoded
        if (endpoint.includes('vendors.paddle.com')) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          payload = {
            vendor_id: process.env.PADDLE_VENDOR_ID || '12345',
            vendor_auth_code: process.env.PADDLE_VENDOR_AUTH_CODE || 'test',
            product_id: 'pro_01k392e1angt6e8vb3nybgj0mz',
            customer_email: 'test@example.com',
            prices: ['USD:100.00'],
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?paddle=true&plan=1-month`
          } as any;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: endpoint.includes('vendors.paddle.com') 
            ? new URLSearchParams(payload as any)
            : JSON.stringify(payload)
        });

        const data = await response.json();
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          data: data
        });

        // If we get a successful response, break
        if (response.ok) {
          break;
        }
      } catch (err) {
        results.push({
          endpoint,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Testing multiple Paddle endpoints to find the correct one',
      results
    });

  } catch (error) {
    console.error('Checkout session test error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also handle GET requests
export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to test checkout session creation'
  });
}
