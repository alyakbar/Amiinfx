import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

// GET /api/admin/courses/[id] - Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
  const courseDoc = await db.collection('courses').doc(params.id).get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: {
        id: courseDoc.id,
        ...courseDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
  // Check if course exists
  const courseDoc = await db.collection('courses').doc(params.id).get();
    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if title is being changed to an existing title
    if (courseDoc.data()?.title !== title) {
      const existingCourse = await db.collection('courses')
        .where('title', '==', title)
        .get();
      
      if (!existingCourse.empty) {
        return NextResponse.json(
          { success: false, error: 'Course with this title already exists' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      title,
      description,
      price: parseFloat(price) || 0,
      status: status || 'draft',
      category,
      instructor,
      updatedAt: new Date().toISOString()
    };

    await db.collection('courses').doc(params.id).update(updateData);

    // Create notification for course update
    await db.collection('notifications').add({
      title: 'Course Updated',
      message: `Course "${title}" has been updated`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      course: {
        id: params.id,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(courseDoc.data() as any),
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/courses/[id] - Update course status or specific fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const body = await request.json();
  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
  // Check if course exists
  const courseDoc = await db.collection('courses').doc(params.id).get();
    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

  await db.collection('courses').doc(params.id).update(updateData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseData = courseDoc.data() as any;
    
    // Create notification for status change
    if (body.status) {
      await db.collection('notifications').add({
        title: 'Course Status Changed',
        message: `Course "${courseData?.title}" status changed to ${body.status}`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      course: {
        id: params.id,
        ...courseData,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const db = getFirestoreAdmin();
  if (!db) return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 503 });
    
  // Check if course exists
  const courseDoc = await db.collection('courses').doc(params.id).get();
    if (!courseDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseData = courseDoc.data() as any;
    
    // Check if course has enrolled students
    if (courseData?.enrolledStudents > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete course with enrolled students' },
        { status: 400 }
      );
    }

    // Delete the course
    await db.collection('courses').doc(params.id).delete();

    // Create notification for course deletion
    await db.collection('notifications').add({
      title: 'Course Deleted',
      message: `Course "${courseData?.title}" has been deleted`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
