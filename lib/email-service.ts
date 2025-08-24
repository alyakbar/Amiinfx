import nodemailer from "nodemailer";
import { generatePurchaseConfirmationTemplate } from "./purchase-email-template";

export async function sendPurchaseConfirmationEmail(
  email: string,
  name: string,
  courseName: string,
  amount: number,
  currency: string,
  transactionId: string
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const emailTemplate = generatePurchaseConfirmationTemplate(
      name,
      courseName,
      amount,
      currency,
      transactionId
    );

    await transporter.sendMail({
      from: `"Amiin FX" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `🎉 Purchase Confirmed - ${courseName} - Amiin FX`,
      html: emailTemplate,
    });

    return true;
  } catch (error) {
    console.error("Failed to send purchase confirmation email:", error);
    return false;
  }
}

// Function to record purchase in database
export async function recordPurchaseInDatabase(
  email: string,
  name: string,
  courseName: string,
  amount: number,
  currency: string,
  transactionId: string,
  paymentMethod: string
) {
  try {
    const { getFirestoreAdmin } = await import('./firestore-admin');
    const db = getFirestoreAdmin();
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const purchaseData = {
      email,
      name,
      courseName,
      amount,
      currency,
      transactionId,
      paymentMethod,
      purchaseDate: new Date().toISOString(),
      status: 'completed',
      courseAccess: true,
      metadata: {
        purchaseTimestamp: Date.now(),
        courseSlug: courseName.toLowerCase().replace(/\s+/g, '-'),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      }
    };

    // Add to purchases collection
    await db.collection('purchases').add(purchaseData);

    // Also add course access to user profile if needed
    const userQuery = await db.collection('users').where('email', '==', email).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const currentCourses = userDoc.data().purchasedCourses || [];
      
      // Check if course already exists to prevent duplicates
      const courseExists = currentCourses.some((course: Record<string, unknown>) => 
        course.courseName === courseName || course.transactionId === transactionId
      );
      
      if (!courseExists) {
        await userDoc.ref.update({
          purchasedCourses: [...currentCourses, {
            courseName,
            purchaseDate: new Date().toISOString(),
            transactionId,
            amount,
            currency,
            paymentMethod
          }]
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to record purchase in database:", error);
    return false;
  }
}
