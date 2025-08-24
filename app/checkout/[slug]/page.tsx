"use client";

import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, CreditCard, Smartphone, Bitcoin, Coins } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const priceParam = searchParams.get("price");
  const priceUSD = priceParam ? parseFloat(priceParam) : null;

  // Ensure slug is a string before using replace
  const courseName = typeof slug === "string"
    ? slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [coinbaseLoading, setCoinbaseLoading] = useState(false);
  const [binanceLoading, setBinanceLoading] = useState(false);
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");

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

    const res = await fetch("/api/paddle/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
      amount: Math.round(amountKES * 100), // Keep amount as cents for server convenience; Paddle API expects prices as strings (handled server-side)
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

  const handleCoinbasePay = async () => {
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    if (!priceUSD) {
      alert("Invalid or missing price.");
      return;
    }

    setCoinbaseLoading(true);
    try {
      // Create Coinbase Commerce hosted charge
      const res = await fetch("/api/crypto/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          amountUSD: priceUSD, 
          service: courseName,
          courseName: courseName,
          provider: "coinbase"
        }),
      });

      const data = await res.json();

      if (data.hosted_url || data.hostUrl) {
        // Redirect user to Coinbase hosted page
        window.location.href = data.hosted_url || data.hostUrl;
      } else {
        console.error("Coinbase init failed", data);
        alert("Failed to initialize Coinbase payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initializing Coinbase payment.");
    } finally {
      setCoinbaseLoading(false);
    }
  };

  const handleBinancePay = async () => {
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    if (!priceUSD) {
      alert("Invalid or missing price.");
      return;
    }

    setBinanceLoading(true);
    try {
      // Create Binance Pay order
      const res = await fetch("/api/crypto/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          amountUSD: priceUSD, 
          service: courseName,
          courseName: courseName,
          provider: "binance"
        }),
      });

      const data = await res.json();

      if (data.hosted_url || data.hostUrl) {
        // Redirect user to Binance Pay hosted page
        window.location.href = data.hosted_url || data.hostUrl;
      } else {
        console.error("Binance init failed", data);
        alert("Failed to initialize Binance payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initializing Binance payment.");
    } finally {
      setBinanceLoading(false);
    }
  };

  const handleMpesaPay = async () => {
    if (!name || !phone) {
      alert("Please enter your name and phone number for M-Pesa.");
      return;
    }
    if (!priceUSD) {
      alert("Invalid or missing price.");
      return;
    }

    setMpesaLoading(true);
    setMpesaMessage("Initiating M-Pesa payment...");

    try {
      // Amount expected in KES for STK push; convert from USD
      const amountKES = await convertUSDToKES(priceUSD);

      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amountKES),
          phone,
          name,
          email,
          accountReference: courseName,
          description: `Payment for ${courseName}`,
        }),
      });

      const initJson = await res.json();
      console.debug("STK init response", initJson);

      // Check immediate response
      if (!initJson) throw new Error("No response from STK push");
      if (initJson.ResponseCode && initJson.ResponseCode !== "0") {
        const msg = initJson.ResponseDescription || JSON.stringify(initJson);
        alert("STK push rejected: " + msg);
        setMpesaMessage("Payment failed — please try again.");
        setMpesaLoading(false);
        return;
      }

      const merchantRequestID = initJson.MerchantRequestID || initJson.merchantRequestID || initJson.MerchantRequestID;
      const checkoutRequestID = initJson.CheckoutRequestID || initJson.checkoutRequestID;
      const idToCheck = merchantRequestID || checkoutRequestID;

      if (!idToCheck) {
        console.warn("No MerchantRequestID/CheckoutRequestID in STK response", initJson);
        alert("STK push accepted but no request id returned. Check server logs.");
        setMpesaMessage("Payment failed — please try again.");
        setMpesaLoading(false);
        return;
      }

      setMpesaMessage("STK push sent. Waiting for confirmation on your phone...");

      // Poll the status endpoint
      const timeoutMs = 2 * 60 * 1000; // 2 minutes
      const intervalMs = 5000;
      const start = Date.now();

      const poll = async () => {
        try {
          const statusRes = await fetch(`/api/mpesa/status?id=${encodeURIComponent(idToCheck)}`);
          const statusJson = await statusRes.json();

          if (statusJson.found && statusJson.success) {
            setMpesaMessage("Payment successful — thank you!");
            alert("M-Pesa payment successful.");
            setMpesaLoading(false);
            return;
          }

          if (Date.now() - start > timeoutMs) {
            setMpesaMessage("Payment failed — not confirmed. Please try again.");
            alert("Payment not confirmed within timeout. Please try again.");
            setMpesaLoading(false);
            return;
          }

          // continue polling
          setTimeout(poll, intervalMs);
        } catch (err) {
          console.error("Status check error", err);
          if (Date.now() - start > timeoutMs) {
            setMpesaMessage("Payment failed — please try again.");
            alert("Payment check failed. Please try again.");
            setMpesaLoading(false);
            return;
          }
          setTimeout(poll, intervalMs);
        }
      };

      // start polling
      setTimeout(poll, intervalMs);
    } catch (err) {
      console.error(err);
      alert("Error initiating M-Pesa payment.");
      setMpesaMessage("Payment failed — please try again.");
      setMpesaLoading(false);
    }
  };

  if (!priceUSD) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Navigation Header */}
        <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-600"></div>
              <Link href="/dashboard" className="text-white font-semibold text-lg">
                AmiinFX
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300 text-sm">Checkout</span>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-8">
          <Card className="bg-red-900 border-red-700 max-w-md w-full">
            <CardContent className="p-6 text-center">
              <p className="text-red-300">Invalid or missing price parameter.</p>
              <Button 
                onClick={() => router.back()} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-600"></div>
            <Link href="/dashboard" className="text-white font-semibold text-lg">
              AmiinFX
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300 text-sm">Checkout</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Course Info Header */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{courseName}</CardTitle>
            <p className="text-3xl font-bold text-green-400">${priceUSD} USD</p>
          </CardHeader>
        </Card>

        {/* Payment Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Complete Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              
              <input
                type="text"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />

              <input
                type="email"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />

              <input
                type="tel"
                placeholder="M-Pesa Phone (2547XXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
              
              {/* Paddle Payment */}
              <Button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>{loading ? "Processing..." : "Pay with Card/Bank (KES)"}</span>
              </Button>

              {/* Coinbase Crypto Payment */}
              <Button
                onClick={handleCoinbasePay}
                disabled={coinbaseLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Bitcoin className="h-5 w-5" />
                <span>{coinbaseLoading ? "Processing..." : "Pay with Coinbase (BTC, ETH, USDC)"}</span>
              </Button>

              {/* Binance Crypto Payment */}
              <Button
                onClick={handleBinancePay}
                disabled={binanceLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Coins className="h-5 w-5" />
                <span>{binanceLoading ? "Processing..." : "Pay with Binance Pay (Crypto)"}</span>
              </Button>

              {/* M-Pesa Payment */}
              <Button
                onClick={handleMpesaPay}
                disabled={mpesaLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Smartphone className="h-5 w-5" />
                <span>{mpesaLoading ? "Waiting for M-Pesa..." : "Pay with M-Pesa"}</span>
              </Button>

              {mpesaMessage && (
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">{mpesaMessage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
