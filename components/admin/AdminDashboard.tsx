'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, Eye, EyeOff,
  ArrowUp, ArrowDown, CreditCard, Zap,
  Target, Wallet, Filter, Download, MoreVertical
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  user: string;
  email: string;
  phone: string;
  course: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface StatsData {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalCourses: number;
  userGrowth: number;
  revenueGrowth: number;
  conversionRate: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  prefix?: string;
  suffix?: string;
}

type MonthlyRevenuePoint = {
  month?: string;
  name?: string;
  revenue: number;
  profit?: number;
  subscriptions?: number;
};

type UserGrowthPoint = {
  month?: string;
  time?: string;
  users: number;
  newUsers?: number;
};

const AdminDashboard = () => {
  const [showRevenue, setShowRevenue] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenuePoint[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [recentTransactionsLive, setRecentTransactionsLive] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Map API shapes to chart-friendly shapes
  const revenueData = monthlyRevenue.length ? monthlyRevenue.map(m => ({
    name: m.month || m.name || '',
    revenue: m.revenue || 0,
    profit: m.profit || 0
  })) : [{ name: 'Jan', revenue: 0, profit: 0 }];

  const coursePerformance = [
    { name: 'Trading Signals', value: 35, color: '#3B82F6' },
    { name: 'Forex Mastery', value: 28, color: '#10B981' },
    { name: 'Crypto Trading', value: 22, color: '#F59E0B' },
    { name: 'Risk Management', value: 15, color: '#EF4444' }
  ];

  const userActivity = userGrowth.length ? userGrowth.map(u => ({
    time: u.time || u.month || '',
    active: u.users || 0
  })) : [
    { time: 'Jan', active: 0 }
  ];

  const recentTransactions: Transaction[] = recentTransactionsLive.length ? recentTransactionsLive : [];

  // Fetch admin statistics from server APIs
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [usersRes, revenueRes] = await Promise.all([
          fetch('/api/admin/user-statistics').then(r => r.json()),
          fetch('/api/admin/revenue-statistics').then(r => r.json()),
        ]);

        if (!mounted) return;

        if (usersRes?.success) {
          const s: StatsData = {
            totalUsers: usersRes.statistics.totalUsers || 0,
            totalRevenue: revenueRes?.statistics?.totalRevenue || 0,
            activeSubscriptions: 0,
            totalCourses: 0,
            userGrowth: usersRes.statistics.growthPercentage || 0,
            revenueGrowth: revenueRes?.statistics?.revenueGrowthPercentage || 0,
            conversionRate: 0,
          };
          setStats(s);
          setUserGrowth(usersRes.userGrowth || []);
        }

        if (revenueRes?.success) {
          setMonthlyRevenue(revenueRes.monthlyRevenue || []);
          // Accept server-provided recent transactions; cast to Transaction[] for client use
          setRecentTransactionsLive((revenueRes.recentTransactions || []) as Transaction[]);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, gradient, prefix = '', suffix = '' }: StatCardProps) => (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <CardContent className="p-6 min-h-[120px] flex flex-col justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-slate-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mt-4 self-end`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return variants[status] || variants.pending;
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mpesa': return <Wallet className="h-4 w-4" />;
      case 'crypto': return <Zap className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) return <div className="p-6 text-slate-300">Loading dashboard…</div>;

  return (
  <div className="space-y-6 ml-72">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          change={stats?.userGrowth ?? 0}
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Revenue"
          value={showRevenue ? (stats?.totalRevenue ?? 0) : '••••••'}
          change={stats?.revenueGrowth ?? 0}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          prefix="$"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          change={8.7}
          icon={Target}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Conversion Rate"
          value={stats?.conversionRate ?? 0}
          change={2.4}
          icon={TrendingUp}
          gradient="from-orange-500 to-red-500"
          suffix="%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Revenue Analytics</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Monthly revenue and profit trends</p>
            </div>
            <button
              onClick={() => setShowRevenue(!showRevenue)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              {showRevenue ? <Eye className="h-4 w-4 text-slate-400" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
            </button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#revenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#profit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Course Performance</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Revenue distribution by course</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={coursePerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {coursePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">User Activity</CardTitle>
          <p className="text-sm text-slate-400 mt-1">Active users throughout the day</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="active" fill="url(#userGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Latest payment activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-slate-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Transaction ID</TableHead>
                  <TableHead className="text-slate-300">Customer</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell className="font-mono text-blue-400">{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getPaymentTypeIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-white">{transaction.user}</p>
                          <p className="text-sm text-slate-400">{transaction.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{transaction.course}</TableCell>
                    <TableCell className="font-medium text-green-400">${transaction.amount}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadge(transaction.status)} border`}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;