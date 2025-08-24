import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

type FirestoreLikeTimestamp = { _seconds: number } | { toDate: () => Date } | string | number;

interface Transaction {
  id: string;
  amount: number | string;
  currency?: string;
  status: string;
  type?: string;
  createdAt?: FirestoreLikeTimestamp;
  paid_at?: string;
  paidAt?: string;
  metadata?: Record<string, unknown> | null;
}

export async function GET() {
  try {
    console.log('Fetching revenue statistics...');

    // Get database connection
    const db = getFirestoreAdmin();
    
    if (!db) {
      console.error('Firestore not initialized');
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Get all transactions from your database
    const transactionsRef = db.collection('transactions');
    const transactionsSnapshot = await transactionsRef.get();

    // Process transaction data
    const transactions: Transaction[] = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        type: data.type || 'unknown',
        createdAt: data.createdAt,
        paid_at: data.paid_at,
        paidAt: data.paidAt,
        metadata: data.metadata,
      };
    });

    // Filter successful transactions only
    const successfulTransactions = transactions.filter(tx => 
      tx.status === 'success' || tx.status === 'completed' || tx.status === 'paid'
    );

    // Calculate total revenue
    const totalRevenue = successfulTransactions.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Calculate monthly revenue for the last 12 months
    const monthlyRevenue = calculateMonthlyRevenue(successfulTransactions);

    // Calculate current month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRevenue = successfulTransactions
      .filter(tx => {
        const txDate = getTransactionDate(tx);
        return txDate && 
               txDate.getMonth() === currentMonth && 
               txDate.getFullYear() === currentYear;
      })
      .reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    // Calculate last month for growth
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthRevenue = successfulTransactions
      .filter(tx => {
        const txDate = getTransactionDate(tx);
        return txDate && 
               txDate.getMonth() === lastMonth && 
               txDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    const revenueGrowthPercentage = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) 
      : thisMonthRevenue > 0 ? 100 : 0;

    console.log(`Total revenue: $${totalRevenue}, This month: $${thisMonthRevenue}, Last month: $${lastMonthRevenue}`);

    return NextResponse.json({
      success: true,
      statistics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
        lastMonthRevenue: Math.round(lastMonthRevenue * 100) / 100,
        revenueGrowthPercentage: Number(revenueGrowthPercentage.toFixed(1)),
        totalTransactions: transactions.length,
        successfulTransactions: successfulTransactions.length,
      },
      monthlyRevenue,
      recentTransactions: successfulTransactions.slice(-10), // Last 10 transactions
    });

  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch revenue statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getTransactionDate(transaction: Transaction): Date | null {
  // Try to get date from various possible fields
  if (transaction.paid_at) {
    return new Date(transaction.paid_at);
  }
  
  if (transaction.paidAt) {
    return new Date(transaction.paidAt);
  }
  
  if (transaction.createdAt) {
    const ca = transaction.createdAt as FirestoreLikeTimestamp;
    if (typeof ca === 'object' && ca !== null && '_seconds' in ca && typeof (ca as { _seconds?: number })._seconds === 'number') {
      return new Date((ca as { _seconds: number })._seconds * 1000);
    }
    if (typeof transaction.createdAt === 'string') {
      return new Date(transaction.createdAt as string);
    }
    if (typeof ca === 'object' && ca !== null && 'toDate' in ca && typeof (ca as { toDate?: () => Date }).toDate === 'function') {
      return (ca as { toDate: () => Date }).toDate();
    }
  }
  
  return null;
}

function calculateMonthlyRevenue(transactions: Transaction[]) {
  const monthlyData: { [key: string]: { revenue: number; subscriptions: number; month: string } } = {};
  
  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    monthlyData[monthKey] = { 
      revenue: 0, 
      subscriptions: 0,
      month: monthName 
    };
  }
  
  // Aggregate transactions by month
  transactions.forEach(tx => {
    const txDate = getTransactionDate(tx);
    if (!txDate) return;
    
    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData[monthKey]) {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      monthlyData[monthKey].revenue += isNaN(amount) ? 0 : amount;
      monthlyData[monthKey].subscriptions += 1;
    }
  });
  
  // Convert to array format for charts
  return Object.keys(monthlyData)
    .sort()
    .map(monthKey => ({
      month: monthlyData[monthKey].month,
      revenue: Math.round(monthlyData[monthKey].revenue * 100) / 100,
      subscriptions: monthlyData[monthKey].subscriptions,
    }));
}
