import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateWelcomeEmailTemplate } from "@/lib/email-templates";

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
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const emailTemplate = generateWelcomeEmailTemplate(firstName, lastName);

      await transporter.sendMail({
        from: `"Amiin FX" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Welcome to Amiin FX - Account Created Successfully!",
        html: emailTemplate,
      });

      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
      });
    } catch (emailError) {
      console.error("Welcome email sending error:", emailError);
      return NextResponse.json(
        { success: false, error: "Failed to send welcome email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send welcome email error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
