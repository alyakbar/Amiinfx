import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { checkoutRequestID } = await req.json();

    if (!checkoutRequestID) {
      return NextResponse.json({ error: "CheckoutRequestID is required" }, { status: 400 });
    }

    // Get M-Pesa access token
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

    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;

    if (!passkey || !shortcode) {
      return NextResponse.json({ error: "Missing shortcode or passkey" }, { status: 500 });
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // Query the transaction status using M-Pesa STK Push Query API
    const queryBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const queryUrl =
      env === "production"
        ? "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

    console.log(`Querying M-Pesa status for: ${checkoutRequestID}`);

    const queryRes = await fetch(queryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryBody),
    });

    const queryResult = await queryRes.json();

    // Analyze the response
    const isSuccess = queryResult.ResultCode === "0" || queryResult.ResultCode === 0;
    const isPending = queryResult.ResultCode === "1037" || queryResult.ResultCode === 1037; // No response from user
    const isCancelled = queryResult.ResultCode === "1032" || queryResult.ResultCode === 1032; // Request cancelled by user
    const isTimeout = queryResult.ResultCode === "1031" || queryResult.ResultCode === 1031; // Transaction timeout

    let status = "unknown";
    if (isSuccess) status = "success";
    else if (isPending) status = "pending";
    else if (isCancelled) status = "cancelled";
    else if (isTimeout) status = "timeout";
    else status = "failed";

    return NextResponse.json({
      checkoutRequestID,
      status,
      isSuccess,
      rawResponse: queryResult,
      analysis: {
        resultCode: queryResult.ResultCode,
        resultDesc: queryResult.ResultDesc,
        responseCode: queryResult.ResponseCode,
        responseDescription: queryResult.ResponseDescription,
        merchantRequestID: queryResult.MerchantRequestID,
        checkoutRequestID: queryResult.CheckoutRequestID,
      }
    });

  } catch (err) {
    console.error("M-Pesa status query error:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
