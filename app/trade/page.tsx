"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Check, Zap, Mail, MessageCircle } from "lucide-react"

export default function TradePage() {
  const [email, setEmail] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleRegister = () => {
    if (!email) {
      alert("Please enter your email address")
      return
    }

    setIsRegistering(true)
    setTimeout(() => {
      alert(
        "Registration successful! Please check your email for the Exness referral link and verification instructions.",
      )
      setIsRegistering(false)
    }, 2000)
  }

  const handleVerification = () => {
    if (!email) {
      alert("Please enter your email address first")
      return
    }

    setIsVerifying(true)
    setTimeout(() => {
      alert(
        "Verification email sent! Please check your inbox and follow the instructions to get instant access to signals.",
      )
      setIsVerifying(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Trade Smarter with Our Trusted Broker
              </h1>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <p className="text-lg text-gray-300 mb-4">
              Amiin FX recommends <span className="font-bold text-red-400">Exness</span> for all your trading needs. Trusted by millions of traders globally, Exness is regulated and secure, offers fast withdrawals and deposits, competitive spreads with zero hidden fees, and provides advanced trading tools and analytics to help you trade with confidence.
            </p>
            <p className="text-gray-300 mb-4">
              Exness is the preferred broker for Amiin FX’s trading strategies. Using Exness ensures seamless compatibility, better performance, and smoother trade execution for all our clients.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300 mb-6">
              <li>Trusted by millions of traders globally</li>
              <li>Regulated and secure</li>
              <li>Fast withdrawals and deposits</li>
              <li>Competitive spreads and zero hidden fees</li>
              <li>Advanced trading tools and analytics</li>
            </ul>
            <div className="flex justify-center mt-8">
              <a
                href=":https://www.exness.ke/?utm_source=partners&fbclid=PAZXh0bgNhZW0CMTEAAaccjmIXTQMZ2ZS1W8IbLd075J8wouwDbJknNZClgKzMNVmqpdJxAkdCpMQmGw_aem_Jcyoqz0rqqJTstfSd7T5Dg&ex_ol=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
              >
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg flex items-center justify-center">
                  Start Trading with Exness Today
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
