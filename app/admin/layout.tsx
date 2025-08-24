"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, Users, BookOpen, DollarSign, Settings, LogOut, Menu, X, Shield,
  BarChart3, CreditCard, TrendingUp, Database
} from 'lucide-react';
import NotificationBell from '@/components/admin/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isDashboard = pathname === '/admin' || pathname === '/admin/dashboard';

  const navigationItems = [
    { href: '/admin/dashboard', icon: Activity, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { href: '/admin/users', icon: Users, label: 'Users', color: 'from-purple-500 to-pink-500' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses', color: 'from-green-500 to-emerald-500' },
    { href: '/admin/transactions', icon: CreditCard, label: 'Transactions', color: 'from-orange-500 to-red-500' },
    { href: '/admin/revenue', icon: TrendingUp, label: 'Revenue', color: 'from-yellow-500 to-orange-500' },
    { href: '/admin/otp-management', icon: Shield, label: 'OTP Management', color: 'from-indigo-500 to-purple-500' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
  ];

  return (
    <div className="admin-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-r border-slate-700/50 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AmiinFX Admin
                </h2>
                <p className="text-xs text-slate-400">Management Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors" 
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-4 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`group flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 relative overflow-hidden border ${
                  active 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-2xl border-white/20 transform scale-105` 
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white border-transparent hover:border-slate-600/50 hover:scale-102'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl" />
                )}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                )}
                <Icon className={`h-5 w-5 z-10 ${active ? 'text-white drop-shadow-sm' : 'group-hover:scale-110 transition-transform'}`} />
                <span className={`font-medium z-10 ${active ? 'drop-shadow-sm' : ''}`}>{item.label}</span>
                {active && (
                  <div className="absolute right-3 w-2 h-2 bg-white rounded-full z-10 drop-shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 mb-4 border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-green-400">All systems operational</p>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200 border border-red-500/20">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="w-full min-h-screen ml-0 lg:ml-72 relative">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 lg:left-72 bg-slate-800/80 backdrop-blur-xl shadow-xl border-b border-slate-700/50 px-6 py-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors" 
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-400">Manage your trading platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
