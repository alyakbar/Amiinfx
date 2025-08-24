import { NextResponse } from "next/server";
import { saveMpesaTransaction } from "@/lib/firestore-admin";

export async function POST(req: Request) {
  try {
    const { email, amount, name, service, planCode } = await req.json();

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // already in cents (KES * 100)
        currency: "KES", // ✅ set to Kenyan Shillings
        plan: planCode || undefined,
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: name },
            { display_name: "Service", variable_name: "service", value: service },
          ],
        },
  callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      }),
    });

    const data = await response.json();
    // attempt to save init record to Firestore (if configured)
    try {
      await saveMpesaTransaction({ provider: "paystack", stage: "init", initData: data, email, amount, name, service });
    } catch (err) {
      console.warn("Failed to save paystack init to Firestore", err);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack Init Error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
