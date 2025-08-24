"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Mail, RefreshCw, CheckCircle } from "lucide-react"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, user, initialized } = useAuth()
  
  const email = searchParams.get("email") || ""
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const password = searchParams.get("password") || ""

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      router.push("/dashboard")
    }
  }, [user, initialized, router])

  // Redirect if missing required params
  useEffect(() => {
    if (!email || !firstName || !lastName || !password) {
      router.push("/signup")
    }
  }, [email, firstName, lastName, password, router])

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)

    try {
      // Verify OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setError(verifyData.error)
        return
      }

      // OTP verified successfully, now create Firebase account
      setVerificationSuccess(true)
      
      try {
        const fullName = `${firstName} ${lastName}`
        await register(email, password, fullName)

        // Save user registration to your transaction database
        try {
          await fetch("/api/auth/save-registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, firstName, lastName }),
          })
        } catch (registrationError) {
          console.warn("Failed to save registration to database:", registrationError)
        }

        // Clean up OTP data
        await fetch("/api/auth/cleanup-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })

        // Send welcome email (optional - don't fail if this fails)
        try {
          await fetch("/api/auth/send-welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, firstName, lastName }),
          })
        } catch (welcomeError) {
          console.warn("Welcome email failed:", welcomeError)
        }

        // Redirect will happen automatically via useAuth
      } catch (registrationError) {
        console.error("Registration error:", registrationError)
        setError("Failed to create account. Please try again.")
        setVerificationSuccess(false)
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setResendLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      })

      const data = await response.json()

      if (data.success) {
        setResendCooldown(60) // 60 second cooldown
        setOtp("") // Clear current OTP input
      } else {
        setError(data.error || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  // Show loading while Firebase initializes
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    )
  }

  // Show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-blue-400">
            Amiin FX
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Verify Your Email</h2>
          <p className="mt-2 text-gray-400">
            We&apos;ve sent a 6-digit code to <span className="text-white">{email}</span>
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              {verificationSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Creating Your Account...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Enter Verification Code
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationSuccess ? (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-400">Email verified! Creating your account...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="otp" className="text-white">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setOtp(value)
                    }}
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-center text-2xl font-mono tracking-wider"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">Didn&apos;t receive the code?</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-blue-400 hover:text-blue-300 hover:bg-gray-700 p-0 h-auto font-normal"
                  >
                    {resendLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Wrong email?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  Go back to signup
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
