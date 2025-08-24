import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

interface UserRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: unknown;
  registeredAt?: unknown;
}

export async function GET() {
  try {
    console.log('Fetching user statistics...');

    // Get database connection
    const db = getFirestoreAdmin();
    
    if (!db) {
      console.error('Firestore not initialized');
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Get all user registrations from your database
    const userRegistrationsRef = db.collection('userRegistrations');
    const userRegistrationsSnapshot = await userRegistrationsRef.get();

    // Get Firebase Auth users count (if needed)
    let firebaseUsersCount = 0;
    try {
      // Note: Getting all Firebase Auth users requires admin privileges
      // For now, we'll focus on registered users in your database
      firebaseUsersCount = userRegistrationsSnapshot.size;
    } catch (error) {
      console.warn('Could not fetch Firebase Auth users:', error);
    }

    // Process user registration data for growth metrics
    const userRegistrations = userRegistrationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: data.createdAt,
        registeredAt: data.registeredAt,
      };
    });

    // Calculate monthly user growth
    const monthlyGrowth = calculateMonthlyGrowth(userRegistrations);
    
    // Calculate statistics
    const totalUsers = userRegistrations.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get users registered this month
    const thisMonthUsers = userRegistrations.filter(user => {
      const userDate = getUserDate(user);
      return userDate && 
             userDate.getMonth() === currentMonth && 
             userDate.getFullYear() === currentYear;
    }).length;

    // Get users registered last month for growth calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthUsers = userRegistrations.filter(user => {
      const userDate = getUserDate(user);
      return userDate && 
             userDate.getMonth() === lastMonth && 
             userDate.getFullYear() === lastMonthYear;
    }).length;

    // Calculate growth percentage
    const growthPercentage = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100) 
      : thisMonthUsers > 0 ? 100 : 0;

    console.log(`Found ${totalUsers} users, ${thisMonthUsers} this month, ${lastMonthUsers} last month`);

    return NextResponse.json({
      success: true,
      statistics: {
        totalUsers,
        thisMonthUsers,
        lastMonthUsers,
        growthPercentage: Number(growthPercentage.toFixed(1)),
        firebaseUsersCount,
      },
      userGrowth: monthlyGrowth,
      userRegistrations: userRegistrations.slice(0, 10), // Return last 10 for preview
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getUserDate(user: UserRegistration): Date | null {
  // Try to get date from various possible fields
  type FirestoreLikeTimestamp = { _seconds: number } | { toDate: () => Date } | string | number;
  if (user.createdAt) {
    const ca = user.createdAt as FirestoreLikeTimestamp;
    if (typeof ca === 'object' && ca !== null && '_seconds' in ca && typeof (ca as { _seconds?: number })._seconds === 'number') {
      return new Date((ca as { _seconds: number })._seconds * 1000);
    }
    if (typeof user.createdAt === 'string') {
      return new Date(user.createdAt as string);
    }
    if (typeof ca === 'object' && ca !== null && 'toDate' in ca && typeof (ca as { toDate?: () => Date }).toDate === 'function') {
      return (ca as { toDate: () => Date }).toDate();
    }
  }
  
  if (user.registeredAt) {
    const ra = user.registeredAt as FirestoreLikeTimestamp;
    if (typeof ra === 'object' && ra !== null && '_seconds' in ra && typeof (ra as { _seconds?: number })._seconds === 'number') {
      return new Date((ra as { _seconds: number })._seconds * 1000);
    }
    if (typeof user.registeredAt === 'string') {
      return new Date(user.registeredAt as string);
    }
    if (typeof ra === 'object' && ra !== null && 'toDate' in ra && typeof (ra as { toDate?: () => Date }).toDate === 'function') {
      return (ra as { toDate: () => Date }).toDate();
    }
  }
  
  return null;
}

function calculateMonthlyGrowth(userRegistrations: UserRegistration[]) {
  const monthlyData: { [key: string]: { users: number; newUsers: number; month: string } } = {};
  
  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    monthlyData[monthKey] = { 
      users: 0, 
      newUsers: 0,
      month: monthName 
    };
  }
  
  // Count users by month
  let cumulativeUsers = 0;
  const sortedMonths = Object.keys(monthlyData).sort();
  
  for (const monthKey of sortedMonths) {
    const [year, month] = monthKey.split('-').map(Number);
    
    // Count new users for this month
    const newUsersThisMonth = userRegistrations.filter(user => {
      const userDate = getUserDate(user);
      return userDate && 
             userDate.getFullYear() === year && 
             userDate.getMonth() === month - 1; // getMonth() is 0-indexed
    }).length;
    
    cumulativeUsers += newUsersThisMonth;
    
    monthlyData[monthKey].users = cumulativeUsers;
    monthlyData[monthKey].newUsers = newUsersThisMonth;
  }
  
  // Convert to array format for charts
  return sortedMonths.map(monthKey => ({
    month: monthlyData[monthKey].month,
    users: monthlyData[monthKey].users,
    newUsers: monthlyData[monthKey].newUsers,
  }));
}
