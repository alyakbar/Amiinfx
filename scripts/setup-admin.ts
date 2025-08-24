import bcrypt from 'bcryptjs';
import { getFirestoreAdmin } from '../lib/firestore-admin';

async function setupAdmin() {
  try {
    const db = getFirestoreAdmin();
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admin_users')
      .where('email', '==', 'admin@amiinfx.com')
      .get();
    
    if (!existingAdmin.empty) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminData = {
      email: 'admin@amiinfx.com',
      password: hashedPassword,
      name: 'AmiinFX Admin',
      role: 'super_admin',
      isActive: true,
      permissions: ['users', 'courses', 'revenue', 'transactions', 'settings'],
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    await db.collection('admin_users').add(adminData);
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@amiinfx.com');
    console.log('Password: Admin123!');
    console.log('Please change the password after first login');

    // Create welcome notification
    await db.collection('notifications').add({
      title: 'Admin Account Created',
      message: 'Admin account has been set up successfully. Please change default password.',
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Create sample data
    await createSampleData(db);
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

async function createSampleData(db: any) {
  try {
    // Sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'active',
        role: 'student',
        enrolledCourses: ['course-1'],
        createdAt: new Date().toISOString()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        status: 'active',
        role: 'student',
        enrolledCourses: ['course-1', 'course-2'],
        createdAt: new Date().toISOString()
      }
    ];

    for (const user of sampleUsers) {
      await db.collection('users').add(user);
    }

    // Sample courses
    const sampleCourses = [
      {
        title: 'Advanced Forex Trading',
        description: 'Learn advanced forex trading strategies and techniques',
        price: 299.99,
        status: 'active',
        category: 'Finance',
        instructor: 'AmiinFX Team',
        enrolledStudents: 45,
        totalRevenue: 13499.55,
        createdAt: new Date().toISOString()
      },
      {
        title: 'Cryptocurrency Fundamentals',
        description: 'Understanding cryptocurrency markets and trading',
        price: 199.99,
        status: 'active',
        category: 'Finance',
        instructor: 'Crypto Expert',
        enrolledStudents: 32,
        totalRevenue: 6399.68,
        createdAt: new Date().toISOString()
      }
    ];

    for (const course of sampleCourses) {
      await db.collection('courses').add(course);
    }

    // Sample revenue data
    const sampleRevenue = [
      {
        type: 'course',
        description: 'Advanced Forex Trading Course',
        amount: 299.99,
        status: 'completed',
        customerEmail: 'john@example.com',
        paymentMethod: 'Credit Card',
        courseTitle: 'Advanced Forex Trading',
        date: new Date().toISOString()
      },
      {
        type: 'course',
        description: 'Cryptocurrency Fundamentals Course',
        amount: 199.99,
        status: 'completed',
        customerEmail: 'jane@example.com',
        paymentMethod: 'PayPal',
        courseTitle: 'Cryptocurrency Fundamentals',
        date: new Date().toISOString()
      }
    ];

    for (const revenue of sampleRevenue) {
      await db.collection('revenue').add(revenue);
    }

    // Sample transactions
    const sampleTransactions = [
      {
        type: 'paystack',
        status: 'success',
        amount: 299.99,
        currency: 'USD',
        email: 'john@example.com',
        name: 'John Doe',
        reference: 'TXN-001',
        description: 'Course purchase',
        createdAt: new Date().toISOString()
      },
      {
        type: 'mpesa',
        status: 'success',
        amount: 15000,
        currency: 'KES',
        email: 'jane@example.com',
        name: 'Jane Smith',
        phone: '+254712345678',
        reference: 'MPESA-002',
        description: 'Course payment',
        createdAt: new Date().toISOString()
      }
    ];

    for (const transaction of sampleTransactions) {
      await db.collection('transactions').add(transaction);
    }

    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Run the setup
setupAdmin();
