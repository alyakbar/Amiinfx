import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, setupKey } = await request.json();

    // Check setup key for security
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Invalid setup key'
      }, { status: 401 });
    }

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Check if admin already exists
    const existingAdmin = await db.collection('admins').where('email', '==', email).get();
    if (!existingAdmin.empty) {
      return NextResponse.json({
        success: false,
        error: 'Admin already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminRef = await db.collection('admins').add({
      email,
      password: hashedPassword,
      name,
      role: 'super_admin',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminId: adminRef.id
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user'
    }, { status: 500 });
  }
}
