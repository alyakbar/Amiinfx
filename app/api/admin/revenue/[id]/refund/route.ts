import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// POST /api/admin/revenue/[id]/refund - Process refund
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund amount' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    // Check if original transaction exists
    const originalDoc = await db.collection('revenue').doc(params.id).get();
    if (!originalDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Original transaction not found' },
        { status: 404 }
      );
    }

    const originalData = originalDoc.data();
    
    // Check if transaction can be refunded
    if (originalData?.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Only completed transactions can be refunded' },
        { status: 400 }
      );
    }

    if (amount > originalData.amount) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed original amount' },
        { status: 400 }
      );
    }

    // Update original transaction status
  await db.collection('revenue').doc(params.id).update({
      status: 'refunded',
      refundedAt: new Date().toISOString(),
      refundAmount: amount
    });

    // Create refund transaction record
    const refundData = {
      type: 'refund',
      description: `Refund for: ${originalData.description}`,
      amount: -amount, // Negative amount for refund
      status: 'completed',
      customerEmail: originalData.customerEmail,
      paymentMethod: originalData.paymentMethod,
      courseTitle: originalData.courseTitle || null,
      originalTransactionId: params.id,
      date: new Date().toISOString()
    };

  const refundRef = await db.collection('revenue').add(refundData);

    // Create notification for refund
  await db.collection('notifications').add({
      title: 'Refund Processed',
      message: `Refund of $${amount} processed for ${originalData.customerEmail}`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refundRef.id,
        ...refundData
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
