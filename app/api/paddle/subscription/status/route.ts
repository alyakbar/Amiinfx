import { NextResponse } from 'next/server';

// Check subscription status for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const customerId = searchParams.get('customer_id');

    if (!email && !customerId) {
      return NextResponse.json({ 
        error: 'Email or customer_id is required' 
      }, { status: 400 });
    }

    // Search for active subscriptions
    const queryParams = new URLSearchParams();
    if (email) queryParams.append('customer[email]', email);
    if (customerId) queryParams.append('customer_id', customerId);
    queryParams.append('status', 'active');

    // Determine API base URL based on environment
    const apiBaseUrl = process.env.PADDLE_ENVIRONMENT === 'sandbox' 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com';

    const response = await fetch(`${apiBaseUrl}/subscriptions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch subscription status',
        details: data 
      }, { status: response.status });
    }

    const subscriptions = data.data || [];
    const activeSubscriptions = subscriptions.filter((sub: { status: string }) => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    return NextResponse.json({
      has_active_subscription: activeSubscriptions.length > 0,
      subscriptions: activeSubscriptions,
      total_subscriptions: subscriptions.length
    });

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
