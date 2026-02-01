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
    label: 'All Properties',
    link: '/properties',
    roles: ['OWNER', 'ADMIN'],
    icon: MapPin,
  },
  {
    label: 'Add Property',
    link: '/properties/add',
    roles: ['OWNER', 'ADMIN'],
    icon: Building2,
  },
  {
    label: 'Units',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'All Units',
    link: '/units',
    icon: Key,
    roles: ['OWNER', 'ADMIN'],
  },
  // {
  //   label: 'TENANCY',
  //   isTitle: true,
  //   roles: ['OWNER', 'ADMIN'],
  // },
  // {
  //   label: 'Tenants',
  //   icon: Users,
  //   roles: ['OWNER', 'ADMIN'],
  //   link: '/tenants',
  // },
  {
    label: 'FINANCE',
    isTitle: true,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Payments',
    icon: DollarSign,
    roles: ['OWNER', 'ADMIN'],
    link: '/finance/payments',
  },
  {
    label: 'Invoices',
    icon: FileText,
    roles: ['OWNER', 'ADMIN'],
    link: '/finance/invoices',
  },
  {
    label: 'Receipts',
    link: '/finance/receipts',
    icon: DollarSign,
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Arrears',
    icon: AlertCircle,
    roles: ['OWNER', 'ADMIN'],
    link: '/finance/arrears',
  },

  {
    label: 'MARKETING',
    isTitle: true,
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
    link: '/system/users',
  },
  // {
  //   label: 'Settings',
  //   icon: Settings,
  //   roles: ['OWNER', 'ADMIN'],
  //   subItems: [
  //     {
  //       label: 'Company Profile',
  //       link: '/system/settings/profile',
  //       roles: ['OWNER', 'ADMIN'],
  //     },
  //     {
  //       label: 'Payment Settings',
  //       link: '/system/settings/payment',
  //       roles: ['OWNER', 'ADMIN'],
  //     },
  //     {
  //       label: 'Notifications',
  //       link: '/system/settings/notifications',
  //       roles: ['OWNER', 'ADMIN'],
  //     },
  //     {
  //       label: 'Audit Logs',
  //       link: '/system/settings/audit',
  //       roles: ['OWNER', 'ADMIN'],
  //     },
  //     {
  //       label: 'API Keys',
  //       link: '/system/settings/api',
  //       roles: ['OWNER', 'ADMIN'],
  //     },
  //   ],
  // },
];

// Caretaker Menu
// const CARETAKER_MENU: MenuItem[] = [
//   {
//     label: 'CORE',
//     isTitle: true,
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Dashboard',
//     icon: Home,
//     link: '/caretaker/dashboard',
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'PROPERTY OPS',
//     isTitle: true,
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Assigned Properties',
//     icon: Building2,
//     link: '/caretaker/properties',
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Units',
//     icon: MapPin,
//     roles: ['CARETAKER'],
//     subItems: [
//       {
//         label: 'Unit Status',
//         link: '/caretaker/units/status',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Move-ins / Move-outs',
//         link: '/caretaker/units/movements',
//         roles: ['CARETAKER'],
//       },
//     ],
//   },
//   {
//     label: 'TENANTS',
//     isTitle: true,
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Tenants',
//     icon: Users,
//     roles: ['CARETAKER'],
//     subItems: [
//       {
//         label: 'Current Occupants',
//         link: '/caretaker/tenants/current',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Contact Information',
//         link: '/caretaker/tenants/contacts',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Lease End Dates',
//         link: '/caretaker/tenants/lease-dates',
//         roles: ['CARETAKER'],
//       },
//     ],
//   },
//   {
//     label: 'MAINTENANCE',
//     isTitle: true,
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Issues & Tickets',
//     icon: Wrench,
//     roles: ['CARETAKER'],
//     subItems: [
//       {
//         label: 'Assigned Issues',
//         link: '/caretaker/maintenance/assigned',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Update Status',
//         link: '/caretaker/maintenance/update',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Add Notes',
//         link: '/caretaker/maintenance/notes',
//         roles: ['CARETAKER'],
//       },
//     ],
//   },
//   {
//     label: 'Inspections',
//     icon: CheckCircle2,
//     roles: ['CARETAKER'],
//     subItems: [
//       {
//         label: 'Schedule Inspections',
//         link: '/caretaker/inspections/schedule',
//         roles: ['CARETAKER'],
//       },
//       {
//         label: 'Inspection Reports',
//         link: '/caretaker/inspections/reports',
//         roles: ['CARETAKER'],
//       },
//     ],
//   },
//   {
//     label: 'COMMUNICATION',
//     isTitle: true,
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Announcements',
//     icon: Zap,
//     link: '/caretaker/announcements',
//     roles: ['CARETAKER'],
//   },
//   {
//     label: 'Messages',
//     icon: MessageSquare,
//     link: '/caretaker/messages',
//     roles: ['CARETAKER'],
//   },
// ];

