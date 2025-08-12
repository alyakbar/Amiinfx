import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  UserCheck,
  Users2,
  GraduationCap,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import type { NavItem } from '@/components/SidebarNavigation';

export const navigationItems: NavItem[] = [
  { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { name: 'Recommended Broker', icon: TrendingUp, href: '/trade', subtitle: 'Broker partnership' },
  { name: 'Signals', icon: TrendingUp, href: '/signals', subtitle: 'Premium trading signals' },
  { name: 'Course', icon: BookOpen, href: '/course', subtitle: 'Strategy Blueprint' },
  { name: 'One on One', icon: Users, href: '/coaching', subtitle: 'Personal coaching' },
  { name: 'Account Management', icon: UserCheck, href: '/account-management', subtitle: 'Let Amiin manage your trades' },
  { name: 'Collaborations', icon: Users2, href: '/collaborations', subtitle: 'Brand partnerships' },
  { name: 'Academy', icon: GraduationCap, href: '/academy', subtitle: 'In-person training' },
  { name: 'Booking', icon: Calendar, href: '/booking', subtitle: 'Schedule sessions' },
  { name: 'Enquiry', icon: HelpCircle, href: '/enquiry', subtitle: 'Get in touch' },
];
