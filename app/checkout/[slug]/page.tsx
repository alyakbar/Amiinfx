"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Apple, BadgeCheck, ArrowLeft, Landmark } from "lucide-react";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

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

  const [form, setForm] = useState({
    name: "",
    email: "",
    saveCard: false,
    paymentMethod: "card",
    mpesa: "",
    cryptoType: "",
    wallet: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePaystackRedirect(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !service?.price) return;
    setLoading(true);

    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        amount: service.price * 100,
        name: form.name,
        service: service.title,
      }),
    });

    const data = await res.json();
    if (data.status && data.data?.authorization_url) {
      window.location.href = data.data.authorization_url;
    } else {
      alert("Error initializing payment");
      setLoading(false);
    }
  }

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
          <form className="space-y-5" onSubmit={form.paymentMethod === 'card' ? handlePaystackRedirect : (e => { e.preventDefault(); setSuccess(true); })}>
            <div>
              <label className="block text-gray-300 mb-1 font-semibold">Name</label>
              <input type="text" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 font-semibold">Email</label>
              <input type="email" required className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email Address" />
            </div>
            {/* Payment Method Tabs */}
            <div>
              <div className="flex gap-2 mb-3">
                {['card', 'mpesa', 'crypto'].map(method => (
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
                ))}
              </div>
              {form.paymentMethod === 'card' && (
                <div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg mt-2 flex items-center justify-center gap-2">
                    {loading ? 'Redirecting...' : 'Pay with Paystack'}
                  </button>
                </div>
              )}
            </div>
          </form>
          <div className="text-xs text-gray-500 mt-8 text-center">Powered by Paystack.</div>
        </div>
      </div>
    </div>
  );
}