// // Tenant Menu
// const TENANT_MENU: MenuItem[] = [
//   {
//     label: 'CORE',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'Dashboard',
//     icon: Home,
//     link: '/tenant/dashboard',
//     roles: ['TENANT'],
//   },
//   {
//     label: 'MY HOME',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'My Unit',
//     icon: MapPin,
//     roles: ['TENANT'],
//     subItems: [
//       {
//         label: 'Unit Details',
//         link: '/tenant/unit/details',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'Lease Agreement',
//         link: '/tenant/unit/lease',
//         roles: ['TENANT'],
//       },
//     ],
//   },
//   {
//     label: 'PAYMENTS',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'Rent & Invoices',
//     icon: DollarSign,
//     roles: ['TENANT'],
//     subItems: [
//       {
//         label: 'Pay Rent',
//         link: '/tenant/payments/pay',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'Payment History',
//         link: '/tenant/payments/history',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'Invoices & Receipts',
//         link: '/tenant/payments/invoices',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'Balances',
//         link: '/tenant/payments/balances',
//         roles: ['TENANT'],
//       },
//     ],
//   },
//   {
//     label: 'MAINTENANCE',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'Issues',
//     icon: Wrench,
//     roles: ['TENANT'],
//     subItems: [
//       {
//         label: 'Report an Issue',
//         link: '/tenant/maintenance/report',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'My Issues',
//         link: '/tenant/maintenance/my-issues',
//         roles: ['TENANT'],
//       },
//       {
//         label: 'Status Tracking',
//         link: '/tenant/maintenance/tracking',
//         roles: ['TENANT'],
//       },
//     ],
//   },
//   {
//     label: 'ACCOUNT',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'My Profile',
//     icon: Users,
//     link: '/tenant/profile',
//     roles: ['TENANT'],
//   },
//   {
//     label: 'SUPPORT',
//     isTitle: true,
//     roles: ['TENANT'],
//   },
//   {
//     label: 'Help & FAQs',
//     icon: MessageSquare,
//     link: '/tenant/support',
//     roles: ['TENANT'],
//   },
// ];

// // Public User Menu
// const PUBLIC_USER_MENU: MenuItem[] = [
//   {
//     label: 'PUBLIC',
//     isTitle: true,
//     roles: ['USER'],
//   },
//   {
//     label: 'Browse Listings',
//     icon: Building2,
//     link: '/public/listings',
//     roles: ['USER'],
//   },
//   {
//     label: 'ACCOUNT',
//     isTitle: true,
//     roles: ['USER'],
//   },
//   {
//     label: 'My Applications',
//     icon: ClipboardList,
//     link: '/public/applications',
//     roles: ['USER'],
//   },
//   {
//     label: 'Saved Listings',
//     icon: TrendingUp,
//     link: '/public/saved',
//     roles: ['USER'],
//   },
//   {
//     label: 'Profile Settings',
//     icon: Settings,
//     link: '/public/profile',
//     roles: ['USER'],
//   },
// ];

// Export all menu configurations
export const MENU: MenuItem[] = [...ADMIN_MENU];

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
