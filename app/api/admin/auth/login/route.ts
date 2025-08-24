import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Check if admin exists
    const adminRef = db.collection('admins').where('email', '==', email);
    const adminSnapshot = await adminRef.get();

    if (adminSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    const adminData = adminSnapshot.docs[0].data();
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminData.password);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminSnapshot.docs[0].id, 
        email: adminData.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await adminSnapshot.docs[0].ref.update({
      lastLogin: new Date(),
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: adminSnapshot.docs[0].id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 });
  }
}
