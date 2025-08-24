import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateOTP, saveOTP } from "@/lib/otp-database";
import { generateOTPEmailTemplate } from "@/lib/email-templates";
import { checkEmailExists, checkPendingOTP } from "@/lib/email-validation";

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Email and name are required" },
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
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in instead." },
        { status: 409 } // 409 Conflict status code
      );
    }

    // Check if there's already a pending OTP for this email
    const hasPendingOTP = await checkPendingOTP(email);
    if (hasPendingOTP) {
      return NextResponse.json(
        { success: false, error: "A verification code was already sent to this email. Please check your inbox or wait before requesting a new code." },
        { status: 429 } // 429 Too Many Requests status code
      );
    }

    // Generate and save OTP
    const otp = generateOTP();
    
    try {
      await saveOTP(email, otp, firstName, lastName);
    } catch (databaseError) {
      console.error("Database error:", databaseError);
      return NextResponse.json(
        { success: false, error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email
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

      const emailTemplate = generateOTPEmailTemplate(firstName, lastName, otp);

      await transporter.sendMail({
        from: `"Amiin FX" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email - Amiin FX",
        html: emailTemplate,
      });

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { success: false, error: "Failed to send OTP email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
