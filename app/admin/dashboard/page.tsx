
import AdminDashboard from '@/components/admin/AdminDashboard';
import '@/styles/admin.css'; // Import admin-specific styles
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Course Trading Platform',
  description: 'Comprehensive admin dashboard for managing courses, users, and revenue analytics',
};

export default function DashboardPage() {
  return <AdminDashboard />;
}