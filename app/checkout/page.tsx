"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ShoppingCart, CheckCircle } from "lucide-react"

type Service = {
  id: string;
  title: string;
  desc: string;
  price: number | null;
  cta: string;
};

type CartItem = Service & { qty: number };

const SERVICES: Service[] = [
  {
    id: "signals",
    title: "Premium Trading Signals",
    desc: "Get expert-generated signals directly to your phone or platform.",
    price: 100,
    cta: "Buy Now",
  },
  {
    id: "online-masterclass",
    title: "Online Masterclass",
    desc: "Learn exact systems Amiin FX uses to trade successfully.",
    price: 250,
    cta: "Buy Now",
  },
  {
    id: "inperson-masterclass",
    title: "In-Person Masterclass",
    desc: "Direct mentorship and hands-on strategy development.",
    price: 500,
    cta: "Book Seat",
  },
  {
    id: "coaching",
    title: "1-on-1 Coaching",
    desc: "Tailored mentorship to transform your trading performance.",
    price: 2000,
    cta: "Enroll Now",
  },
  {
    id: "account-management",
    title: "Account Management",
    desc: "Let Amiin FX manage your trades for a 50/50 profit split.",
    price: null,
    cta: "Contact for Setup",
  },
  {
    id: "session-booking",
    title: "1-Hour Trading Session",
    desc: "Book a focused, one-hour mentorship session.",
    price: 50,
    cta: "Book Now",
  },
  {
    id: "course",
    title: "Complete Trading Course",
    desc: "All-in-one trading course covering everything from basics to advanced strategies.",
    price: 199,
    cta: "Buy Course",
  },
]

function formatPrice(price: number | null) {
  if (price === null) return "Custom"
  if (price === 50) return "$50/hour"
  return `$${price}`
}

export default function CheckoutPage() {
  const router = useRouter()

  const handleServiceClick = (service: Service) => {
    if (service.price === null) {
      window.location.href = "/contact"
      return
    }
    router.push(`/checkout/${service.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero */}
      <section className="w-full bg-gradient-to-br from-black via-gray-900 to-green-900 py-12 px-4 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Checkout — Amiin FX Services</h1>
        <p className="text-lg text-green-300 mb-2">Secure your access to expert trading services.</p>
      </section>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mb-16">
        {SERVICES.map((s) => (
          <div key={s.id} className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-start hover:shadow-2xl transition-shadow duration-300 group border border-gray-700">
            <h2 className="text-xl font-bold mb-2 text-green-400 group-hover:text-yellow-400 transition">{s.title}</h2>
            <p className="text-gray-300 mb-4 flex-1">{s.desc}</p>
            <div className="text-lg font-bold mb-4">
              {s.price === null ? <span className="text-yellow-400">Custom Pricing</span> : formatPrice(s.price)}
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow group-hover:scale-105 transition-transform"
              onClick={() => handleServiceClick(s)}
            >
              {s.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Cart and payment modals removed for single-service checkout */}
    </div>
  )
}
