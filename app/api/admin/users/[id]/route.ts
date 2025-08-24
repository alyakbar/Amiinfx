import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET - Fetch specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const userDoc = await db.collection('userRegistrations').doc(params.id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const data = userDoc.data();
    const user = {
      id: userDoc.id,
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      email: data?.email || '',
      phone: data?.phone || '',
      status: data?.status || 'active',
      role: data?.role || 'user',
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastLogin: data?.lastLogin?.toDate?.()?.toISOString() || null,
      emailVerified: data?.emailVerified || false,
      totalPurchases: data?.totalPurchases || 0,
      totalSpent: data?.totalSpent || 0
    };

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user'
    }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json() as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: string;
      status?: string;
      emailVerified?: boolean;
    };
    const { firstName, lastName, email, phone, role, status, emailVerified } = body;

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const userRef = db.collection('userRegistrations').doc(params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    const currentData = userDoc.data();
    if (email && email !== currentData?.email) {
      const existingUser = await db.collection('userRegistrations')
        .where('email', '==', email)
        .get();
      
      if (!existingUser.empty && existingUser.docs[0].id !== params.id) {
        return NextResponse.json({
          success: false,
          error: 'User with this email already exists'
        }, { status: 400 });
      }
    }

  // Update user data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    await userRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// PATCH - Partial update (e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const updateData = await request.json() as Record<string, unknown>;

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const userRef = db.collection('userRegistrations').doc(params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Add timestamp for update
    updateData.updatedAt = new Date();

    await userRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const userRef = db.collection('userRegistrations').doc(params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Instead of deleting, mark as deleted (soft delete)
    await userRef.update({
      status: 'deleted',
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    // Create notification for user deletion
    try {
      await db.collection('notifications').add({
        title: 'User Deleted',
        message: `User ${userDoc.data()?.firstName} ${userDoc.data()?.lastName} (${userDoc.data()?.email}) has been deleted`,
        type: 'warning',
        isRead: false,
        createdAt: new Date()
      });
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}
