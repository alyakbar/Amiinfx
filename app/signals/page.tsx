"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Smartphone, Mail, Check, Star } from "lucide-react"

export default function Page() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()

  // Map plan name to checkout slug
  const planSlugMap: Record<string, string> = {
    "1 Month": "signals",
    "3 Months": "signals",
    "Lifetime Access": "signals",
  }

  const handleSubscribe = (plan: string, price: string) => {
    setSelectedPlan(plan)
    setTimeout(() => {
      const slug = planSlugMap[plan] || "signals"
      const encodedPlan = encodeURIComponent(plan)
      router.push(`/checkout/${slug}?plan=${encodedPlan}`)
      setSelectedPlan(null)
    }, 1000)
  }

  const plans = [
    {
      name: "1 Month",
      price: "$100",
      duration: "Monthly",
      popular: false,
      features: [
        "Daily trading signals",
        "Entry, stop loss, and take profit levels",
        "Market analysis and reasoning",
        "Telegram group access",
        "Email notifications",
      ],
    },
    {
      name: "3 Months",
      price: "$199",
      duration: "3 Months",
      popular: true,
      features: [
        "Daily trading signals",
        "Entry, stop loss, and take profit levels",
        "Market analysis and reasoning",
        "Telegram group access",
        "Email notifications",
        "Priority support",
      ],
    },
    {
      name: "Lifetime Access",
      price: "$599",
      duration: "One-time payment",
      popular: false,
      features: [
        "Daily trading signals",
        "Entry, stop loss, and take profit levels",
        "Market analysis and reasoning",
        "Telegram group access",
        "Email notifications",
        "Priority support",
        "Exclusive webinars",
        "Direct access to Amiin FX",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Premium Trading <span className="text-red-400">SIGNALS</span>
                </h1>
                <p className="text-gray-400 mt-2">Get real-time forex signals directly from Amiin FX.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Telegram Delivery</h3>
              <p className="text-gray-400 text-sm">Instant notifications sent directly to your phone</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Alerts</h3>
              <p className="text-gray-400 text-sm">Professional signal reports in your inbox</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-gray-800 border-gray-700 relative ${
                plan.popular ? "border-blue-500 border-2" : ""
              } hover:border-blue-600 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-red-400 mb-2">{plan.price}</div>
                  <p className="text-gray-400">{plan.duration}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  disabled={selectedPlan === plan.name}
                  className={`w-full font-bold py-3 ${
                    plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {selectedPlan === plan.name ? "SUBSCRIBING..." : "SUBSCRIBE NOW"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Why Choose Amiin FX Signals?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">High Accuracy</h4>
                  <p className="text-gray-400 text-sm">Signals based on proven strategies with consistent results</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Real-Time Delivery</h4>
                  <p className="text-gray-400 text-sm">Instant notifications via Telegram and email</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Expert Analysis</h4>
                  <p className="text-gray-400 text-sm">Detailed market analysis from Amiin FX himself</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

