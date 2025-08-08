"use client"

import { useEffect, useState } from "react"
import styles from "./page.module.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  Users2,
  GraduationCap,
  Calendar,
  HelpCircle,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Video,
  UserCheck,
} from "lucide-react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { user, loading, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !user) {
      router.push("/login")
    }
  }, [user, initialized, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigationItems = [
    { name: "Dashboard", icon: BarChart3, href: "/dashboard", active: true },
    { name: "Recommended Broker", icon: TrendingUp, href: "/trade", subtitle: "Broker partnership" },
    { name: "Signals", icon: TrendingUp, href: "/signals", subtitle: "Premium trading signals" },
    { name: "Course", icon: BookOpen, href: "/course", subtitle: "Strategy Blueprint" },
    { name: "One on One", icon: Users, href: "/coaching", subtitle: "Personal coaching" },
    {
      name: "Account Management",
      icon: UserCheck,
      href: "/account-management",
      subtitle: "Let Amiin manage your trades",
    },
    { name: "Resources", icon: BookOpen, href: "/resources", badge: "NEW", subtitle: "Learning materials" },
    { name: "Collaborations", icon: Users2, href: "/collaborations", subtitle: "Brand partnerships" },
    { name: "Academy", icon: GraduationCap, href: "/academy", subtitle: "In-person training" },
    { name: "Booking", icon: Calendar, href: "/booking", subtitle: "Schedule sessions" },
    { name: "Enquiry", icon: HelpCircle, href: "/enquiry", subtitle: "Get in touch" },
  ]

  const dashboardCards = [
    // First Row
    {
      title: "Recommended Broker",
      subtitle: "Broker partnership",
      icon: TrendingUp,
      color: "bg-red-500/20 text-red-400",
      iconBg: "bg-red-500",
      href: "/trade",
    },
    {
      title: "Signals",
      subtitle: "Premium trading signals - From $100",
      icon: TrendingUp,
      color: "bg-green-500/20 text-green-400",
      iconBg: "bg-green-500",
      href: "/signals",
    },
    {
      title: "Online Masterclass",
      subtitle: "Learn exact trading systems - $250",
      icon: Video,
      color: "bg-blue-500/20 text-blue-400",
      iconBg: "bg-blue-500",
      href: "/academy",
    },
    {
      title: "In-Person Masterclass",
      subtitle: "Direct mentorship - $500",
      icon: GraduationCap,
      color: "bg-purple-500/20 text-purple-400",
      iconBg: "bg-purple-500",
      href: "/academy",
    },
    // Second Row
    {
      title: "One on One Coaching",
      subtitle: "Personalized mentorship - $2,000",
      icon: Users,
      color: "bg-orange-500/20 text-orange-400",
      iconBg: "bg-orange-500",
      href: "/coaching",
    },
    {
      title: "Account Management",
      subtitle: "Let Amiin FX manage your trades",
      icon: UserCheck,
      color: "bg-cyan-500/20 text-cyan-400",
      iconBg: "bg-cyan-500",
      href: "/account-management",
    },
    {
      title: "Session Booking",
      subtitle: "Flexible 1-hour sessions - $50/hour",
      icon: Calendar,
      color: "bg-pink-500/20 text-pink-400",
      iconBg: "bg-pink-500",
      href: "/booking",
    },
    {
      title: "Courses",
      subtitle: "Complete course - $199",
      icon: BookOpen,
      color: "bg-teal-500/20 text-teal-400",
      iconBg: "bg-teal-500",
      href: "/course",
    },
  ]

  // Show loading while Firebase initializes
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold text-blue-400">
            Amiin FX
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white" title="Close sidebar">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="flex-1">{item.name}</span>
              {item.badge && <Badge className="bg-red-500 text-white text-xs px-2 py-1">{item.badge}</Badge>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Need Help?</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">Contact Support</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 h-12 flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white mr-2" title="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-7 min-w-[70px] flex items-center">
              <Badge className="bg-red-500 text-white text-xs mr-1 px-1 py-0.5">NEW</Badge>
              Forecast
            </Button>
            <button className="text-gray-400 hover:text-white" title="Settings">
              <Settings className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-white relative" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center">
                1
              </span>
            </button>
            <div className="flex items-center space-x-1">
              <div className="text-right">
                <p className="text-xs font-medium">{user.displayName || "User"}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Log out">
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="px-2 sm:px-4 pt-3 pb-6 max-w-full overflow-x-hidden">
          {/* Welcome Card */}
          <Card className="bg-gray-800 border-gray-700 mb-2 mx-auto max-w-[360px] sm:mb-4 sm:max-w-[400px] shadow-none">
            <CardContent className="p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-bold mb-0 flex items-center justify-center">
                Welcome back, {user.displayName?.split(" ")[0] || "User"}!<span className="ml-2">👋</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm text-center mt-1">
                Here's your complete navigation hub. Click any card to access that section.
              </p>
            </CardContent>
          </Card>

          {/* Responsive Card Grid */}
          <div
            className={`${styles.dashboardGrid} w-full mx-auto mb-3 sm:mb-6 px-0 justify-items-center`}
          >
            {dashboardCards.map((card) => (
              <Link key={card.title} href={card.href} className="w-full flex justify-center">
                <Card
                  className={`
                    ${styles.dashboardCard}
                    bg-[#1E1E2F]
                    border-none
                    shadow-md
                    hover:shadow-lg
                    transition-all
                    duration-200
                    cursor-pointer
                    group
                    h-[130px]
                    sm:h-[150px]
                    w-full
                    max-w-[170px]
                    rounded-xl
                    flex flex-col items-center justify-center
                    p-3
                    hover:ring-2 hover:ring-blue-500/40
                    active:ring-2 active:ring-blue-600/60
                  `}
                >
                  <CardContent className="p-0 flex flex-col items-center justify-center w-full h-full">
                    <div
                      className={`${styles.dashboardCardIcon} w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200 shadow`}
                    >
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className={`${styles.dashboardCardTitle} text-[16px] font-bold text-white mb-1 leading-tight text-center w-full truncate`}>
                      {card.title}
                    </h3>
                    <p className={`${styles.dashboardCardSubtitle} text-[13px] text-gray-400 leading-snug text-center w-full line-clamp-2`}>
                      {card.subtitle}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional Info */}
          <div className="max-w-[400px] mx-auto p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg shadow-inner">
            <h3 className="text-sm font-semibold text-blue-400 mb-1 text-center">Welcome to Amiin FX Dashboard!</h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed text-center">
              Your complete trading education and mentorship platform. Navigate through different sections using the
              cards above or the sidebar menu. Each section is designed to help you on your journey to becoming a
              profitable trader.
            </p>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
