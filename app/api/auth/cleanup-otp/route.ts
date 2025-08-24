import { NextResponse } from "next/server";
import { deleteOTP } from "@/lib/otp-database";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await deleteOTP(email);

    return NextResponse.json({
      success: true,
      message: "OTP cleanup completed",
    });
  } catch (error) {
    console.error("Cleanup OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
