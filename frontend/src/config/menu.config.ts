import {
  LucideIcon,
  Home,
  Building2,
  Users,
  DollarSign,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Lock,
  AlertCircle,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Image,
  Key,
  Clock,
  MapPin,
  Zap,
} from 'lucide-react';

export interface MenuItem {
  label: string;
  id?: number;
  icon?: LucideIcon;
  link?: string;
  isExternalLink?: boolean;
  expanded?: boolean;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: { variant: string; isDarkText?: boolean; isPill?: boolean; text: string };
  parentId?: number;
  roles?: ('OWNER' | 'CARETAKER' | 'TENANT' | 'USER' | 'ADMIN')[];
}

// Admin/Owner Menu
const ADMIN_MENU: MenuItem[] = [
  {
    label: 'CORE',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Dashboard',
    icon: Home,
    link: '/dashboard',
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'PROPERTIES',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Properties',
    icon: Building2,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'All Properties',
        link: '/properties',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Add Property',
        link: '/properties/add',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Property Settings',
        link: '/properties/settings',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Units',
    icon: MapPin,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'All Units',
        link: '/units',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Unit Pricing',
        link: '/units/pricing',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Availability',
        link: '/units/availability',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'TENANCY',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Tenants',
    icon: Users,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Active Tenants',
        link: '/tenants/active',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Past Tenants',
        link: '/tenants/past',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Lease Agreements',
        link: '/leases',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Applications',
    icon: ClipboardList,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'New Applications',
        link: '/applications/new',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Approvals / Rejections',
        link: '/applications/status',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'FINANCE',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Payments',
    icon: DollarSign,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Rent Payments',
        link: '/finance/payments/rent',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Mpesa Transactions',
        link: '/finance/payments/mpesa',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Payment Reconciliation',
        link: '/finance/payments/reconciliation',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Invoices',
    icon: FileText,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Generated Invoices',
        link: '/finance/invoices',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Receipts',
        link: '/finance/receipts',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Income Reports',
    icon: BarChart3,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Property-wise Income',
        link: '/finance/reports/property',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Monthly / Annual Reports',
        link: '/finance/reports/timeline',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Arrears',
    icon: AlertCircle,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Overdue Tenants',
        link: '/finance/arrears/overdue',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Penalties & Adjustments',
        link: '/finance/arrears/penalties',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'OPERATIONS',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Maintenance',
    icon: Wrench,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Issues & Tickets',
        link: '/maintenance/issues',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Open Issues',
        link: '/maintenance/open',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Resolved Issues',
        link: '/maintenance/resolved',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'SLA Tracking',
        link: '/maintenance/sla',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'MARKETING',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Listings',
    icon: TrendingUp,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Published Units',
        link: '/marketing/listings/published',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Draft Listings',
        link: '/marketing/listings/draft',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'View Analytics',
        link: '/marketing/listings/analytics',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Marketing Plans',
    icon: Briefcase,
    link: '/marketing/subscriptions',
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'SYSTEM',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Users & Access',
    icon: Lock,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Users',
        link: '/system/users',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Owners',
        link: '/system/users/owners',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Caretakers',
        link: '/system/users/caretakers',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Tenants',
        link: '/system/users/tenants',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Roles & Permissions',
        link: '/system/roles',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Assets',
    icon: Image,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Media Library',
        link: '/system/assets/media',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Property Photos',
        link: '/system/assets/photos',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Documents',
        link: '/system/assets/documents',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    roles: ['OWNER', 'ADMIN'],
    subItems: [
      {
        label: 'Company Profile',
        link: '/system/settings/profile',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Payment Settings',
        link: '/system/settings/payment',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Notifications',
        link: '/system/settings/notifications',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'Audit Logs',
        link: '/system/settings/audit',
        roles: ['OWNER', 'ADMIN'],
      },
      {
        label: 'API Keys',
        link: '/system/settings/api',
        roles: ['OWNER', 'ADMIN'],
      },
    ],
  },
];

// Caretaker Menu
const CARETAKER_MENU: MenuItem[] = [
  {
    label: 'CORE',
    isTitle: true,
    roles: ['CARETAKER'],
  },
  {
    label: 'Dashboard',
    icon: Home,
    link: '/caretaker/dashboard',
    roles: ['CARETAKER'],
  },
  {
    label: 'PROPERTY OPS',
    isTitle: true,
    roles: ['CARETAKER'],
  },
  {
    label: 'Assigned Properties',
    icon: Building2,
    link: '/caretaker/properties',
    roles: ['CARETAKER'],
  },
  {
    label: 'Units',
    icon: MapPin,
    roles: ['CARETAKER'],
    subItems: [
      {
        label: 'Unit Status',
        link: '/caretaker/units/status',
        roles: ['CARETAKER'],
      },
      {
        label: 'Move-ins / Move-outs',
        link: '/caretaker/units/movements',
        roles: ['CARETAKER'],
      },
    ],
  },
  {
    label: 'TENANTS',
    isTitle: true,
    roles: ['CARETAKER'],
  },
  {
    label: 'Tenants',
    icon: Users,
    roles: ['CARETAKER'],
    subItems: [
      {
        label: 'Current Occupants',
        link: '/caretaker/tenants/current',
        roles: ['CARETAKER'],
      },
      {
        label: 'Contact Information',
        link: '/caretaker/tenants/contacts',
        roles: ['CARETAKER'],
      },
      {
        label: 'Lease End Dates',
        link: '/caretaker/tenants/lease-dates',
        roles: ['CARETAKER'],
      },
    ],
  },
  {
    label: 'MAINTENANCE',
    isTitle: true,
    roles: ['CARETAKER'],
  },
  {
    label: 'Issues & Tickets',
    icon: Wrench,
    roles: ['CARETAKER'],
    subItems: [
      {
        label: 'Assigned Issues',
        link: '/caretaker/maintenance/assigned',
        roles: ['CARETAKER'],
      },
      {
        label: 'Update Status',
        link: '/caretaker/maintenance/update',
        roles: ['CARETAKER'],
      },
      {
        label: 'Add Notes',
        link: '/caretaker/maintenance/notes',
        roles: ['CARETAKER'],
      },
    ],
  },
  {
    label: 'Inspections',
    icon: CheckCircle2,
    roles: ['CARETAKER'],
    subItems: [
      {
        label: 'Schedule Inspections',
        link: '/caretaker/inspections/schedule',
        roles: ['CARETAKER'],
      },
      {
        label: 'Inspection Reports',
        link: '/caretaker/inspections/reports',
        roles: ['CARETAKER'],
      },
    ],
  },
  {
    label: 'COMMUNICATION',
    isTitle: true,
    roles: ['CARETAKER'],
  },
  {
    label: 'Announcements',
    icon: Zap,
    link: '/caretaker/announcements',
    roles: ['CARETAKER'],
  },
  {
    label: 'Messages',
    icon: MessageSquare,
    link: '/caretaker/messages',
    roles: ['CARETAKER'],
  },
];

