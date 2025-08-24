import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mpesa-payments.json");

async function readPayments(): Promise<Record<string, unknown>> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });

    const payments = await readPayments();
    const record = payments[id as string];
    if (!record) {
      return NextResponse.json({ found: false });
    }

    // Determine success - check multiple possible locations for result
    const r = record as Record<string, unknown>;
    const metadata = (r["metadata"] ?? {}) as Record<string, unknown>;
    const raw = (r["raw"] ?? {}) as Record<string, unknown>;

    // Check for resultCode in multiple locations
    let resultCode: number | string | undefined;
    
    // Direct property
    if (typeof r["resultCode"] === 'number' || typeof r["resultCode"] === 'string') {
      resultCode = r["resultCode"] as number | string;
    }
    // In metadata
    else if (metadata && (typeof metadata["ResultCode"] === 'number' || typeof metadata["ResultCode"] === 'string')) {
      resultCode = metadata["ResultCode"] as number | string;
    }
    // In raw callback data
    else if (raw && (typeof raw["ResultCode"] === 'number' || typeof raw["ResultCode"] === 'string')) {
      resultCode = raw["ResultCode"] as number | string;
    }
    // Check in nested structures
    else if (raw && raw["Body"] && (raw["Body"] as Record<string, unknown>)["stkCallback"]) {
      const stkCallback = (raw["Body"] as Record<string, unknown>)["stkCallback"];
      if (typeof (stkCallback as Record<string, unknown>)["ResultCode"] === 'number' || typeof (stkCallback as Record<string, unknown>)["ResultCode"] === 'string') {
        resultCode = (stkCallback as Record<string, unknown>)["ResultCode"] as number | string;
      }
    }

    // Check for M-Pesa receipt number (indicates successful payment)
    const mpesaReceipt = 
      metadata["MpesaReceiptNumber"] ||
      metadata["mpesaReceiptNumber"] ||
      (raw["CallbackMetadata"] && (raw["CallbackMetadata"] as Record<string, unknown>)["Item"] && 
       ((raw["CallbackMetadata"] as Record<string, unknown>)["Item"] as Record<string, unknown>[]).find(item => (item as Record<string, unknown>).Name === "MpesaReceiptNumber")?.Value) ||
      undefined;

    // Payment is successful if:
    // 1. ResultCode is 0 (success)
    // 2. OR we have a valid M-Pesa receipt number
    const success = (resultCode === 0 || resultCode === '0') || Boolean(mpesaReceipt);

    return NextResponse.json({ 
      found: true, 
      success: !!success, 
      record,
      debug: {
        resultCode,
        mpesaReceipt,
        hasMetadata: !!metadata,
        hasRaw: !!raw,
        metadataKeys: Object.keys(metadata),
        rawKeys: Object.keys(raw)
      }
    });
  } catch (err) {
    console.error("MPESA status error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
