"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3, TrendingUp, BookOpen, Users, Users2, GraduationCap, Calendar,
  HelpCircle, Settings, Bell, User, LogOut, Menu, X, UserCheck
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
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
    { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
    { name: "Recommended Broker", icon: TrendingUp, href: "/trade" },
    { name: "Signals", icon: TrendingUp, href: "/signals" },
    { name: "Course", icon: BookOpen, href: "/course" },
    { name: "One on One", icon: Users, href: "/coaching" },
    { name: "Account Management", icon: UserCheck, href: "/account-management" },
    { name: "Collaborations", icon: Users2, href: "/collaborations" },
    { name: "Academy", icon: GraduationCap, href: "/academy" },
    { name: "Booking", icon: Calendar, href: "/booking" },
    { name: "Enquiry", icon: HelpCircle, href: "/enquiry" },
  ]

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold text-blue-400">Amiin FX</Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 mr-3 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                {item.name}
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
            Contact Support
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Navbar */}
        <header className="bg-gray-800 border-b border-gray-700 h-12 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white mr-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-white relative">
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
              <button onClick={handleLogout} className="text-gray-400 hover:text-white">
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          </div>
        </header>

        {/* Page-specific content */}
        <main className="p-4">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
