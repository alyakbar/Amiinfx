import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { saveMpesaTransaction, saveTransaction } from "@/lib/firestore-admin";

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
  try {
    const content = await fs.readFile(DATA_FILE, "utf8");
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
    const body = await req.json();
    console.log("MPESA REVERSAL RECEIVED:", JSON.stringify(body));

    // Accept flexible shapes: direct fields or nested under Body
    const envBody = body?.Body || body;

    const merchantRequestID = envBody?.MerchantRequestID || envBody?.merchantRequestID || envBody?.merchantReqID || null;
    const checkoutRequestID = envBody?.CheckoutRequestID || envBody?.checkoutRequestID || null;
    const receipt = envBody?.MpesaReceiptNumber || envBody?.mpesaReceiptNumber || envBody?.ReceiptNumber || envBody?.receipt || null;
    const resultCode = typeof envBody?.ResultCode === "number" ? envBody.ResultCode : Number(envBody?.ResultCode ?? -1);
    const resultDesc = envBody?.ResultDesc || envBody?.resultDesc || envBody?.Description || "Reversal initiated";

    // Collect common metadata fields
    const meta: Record<string, unknown> = {
      Amount: envBody?.Amount ?? envBody?.amount ?? null,
      PhoneNumber: envBody?.PhoneNumber ?? envBody?.phone ?? null,
      TransactionDate: envBody?.TransactionDate ?? envBody?.transactionDate ?? null,
      reason: envBody?.Reason ?? envBody?.reason ?? null,
      ...envBody?.metadata,
    };

    const record: Record<string, unknown> = {
      type: 'reversal',
      merchantRequestID,
      checkoutRequestID,
      resultCode,
      resultDesc,
      metadata: meta,
      raw: envBody,
      receivedAt: new Date().toISOString(),
    };

    const payments = await readPayments();

    // store under merchantRequestID / checkoutRequestID / receipt or a generated key
    const key = merchantRequestID || checkoutRequestID || receipt || `reversal_${Date.now()}`;
    payments[key] = record;
    if (receipt) payments[String(receipt)] = record;

    // attempt to persist to Firestore if admin SDK is available
    try {
      const docId = await saveMpesaTransaction(record as Record<string, unknown>);
      if (docId) {
        record.firestoreId = docId;
        payments[key] = record;
        if (receipt) payments[String(receipt)] = record;
      }

      // Save to unified transactions collection as a failed/reversed transaction record
      const transactionId = `mpesa_reversal_${merchantRequestID || checkoutRequestID || Date.now()}`;
      const amount = meta.Amount ? Number(meta.Amount) / 100 : 0;

      await saveTransaction({
        id: transactionId,
        type: 'mpesa',
        status: 'failed',
        amount,
        currency: 'KES',
        email: (meta.email as string) || '',
        phone: (meta.PhoneNumber as string) || '',
        name: (meta.name as string) || '',
        reference: checkoutRequestID || merchantRequestID || '',
        metadata: {
          reversal: true,
          resultCode,
          resultDesc,
          mpesaReceiptNumber: receipt,
          ...meta,
        },
        paid_at: new Date().toISOString(),
        raw_data: envBody,
      });
    } catch (err) {
      console.warn("Firestore save failed for reversal (continuing to persist locally)", err);
    }

    await writePayments(payments);

    return NextResponse.json({ result: "OK" });
  } catch (err) {
    console.error("MPESA reversal error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
