

"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Apple, BadgeCheck, ArrowLeft, Landmark } from "lucide-react";

const SERVICES = [
  { id: "signals", title: "Premium Trading Signals", desc: "Get expert-generated signals directly to your phone or platform.", price: 100 },
  { id: "online-masterclass", title: "Online Masterclass", desc: "Learn exact systems Amiin FX uses to trade successfully.", price: 250 },
  { id: "inperson-masterclass", title: "In-Person Masterclass", desc: "Direct mentorship and hands-on strategy development.", price: 500 },
  { id: "coaching", title: "1-on-1 Coaching", desc: "Tailored mentorship to transform your trading performance.", price: 2000 },
  { id: "account-management", title: "Account Management", desc: "Let Amiin FX manage your trades for a 50/50 profit split.", price: null },
  { id: "session-booking", title: "1-Hour Trading Session", desc: "Book a focused, one-hour mentorship session.", price: 50 },
  { id: "course", title: "Complete Trading Course", desc: "All-in-one trading course covering everything from basics to advanced strategies.", price: 199 },
];

function formatPrice(price: number | null) {
  if (price === null) return "Custom";
  if (price === 50) return "$50/hour";
  return `$${price}`;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  let slug = "";
  if (typeof params.slug === "string") slug = params.slug;
  else if (Array.isArray(params.slug)) slug = params.slug[0];
  slug = slug.trim().toLowerCase();
  const service = SERVICES.find(s => s.id.toLowerCase() === slug);

  // Payment form state (placeholder logic)
  const [form, setForm] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvv: "",
    saveCard: false,
    paymentMethod: "card",
    mpesa: "",
    cryptoType: "",
    wallet: "",
  });
  const [success, setSuccess] = useState(false);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center border-2 border-red-600">
          <Landmark className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
          <p className="mb-4">The requested service does not exist. Please check the link or select another product.</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center border-2 border-green-600">
          <BadgeCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
          <p className="mb-4">Thank you for purchasing <span className="font-bold">{service.title}</span>.<br />Amiin FX will contact you soon.</p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg" onClick={() => router.push("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-2 py-8">
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border-2 border-green-600">
        {/* Left: Product Summary */}
        <div className="md:w-1/2 w-full bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-green-400 mb-2">{service.title}</h2>
            <p className="text-gray-300 mb-4">{service.desc}</p>
            <div className="text-4xl font-bold text-green-400 mb-6">{formatPrice(service.price)}</div>
          </div>
          <div className="mt-auto text-xs text-gray-400">You are purchasing this product securely. All sales are final.</div>
        </div>

        {/* Right: Payment Form */}
        <div className="md:w-1/2 w-full bg-gray-900 p-8 flex flex-col justify-between">
          <form className="space-y-5" onSubmit={e => { e.preventDefault(); setSuccess(true); }}>
            <div>
              <label className="block text-gray-300 mb-1 font-semibold">Name</label>
              <input type="text" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 font-semibold">Email</label>
              <input type="email" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email Address" />
            </div>
            {/* Express Checkout Buttons */}
            <div className="flex gap-2">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold bg-yellow-400 hover:bg-yellow-300 text-black border border-yellow-500 shadow transition-all">
                <CreditCard className="h-5 w-5 text-yellow-700" /> PayPal
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold bg-black hover:bg-gray-800 text-white border border-gray-700 shadow transition-all">
                <Apple className="h-5 w-5 text-white" /> Apple Pay
              </button>
            </div>
            {/* Payment Method Tabs */}
            <div>
              <div className="flex gap-2 mb-3">
                {['card', 'mpesa', 'crypto'].map(method => (
                  method !== 'klarna' && (
                    <button
                      key={method}
                      type="button"
                      className={`flex-1 py-2 rounded-lg font-bold border transition-all ${form.paymentMethod === method ? 'bg-green-600 text-white border-green-700' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                      onClick={() => setForm(f => ({ ...f, paymentMethod: method }))}
                    >
                      {method === 'card' && 'Card'}
                      {method === 'mpesa' && 'MPesa'}
                      {method === 'crypto' && 'Crypto'}
                    </button>
                  )
                ))}
              </div>
              {/* Card Payment Fields */}
              {form.paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Card Number</label>
                    <input type="text" required maxLength={19} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 tracking-widest" value={form.card} onChange={e => setForm(f => ({ ...f, card: e.target.value }))} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-gray-300 mb-1 font-semibold">Expiry</label>
                      <input type="text" required maxLength={5} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} placeholder="MM/YY" inputMode="numeric" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-300 mb-1 font-semibold">CVV</label>
                      <input type="text" required maxLength={4} className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} placeholder="123" inputMode="numeric" />
                    </div>
                  </div>
                </>
              )}
              {/* MPesa Payment Fields */}
              {form.paymentMethod === 'mpesa' && (
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">MPesa Phone Number</label>
                  <input type="tel" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.mpesa || ''} onChange={e => setForm(f => ({ ...f, mpesa: e.target.value }))} placeholder="e.g. 0712 345 678" />
                </div>
              )}
              {/* Crypto Payment Fields */}
              {form.paymentMethod === 'crypto' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Cryptocurrency</label>
                    <select className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white" value={form.cryptoType || ''} onChange={e => setForm(f => ({ ...f, cryptoType: e.target.value }))} title="Cryptocurrency">
                      <option value="">Select</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Wallet Address</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" value={form.wallet || ''} onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))} placeholder="Paste your wallet address" />
                  </div>
                </>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.saveCard} onChange={e => setForm(f => ({ ...f, saveCard: e.target.checked }))} className="accent-green-500" />
              <span className="text-gray-300 text-sm">Save card for future use</span>
            </label>
            <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-lg shadow-lg text-lg mt-2 transition-all">
              Pay Now {form.paymentMethod === 'card' && <span className="ml-2">(Card)</span>}
              {form.paymentMethod === 'mpesa' && <span className="ml-2">(MPesa)</span>}
              {form.paymentMethod === 'crypto' && <span className="ml-2">(Crypto)</span>}
            </button>
          </form>
          <div className="text-xs text-gray-500 mt-8 text-center">Powered by Pay.</div>
        </div>
      </div>
    </div>
  );
}
