import { NextResponse } from "next/server";

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
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack Init Error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
