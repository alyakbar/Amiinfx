import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    // Get all unread notifications
    const unreadNotifications = await db
      .collection('notifications')
      .where('isRead', '==', false)
      .get();

    // Update all to read
    const batch = db.batch();
    const updateTime = new Date();

    unreadNotifications.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: updateTime,
        updatedAt: updateTime
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Marked ${unreadNotifications.size} notifications as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notifications as read'
    }, { status: 500 });
  }
}
