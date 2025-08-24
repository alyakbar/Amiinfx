// Temporary in-memory storage for OTP data
// This will be replaced with Firestore once it's enabled

interface OTPData {
  otp: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  verifiedAt?: Date;
}

// In-memory storage (will reset on server restart)
const otpStorage = new Map<string, OTPData>();

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
    }
  }
}, 5 * 60 * 1000);

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

// Save OTP to memory storage
export async function saveOTP(email: string, otp: string, firstName: string, lastName: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  otpStorage.set(email, {
    otp,
    email,
    firstName,
    lastName,
    expiresAt,
    verified: false,
    createdAt: new Date(),
  });
}

// Get OTP data from memory storage
export async function getOTPData(email: string): Promise<OTPData | null> {
  const data = otpStorage.get(email);
  if (!data) {
    return null;
  }
  
  // Check if expired
  const now = new Date();
  if (now > data.expiresAt) {
    otpStorage.delete(email);
    return null;
  }
  
  return data;
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<OTPVerificationResult> {
  const otpData = await getOTPData(email);
  
  if (!otpData) {
    return { success: false, error: "No OTP found for this email or OTP has expired" };
  }
  
  // Check if OTP matches
  if (otpData.otp !== otp) {
    return { success: false, error: "Invalid OTP" };
  }
  
  // Mark OTP as verified
  otpData.verified = true;
  otpData.verifiedAt = new Date();
  otpStorage.set(email, otpData);
  
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
  otpStorage.delete(email);
}

// Check if OTP exists and is verified
export async function isOTPVerified(email: string): Promise<boolean> {
  const otpData = await getOTPData(email);
  return otpData?.verified || false;
}

// Get storage stats (for debugging)
export function getStorageStats() {
  return {
    totalOTPs: otpStorage.size,
    otps: Array.from(otpStorage.entries()).map(([email, data]) => ({
      email,
      expiresAt: data.expiresAt,
      verified: data.verified,
      createdAt: data.createdAt,
    })),
  };
}
