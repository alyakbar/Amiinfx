
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return mock transactions since no database is used
    const transactions = [
      {
        id: "1",
        email: "user1@example.com",
        amount: 100,
        status: "success",
        reference: "ref-001",
        paid_at: new Date().toISOString(),
      },
      {
        id: "2",
        email: "user2@example.com",
        amount: 200,
        status: "pending",
        reference: "ref-002",
        paid_at: new Date().toISOString(),
      }
    ];
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
