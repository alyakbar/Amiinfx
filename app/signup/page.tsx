"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [localError, setLocalError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const router = useRouter()
  const { error, clearError, user, initialized } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      router.push("/dashboard")
    }
  }, [user, initialized, router])

  // Clear errors when inputs change
  useEffect(() => {
    clearError()
    setLocalError("")
  }, [formData, clearError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear email exists flag when user modifies email
    if (name === "email") {
      setEmailExists(false)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes("@")) {
      return
    }

    setEmailCheckLoading(true)
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.exists) {
        setEmailExists(true)
        setLocalError("An account with this email already exists. Please sign in instead.")
      } else if (data.hasPendingOTP) {
        setLocalError("A verification code was already sent to this email. Please check your inbox.")
      } else {
        setEmailExists(false)
        setLocalError("")
      }
    } catch (error) {
      console.error("Email check error:", error)
      // Don't show error to user, just allow them to proceed
    } finally {
      setEmailCheckLoading(false)
    }
  }

  // Debounced email check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email && formData.email.includes("@")) {
        checkEmailAvailability(formData.email)
      }
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setLocalError("Please fill in all fields")
      return false
    }

    if (!formData.email.includes("@")) {
      setLocalError("Please enter a valid email address")
      return false
    }

    if (emailExists) {
      setLocalError("An account with this email already exists. Please sign in instead.")
      return false
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match")
      return false
    }

    if (!formData.agreeToTerms) {
      setLocalError("Please agree to the terms and conditions")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Send OTP to email
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to OTP verification page with user data
        const params = new URLSearchParams({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        })
        router.push(`/verify-otp?${params.toString()}`)
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          // Email already exists
          setEmailExists(true)
          setLocalError("An account with this email already exists. Please sign in instead.")
        } else if (response.status === 429) {
          // Too many requests / pending OTP
          setLocalError("A verification code was already sent to this email. Please check your inbox or wait before requesting a new code.")
        } else {
          setLocalError(data.error || "Failed to send verification code")
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      setLocalError("Failed to send verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

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
          <h2 className="mt-6 text-3xl font-bold text-white">Start Your Journey</h2>
          <p className="mt-2 text-gray-400">Create your account and begin your path to financial freedom</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {displayError && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">{displayError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="First name"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="Last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 bg-gray-700 border-gray-600 text-white pr-10 ${
                      emailExists ? "border-red-500 focus:border-red-500" : 
                      formData.email && !emailCheckLoading && !emailExists ? "border-green-500" : ""
                    }`}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                  {emailCheckLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    </div>
                  )}
                  {!emailCheckLoading && formData.email && formData.email.includes("@") && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5">
                      {emailExists ? (
                        <span className="text-red-500">✗</span>
                      ) : (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  )}
                </div>
                {emailExists && (
                  <p className="text-xs text-red-400 mt-1">
                    This email is already registered. <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">Sign in instead</Link>
                  </p>
                )}
                {!emailExists && formData.email && formData.email.includes("@") && !emailCheckLoading && (
                  <p className="text-xs text-green-400 mt-1">Email is available</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-400 hover:text-blue-300">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading || emailExists || emailCheckLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending Verification Code..." : 
                 emailExists ? "Email Already Registered" :
                 emailCheckLoading ? "Checking Email..." :
                 "Send Verification Code"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in here
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
