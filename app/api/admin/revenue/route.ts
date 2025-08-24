import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/admin/revenue - Fetch all revenue transactions
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });

    const revenueSnapshot = await db.collection('revenue').orderBy('date', 'desc').get();
    const revenue = revenueSnapshot.docs.map(doc => ({
      id: doc.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(doc.data() as any)
    }));

    // Calculate stats
    const stats = {
      totalRevenue: revenue
        .filter(item => item.status === 'completed' && item.type !== 'refund')
        .reduce((sum, item) => sum + item.amount, 0),
      monthlyRevenue: revenue
        .filter(item => {
          const itemDate = new Date(item.date);
          const now = new Date();
          return item.status === 'completed' && 
                 item.type !== 'refund' &&
                 itemDate.getMonth() === now.getMonth() && 
                 itemDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, item) => sum + item.amount, 0),
      pendingAmount: revenue
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + item.amount, 0),
      refundedAmount: revenue
        .filter(item => item.status === 'refunded' || item.type === 'refund')
        .reduce((sum, item) => sum + Math.abs(item.amount), 0),
      totalTransactions: revenue.length
    };

    return NextResponse.json({
      success: true,
      revenue,
      stats
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

// POST /api/admin/revenue - Create a new revenue transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, amount, customerEmail, paymentMethod, courseTitle } = body;

    // Validation
    if (!type || !description || !amount || !customerEmail || !paymentMethod) {
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

  const revenueData = {
      type,
      description,
      amount: parseFloat(amount),
      status: 'completed',
      customerEmail,
      paymentMethod,
      courseTitle: courseTitle || null,
      date: new Date().toISOString()
    };

  const revenueRef = await db.collection('revenue').add(revenueData);

  // Create notification for new transaction
  await db.collection('notifications').add({
      title: 'New Revenue Transaction',
      message: `New ${type} transaction: ${description} - $${amount}`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: revenueRef.id,
        ...revenueData
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
