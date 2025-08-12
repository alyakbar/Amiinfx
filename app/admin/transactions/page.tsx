"use client";

import { useEffect, useState } from "react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading transactions...</div>;
  }

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Recent Transactions</h1>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 border border-gray-700">Email</th>
              <th className="p-3 border border-gray-700">Amount</th>
              <th className="p-3 border border-gray-700">Status</th>
              <th className="p-3 border border-gray-700">Reference</th>
              <th className="p-3 border border-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border border-gray-700 hover:bg-gray-900">
                <td className="p-3">{tx.email}</td>
                <td className="p-3">${tx.amount}</td>
                <td className="p-3">{tx.status}</td>
                <td className="p-3">{tx.reference}</td>
                <td className="p-3">
                  {tx.paid_at ? new Date(tx.paid_at).toLocaleString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
