'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, TrendingUp, ArrowUp, ArrowDown, RefreshCw, Download, Calendar,
  CreditCard, Target, Activity
} from 'lucide-react';

interface RevenueItem {
  id: string;
  date: string;
  source: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  type: 'course' | 'subscription' | 'coaching' | 'refund';
  customer: string;
  paymentMethod: string;
}

export default function RevenuePage() {
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<RevenueItem>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Firestore CRUD
  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'revenue'));
      const items: RevenueItem[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueItem));
      setRevenueItems(items);
      toast({ title: 'Revenue data loaded', description: `Found ${items.length} revenue items.` });
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast({ title: 'Error', description: 'Failed to fetch revenue data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createRevenue = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'revenue'), form);
      toast({ title: 'Created', description: 'Revenue item added.' });
      setForm({});
      fetchRevenue();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create item.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateRevenue = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'revenue', editingId), form);
      toast({ title: 'Updated', description: 'Revenue item updated.' });
      setForm({});
      setEditingId(null);
      fetchRevenue();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteRevenue = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'revenue', id));
      toast({ title: 'Deleted', description: 'Revenue item deleted.' });
      fetchRevenue();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // derive chart data from revenueItems
  const monthLabels = (() => {
    const labels: string[] = [];
    const dt = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(dt.getFullYear(), dt.getMonth() - i, 1);
      labels.push(d.toLocaleString('default', { month: 'short' }));
    }
    return labels;
  })();

  const revenueData = monthLabels.map((label, idx) => {
    const dt = new Date();
    const monthIndex = dt.getMonth() - (7 - idx);
    const year = dt.getFullYear() + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12;
    const total = revenueItems.reduce((sum, item) => {
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return sum;
      if (d.getFullYear() === year && d.getMonth() === month) return sum + item.amount;
      return sum;
    }, 0);
    const target = Math.round(total * 1.05) || 0;
    return { month: label, revenue: total, target };
  });

  const typeTotals = revenueItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.amount;
    return acc;
  }, {});

  const revenueBySource = [
    { name: 'Courses', value: typeTotals['course'] || 0, color: '#3B82F6', amount: typeTotals['course'] || 0 },
    { name: 'Subscriptions', value: typeTotals['subscription'] || 0, color: '#10B981', amount: typeTotals['subscription'] || 0 },
    { name: 'Coaching', value: typeTotals['coaching'] || 0, color: '#F59E0B', amount: typeTotals['coaching'] || 0 },
    { name: 'Refunds', value: typeTotals['refund'] || 0, color: '#EF4444', amount: typeTotals['refund'] || 0 }
  ].map(entry => ({ ...entry, value: entry.amount }));

  const last7Days = (() => {
    const arr: { date: string; amount: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const amt = revenueItems.reduce((sum, item) => {
        const it = new Date(item.date);
        if (isNaN(it.getTime())) return sum;
        if (it.toISOString().split('T')[0] === key) return sum + item.amount;
        return sum;
      }, 0);
      arr.push({ date: key, amount: amt });
    }
    return arr;
  })();

  const dailyRevenue = last7Days;

  // ...existing code...

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      refunded: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return variants[status as keyof typeof variants] || variants.completed;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      course: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      subscription: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      coaching: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      refund: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return variants[type as keyof typeof variants] || variants.course;
  };

  const stats = {
    totalRevenue: revenueItems.reduce((sum, item) => sum + (item.status !== 'refunded' ? item.amount : 0), 0),
    pendingRevenue: revenueItems.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0),
    completedTransactions: revenueItems.filter(item => item.status === 'completed').length,
    averageOrderValue: revenueItems.length > 0 ? 
      revenueItems.reduce((sum, item) => sum + item.amount, 0) / revenueItems.length : 0
  };

  interface StatCardProps {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    prefix?: string;
    suffix?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, gradient, prefix = '', suffix = '' }) => (
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

  useEffect(() => {
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
  <div className="space-y-6 ml-72">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Revenue Analytics
          </h1>
          <p className="text-slate-400 mt-1">Track and analyze your revenue streams and financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={fetchRevenue} 
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={15.2}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          prefix="$"
        />
        <StatCard
          title="Pending Revenue"
          value={stats.pendingRevenue}
          change={-5.1}
          icon={Target}
          gradient="from-yellow-500 to-orange-500"
          prefix="$"
        />
        <StatCard
          title="Completed Transactions"
          value={stats.completedTransactions}
          change={8.7}
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Average Order Value"
          value={Math.round(stats.averageOrderValue)}
          change={12.3}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
          prefix="$"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-slate-400">Revenue vs targets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="target" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#revenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="target" stroke="#3B82F6" fillOpacity={1} fill="url(#target)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Source */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Source</CardTitle>
            <CardDescription className="text-slate-400">Distribution of revenue streams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueBySource.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {revenueBySource.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        source.name === 'Courses' ? 'bg-blue-500' :
                        source.name === 'Subscriptions' ? 'bg-green-500' :
                        source.name === 'Coaching' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-slate-400 text-sm">{source.name}</span>
                  </div>
                  <span className="text-white font-medium">${source.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Daily Revenue</CardTitle>
          <CardDescription className="text-slate-400">Revenue breakdown by day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="amount" fill="url(#dailyGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue CRUD Form */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle className="text-white">{editingId ? 'Edit Revenue' : 'Add Revenue'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => {e.preventDefault(); if (editingId) { updateRevenue(); } else { createRevenue(); }}}>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Date</span>
              <input className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" type="date" title="Date" value={form.date || ''} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Source</span>
              <input className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" type="text" title="Source" placeholder="Source" value={form.source || ''} onChange={e => setForm(f => ({...f, source: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Amount</span>
              <input className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" type="number" title="Amount" placeholder="Amount" value={form.amount || ''} onChange={e => setForm(f => ({...f, amount: Number(e.target.value)}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Customer</span>
              <input className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" type="text" title="Customer" placeholder="Customer" value={form.customer || ''} onChange={e => setForm(f => ({...f, customer: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Payment Method</span>
              <input className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" type="text" title="Payment Method" placeholder="Payment Method" value={form.paymentMethod || ''} onChange={e => setForm(f => ({...f, paymentMethod: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Status</span>
              <select className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" title="Status" value={form.status || ''} onChange={e => setForm(f => ({...f, status: e.target.value as RevenueItem['status']}))} required>
                <option value="">Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm">Type</span>
              <select className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" title="Type" value={form.type || ''} onChange={e => setForm(f => ({...f, type: e.target.value as RevenueItem['type']}))} required>
                <option value="">Type</option>
                <option value="course">Course</option>
                <option value="subscription">Subscription</option>
                <option value="coaching">Coaching</option>
                <option value="refund">Refund</option>
              </select>
            </label>
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={loading} className="bg-green-600 text-white">{editingId ? 'Update' : 'Create'}</Button>
              {editingId && <Button type="button" onClick={() => {setEditingId(null); setForm({});}} className="bg-slate-700 text-white">Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Revenue Items Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Revenue Transactions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Recent revenue transactions and their details
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Source</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Customer</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Type</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Payment Method</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <span className="ml-2">Loading revenue data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : revenueItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-lg">No revenue data found</p>
                      <p className="text-sm">Revenue transactions will appear here</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  revenueItems.map((item) => (
                    <TableRow key={item.id} className="border-slate-700 hover:bg-slate-800/30 transition-colors">
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">{item.source}</TableCell>
                      <TableCell className="text-slate-300">{item.customer}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(item.type)}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {item.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        ${item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-700" onClick={() => {setEditingId(item.id); setForm(item);}}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-700 text-red-400" onClick={() => deleteRevenue(item.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
