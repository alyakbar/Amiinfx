import { NextResponse } from "next/server";
import { checkEmailExists, checkPendingOTP } from "@/lib/email-validation";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return NextResponse.json({
        success: false,
        exists: true,
        error: "An account with this email already exists. Please sign in instead.",
      });
    }

    // Check if there's a pending OTP for this email
    const hasPendingOTP = await checkPendingOTP(email);
    
    return NextResponse.json({
      success: true,
      exists: false,
      hasPendingOTP,
      message: hasPendingOTP 
        ? "There's already a pending verification for this email. Please check your inbox or wait before requesting a new code."
        : "Email is available for registration",
    });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
