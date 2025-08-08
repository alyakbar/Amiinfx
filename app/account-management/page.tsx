"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, UserCheck, Check, Shield, BarChart3 } from "lucide-react"

export default function AccountManagementPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    accountSize: "",
    riskTolerance: "moderate",
    tradingExperience: "",
    goals: "",
  })

  const handleApply = (planType: string) => {
    setSelectedPlan(planType)
    setTimeout(() => {
      alert(
        `Application submitted for ${planType}! Our team will contact you within 24 hours to discuss your account management setup.`,
      )
      setSelectedPlan(null)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const managementPlans = [
    {
      name: "Manual Management",
      price: "15% of profits",
      description: "Amiin FX manually trades your account with full transparency",
      features: [
        "Manual trading by Amiin FX",
        "Full account transparency",
        "Monthly performance reports",
        "Risk management protocols",
        "Direct communication access",
      ],
      icon: UserCheck,
      color: "bg-blue-600",
    },
    {
      name: "Automated Management",
      price: "20% of profits",
      description: "Advanced algorithms execute trades based on Amiin's strategies",
      features: [
        "Automated trading systems",
        "24/7 market monitoring",
        "Real-time performance tracking",
        "Advanced risk controls",
        "Monthly strategy updates",
      ],
      icon: BarChart3,
      color: "bg-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Step 1: Headline */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Let Amiin Trade for You — <span className="text-cyan-400">Share the Profits, Not the Stress</span>
              </h1>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Intro Paragraph */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <p className="text-lg text-gray-300 mb-2">
              Experience hands-free trading with Amiin FX’s professional account management. Simply fund your trading account and let Amiin FX handle the rest—no charts, no stress, no guesswork. Our expertise and proven strategies work for you, so you can focus on what matters most while your capital is actively traded for maximum results.
            </p>
          </CardContent>
        </Card>

        {/* Step 3: 50/50 Profit Split Model */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">Fair and Transparent: 50/50 Profit Split</h2>
            <p className="text-gray-300">
              At the end of each trading cycle—weekly, bi-weekly, or monthly—you and Amiin FX split the net profits 50/50. You provide the capital, we provide the expertise. There are no hidden fees, and you only pay when you profit.
            </p>
          </CardContent>
        </Card>

        {/* Step 4: Trust & Security */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Your Security & Control</h3>
            <p className="text-gray-300 mb-2">
              You retain full control and visibility over your trading account at all times. All trading activity is conducted transparently, and you can withdraw your funds whenever you wish (subject to broker terms). Your trust and peace of mind are our top priorities.
            </p>
          </CardContent>
        </Card>

        {/* Step 5: FAQ Bullets */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Minimum deposit amount?</span> $5,000</li>
              <li><span className="font-semibold text-white">How long does the profit cycle last?</span> Choose weekly, bi-weekly, or monthly cycles.</li>
              <li><span className="font-semibold text-white">Can I monitor my account?</span> Yes, you have full access and visibility at all times.</li>
              <li><span className="font-semibold text-white">How is profit withdrawal handled?</span> Profits are split and paid out at the end of each cycle.</li>
              <li><span className="font-semibold text-white">Can I stop at any time?</span> Yes, you can stop or withdraw funds whenever you wish (subject to broker terms).</li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 6: Closing Statement */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-cyan-400 font-semibold mb-4">
              Start your hands-free trading journey today with a trusted professional by your side. Let your money work for you while we do the trading.
            </p>

            {/* Step 7: CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a
                href="https://t.me/amiin_fx10"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
              >
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 text-lg flex items-center justify-center">
                  Message Us on Telegram
                </Button>
              </a>
              <a
                href="https://wa.me/254111532085"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
              >
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg flex items-center justify-center">
                  Chat via WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
