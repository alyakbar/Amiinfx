import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { saveMpesaTransaction, saveTransaction } from "@/lib/firestore-admin";
import { sendPurchaseConfirmationEmail, recordPurchaseInDatabase } from "@/lib/email-service";

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
    const body = await req.json();
    console.log("M-Pesa callback received");

    // Typical Daraja STK callback lives at body.Body.stkCallback
    const stk = body?.Body?.stkCallback;
    if (!stk) {
      // Not an STK callback; persist raw body with a generated id
      const payments = await readPayments();
      const id = `raw_${Date.now()}`;
      payments[id] = { raw: body, receivedAt: new Date().toISOString() };
      await writePayments(payments);
      return NextResponse.json({ result: "OK" });
    }

    const merchantRequestID = stk.MerchantRequestID || stk.merchantRequestID || null;
    const checkoutRequestID = stk.CheckoutRequestID || stk.checkoutRequestID || null;
    const resultCode = typeof stk.ResultCode === "number" ? stk.ResultCode : Number(stk.ResultCode || -1);
    const resultDesc = stk.ResultDesc || stk.resultDesc || "";

    console.log(`M-Pesa payment ${resultCode === 0 ? 'SUCCESS' : 'FAILED'}: ${checkoutRequestID}`);

    // Extract callback metadata items like Amount, MpesaReceiptNumber, PhoneNumber, TransactionDate
  const metaItems: Record<string, unknown> = {};
    const items = stk.CallbackMetadata?.Item || stk.callbackMetadata?.Item || [];
    if (Array.isArray(items)) {
      for (const it of items) {
        if (it && it.Name) {
          metaItems[it.Name] = it.Value ?? null;
        }
      }
    }

    const record: Record<string, unknown> = {
      merchantRequestID,
      checkoutRequestID,
      resultCode,
      resultDesc,
      metadata: metaItems,
      raw: stk,
      receivedAt: new Date().toISOString(),
    };


    // Persist result keyed by MerchantRequestID and CheckoutRequestID
    const payments = await readPayments();

    // attempt to merge any init request data previously stored for this MerchantRequestID or CheckoutRequestID
    try {
      const existing = (merchantRequestID && payments[merchantRequestID as string]) || (checkoutRequestID && payments[checkoutRequestID as string]) || null;
      if (existing && (existing as Record<string, unknown>).request) {
        const reqData = (existing as Record<string, unknown>).request as Record<string, unknown>;
        // merge name/email/phone/amount into record
        record.request = { ...(record.request as Record<string, unknown> || {}), ...reqData };
      }
    } catch {
      // non-fatal
    }

    if (merchantRequestID) payments[merchantRequestID] = record;
    if (checkoutRequestID) payments[checkoutRequestID] = record;
    // also store by receipt number if available
  const receiptVal = (metaItems as Record<string, unknown>)["MpesaReceiptNumber"] || (metaItems as Record<string, unknown>)["mpesaReceiptNumber"];
  if (receiptVal) payments[String(receiptVal)] = record;

    // attempt to write to Firestore (admin) if available
    try {
      const docId = await saveMpesaTransaction(record as Record<string, unknown>);
      if (docId) {
        // annotate local record with firestore id
        record.firestoreId = docId;
        if (merchantRequestID) payments[merchantRequestID] = record;
        if (checkoutRequestID) payments[checkoutRequestID] = record;
        if (receiptVal) payments[String(receiptVal)] = record;
      }

      // Also save to unified transactions collection
      const transactionId = `mpesa_${merchantRequestID}_${checkoutRequestID}`;
      const status = resultCode === 0 ? 'success' : 
                    resultCode === 1032 ? 'cancelled' : 
                    'failed';
      
      const requestData = record.request as { 
        amount?: number; 
        email?: string; 
        phone?: string; 
        name?: string;
        accountReference?: string;
        description?: string;
        courseName?: string;
      } | undefined;
      const amount = metaItems.Amount ? Number(metaItems.Amount) / 100 : 
                    requestData?.amount ? Number(requestData.amount) / 100 : 0;

      // Extract course name
      const courseName = requestData?.courseName || 
                        requestData?.accountReference || 
                        requestData?.description || 
                        'Course Purchase';

      await saveTransaction({
        id: transactionId,
        type: 'mpesa',
        status,
        amount,
        currency: 'KES',
        email: requestData?.email || '',
        phone: metaItems.PhoneNumber as string || requestData?.phone || '',
        name: requestData?.name || '',
        reference: checkoutRequestID || '',
        metadata: {
          merchantRequestID,
          resultCode,
          resultDesc,
          mpesaReceiptNumber: metaItems.MpesaReceiptNumber,
          transactionDate: metaItems.TransactionDate,
          accountReference: requestData?.accountReference,
          description: requestData?.description,
          courseName: courseName,
        },
        paid_at: new Date().toISOString(),
        raw_data: stk,
      });

      // Send purchase confirmation email if payment was successful
      if (status === 'success' && requestData?.email && requestData?.name) {
        try {
          // Extract course name from request data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseName = (record.request as any)?.courseName || 
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           (record.request as any)?.accountReference || 
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           (record.request as any)?.description || 
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           (record.request as any)?.service || 
                           'Course Purchase';

          // Send confirmation email
          await sendPurchaseConfirmationEmail(
            requestData.email,
            requestData.name,
            courseName,
            amount,
            'KES',
            metaItems.MpesaReceiptNumber as string || transactionId
          );

          // Record purchase in database
          await recordPurchaseInDatabase(
            requestData.email,
            requestData.name,
            courseName,
            amount,
            'KES',
            metaItems.MpesaReceiptNumber as string || transactionId,
            'mpesa'
          );

        } catch (emailError) {
          console.error('Failed to send M-Pesa purchase confirmation:', emailError);
          // Don't fail the callback if email fails
        }
      }
    } catch (err) {
      console.warn("Firestore save failed (continuing to persist locally)", err);
    }

    await writePayments(payments);

    return NextResponse.json({ result: "OK" });
  } catch (err) {
    console.error("MPESA callback error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
