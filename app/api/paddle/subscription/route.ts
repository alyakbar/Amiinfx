import { NextResponse } from 'next/server';
import { saveMpesaTransaction } from '@/lib/firestore-admin';

// Paddle subscription initialization
export async function POST(req: Request) {
  try {
    const { email, planType, name } = await req.json();

    // Define subscription plan configurations
    const subscriptionPlans = {
      '1-month': {
        plan_id: process.env.PADDLE_1_MONTH_PLAN_ID,
        price: 100,
        duration: 'monthly'
      },
      '3-months': {
        plan_id: process.env.PADDLE_3_MONTHS_PLAN_ID,
        price: 199,
        duration: 'quarterly'
      },
      'lifetime': {
        plan_id: process.env.PADDLE_LIFETIME_PLAN_ID,
        price: 599,
        duration: 'one-time'
      }
    };

    const selectedPlan = subscriptionPlans[planType as keyof typeof subscriptionPlans];
    
    if (!selectedPlan) {
      return NextResponse.json({ 
        status: false, 
        message: 'Invalid plan type' 
      }, { status: 400 });
    }

    // Since the test showed only the Classic API works, use that instead
    // Map Price IDs back to Product IDs for the Classic API
    const priceToProductMap = {
      'pri_01k394ag7myqvk6r711b4vwr73': 'pro_01k392e1angt6e8vb3nybgj0mz', // 1 month
      'pri_01k3948mqcr0243xgjxy848xr8': 'pro_01k393yk58stnmtp0rtwx874a2', // 3 months  
      'pri_01k394e7w5tnsja08a557f7d08': 'pro_01k394bt7rk25zg0qn9h2pqbky'  // lifetime
    };

    const productId = priceToProductMap[selectedPlan.plan_id as keyof typeof priceToProductMap];
    
    if (!productId) {
      return NextResponse.json({ 
        status: false, 
        message: 'Product not found for selected plan' 
      }, { status: 400 });
    }

    // Use Paddle Classic API (v2) since that's what works with your account
    const payload = {
      vendor_id: process.env.PADDLE_VENDOR_ID,
      vendor_auth_code: process.env.PADDLE_VENDOR_AUTH_CODE,
      product_id: productId,
      customer_email: email,
      customer_name: name,
      prices: [`USD:${selectedPlan.price}.00`],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?paddle=true&plan=${planType}`,
      passthrough: JSON.stringify({
        customer_name: name,
        plan_type: planType,
        service: 'Trading Signals Subscription'
      })
    };

    const res = await fetch('https://vendors.paddle.com/api/2.0/product/generate_pay_link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(Object.entries(payload).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>))
    });

    const data = await res.json();

    console.log('Paddle API Response:', {
      status: res.status,
      statusText: res.statusText,
      data: data
    });

    // Log the subscription initialization
    try {
      await saveMpesaTransaction({ 
        provider: 'paddle', 
        stage: 'subscription_init', 
        initData: data, 
        email, 
        amount: selectedPlan.price * 100, // Store in cents
        name, 
        service: `Trading Signals - ${planType}`,
        metadata: { planType, selectedPlan }
      });
    } catch (err) {
      console.warn('Failed to save paddle subscription init to Firestore', err);
    }

    // Return the checkout URL for client-side redirect (Classic API format)
    if (data.success && data.response && data.response.url) {
      return NextResponse.json({
        status: true,
        checkout_url: data.response.url,
        session_id: data.response.checkout_id || data.response.id
      });
    } else {
      console.error('Paddle subscription init failed:', data);
      return NextResponse.json({ 
        status: false, 
        message: 'Failed to create subscription checkout',
        error: data 
      }, { status: 400 });
    }

  } catch (err) {
    console.error('Paddle subscription init error', err);
    return NextResponse.json({ 
      status: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}
