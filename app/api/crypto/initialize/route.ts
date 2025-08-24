import crypto from "crypto";
import { NextResponse } from "next/server";
import { saveMpesaTransaction } from "@/lib/firestore-admin";

type InitBody = {
  name?: string;
  email?: string;
  amountUSD: number;
  service?: string;
  provider?: "coinbase" | "binance";
  courseName?: string;
  phone?: string;
};

export async function POST(req: Request) {
  const bodyJson: InitBody = await req.json();
  const { amountUSD, service, provider = "binance", courseName, phone } = bodyJson;

  // Handle Coinbase Commerce
  if (provider === "coinbase") {
    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      return NextResponse.json({ error: "Missing Coinbase Commerce API key" }, { status: 500 });
    }

    try {
      const chargeData = {
        name: service || "AmiinFX Service",
        description: `Payment for ${service || "AmiinFX Service"}`,
        pricing_type: "fixed_price",
        local_price: {
          amount: amountUSD.toFixed(2),
          currency: "USD"
        },
        metadata: {
          customer_name: bodyJson.name || "",
          customer_email: bodyJson.email || "",
          customer_phone: bodyJson.phone || "",
          service: service || "",
          course_name: courseName || service || ""
        },
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success/coinbase`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`
      };

      const response = await fetch("https://api.commerce.coinbase.com/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY,
          "X-CC-Version": "2018-03-22",
        },
        body: JSON.stringify(chargeData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Save failed transaction to database
        try {
          await saveMpesaTransaction({
            provider: "coinbase",
            stage: "init_failed",
            error: data,
            raw: data,
            name: bodyJson.name || null,
            email: bodyJson.email || null,
            phone: bodyJson.phone || null,
            amountUSD: bodyJson.amountUSD || null,
            service: bodyJson.service || null,
            courseName: courseName || bodyJson.service || null,
            status: "failed",
            failureReason: data?.error?.message || "Coinbase charge creation failed",
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Failed to save coinbase init failure to Firestore", err);
        }
        return NextResponse.json({ error: data }, { status: 500 });
      }

      // Save successful initialization to Firestore
      try {
        await saveMpesaTransaction({
          provider: "coinbase",
          stage: "init",
          chargeId: data.data?.id,
          hostUrl: data.data?.hosted_url,
          raw: data,
          name: bodyJson.name || null,
          email: bodyJson.email || null,
          phone: bodyJson.phone || null,
          amountUSD: bodyJson.amountUSD || null,
          service: bodyJson.service || null,
          courseName: courseName || bodyJson.service || null,
          status: "initialized",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save coinbase init to Firestore", err);
      }

      return NextResponse.json({ 
        hosted_url: data.data?.hosted_url,
        chargeId: data.data?.id,
        raw: data 
      });
    } catch (err) {
      console.error("Coinbase Commerce error:", err);
      
      // Save exception failure to database
      try {
        await saveMpesaTransaction({
          provider: "coinbase",
          stage: "init_exception",
          error: err instanceof Error ? err.message : String(err),
          raw: { error: err instanceof Error ? err.message : String(err) },
          name: bodyJson.name || null,
          email: bodyJson.email || null,
          phone: bodyJson.phone || null,
          amountUSD: bodyJson.amountUSD || null,
          service: bodyJson.service || null,
          courseName: courseName || bodyJson.service || null,
          status: "failed",
          failureReason: "Exception during Coinbase Commerce initialization",
          timestamp: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Failed to save coinbase exception to Firestore", dbErr);
      }
      
      return NextResponse.json({ error: "Coinbase Commerce initialization failed" }, { status: 500 });
    }
  }

  // Handle Binance Pay (existing code)
  if (
    !process.env.BINANCE_PAY_MERCHANT_ID ||
    !process.env.BINANCE_PAY_API_KEY ||
    !process.env.BINANCE_PAY_API_SECRET ||
    !process.env.BINANCE_PAY_API_HOST
  ) {
    // Save missing env vars failure
    try {
      await saveMpesaTransaction({
        provider: "binance",
        stage: "init_failed",
        error: "Missing Binance Pay environment variables",
        raw: { error: "Missing environment variables" },
        name: bodyJson.name || null,
        email: bodyJson.email || null,
        phone: bodyJson.phone || null,
        amountUSD: bodyJson.amountUSD || null,
        service: bodyJson.service || null,
        courseName: courseName || bodyJson.service || null,
        status: "failed",
        failureReason: "Missing Binance Pay environment variables",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Failed to save binance env failure to Firestore", err);
    }
    return NextResponse.json({ error: "Missing Binance Pay env vars" }, { status: 500 });
  }

  const merchantTradeNo = `amiinfx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  try {
    // Build the request payload according to Binance Pay merchant API spec.
    // Adjust fields to match the current Binance Pay API (this is a template).
    const payload = {
      merchantTradeNo,
      totalAmount: amountUSD,
      currency: "USD",
      productName: service || "AmiinFX Service",
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success/${merchantTradeNo}?provider=binance`,
    };

    const body = JSON.stringify(payload);
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString("hex");

    // Signature: follow Binance Pay docs for exact algorithm and header names.
    // This example uses HMAC-SHA512 over: merchantId + timestamp + nonce + body
    const toSign = `${process.env.BINANCE_PAY_MERCHANT_ID}${timestamp}${nonce}${body}`;
    const signature = crypto
      .createHmac("sha512", process.env.BINANCE_PAY_API_SECRET!)
      .update(toSign)
      .digest("hex");

    const res = await fetch(`${process.env.BINANCE_PAY_API_HOST}/binancepay/openapi/v2/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": timestamp,
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": process.env.BINANCE_PAY_API_KEY!,
        "BinancePay-Signature": signature,
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      // Save failed API response to database
      try {
        await saveMpesaTransaction({
          provider: "binance",
          stage: "init_failed",
          merchantTradeNo,
          error: data,
          raw: data,
          name: bodyJson.name || null,
          email: bodyJson.email || null,
          phone: bodyJson.phone || null,
          amountUSD: bodyJson.amountUSD || null,
          service: bodyJson.service || null,
          courseName: courseName || bodyJson.service || null,
          status: "failed",
          failureReason: data?.message || "Binance Pay API request failed",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save binance API failure to Firestore", err);
      }
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // Binance response varies; return the hosted URL field your integration uses.
    const hostUrl = data?.data?.payUrl || data?.data?.hostUrl || data?.payUrl || data?.hostUrl;

    // Persist successful init/order to Firestore if admin configured
    try {
      await saveMpesaTransaction({
        provider: "binance",
        stage: "init",
        merchantTradeNo,
        hostUrl,
        raw: data,
        name: bodyJson.name || null,
        email: bodyJson.email || null,
        phone: bodyJson.phone || null,
        amountUSD: bodyJson.amountUSD || null,
        service: bodyJson.service || null,
        courseName: courseName || bodyJson.service || null,
        status: "initialized",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Failed to save binance init to Firestore", err);
    }
    
    return NextResponse.json({ 
      hosted_url: hostUrl,
      hostUrl, 
      merchantTradeNo, 
      raw: data 
    });
    
  } catch (err) {
    console.error("Binance Pay error:", err);
    
    // Save exception failure to database
    try {
      await saveMpesaTransaction({
        provider: "binance",
        stage: "init_exception",
        merchantTradeNo,
        error: err instanceof Error ? err.message : String(err),
        raw: { error: err instanceof Error ? err.message : String(err) },
        name: bodyJson.name || null,
        email: bodyJson.email || null,
        phone: bodyJson.phone || null,
        amountUSD: bodyJson.amountUSD || null,
        service: bodyJson.service || null,
        courseName: courseName || bodyJson.service || null,
        status: "failed",
        failureReason: "Exception during Binance Pay initialization",
        timestamp: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Failed to save binance exception to Firestore", dbErr);
    }
    
    return NextResponse.json({ error: "Binance Pay initialization failed" }, { status: 500 });
  }
}
