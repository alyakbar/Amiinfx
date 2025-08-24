import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

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

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP to Firestore
export async function saveOTP(email: string, otp: string, firstName: string, lastName: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  await setDoc(doc(db, "otpVerifications", email), {
    otp,
    email,
    firstName,
    lastName,
    expiresAt,
    verified: false,
    createdAt: new Date(),
  });
}

// Get OTP data from Firestore
export async function getOTPData(email: string): Promise<OTPData | null> {
  const otpDocRef = doc(db, "otpVerifications", email);
  const otpDoc = await getDoc(otpDocRef);
  
  if (!otpDoc.exists()) {
    return null;
  }
  
  const data = otpDoc.data();
  return {
    ...data,
    expiresAt: data.expiresAt.toDate(),
    createdAt: data.createdAt.toDate(),
    verifiedAt: data.verifiedAt?.toDate(),
  } as OTPData;
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

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<OTPVerificationResult> {
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
  const otpDocRef = doc(db, "otpVerifications", email);
  await updateDoc(otpDocRef, {
    verified: true,
    verifiedAt: new Date(),
  });
  
  return {
    success: true,
    userData: {
      email: otpData.email,
      firstName: otpData.firstName,
      lastName: otpData.lastName,
    },
  };
}

// Delete OTP data
export async function deleteOTP(email: string): Promise<void> {
  const otpDocRef = doc(db, "otpVerifications", email);
  await deleteDoc(otpDocRef);
}

// Check if OTP exists and is verified
export async function isOTPVerified(email: string): Promise<boolean> {
  const otpData = await getOTPData(email);
  return otpData?.verified || false;
}
