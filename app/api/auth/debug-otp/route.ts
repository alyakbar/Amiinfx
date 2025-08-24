import { NextResponse } from "next/server";
import { getAllOTPVerifications } from "@/lib/otp-database";

export async function GET() {
  try {
    const otpVerifications = await getAllOTPVerifications();
    return NextResponse.json({
      success: true,
      count: otpVerifications.length,
      otpVerifications,
    });
  } catch (error) {
    console.error("Debug OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
