import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/courses - Fetch all active courses for users
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    }

    // First try to get active courses
    let coursesSnapshot = await db.collection('courses')
      .where('status', '==', 'active')
      .get();
    
    // If no active courses, get all courses for testing
    if (coursesSnapshot.size === 0) {
      coursesSnapshot = await db.collection('courses').get();
    }

    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(doc.data() as any)
    }));

    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
