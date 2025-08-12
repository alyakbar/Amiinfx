"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, RefreshCw, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import firebaseApp from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function BookingPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedHours, setSelectedHours] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
  const auth = getAuth(firebaseApp)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "")
        setUserEmail(user.email || "")
      }
    })
    return () => unsubscribe()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      alert("No new slots available right now.")
      setIsRefreshing(false)
    }, 2000)
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time for your session.")
      return
    }

    setIsBooking(true)
    const slug = `${selectedDate}-${selectedTime.replace(":", "")}`
    const price = selectedHours * 100 // in USD, adjust if converting to KSH
    router.push(
      `/checkout/${slug}?hours=${selectedHours}&price=${price}&date=${selectedDate}&time=${selectedTime}`
    )
  }

  const totalCost = selectedHours * 100

  return (
    <DashboardLayout>
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

          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Session <span className="text-red-400">BOOKING</span>
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Flexible 1-hour sessions for strategy tuning, live chart reviews, or Q&A.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Book Your Session</h3>

                  <div className="space-y-4">
                    {/* Hidden Name & Email (auto-filled from auth) */}
                    <input type="hidden" value={userName} />
                    <input type="hidden" value={userEmail} />

                    <div>
                      <Label className="text-white">Number of Hours</Label>
                      <select
                        value={selectedHours}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedHours(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        title="Number of Hours"
                        aria-label="Number of Hours"
                      >
                        <option value={1}>1 Hour</option>
                        <option value={2}>2 Hours</option>
                        <option value={3}>3 Hours</option>
                        <option value={4}>4 Hours</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-white">Preferred Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                        className="mt-1 bg-gray-700 border-gray-600 text-white"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Preferred Time</Label>
                      <select
                        value={selectedTime}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTime(e.target.value)}
                        className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        title="Preferred Time"
                        aria-label="Preferred Time"
                      >
                        <option value="">Select a time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-blue-400 mr-2" />
                          <span className="text-white font-semibold">Total Cost:</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-400">${totalCost}</span>
                      </div>
                      <p className="text-gray-300 text-sm mt-2">
                        {selectedHours} hour(s) × $100/hour = ${totalCost}
                      </p>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                    >
                      {isBooking ? "BOOKING..." : `BOOK SESSION - $${totalCost}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Session Info */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">What&apos;s Included</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">Flexible 1-hour sessions</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">Live chart reviews</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">Strategy tuning & optimization</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">Q&A with personalized feedback</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Available Slots</h3>
                    <Button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-400 mb-2">Limited Availability</h4>
                    <p className="text-gray-500 mb-4">
                      Sessions are in high demand. Book your preferred time above and we&apos;ll confirm availability.
                    </p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>• Sessions typically available 1-2 weeks in advance</p>
                      <p>• Priority booking for coaching clients</p>
                      <p>• Emergency sessions available via support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
