import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const env = process.env.MPESA_ENV || "sandbox";

  if (!key || !secret) {
    return NextResponse.json({ error: "Missing MPESA consumer credentials" }, { status: 500 });
  }

  const url =
    env === "production"
      ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("MPESA token error:", err);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
