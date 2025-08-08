"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, MapPin, Building, Check, Star, Video } from "lucide-react"

export default function AcademyPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const handleApply = (courseType: string) => {
    setSelectedCourse(courseType)
    // Simulate application process
    setTimeout(() => {
      alert(`Application submitted for ${courseType}! We'll contact you soon.`)
      setSelectedCourse(null)
    }, 1000)
  }

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

        {/* Header Card */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  AMIIN FOREX <span className="text-red-400">MASTERCLASS</span>
                </h1>
                <p className="text-gray-400 mt-2">Learn the exact trading systems used by Amiin FX</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Online Option */}
            <Card className="bg-blue-900/20 border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Video className="h-6 w-6 text-blue-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Online Masterclass</h3>
                </div>
                <p className="text-gray-300">Live online sessions with interactive Q&A and recorded access</p>
              </CardContent>
            </Card>

            {/* In-Person Option */}
            <Card className="bg-purple-900/20 border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">In-Person Masterclass</h3>
                </div>
                <p className="text-gray-300">Hands-on training at our dedicated facility with direct mentorship</p>
              </CardContent>
            </Card>

            {/* What Makes Our Masterclass Different */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">What Makes Our Masterclass Different?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Personal attention from Amiin FX</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Live market analysis sessions</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Practical trading setups and demos</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Exact systems used by Amiin FX</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Skill Levels Welcome */}
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-green-400 mr-2" />
                  <h3 className="text-lg font-bold text-green-400">All skill levels welcome</h3>
                </div>
                <p className="text-gray-300">
                  From complete beginners to advanced traders looking to refine their skills
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Course Offerings */}
          <div className="space-y-6">
            {/* Online Masterclass */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Online Masterclass</h3>
                    <p className="text-2xl font-bold text-blue-400">$250</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Live online sessions</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Interactive Q&A with Amiin</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Recorded access for review</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Trading system breakdowns</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleApply("Online Masterclass")}
                  disabled={selectedCourse === "Online Masterclass"}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {selectedCourse === "Online Masterclass" ? "Enrolling..." : "Enroll in Online Masterclass"}
                </Button>
              </CardContent>
            </Card>

            {/* In-Person Masterclass */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">In-Person Masterclass</h3>
                    <p className="text-2xl font-bold text-purple-400">$500</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Hands-on training with Amiin</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Direct mentorship & feedback</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Live chart analysis sessions</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Networking with other traders</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleApply("In-Person Masterclass")}
                  disabled={selectedCourse === "In-Person Masterclass"}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {selectedCourse === "In-Person Masterclass" ? "Applying..." : "Apply for In-Person Masterclass"}
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">What You'll Learn</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Amiin's exact entry and exit strategies</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Risk management techniques</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Market structure analysis</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Psychology of successful trading</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
