"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  HelpCircle,
  MessageCircle,
  Users2,
  Check,
  ChevronDown,
  Video,
  Instagram,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    { name: "Start Trading", icon: TrendingUp },
    { name: "Signals", icon: TrendingUp },
    { name: "Courses", icon: BookOpen },
    { name: "Mentorship", icon: Users },
    { name: "Academy", icon: GraduationCap },
    { name: "Collaborations", icon: Users2 },
    { name: "Booking", icon: Calendar },
    { name: "Enquiry", icon: HelpCircle },
  ]

  const faqs = [
    {
      question: "WHO IS AMIIN FX?",
      answer:
        "Amiin FX is a leading forex education platform founded by experienced traders who have helped thousands of students achieve financial freedom through proven trading strategies and comprehensive mentorship programs.",
    },
    {
      question: "Do I need experience to join the academy?",
      answer:
        "No experience is required! Our programs are designed for complete beginners. We start with the fundamentals and gradually build your knowledge and skills through structured lessons and hands-on practice.",
    },
    {
      question: "What is the first step to get started?",
      answer:
        "Simply sign up for our free introductory course to get familiar with our teaching style and community. From there, you can choose the learning path that best fits your goals and schedule.",
    },
    {
      question: "What do I need to trade?",
      answer:
        "You'll need a computer or smartphone, internet connection, and a small amount of capital to start (we recommend starting with $100-500 for practice). We'll guide you through setting up your trading platform and broker account.",
    },
    {
      question: "What if I can't trade full-time?",
      answer:
        "That's perfectly fine! Many of our successful students trade part-time. Our strategies are designed to work with various schedules, and we offer flexible learning options including recorded sessions and weekend workshops.",
    },
  ]

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-black tracking-wider text-white">
              Amiin FX
            </Link>

            {/* Right side - Instagram + Get Started + Hamburger */}
            <div className="flex items-center space-x-4">
              {/* Instagram Follow Button */}
              <a
                href="https://www.instagram.com/amiin__fx/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <Instagram className="h-4 w-4" />
                <span className="text-sm font-medium">115K</span>
              </a>

              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-full px-6">
                  Get Started
                </Button>
              </Link>
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-white hover:text-blue-400 transition-colors p-2"
                title="Open menu"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gray-900 border-l border-gray-700 transform transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Close menu"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-6 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href="/signup"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <item.icon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                <span className="text-white group-hover:text-blue-300 font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Instagram in Drawer */}
          <div className="px-6 mb-4">
            <a
              href="https://www.instagram.com/amiin__fx/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 rounded-full transition-all duration-300 w-full"
              onClick={() => setDrawerOpen(false)}
            >
              <Instagram className="h-5 w-5" />
              <span className="font-medium">Follow Amiin FX on Instagram</span>
            </a>
          </div>

          {/* Drawer Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
            <Link href="/signup" onClick={() => setDrawerOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-full">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 hero-section-bg"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider mb-6">
            Start Your <span className="text-blue-400">Trading Journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join a movement of new traders mastering signals, mentorship, and strategy — all from one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-4 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://www.instagram.com/amiin__fx/"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Instagram className="h-5 w-5" />
              <span className="font-medium">Follow on Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Amiin FX Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Profile Image */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25">
                  <div className="w-72 h-72 bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-6xl font-black text-blue-400">AF</div>
                  </div>
                </div>
                {/* Floating Instagram Badge */}
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 shadow-lg">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-wider text-white mb-6">
                  About <span className="text-blue-400">Amiin FX</span>
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                  <p>
                    Amiin FX is a seasoned forex trader, mentor, and public speaker. He is the{" "}
                    <span className="text-blue-400 font-semibold">Founder and CEO of Elite Trading Hub</span>, an
                    educational and mentorship platform that helps individuals build wealth through smart financial
                    systems and forex trading.
                  </p>
                  <p>
                    With a growing community and results-driven programs, Amiin is known for turning everyday traders
                    into high-performing professionals. His approach combines technical expertise with practical
                    mentorship, creating a pathway for sustainable trading success.
                  </p>
                </div>
              </div>

              {/* Social Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">115K+</div>
                  <div className="text-gray-400 text-sm">Instagram Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">1000+</div>
                  <div className="text-gray-400 text-sm">Students Mentored</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">5+</div>
                  <div className="text-gray-400 text-sm">Years Experience</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="https://www.instagram.com/amiin__fx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Follow on Instagram
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Building Wealth Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Animated Neural Network */}
            <div className="flex justify-center lg:justify-start order-1 lg:order-1">
              <div className="relative w-[400px] h-[400px] max-w-full">
                {/* Neural Network Animation Container */}
                <div className="neural-network-container w-full h-full relative overflow-hidden rounded-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
                  {/* Central Node */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 rounded-full animate-pulse-slow shadow-lg shadow-blue-500/50">
                    <div className="absolute inset-2 bg-blue-400 rounded-full animate-ping"></div>
                  </div>

                  {/* Orbiting Nodes */}
                  <div className="orbit-1 absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-500"></div>
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-1500"></div>
                  </div>

                  {/* Outer Ring */}
                  <div className="orbit-2 absolute top-1/2 left-1/2 w-80 h-80 transform -translate-x-1/2 -translate-y-1/2 animate-spin-reverse">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-2000"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-3000"></div>
                    <div className="absolute left-4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-2500"></div>
                    <div className="absolute right-4 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-3500"></div>
                    <div className="absolute top-12 right-12 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-4000"></div>
                    <div className="absolute bottom-12 left-12 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-4500"></div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <g className="animate-pulse-lines">
                      <line x1="200" y1="200" x2="200" y2="80" stroke="url(#lineGradient)" strokeWidth="1" />
                      <line x1="200" y1="200" x2="320" y2="200" stroke="url(#lineGradient)" strokeWidth="1" />
                      <line x1="200" y1="200" x2="200" y2="320" stroke="url(#lineGradient)" strokeWidth="1" />
                      <line x1="200" y1="200" x2="80" y2="200" stroke="url(#lineGradient)" strokeWidth="1" />
                      <line x1="200" y1="200" x2="300" y2="100" stroke="url(#lineGradient)" strokeWidth="1" />
                      <line x1="200" y1="200" x2="100" y2="300" stroke="url(#lineGradient)" strokeWidth="1" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="order-2 lg:order-2 space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black tracking-wider text-white">
                  Start Building <span className="text-blue-400">Wealth</span>
                </h2>

                <div className="space-y-4 text-lg leading-relaxed">
                  <p className="text-gray-300">
                    Imagine waking up every morning knowing that your{" "}
                    <span className="text-blue-400 font-semibold">money is working for you</span> while you sleep.
                  </p>
                  <p className="text-gray-300">
                    Picture yourself making <span className="text-blue-400 font-semibold">strategic decisions</span>{" "}
                    that compound into life-changing wealth.
                  </p>
                  <p className="text-gray-300">
                    This isn&apos;t just a dream – it&apos;s your <span className="text-blue-400 font-semibold">new reality</span>{" "}
                    with the right knowledge and guidance.
                  </p>
                </div>
              </div>

              {/* Testimonial Card */}
              <div className="testimonial-card bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 max-w-md ml-auto transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      M
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm italic mb-3 leading-relaxed">
                      &quot;I went from struggling paycheck to paycheck to generating consistent monthly profits. The
                      strategies actually work.&quot;
                    </p>
                    <div>
                      <p className="text-white font-semibold text-sm">Marcus Johnson</p>
                      <p className="text-blue-400 text-xs">6-Figure Trader</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* You Have Two Choices Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-4 text-white">
              You Have <span className="text-blue-400">Two Choices</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The path you choose today will determine your financial future tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Traditional Path Card */}
            <Card className="bg-red-900/10 border-red-700/50 border-2 hover:border-red-600 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-wider text-red-400 mb-2">Traditional Path</h3>
                  <p className="text-gray-400 italic">The &apos;safe&apos; route everyone talks about</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">40+ years of daily 9–5 grind</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Limited salary growth potential</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Financial stress and uncertainty</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Retirement may not be enough</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">No control over your time</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-red-300 italic font-semibold">&quot;Work for 40 years, hope for a decent retirement&quot;</p>
                </div>
              </CardContent>
            </Card>

            {/* Forex Trading Path Card */}
            <Card className="bg-blue-900/10 border-blue-700/50 border-2 hover:border-blue-600 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-wider text-blue-400 mb-2">Forex Trading Path</h3>
                  <p className="text-gray-400 italic">The entrepreneurial route to freedom</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Learn profitable trading strategies</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Generate income from anywhere</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Build multiple income streams</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Unlimited earning potential</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-300">Join successful trading community</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-blue-300 italic font-semibold">&quot;Master trading skills, create lasting wealth&quot;</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Which Path Will You Choose?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              The decision you make today will determine your financial future. Stop settling for average and start
              building the life you deserve.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Choose Financial Freedom
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Your Roadmap to Financial Freedom Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-4 text-white">
              Your Roadmap to <span className="text-blue-400">Financial Freedom</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Follow our proven step-by-step system to transform your financial future
            </p>
          </div>

          {/* Roadmap Steps */}
          <div className="relative">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-center space-x-8 mb-16">
              {/* START */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
                  START
                </div>
                <p className="text-gray-300 font-medium">Your Journey</p>
              </div>

              <ArrowRight className="h-6 w-6 text-blue-400" />

              {/* STEP 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  1
                </div>
                <p className="text-gray-300 font-medium">Sign Up For Free</p>
              </div>

              <ArrowRight className="h-6 w-6 text-blue-400" />

              {/* STEP 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  2
                </div>
                <p className="text-gray-300 font-medium">Choose Your Pathway</p>
              </div>

              <ArrowRight className="h-6 w-6 text-blue-400" />

              {/* STEP 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  3
                </div>
                <p className="text-gray-300 font-medium">Subscribe to Plan</p>
              </div>

              <ArrowRight className="h-6 w-6 text-blue-400" />

              {/* STEP 4 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  4
                </div>
                <p className="text-gray-300 font-medium">Access Community</p>
              </div>

              <ArrowRight className="h-6 w-6 text-blue-400" />

              {/* STEP 5 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-green-500/25">
                  5
                </div>
                <p className="text-gray-300 font-medium">Start Earning</p>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-8 mb-16">
              {[
                { step: "START", label: "Your Journey", color: "blue" },
                { step: "1", label: "Sign Up For Free", color: "blue" },
                { step: "2", label: "Choose Your Pathway", color: "blue" },
                { step: "3", label: "Subscribe to Plan", color: "blue" },
                { step: "4", label: "Access Community", color: "blue" },
                { step: "5", label: "Start Earning", color: "green" },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${
                      item.color === "green" ? "from-green-600 to-green-800" : "from-blue-600 to-blue-800"
                    } rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      item.color === "green" ? "shadow-green-500/25" : "shadow-blue-500/25"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">{item.label}</p>
                  </div>
                  {index < 5 && <ArrowRight className="h-4 w-4 text-blue-400 rotate-90 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to start your journey to financial freedom?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders who have already transformed their lives with our proven system.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Build Your Business Right from Your Browser Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-4 text-white">
              Build Your Business Right from Your <span className="text-blue-400">Browser</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Everything you need to start, grow, and scale your trading business is accessible from any device with an
              internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Card 1: Online Masterclass */}
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-wider text-white mb-2">Online Masterclass</h3>
                <p className="text-gray-400 mb-4">Learn the exact trading systems used by Amiin FX</p>
                <div className="text-3xl font-bold text-blue-400 mb-6">$250</div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Live online sessions</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Interactive Q&A</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Recorded access</span>
                  </div>
                </div>
                <Link href="/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full">Enroll Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: In-Person Masterclass */}
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-wider text-white mb-2">In-Person Masterclass</h3>
                <p className="text-gray-400 mb-4">Learn the exact trading systems used by Amiin FX</p>
                <div className="text-3xl font-bold text-blue-400 mb-6">$500</div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Hands-on training</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Direct mentorship</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Networking opportunities</span>
                  </div>
                </div>
                <Link href="/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full">Apply Now</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 3: Session Booking */}
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-wider text-white mb-2">Session Booking</h3>
                <p className="text-gray-400 mb-4">
                  Flexible 1-hour sessions for strategy tuning, live chart reviews, or Q&A
                </p>
                <div className="text-3xl font-bold text-blue-400 mb-6">$50/hour</div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Flexible scheduling</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Live chart analysis</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300 text-sm">Personalized guidance</span>
                  </div>
                </div>
                <Link href="/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full">Book Now</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Footer CTA */}
          <div className="text-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-12 py-4 rounded-full hover:shadow-lg transition-all duration-300 w-full md:w-auto"
              >
                Start Building Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Still Wondering If Forex Trading Is For You? Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-4 text-white">
              Still Wondering If <span className="text-blue-400">Forex Trading</span> Is For You?
            </h2>
            <p className="text-xl text-gray-300">
              Find answers to common questions about forex trading and how to get started
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-800 transition-colors rounded-lg"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-white text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-blue-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <Card className="bg-gray-900 border-gray-700 inline-block">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-4">Still have questions?</h3>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Contact Us
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo & Description */}
            <div>
              <div className="text-2xl font-black tracking-wider text-white mb-4">Amiin FX</div>
              <p className="text-gray-400 mb-4">
                Empowering traders worldwide to achieve financial freedom through education, mentorship, and proven
                strategies.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/amiin__fx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/signup" className="block text-gray-400 hover:text-blue-400 transition-colors">
                  Get Started
                </Link>
                <Link href="/signup" className="block text-gray-400 hover:text-blue-400 transition-colors">
                  Trading Signals
                </Link>
                <Link href="/signup" className="block text-gray-400 hover:text-blue-400 transition-colors">
                  Courses
                </Link>
                <Link href="/signup" className="block text-gray-400 hover:text-blue-400 transition-colors">
                  Mentorship
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">Get Started</h3>
              <p className="text-gray-400 mb-4">Ready to begin your trading journey?</p>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-full">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500">© 2024 Amiin FX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
