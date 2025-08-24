'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, DocumentData, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  CreditCard, Search, Filter, Download, Eye, TrendingUp,
  DollarSign, Activity, Clock, CheckCircle, XCircle, AlertCircle,
  Calendar, ArrowUp, ArrowDown, MoreVertical, Wallet, Zap, Smartphone,
  Target, RefreshCw
} from 'lucide-react';
import { Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  reference: string;
  type: 'card' | 'mpesa' | 'crypto' | 'bank';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  courseName?: string;
  createdAt: string; // ISO string
  paidAt?: string;
  gateway: string;
  fees?: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, 'transactions'));
      const items: Transaction[] = qs.docs.map(d => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          reference: data.reference || d.id,
          type: (data.type as Transaction['type']) || 'card',
          status: (data.status as Transaction['status']) || 'completed',
          amount: Number(data.amount || 0),
          currency: data.currency || 'USD',
          customerName: data.customerName || data.name || 'Unknown',
          customerEmail: data.customerEmail || data.email || '',
          customerPhone: data.customerPhone || data.phone,
          courseName: data.courseName,
          createdAt: data.createdAt || data.paidAt || new Date().toISOString(),
          paidAt: data.paidAt,
          gateway: data.gateway || data.paymentGateway || 'Unknown',
          fees: data.fees ? Number(data.fees) : undefined
        } as Transaction;
      });
      // sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(items);
    } catch (err) {
      // keep console for debugging
      // eslint-disable-next-line no-console
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (id: string, status: Transaction['status']) => {
    if (!id) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'transactions', id), { status });
      // refresh
      await fetchTransactions();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update transaction', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'transactions', id));
      await fetchTransactions();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete transaction', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived stats
  const transactionStats = React.useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((s, t) => s + (t.amount || 0), 0);
    const completedCount = transactions.filter(t => t.status === 'completed').length;
    const successRate = totalTransactions ? (completedCount / totalTransactions) * 100 : 0;
    const avgTransactionValue = totalTransactions ? totalRevenue / totalTransactions : 0;

    const today = new Date();
    const todayTransactions = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d.toDateString() === today.toDateString();
    }).length;
    const todayRevenue = transactions.filter(t => new Date(t.createdAt).toDateString() === today.toDateString())
      .reduce((s, t) => s + (t.amount || 0), 0);

    return {
      totalTransactions,
      totalRevenue,
      successRate: Number(successRate.toFixed(1)),
      avgTransactionValue: Number(avgTransactionValue.toFixed(2)),
      todayTransactions,
      todayRevenue
    };
  }, [transactions]);

  // Filters
  const filteredTransactions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return transactions.filter(transaction => {
      const matchesSearch =
        !q ||
        transaction.reference.toLowerCase().includes(q) ||
        transaction.customerName.toLowerCase().includes(q) ||
        transaction.customerEmail.toLowerCase().includes(q) ||
        (transaction.courseName && transaction.courseName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  // Small helpers for badges/icons
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return variants[status] || variants.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      case 'refunded': return <RefreshCw className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4 text-blue-400" />;
      case 'mpesa': return <Smartphone className="h-4 w-4 text-green-400" />;
      case 'crypto': return <Zap className="h-4 w-4 text-orange-400" />;
      case 'bank': return <Wallet className="h-4 w-4 text-purple-400" />;
      default: return <CreditCard className="h-4 w-4 text-slate-400" />;
    }
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
            {prefix}{typeof value === 'number' ? (value as number).toLocaleString() : value}{suffix}
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
              <span className="text-sm text-slate-400 ml-1">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mt-4 self-end`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );

  // Chart data derivations
  const transactionTrends = React.useMemo(() => {
    // build daily completed/failed counts for the last N days depending on selectedPeriod
    const days = selectedPeriod === '24h' ? 1 : selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const arr: { date: string; completed: number; failed: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString();
      const completed = transactions.filter(t => {
        const dt = new Date(t.createdAt);
        return dt.toDateString() === d.toDateString() && t.status === 'completed';
      }).length;
      const failed = transactions.filter(t => {
        const dt = new Date(t.createdAt);
        return dt.toDateString() === d.toDateString() && t.status === 'failed';
      }).length;
      arr.push({ date: label, completed, failed });
    }
    return arr;
  }, [transactions, selectedPeriod]);

  const paymentMethods = React.useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      const name = t.type === 'card' ? 'Credit Card' : t.type === 'mpesa' ? 'M-Pesa' : t.type === 'crypto' ? 'Crypto' : 'Bank Transfer';
      counts[name] = (counts[name] || 0) + 1;
    });
    const palette = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    return Object.keys(counts).map((key, i) => ({ name: key, value: counts[key], color: palette[i % palette.length] }));
  }, [transactions]);

  const revenueData = React.useMemo(() => {
    // hourly revenue for the most recent 24 hours
    const hours = Array.from({ length: 24 }).map((_, i) => {
      const hour = i;
      const timeLabel = `${hour}:00`;
      const revenue = transactions.filter(t => new Date(t.createdAt).getHours() === hour)
        .reduce((s, t) => s + (t.amount || 0), 0);
      return { time: timeLabel, revenue };
    });
    return hours;
  }, [transactions]);

  return (
    <div className="space-y-6 ml-72">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-slate-400 mt-1">Monitor and manage all payment transactions</p>
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
          title="Total Transactions"
          value={transactionStats.totalTransactions}
          change={12.5}
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Revenue"
          value={transactionStats.totalRevenue}
          change={18.2}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          prefix="$"
        />
        <StatCard
          title="Success Rate"
          value={transactionStats.successRate}
          change={2.1}
          icon={Target}
          gradient="from-purple-500 to-pink-500"
          suffix="%"
        />
        <StatCard
          title="Avg. Value"
          value={transactionStats.avgTransactionValue}
          change={-1.2}
          icon={TrendingUp}
          gradient="from-orange-500 to-red-500"
          prefix="$"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trends */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Transaction Trends</CardTitle>
            <CardDescription className="text-slate-400">Success vs failure rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionTrends}>
                <defs>
                  <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="failed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="url(#completed)" strokeWidth={2} />
                <Area type="monotone" dataKey="failed" stackId="2" stroke="#EF4444" fill="url(#failed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription className="text-slate-400">Distribution of payment types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
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
            <div className="flex justify-center space-x-6 mt-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 ${
                      method.name === 'Credit Card' ? 'bg-blue-500' :
                      method.name === 'PayPal' ? 'bg-indigo-500' :
                      method.name === 'Bank Transfer' ? 'bg-green-500' :
                      method.name === 'Crypto' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-slate-400 text-sm">{method.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Revenue Over Time</CardTitle>
          <CardDescription className="text-slate-400">Hourly revenue distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
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
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest payment activities and transaction details
            </CardDescription>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">Transaction</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Customer</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Course</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-lg">No transactions found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-slate-700 hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getPaymentTypeIcon(transaction.type)}
                          <div>
                            <div className="font-medium text-white">{transaction.reference}</div>
                            <div className="text-sm text-slate-400">{transaction.gateway}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{transaction.customerName}</div>
                          <div className="text-sm text-slate-400">{transaction.customerEmail}</div>
                          {transaction.customerPhone && (
                            <div className="text-sm text-slate-400">{transaction.customerPhone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {transaction.courseName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-400">
                          ${transaction.amount.toFixed(2)} {transaction.currency}
                        </div>
                        {transaction.fees && (
                          <div className="text-sm text-slate-400">
                            Fee: ${transaction.fees.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(transaction.status)} border flex items-center w-fit`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-400">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4 text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                          >
                            <Download className="h-4 w-4 text-green-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                            onClick={() => handleUpdateTransaction(transaction.id, transaction.status === 'completed' ? 'pending' : 'completed')}
                          >
                            {transaction.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-yellow-400" />}
                          </Button>
                        </div>
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
