import { getFirestoreAdmin } from "@/lib/firestore-admin";
import admin from "firebase-admin";

export interface OTPData {
  otp: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface OTPVerificationResult {
  success: boolean;
  error?: string;
  userData?: UserData;
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP to your existing transaction database
export async function saveOTP(email: string, otp: string, firstName: string, lastName: string): Promise<void> {
  const database = getFirestoreAdmin();
  if (!database) {
    throw new Error("Database not available");
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  try {
    await database.collection("otpVerifications").doc(email).set({
      otp,
      email,
      firstName,
      lastName,
      expiresAt,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to save OTP:", error);
    throw new Error("Failed to save OTP");
  }
}

// Get OTP data from your database
export async function getOTPData(email: string): Promise<OTPData | null> {
  const database = getFirestoreAdmin();
  if (!database) {
    return null;
  }

  try {
    const docRef = database.collection("otpVerifications").doc(email);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    if (!data) {
      return null;
    }
    
    return {
      ...data,
      expiresAt: data.expiresAt.toDate(),
      createdAt: data.createdAt.toDate(),
      verifiedAt: data.verifiedAt?.toDate(),
    } as OTPData;
  } catch (error) {
    console.error("Failed to get OTP data:", error);
    return null;
  }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<OTPVerificationResult> {
  const database = getFirestoreAdmin();
  if (!database) {
    return { success: false, error: "Database not available" };
  }

  const otpData = await getOTPData(email);
  
  if (!otpData) {
    return { success: false, error: "No OTP found for this email" };
  }
  
  // Check if OTP has expired
  const now = new Date();
  if (now > otpData.expiresAt) {
    await deleteOTP(email);
    return { success: false, error: "OTP has expired. Please request a new one." };
  }
  
  // Check if OTP matches
  if (otpData.otp !== otp) {
    return { success: false, error: "Invalid OTP" };
  }
  
  // Mark OTP as verified
  try {
    const docRef = database.collection("otpVerifications").doc(email);
    await docRef.update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      success: true,
      userData: {
        email: otpData.email,
        firstName: otpData.firstName,
        lastName: otpData.lastName,
      },
    };
  } catch (error) {
    console.error("Failed to update OTP verification:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

// Delete OTP data
export async function deleteOTP(email: string): Promise<void> {
  const database = getFirestoreAdmin();
  if (!database) {
    return;
  }

  try {
    await database.collection("otpVerifications").doc(email).delete();
  } catch (error) {
    console.error("Failed to delete OTP:", error);
  }
}

// Check if OTP exists and is verified
export async function isOTPVerified(email: string): Promise<boolean> {
  const otpData = await getOTPData(email);
  return otpData?.verified || false;
}

// Save user registration to transactions database (for tracking)
export async function saveUserRegistration(userData: UserData): Promise<void> {
  const database = getFirestoreAdmin();
  if (!database) {
    return;
  }

  try {
    const registrationId = `registration_${userData.email}_${Date.now()}`;
    await database.collection("userRegistrations").doc(registrationId).set({
      ...userData,
      type: 'user_registration',
      status: 'completed',
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to save user registration:", error);
  }
}

// Get all OTP verifications (for admin purposes)
export async function getAllOTPVerifications() {
  const database = getFirestoreAdmin();
  if (!database) {
    return [];
  }

  try {
    const snapshot = await database.collection("otpVerifications").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Failed to fetch OTP verifications:", error);
    return [];
  }
}
