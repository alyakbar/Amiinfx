import { getFirestoreAdmin } from "@/lib/firestore-admin";
import { auth } from "@/lib/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Check Firebase Auth first
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      return true; // Email exists in Firebase Auth
    }

    // Also check our database for any registration records
    const database = getFirestoreAdmin();
    if (!database) {
      return false;
    }

    // Check userRegistrations collection
    const registrationQuery = await database
      .collection("userRegistrations")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!registrationQuery.empty) {
      return true; // Email exists in registration records
    }

    // Check transactions collection for any previous activity
    const transactionQuery = await database
      .collection("transactions")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!transactionQuery.empty) {
      return true; // Email exists in transaction records
    }

    return false; // Email doesn't exist anywhere
  } catch (error) {
    console.error("Error checking email existence:", error);
    // Return false on error to allow signup attempt (better UX)
    return false;
  }
}

export async function checkPendingOTP(email: string): Promise<boolean> {
  try {
    const database = getFirestoreAdmin();
    if (!database) {
      return false;
    }

    const otpDoc = await database.collection("otpVerifications").doc(email).get();
    
    if (!otpDoc.exists) {
      return false;
    }

    const otpData = otpDoc.data();
    if (!otpData) {
      return false;
    }

    // Check if OTP is still valid (not expired and not verified)
    const now = new Date();
    const expiresAt = otpData.expiresAt.toDate();
    
    return !otpData.verified && now <= expiresAt;
  } catch (error) {
    console.error("Error checking pending OTP:", error);
    return false;
  }
}
