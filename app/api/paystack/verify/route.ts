import { NextResponse } from "next/server";
import axios from "axios";
import { saveMpesaTransaction, saveTransaction } from "@/lib/firestore-admin";


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

    // Save successful paystack transaction to Firestore (if configured)
    try {
      const payerName = transaction?.metadata?.custom_fields?.find((f: { variable_name?: string; value?: unknown }) => f.variable_name === "name")?.value || transaction.customer?.first_name || null;
      const payerEmail = transaction?.customer?.email || transaction?.customer?.email || null;
      const amount = transaction?.amount || null; // paystack amount in kobo
      const currency = transaction?.currency || null;

      // Save to legacy mpesa transactions collection
      await saveMpesaTransaction({
        provider: "paystack",
        stage: "verify",
        transaction,
        name: payerName,
        email: payerEmail,
        amount,
        currency,
      });

      // Also save to unified transactions collection
      const transactionId = `paystack_${reference}`;
      await saveTransaction({
        id: transactionId,
        type: 'paystack',
        status: transaction.status === 'success' ? 'success' : 'failed',
        amount: amount ? amount / 100 : 0, // Convert from kobo to actual amount
        currency: currency || 'NGN',
        email: payerEmail || '',
        phone: transaction?.customer?.phone || '',
        name: payerName as string || '',
        reference: reference,
        metadata: {
          authorization_code: transaction?.authorization?.authorization_code,
          card_type: transaction?.authorization?.card_type,
          last4: transaction?.authorization?.last4,
          exp_month: transaction?.authorization?.exp_month,
          exp_year: transaction?.authorization?.exp_year,
          channel: transaction?.channel,
          fees: transaction?.fees,
        },
        paid_at: transaction?.paid_at || new Date().toISOString(),
        raw_data: transaction,
      });
    } catch (err) {
      console.warn("Failed to save paystack verify to Firestore", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error verifying transaction:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
