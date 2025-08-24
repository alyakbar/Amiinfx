import crypto from "crypto";
import { NextResponse } from "next/server";
import axios from "axios";
import { saveMpesaTransaction } from "@/lib/firestore-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Coinbase may return a charge id as `charge_id` or `code` depending on flow
    const code = searchParams.get("code") || searchParams.get("charge_id");

    if (!code) {
      // Record missing code error
      try {
        await saveMpesaTransaction({
          provider: "coinbase",
          stage: "verify_failed",
          error: "Missing charge identifier",
          status: "failed",
          failureReason: "Missing charge identifier in verification request",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save coinbase missing code error to Firestore", err);
      }
      return NextResponse.json({ error: "Missing charge identifier" }, { status: 400 });
    }

    // Fetch charge details from Coinbase Commerce
    const res = await axios.get(`https://api.commerce.coinbase.com/charges/${code}`, {
      headers: {
        "X-CC-Api-Key": String(process.env.COINBASE_COMMERCE_API_KEY || ""),
        "X-CC-Version": "2018-03-22",
      },
    });

    const charge = res.data?.data;

    if (!charge) {
      // Record charge not found error
      try {
        await saveMpesaTransaction({
          provider: "coinbase",
          stage: "verify_failed",
          chargeId: code,
          error: "Charge not found",
          status: "failed",
          failureReason: "Charge not found in Coinbase Commerce",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save coinbase charge not found error to Firestore", err);
      }
      return NextResponse.json({ error: "Charge not found" }, { status: 404 });
    }

    // Determine if there's a completed payment
    const paid = Array.isArray(charge.payments) && charge.payments.length > 0;

    if (paid) {
      // Record successful payment verification
      try {
        // Extract customer info from charge metadata if available
        const metadata = charge.metadata || {};
        const customerName = metadata.customer_name || '';
        const customerEmail = metadata.customer_email || '';
        const customerPhone = metadata.customer_phone || '';
        const courseName = metadata.course_name || metadata.service || '';
        
        await saveMpesaTransaction({ 
          provider: "coinbase", 
          stage: "verify_success", 
          chargeId: code,
          charge,
          status: "success",
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          courseName: courseName,
          service: courseName,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save coinbase successful verification to Firestore", err);
      }
      return NextResponse.json({ success: true, charge });
    }

    // Record payment not completed (pending/failed)
    try {
      // Extract customer info from charge metadata if available
      const metadata = charge.metadata || {};
      const customerName = metadata.customer_name || '';
      const customerEmail = metadata.customer_email || '';
      const customerPhone = metadata.customer_phone || '';
      const courseName = metadata.course_name || metadata.service || '';
      
      await saveMpesaTransaction({
        provider: "coinbase",
        stage: "verify_pending",
        chargeId: code,
        charge,
        status: charge.timeline ? charge.timeline[charge.timeline.length - 1]?.status || "pending" : "pending",
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        courseName: courseName,
        service: courseName,
        failureReason: "Payment not completed or still pending",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Failed to save coinbase pending verification to Firestore", err);
    }

    return NextResponse.json({ success: false, charge });
  } catch (err) {
    console.error("Crypto verify error:", err);
    
    // Record exception during verification
    try {
      await saveMpesaTransaction({
        provider: "coinbase",
        stage: "verify_exception",
        error: err instanceof Error ? err.message : String(err),
        status: "failed",
        failureReason: "Exception during Coinbase verification",
        timestamp: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Failed to save coinbase verification exception to Firestore", dbErr);
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const merchantTradeNo = url.searchParams.get("merchantTradeNo");
    const orderId = url.searchParams.get("orderId");

    if (!merchantTradeNo && !orderId) {
      // Record missing parameters error
      try {
        await saveMpesaTransaction({
          provider: "binance",
          stage: "verify_failed",
          error: "Missing merchantTradeNo or orderId",
          status: "failed",
          failureReason: "Missing required parameters for Binance verification",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save binance missing params error to Firestore", err);
      }
      return NextResponse.json({ error: "merchantTradeNo or orderId is required" }, { status: 400 });
    }

    if (
      !process.env.BINANCE_PAY_MERCHANT_ID ||
      !process.env.BINANCE_PAY_API_KEY ||
      !process.env.BINANCE_PAY_API_SECRET ||
      !process.env.BINANCE_PAY_API_HOST
    ) {
      // Record missing env vars error
      try {
        await saveMpesaTransaction({
          provider: "binance",
          stage: "verify_failed",
          merchantTradeNo,
          orderId,
          error: "Missing Binance Pay environment variables",
          status: "failed",
          failureReason: "Missing Binance Pay environment variables",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save binance env vars error to Firestore", err);
      }
      return NextResponse.json({ error: "Missing Binance Pay env vars" }, { status: 500 });
    }

    // Build query payload per Binance Pay query API (adjust to exact spec)
    const queryPayload = { merchantTradeNo, orderId };
    const body = JSON.stringify(queryPayload);
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString("hex");
    const toSign = `${process.env.BINANCE_PAY_MERCHANT_ID}${timestamp}${nonce}${body}`;
    const signature = crypto.createHmac("sha512", process.env.BINANCE_PAY_API_SECRET!).update(toSign).digest("hex");

    const res = await fetch(`${process.env.BINANCE_PAY_API_HOST}/binancepay/openapi/v2/query`, {
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
      // Record API failure
      try {
        await saveMpesaTransaction({
          provider: "binance",
          stage: "verify_failed",
          merchantTradeNo,
          orderId,
          error: data,
          raw: data,
          status: "failed",
          failureReason: "Binance Pay API verification request failed",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to save binance API failure to Firestore", err);
      }
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // Determine success from the provider-specific fields
    const status = data?.data?.status || data?.status;
    const paid = status === "SUCCESS" || status === "COMPLETED" || status === "PAID";
    
    // Record verification result
    try {
      await saveMpesaTransaction({ 
        provider: "binance", 
        stage: paid ? "verify_success" : "verify_pending", 
        merchantTradeNo, 
        orderId, 
        status: paid ? "success" : status || "pending",
        raw: data,
        timestamp: new Date().toISOString(),
        ...(paid ? {} : { failureReason: `Payment status: ${status || "unknown"}` })
      });
    } catch (err) {
      console.warn("Failed to save binance verify result to Firestore", err);
    }
    
    return NextResponse.json({ success: paid, status, raw: data });
    
  } catch (err) {
    console.error("Binance verification error:", err);
    
    // Record exception during verification
    try {
      await saveMpesaTransaction({
        provider: "binance",
        stage: "verify_exception",
        error: err instanceof Error ? err.message : String(err),
        status: "failed",
        failureReason: "Exception during Binance verification",
        timestamp: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Failed to save binance verification exception to Firestore", dbErr);
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
