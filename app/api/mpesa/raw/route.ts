import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'data', 'mpesa-payments.json');
    const raw = fs.readFileSync(p, 'utf8');
    const obj = JSON.parse(raw || '{}') as Record<string, unknown>;
    const payments = Object.entries(obj).map(([id, v]) => {
      return { id, ...(typeof v === 'object' && v ? v as Record<string, unknown> : {}) };
    });
    return NextResponse.json({ success: true, payments });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
