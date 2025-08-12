import { NextResponse } from "next/server";
import axios from "axios";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  try {
    // Verify payment with Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const transaction = verifyRes.data.data;

    if (transaction.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

  // Firestore usage removed. You can add your own logic here if needed.

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error verifying transaction:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
