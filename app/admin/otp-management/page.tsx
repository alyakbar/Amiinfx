'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { 
  RefreshCw, Mail, CheckCircle, Clock, AlertCircle, Search, Filter, Download, 
  TrendingUp, ArrowUp, ArrowDown, Eye, Trash2, Users, Activity
} from 'lucide-react';

interface OTPVerification {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  expiresAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  verifiedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export default function OTPManagementPage() {
  const [otpVerifications, setOTPVerifications] = useState<OTPVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Sample data for charts when no real data is available
  const sampleOtpData = [
    { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', verified: true, 
      expiresAt: { _seconds: Date.now() / 1000 + 3600, _nanoseconds: 0 }, 
      createdAt: { _seconds: Date.now() / 1000 - 1800, _nanoseconds: 0 },
      verifiedAt: { _seconds: Date.now() / 1000 - 900, _nanoseconds: 0 } },
    { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', verified: false, 
      expiresAt: { _seconds: Date.now() / 1000 + 1800, _nanoseconds: 0 }, 
      createdAt: { _seconds: Date.now() / 1000 - 600, _nanoseconds: 0 } },
    { id: '3', email: 'user3@example.com', firstName: 'Mike', lastName: 'Johnson', verified: false, 
      expiresAt: { _seconds: Date.now() / 1000 - 600, _nanoseconds: 0 }, 
      createdAt: { _seconds: Date.now() / 1000 - 3600, _nanoseconds: 0 } },
  ];

  const statusDistribution = [
    { name: 'Verified', value: 65, color: '#10B981', count: 156 },
    { name: 'Pending', value: 25, color: '#F59E0B', count: 60 },
    { name: 'Expired', value: 10, color: '#EF4444', count: 24 }
  ];

  const verificationTrends = [
    { date: '2024-08-19', total: 45, verified: 35, pending: 7, expired: 3 },
    { date: '2024-08-20', total: 52, verified: 41, pending: 8, expired: 3 },
    { date: '2024-08-21', total: 38, verified: 30, pending: 6, expired: 2 },
    { date: '2024-08-22', total: 61, verified: 48, pending: 9, expired: 4 },
    { date: '2024-08-23', total: 43, verified: 34, pending: 7, expired: 2 }
  ];

  const hourlyActivity = [
    { hour: '00:00', count: 5 }, { hour: '03:00', count: 2 }, { hour: '06:00', count: 8 },
    { hour: '09:00', count: 25 }, { hour: '12:00', count: 35 }, { hour: '15:00', count: 28 },
    { hour: '18:00', count: 22 }, { hour: '21:00', count: 15 }
  ];

  const fetchOTPVerifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/debug-otp');
      const result = await response.json();
      
      if (result.success) {
        setOTPVerifications(result.otpVerifications || sampleOtpData);
        toast({
          title: "OTP Verifications loaded",
          description: `Found ${result.count || sampleOtpData.length} OTP verification records.`,
        });
      } else {
        // Use sample data if API fails
        setOTPVerifications(sampleOtpData);
        toast({
          title: "Using sample data",
          description: "Could not fetch live OTP data, showing sample data.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching OTP verifications:', error);
      setOTPVerifications(sampleOtpData);
      toast({
        title: "Using sample data",
        description: "Failed to fetch OTP verifications. Showing sample data.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (verification: OTPVerification) => {
    const now = new Date();
    const expiresAt = new Date(verification.expiresAt._seconds * 1000);
    
    if (verification.verified) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>;
    } else if (now > expiresAt) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        Expired
      </Badge>;
    } else {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>;
    }
  };

  const formatDate = (timestamp: { _seconds: number }) => {
    try {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getTimeRemaining = (verification: OTPVerification) => {
    if (verification.verified) return 'Verified';
    
    const now = new Date();
    const expiresAt = new Date(verification.expiresAt._seconds * 1000);
    
    if (now > expiresAt) return 'Expired';
    
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffMins}m ${diffSecs}s`;
  };

  const filteredVerifications = otpVerifications.filter(verification => {
    const matchesSearch = 
      verification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${verification.firstName} ${verification.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const expiresAt = new Date(verification.expiresAt._seconds * 1000);
    let status = 'pending';
    
    if (verification.verified) status = 'verified';
    else if (now > expiresAt) status = 'expired';
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: otpVerifications.length,
    verified: otpVerifications.filter(v => v.verified).length,
    pending: otpVerifications.filter(v => {
      const now = new Date();
      const expiresAt = new Date(v.expiresAt._seconds * 1000);
      return !v.verified && now <= expiresAt;
    }).length,
    expired: otpVerifications.filter(v => {
      const now = new Date();
      const expiresAt = new Date(v.expiresAt._seconds * 1000);
      return !v.verified && now > expiresAt;
    }).length
  };

  const StatCard = ({ title, value, change, icon: Icon, gradient, subtitle }) => (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
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
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchOTPVerifications();
    
    const interval = setInterval(() => {
      if (otpVerifications.length > 0) {
        setOTPVerifications(prev => [...prev]); // Force re-render to update time remaining
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
  <div className="space-y-6 ml-72">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            OTP Verification Management
          </h1>
          <p className="text-slate-400 mt-1">Monitor and manage email OTP verifications for user registration</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={fetchOTPVerifications} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total OTPs"
          value={stats.total}
          change={8.5}
          icon={Mail}
          gradient="from-blue-500 to-cyan-500"
          subtitle="All time"
        />
        <StatCard
          title="Verified"
          value={stats.verified}
          change={12.3}
          icon={CheckCircle}
          gradient="from-green-500 to-emerald-500"
          subtitle={`${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% success rate`}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          change={-5.2}
          icon={Clock}
          gradient="from-yellow-500 to-orange-500"
          subtitle="Awaiting verification"
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          change={-15.8}
          icon={AlertCircle}
          gradient="from-red-500 to-pink-500"
          subtitle="Requires resend"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Status Distribution</CardTitle>
            <CardDescription className="text-slate-400">OTP verification status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
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
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-slate-400 text-sm">{status.name}</span>
                  </div>
                  <span className="text-white font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Trends */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Verification Trends</CardTitle>
            <CardDescription className="text-slate-400">Daily OTP verification activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={verificationTrends}>
                <defs>
                  <linearGradient id="verified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="verified" stroke="#10B981" fillOpacity={1} fill="url(#verified)" strokeWidth={2} />
                <Area type="monotone" dataKey="pending" stroke="#F59E0B" fillOpacity={1} fill="url(#pending)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Hourly Activity</CardTitle>
          <CardDescription className="text-slate-400">OTP verification requests by hour</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="count" fill="url(#activityGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* OTP Verifications Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              OTP Verifications
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage and monitor OTP verification requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-slate-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search by email or name..."
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
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">User</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Email</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Created</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Expires/Verified</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Time Remaining</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading OTP verifications...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVerifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-12">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-lg">No OTP verifications found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVerifications.map((verification) => (
                    <TableRow key={verification.id} className="border-slate-700 hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {verification.firstName.charAt(0)}{verification.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {verification.firstName} {verification.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{verification.email}</TableCell>
                      <TableCell>{getStatusBadge(verification)}</TableCell>
                      <TableCell className="text-slate-300">{formatDate(verification.createdAt)}</TableCell>
                      <TableCell className="text-slate-300">
                        {verification.verified && verification.verifiedAt 
                          ? formatDate(verification.verifiedAt)
                          : formatDate(verification.expiresAt)
                        }
                      </TableCell>
                      <TableCell className="text-slate-300">{getTimeRemaining(verification)}</TableCell>
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
                            <Trash2 className="h-4 w-4 text-red-400" />
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
