"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, User, Check } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function CoachingPage() {
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
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-red-400">ONE ON ONE</span> Coaching with Amiin FX
              </h1>
              <p className="text-gray-300 text-lg">
                Personalized mentorship with Amiin FX to accelerate your trading journey.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Testimonials */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-gray-300 italic mb-2">
                        "The one-on-one coaching completely transformed my trading."
                      </p>
                      <p className="text-white font-semibold">Sarah Mitchell</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-gray-300 italic mb-2">
                        "Amiin's personalized approach helped me develop a winning mindset."
                      </p>
                      <p className="text-white font-semibold">Marcus Johnson</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Stories */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-orange-400 text-xl mr-2">⭐</span>
                    <h3 className="text-xl font-bold text-white">100+ Success Stories</h3>
                  </div>
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                      <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                      <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-300">+100 coached traders</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-red-400 mb-2">$2,000</div>
                    <p className="text-gray-400">One-time investment</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Direct access to Amiin FX</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Personalized trading strategy</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Psychology & mindset coaching</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Ongoing support & feedback</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Live trading sessions</span>
                    </div>
                  </div>

                  {/* Checkout Link */}
                  <Link href="/checkout/coaching?price=2000" className="w-full block">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">
                      REGISTER FOR COACHING
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
