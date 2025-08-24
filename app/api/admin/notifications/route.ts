import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Get recent notifications
    const notificationsSnapshot = await db
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));

    // Get unread count
    const unreadSnapshot = await db
      .collection('notifications')
      .where('isRead', '==', false)
      .get();

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: unreadSnapshot.size
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, userId } = await request.json();

    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const notification = {
      title,
      message,
      type: type || 'info', // info, warning, error, success
      userId: userId || null,
      isRead: false,
      createdAt: new Date(),
      readAt: null
    };

    const docRef = await db.collection('notifications').add(notification);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}
