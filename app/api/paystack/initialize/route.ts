import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, amount, name, service } = await req.json();

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // amount in kobo (NGN)
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: name },
            { display_name: "Service", variable_name: "service", value: service },
          ],
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack Init Error:", error);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