// Tenant Menu
const TENANT_MENU: MenuItem[] = [
  {
    label: 'CORE',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'Dashboard',
    icon: Home,
    link: '/tenant/dashboard',
    roles: ['TENANT'],
  },
  {
    label: 'MY HOME',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'My Unit',
    icon: MapPin,
    roles: ['TENANT'],
    subItems: [
      {
        label: 'Unit Details',
        link: '/tenant/unit/details',
        roles: ['TENANT'],
      },
      {
        label: 'Lease Agreement',
        link: '/tenant/unit/lease',
        roles: ['TENANT'],
      },
    ],
  },
  {
    label: 'PAYMENTS',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'Rent & Invoices',
    icon: DollarSign,
    roles: ['TENANT'],
    subItems: [
      {
        label: 'Pay Rent',
        link: '/tenant/payments/pay',
        roles: ['TENANT'],
      },
      {
        label: 'Payment History',
        link: '/tenant/payments/history',
        roles: ['TENANT'],
      },
      {
        label: 'Invoices & Receipts',
        link: '/tenant/payments/invoices',
        roles: ['TENANT'],
      },
      {
        label: 'Balances',
        link: '/tenant/payments/balances',
        roles: ['TENANT'],
      },
    ],
  },
  {
    label: 'MAINTENANCE',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'Issues',
    icon: Wrench,
    roles: ['TENANT'],
    subItems: [
      {
        label: 'Report an Issue',
        link: '/tenant/maintenance/report',
        roles: ['TENANT'],
      },
      {
        label: 'My Issues',
        link: '/tenant/maintenance/my-issues',
        roles: ['TENANT'],
      },
      {
        label: 'Status Tracking',
        link: '/tenant/maintenance/tracking',
        roles: ['TENANT'],
      },
    ],
  },
  {
    label: 'ACCOUNT',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'My Profile',
    icon: Users,
    link: '/tenant/profile',
    roles: ['TENANT'],
  },
  {
    label: 'SUPPORT',
    isTitle: true,
    roles: ['TENANT'],
  },
  {
    label: 'Help & FAQs',
    icon: MessageSquare,
    link: '/tenant/support',
    roles: ['TENANT'],
  },
];

// Public User Menu
const PUBLIC_USER_MENU: MenuItem[] = [
  {
    label: 'PUBLIC',
    isTitle: true,
    roles: ['USER'],
  },
  {
    label: 'Browse Listings',
    icon: Building2,
    link: '/public/listings',
    roles: ['USER'],
  },
  {
    label: 'ACCOUNT',
    isTitle: true,
    roles: ['USER'],
  },
  {
    label: 'My Applications',
    icon: ClipboardList,
    link: '/public/applications',
    roles: ['USER'],
  },
  {
    label: 'Saved Listings',
    icon: TrendingUp,
    link: '/public/saved',
    roles: ['USER'],
  },
  {
    label: 'Profile Settings',
    icon: Settings,
    link: '/public/profile',
    roles: ['USER'],
  },
];

// Export all menu configurations
export const MENU: MenuItem[] = [...ADMIN_MENU, ...CARETAKER_MENU, ...TENANT_MENU, ...PUBLIC_USER_MENU];

// Helper function to filter menu by roles
export const getMenuByRole = (roles: string[]): MenuItem[] => {
  console.log({ roles });
  if (!roles || roles.length === 0) {
    return [];
  }

  return MENU.filter((item) => {
    // Title sections without roles show for all
    if (item.isTitle && !item.roles) return true;
    // Title sections with roles only show if user has that role
    if (item.isTitle && item.roles) {
      return item.roles.some((role) => roles.includes(role));
    }
    // Regular items without role restriction show for all
    if (!item.roles) return false;
    // Regular items with role restriction
    return item.roles.some((role) => roles.includes(role));
  })
    .filter((item) => {
      // Remove title sections that have no child items
      if (item.isTitle && item.subItems) {
        const visibleChildren = item.subItems.filter((subItem) => {
          if (!subItem.roles) return true;
          return subItem.roles.some((role) => roles.includes(role));
        });
        return visibleChildren.length > 0;
      }
      return true;
    })
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((subItem) => {
        if (!subItem.roles) return true;
        return subItem.roles.some((role) => roles.includes(role));
      }),
    }));
};
