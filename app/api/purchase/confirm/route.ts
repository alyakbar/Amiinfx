import { NextRequest, NextResponse } from 'next/server';
import { sendPurchaseConfirmationEmail, recordPurchaseInDatabase } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email, name, courseName, amount, currency, transactionId, paymentMethod } = await req.json();

    if (!email || !name || !courseName || !amount || !currency || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send purchase confirmation email
    const emailSent = await sendPurchaseConfirmationEmail(
      email,
      name,
      courseName,
      amount,
      currency,
      transactionId
    );

    // Record purchase in database
    const recordSaved = await recordPurchaseInDatabase(
      email,
      name,
      courseName,
      amount,
      currency,
      transactionId,
      paymentMethod || 'test'
    );

    return NextResponse.json({
      success: true,
      emailSent,
      recordSaved,
      message: 'Purchase confirmation processed successfully'
    });

  } catch (error) {
    console.error('Purchase confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process purchase confirmation' },
      { status: 500 }
    );
  }
}

// Test endpoint - GET request to send a test email
export async function GET() {
  try {
    const testData = {
      email: 'test@example.com',
      name: 'Test User',
      courseName: 'Master Sniper Entries',
      amount: 199,
      currency: 'USD',
      transactionId: `test_${Date.now()}`,
      paymentMethod: 'test'
    };

    const emailSent = await sendPurchaseConfirmationEmail(
      testData.email,
      testData.name,
      testData.courseName,
      testData.amount,
      testData.currency,
      testData.transactionId
    );

    return NextResponse.json({
      success: true,
      emailSent,
      message: 'Test email sent successfully',
      testData
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
