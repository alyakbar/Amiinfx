import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// POST /api/admin/transactions/[id]/retry - Retry failed transaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    // Check if transaction exists
    const transactionDoc = await db.collection('transactions').doc(params.id).get();
    if (!transactionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transactionData = transactionDoc.data();
    
    // Check if transaction can be retried
    if (transactionData?.status !== 'failed') {
      return NextResponse.json(
        { success: false, error: 'Only failed transactions can be retried' },
        { status: 400 }
      );
    }

    // Update transaction status to pending
  await db.collection('transactions').doc(params.id).update({
      status: 'pending',
      retryCount: (transactionData.retryCount || 0) + 1,
      lastRetryAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create notification for retry
  await db.collection('notifications').add({
      title: 'Transaction Retry Initiated',
      message: `Retry initiated for transaction ${transactionData.reference}`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Here you would typically trigger the actual payment retry logic
    // For now, we'll just update the status
    
    return NextResponse.json({
      success: true,
      message: 'Transaction retry initiated'
    });
  } catch (error) {
    console.error('Error retrying transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retry transaction' },
      { status: 500 }
    );
  }
}
