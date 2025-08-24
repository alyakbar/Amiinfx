import { NextResponse } from "next/server";
import { saveUserRegistration } from "@/lib/otp-database";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Email and name are required" },
        { status: 400 }
      );
    }

    try {
      await saveUserRegistration({ email, firstName, lastName });
      
      return NextResponse.json({
        success: true,
        message: "User registration saved successfully",
      });
    } catch (databaseError) {
      console.error("Database error:", databaseError);
      return NextResponse.json(
        { success: false, error: "Failed to save registration" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Save registration error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
