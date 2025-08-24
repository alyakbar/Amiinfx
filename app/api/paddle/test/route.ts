import { NextResponse } from 'next/server';

// Test Paddle API connection and get prices
export async function GET() {
  try {
    console.log('Testing Paddle API with key:', process.env.PADDLE_API_KEY?.substring(0, 20) + '...');

    const apiUrl = 'https://sandbox-api.paddle.com';

    // Get products and their prices
    const productsResponse = await fetch(`${apiUrl}/products`, {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const productsData = await productsResponse.json();

    // Get prices for all products
    const pricesResponse = await fetch(`${apiUrl}/prices`, {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const pricesData = await pricesResponse.json();

    return NextResponse.json({
      environment: process.env.PADDLE_ENVIRONMENT,
      apiKey: process.env.PADDLE_API_KEY?.substring(0, 20) + '...',
      products: productsData,
      prices: pricesData,
      message: 'API working! Now we need to find the correct Price IDs for checkout sessions.'
    });

  } catch (error) {
    console.error('Paddle API test error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
