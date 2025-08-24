import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mpesa-payments.json");

async function readPayments(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(content || "{}");
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const payments = await readPayments();
    const paymentEntries = Object.entries(payments);
    
    // Sort by receivedAt timestamp, most recent first
    const sortedPayments = paymentEntries
      .map(([id, data]) => ({
        id,
        ...(data as Record<string, unknown>),
      }))
      .filter(payment => payment.receivedAt)
      .sort((a, b) => {
        const timeA = new Date(a.receivedAt as string).getTime();
        const timeB = new Date(b.receivedAt as string).getTime();
        return timeB - timeA; // Most recent first
      })
      .slice(0, 10); // Last 10 payments

    // Get the most recent payment
    const mostRecent = sortedPayments[0];
    const now = new Date();
    const lastPaymentTime = mostRecent ? new Date(mostRecent.receivedAt as string) : null;
    const minutesAgo = lastPaymentTime ? Math.floor((now.getTime() - lastPaymentTime.getTime()) / (1000 * 60)) : null;

    return NextResponse.json({
      totalPayments: paymentEntries.length,
      recentPayments: sortedPayments,
      lastPaymentReceived: lastPaymentTime?.toISOString(),
      minutesAgoSinceLastPayment: minutesAgo,
      callbackStatus: {
        working: sortedPayments.length > 0,
        lastResultCode: mostRecent?.resultCode,
        lastResultDesc: mostRecent?.resultDesc,
        hasSuccessfulPayments: sortedPayments.some(p => p.resultCode === 0),
      }
    });
  } catch (err) {
    console.error("Recent payments check error:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
