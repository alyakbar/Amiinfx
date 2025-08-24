import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mpesa-payments.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify({}), "utf8");
    }
  } catch (err) {
    console.error("Failed to ensure data file:", err);
  }
}

async function readPayments(): Promise<Record<string, unknown>> {
  await ensureDataFile();
  const content = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(content || "{}");
  } catch {
    return {};
  }
}

async function writePayments(data: Record<string, unknown>) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(req: Request) {
  try {
    // parse body once so we can reuse fields like name/email
    const reqBody = await req.json();
    const { amount, phone, accountReference, description, name, email } = reqBody;

    if (!amount || !phone) {
      return NextResponse.json({ error: "Missing amount or phone" }, { status: 400 });
    }

    const env = process.env.MPESA_ENV || "sandbox";
    const tokenRes = await fetch(
      env === "production"
        ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64")}`,
        },
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to obtain access token" }, { status: 500 });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    // Lipa Na MPESA Online (STK Push) requires password: base64(MPESA_PASSKEY + BusinessShortCode + timestamp)
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;

    if (!passkey || !shortcode) {
      return NextResponse.json({ error: "Missing shortcode or passkey" }, { status: 500 });
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
      AccountReference: accountReference || "AmiinFX",
      TransactionDesc: description || "Payment",
    };

    const apiUrl =
      env === "production"
        ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    // persist init response locally for mapping
      try {
        await ensureDataFile();
        const payments = await readPayments();
        const merchantRequestID = data.MerchantRequestID || data.merchantRequestID || null;
        const checkoutRequestID = data.CheckoutRequestID || data.checkoutRequestID || null;
        // include client-supplied fields if provided (name, email) from request body
        const initRecord = {
          init: data,
          request: {
            amount,
            phone,
            name: name || null,
            email: email || null,
            accountReference: accountReference || null,
            description: description || null,
            courseName: accountReference || description || null,
          },
          createdAt: new Date().toISOString(),
        };
        if (merchantRequestID) payments[merchantRequestID] = initRecord;
        if (checkoutRequestID) payments[checkoutRequestID] = initRecord;
        await writePayments(payments);
      } catch (err) {
        console.warn("Failed to persist STK init locally", err);
      }
    return NextResponse.json(data);
  } catch (err) {
    console.error("STK Push error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
