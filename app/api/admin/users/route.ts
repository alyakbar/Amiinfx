import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET - Fetch all users
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Get users from userRegistrations collection and Firebase Auth if needed
    const usersSnapshot = await db.collection('userRegistrations').get();
    
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        status: data.status || 'active',
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.registeredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
        emailVerified: data.emailVerified || false,
        totalPurchases: data.totalPurchases || 0,
        totalSpent: data.totalSpent || 0
      };
    });

    // Sort by creation date, newest first
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, role, status } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({
        success: false,
        error: 'First name, last name, and email are required'
      }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Check if user already exists
    const existingUser = await db.collection('userRegistrations').where('email', '==', email).get();
    if (!existingUser.empty) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      phone: phone || '',
      role: role || 'user',
      status: status || 'active',
      emailVerified: false,
      createdAt: new Date(),
      registeredAt: new Date(),
      lastLogin: null,
      totalPurchases: 0,
      totalSpent: 0
    };

    const docRef = await db.collection('userRegistrations').add(userData);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: docRef.id
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}
