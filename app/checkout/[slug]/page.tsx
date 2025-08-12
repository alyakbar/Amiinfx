"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();

  const priceParam = searchParams.get("price");
  const priceUSD = priceParam ? parseFloat(priceParam) : null;

  const courseName = slug
    ? slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert USD → KES
  async function convertUSDToKES(usdAmount: number) {
    try {
      const res = await fetch(
        `https://api.exchangerate.host/convert?from=USD&to=KES&amount=${usdAmount}`
      );
      const data = await res.json();
      if (data && data.result) {
        return data.result;
      }
      return usdAmount * 130; // fallback rate
    } catch (error) {
      console.error("Currency conversion failed:", error);
      return usdAmount * 130; // fallback rate
    }
  }

  const handlePay = async () => {
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    if (!priceUSD) {
      alert("Invalid or missing price.");
      return;
    }

    setLoading(true);
    try {
      // Convert USD price → KES
      const amountKES = await convertUSDToKES(priceUSD);

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: Math.round(amountKES * 100), // Paystack expects amount in cents
          name,
          service: courseName,
          currency: "KES",
        }),
      });

      const data = await res.json();

      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Payment initialization failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Error initializing payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!priceUSD) {
    return <div className="text-white p-8">Invalid or missing price.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">{courseName}</h1>
        <p className="text-red-400 text-xl mb-6">${priceUSD} USD</p>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
        />

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 p-3 rounded bg-gray-700 text-white"
        />

        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? "Processing..." : "Pay Now in KES"}
        </Button>
      </div>
    </div>
  );
}
