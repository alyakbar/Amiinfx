import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/admin/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
  const transactionDoc = await db.collection('transactions').doc(params.id).get();

    if (!transactionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionDoc.id,
        ...transactionDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reference, amount, status, description } = body;

    // Validation
    if (amount && amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
  // Check if transaction exists
  const transactionDoc = await db.collection('transactions').doc(params.id).get();
    if (!transactionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if reference is being changed to an existing reference
  if (reference && transactionDoc.data()?.reference !== reference) {
      const existingTransaction = await db.collection('transactions')
        .where('reference', '==', reference)
        .get();
      
      if (!existingTransaction.empty) {
        return NextResponse.json(
          { success: false, error: 'Transaction with this reference already exists' },
          { status: 400 }
        );
      }
    }

  const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };

    if (reference) updateData.reference = reference;
    if (amount) updateData.amount = parseFloat(amount);
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;

  await db.collection('transactions').doc(params.id).update(updateData);

    // Create notification for transaction update
    await db.collection('notifications').add({
      title: 'Transaction Updated',
      message: `Transaction ${reference || transactionDoc.data()?.reference} has been updated`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: params.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(transactionDoc.data() as any),
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
  // Check if transaction exists
  const transactionDoc = await db.collection('transactions').doc(params.id).get();
    if (!transactionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactionData = transactionDoc.data() as any;
    
    // Delete the transaction
    await db.collection('transactions').doc(params.id).delete();

    // Create notification for transaction deletion
    await db.collection('notifications').add({
      title: 'Transaction Deleted',
      message: `Transaction ${transactionData?.reference} has been deleted`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
