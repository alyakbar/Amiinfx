import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

export async function GET() {
  try {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);

    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
