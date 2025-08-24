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
    
    const payments = await readPayments();
    
    if (id) {
      // Get specific payment record
      const record = payments[id as string];
      return NextResponse.json({ 
        found: !!record, 
        record,
        id,
        debug: {
          availableKeys: Object.keys(payments),
          recordType: typeof record,
          recordKeys: record ? Object.keys(record as object) : []
        }
      });
    } else {
      // Get all payments for debugging
      return NextResponse.json({ 
        totalRecords: Object.keys(payments).length,
        allKeys: Object.keys(payments),
        allPayments: payments 
      });
    }
  } catch (err) {
    console.error("Debug M-Pesa error:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
