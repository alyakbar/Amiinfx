import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/admin/transactions - Fetch all transactions
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
    const transactionsSnapshot = await db.collection('transactions').orderBy('createdAt', 'desc').get();
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(doc.data() as any)
    }));

    // Calculate stats
    const stats = {
      totalTransactions: transactions.length,
      successfulTransactions: transactions.filter(t => t.status === 'success').length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      failedTransactions: transactions.filter(t => t.status === 'failed').length,
      totalAmount: transactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    };

    return NextResponse.json({
      success: true,
      transactions,
      stats
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, currency, email, name, description, paymentMethod, reference } = body;

    // Validation
    if (!type || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
    // Check if reference already exists
    if (reference) {
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

    const transactionData = {
      type,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      email: email || null,
      name: name || null,
      description: description || null,
      paymentMethod: paymentMethod || null,
      reference: reference || `TXN-${Date.now()}`,
      status: 'success', // Manual transactions are typically successful
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

  const transactionRef = await db.collection('transactions').add(transactionData);

  // Create notification for new transaction
  await db.collection('notifications').add({
      title: 'New Transaction Created',
      message: `Manual transaction ${transactionData.reference} created for ${currency} ${amount}`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionRef.id,
        ...transactionData
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
