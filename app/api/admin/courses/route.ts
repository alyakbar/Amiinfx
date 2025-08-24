import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/admin/courses - Fetch all courses
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    }

    const coursesSnapshot = await db.collection('courses').orderBy('createdAt', 'desc').get();
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

// POST /api/admin/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, status, category, instructor } = body;

    // Validation
    if (!title || !description || !category || !instructor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { success: false, error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });

  // Check if course title already exists
  const existingCourse = await db.collection('courses')
      .where('title', '==', title)
      .get();
    
    if (!existingCourse.empty) {
      return NextResponse.json(
        { success: false, error: 'Course with this title already exists' },
        { status: 400 }
      );
    }

    const courseData = {
      title,
      description,
      price: parseFloat(price) || 0,
      status: status || 'draft',
      category,
      instructor,
      enrolledStudents: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

  const courseRef = await db.collection('courses').add(courseData);

  // Create notification for new course
  await db.collection('notifications').add({
      title: 'New Course Created',
      message: `Course "${title}" has been created`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      course: {
        id: courseRef.id,
        ...courseData
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
