"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { ArrowLeft, Users2, Check, Instagram, Twitter, Youtube, Music, MessageCircle, ExternalLink } from "lucide-react"

export default function CollaborationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitProposal = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      alert(
        "Partnership proposal submitted successfully! We'll review your proposal and get back to you within 5-7 business days.",
      )
      setIsSubmitting(false)
    }, 2000)
  }

  const socialChannels = [
    { name: "Instagram", followers: "640K followers", icon: Instagram, color: "text-pink-400" },
    { name: "X (Twitter)", followers: "300K followers", icon: Twitter, color: "text-blue-400" },
    { name: "YouTube", followers: "310K followers", icon: Youtube, color: "text-red-400" },
    { name: "TikTok", followers: "250K followers", icon: Music, color: "text-purple-400" },
    { name: "Telegram", followers: "200K+ followers", icon: MessageCircle, color: "text-blue-300" },
  ]

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

        {/* Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Brand <span className="text-red-400">COLLABORATIONS</span>
                </h1>
                <p className="text-gray-400 mt-2">Promote your fintech, prop firm, or product to our 1.9M+ audience.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Audience Reach */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-400 mb-2">1.7M+</div>
                  <h3 className="text-xl font-bold text-white mb-2">Total Audience Reach</h3>
                  <p className="text-gray-300">Across all platforms</p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-gray-300">YouTube, Instagram, X, Telegram, TikTok coverage</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-gray-300">Data-driven pricing</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-gray-300">Targeted fintech audience</span>
              </div>
            </div>

            {/* Social Media Channels */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Our Social Media Channels</h3>
                <div className="space-y-3">
                  {socialChannels.map((channel) => (
                    <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center mr-3`}>
                          <channel.icon className={`h-4 w-4 ${channel.color}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{channel.name}</p>
                          <p className="text-gray-400 text-sm">{channel.followers}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Follow Us */}
            <Card className="bg-blue-900/20 border-blue-700">
              <CardContent className="p-4">
                <p className="text-center text-blue-300 text-sm">
                  📱 Follow us across all platforms to see our content in action
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to collaborate?</h3>
                <p className="text-gray-300 mb-6">
                  Let&apos;s discuss how we can promote your brand to our engaged trading community.
                </p>

                <Button
                  onClick={handleSubmitProposal}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg mb-6"
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT PARTNERSHIP PROPOSAL"}
                </Button>

                <p className="text-center text-gray-400 text-sm">
                  Custom packages available for long-term partnerships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
