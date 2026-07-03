// EuroDorbar Admin Panel Persistent Storage Database
// Simulates fully active Firestore Collections using LocalStorage

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null; // For nested categories
  icon: string; // lucide icon name
  image: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface AdminPayment {
  id: string;
  orderId: string;
  buyerName: string;
  amount: number;
  gateway: 'stripe' | 'paypal' | 'visa' | 'mastercard' | 'apple_pay' | 'google_pay' | 'cod';
  status: 'success' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  transactionRef: string;
}

export interface AdminRefund {
  id: string;
  orderId: string;
  storeName: string;
  buyerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  disputeNotes?: string;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  subject: string;
  category: 'payment' | 'shipping' | 'seller_dispute' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'processing' | 'closed';
  messages: {
    sender: 'user' | 'admin';
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface WebsiteSettings {
  name: string;
  logo: string;
  favicon: string;
  themeColor: string; // hex
  currency: string; // "EUR", "USD", etc.
  language: string; // "en", "it", etc.
  timeZone: string;
  taxRate: number; // percent
  maintenanceMode: boolean;
  metaTitle: string;
  metaDescription: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  emailTemplateWelcome: string;
  emailTemplateOrderPaid: string;
}

export interface AdminAuditLog {
  id: string;
  adminUser: string;
  action: string;
  module: string;
  ipAddress: string;
  device: string;
  createdAt: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: {
    id: string;
    name: string;
    rate: number;
    deliveryTime: string;
    company: string;
  }[];
}

export interface HelpCenterArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
}

// Initial Seeds
const SEED_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat_electronics',
    name: 'Consumer Electronics',
    slug: 'consumer-electronics',
    parentId: null,
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=300&q=80',
    metaTitle: 'Buy Latest Consumer Electronics Online | EuroDorbar',
    metaDescription: 'Shop smartwatches, ANC wireless earbuds, RGB mechanical keyboards, and supercharged fast chargers.',
    keywords: 'electronics, smartwatch, keyboard, earbuds'
  },
  {
    id: 'cat_smartwear',
    name: 'Smart Wearables',
    slug: 'smart-wearables',
    parentId: 'cat_electronics',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=300&q=80',
    metaTitle: 'Smart Wearables - Fitness Trackers & Smartwatches',
    metaDescription: 'Discover the best fitness trackers and high-resolution AMOLED smartwatches in Malta.',
    keywords: 'smartwatch, fitness, tracker'
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    parentId: null,
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
    metaTitle: 'Premium Fashion & Designer Sunglasses',
    metaDescription: 'Mediterranean summer aviators, top-grain sheepskin biker jackets, and athletic running sneakers.',
    keywords: 'fashion, jacket, sneakers, sunglasses'
  },
  {
    id: 'cat_home',
    name: 'Home & Garden',
    slug: 'home-garden',
    parentId: null,
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
    metaTitle: 'Smart Home Automation, Lighting & Barista Kitchen',
    metaDescription: 'Furnish with LED sound-synced strip lights and smart automated Italian espresso coffee makers.',
    keywords: 'espresso, smart home, LED, lights'
  }
];

const SEED_PAYMENTS: AdminPayment[] = [
  {
    id: 'pay_1',
    orderId: 'MM-29402',
    buyerName: 'Sarah Borg',
    amount: 74.23,
    gateway: 'stripe',
    status: 'success',
    createdAt: '2026-03-01T10:15:00Z',
    transactionRef: 'ch_stripe_90823480a8'
  },
  {
    id: 'pay_2',
    orderId: 'MM-28312',
    buyerName: 'Sarah Borg',
    amount: 80.00,
    gateway: 'visa',
    status: 'success',
    createdAt: '2026-02-18T14:30:00Z',
    transactionRef: 'ch_visa_77189028aa'
  },
  {
    id: 'pay_3',
    orderId: 'MM-21045',
    buyerName: 'Christian Muscat',
    amount: 40.50,
    gateway: 'apple_pay',
    status: 'success',
    createdAt: '2026-02-28T09:12:00Z',
    transactionRef: 'ch_aplay_11028394bc'
  },
  {
    id: 'pay_4',
    orderId: 'MM-11928',
    buyerName: 'David Grech',
    amount: 149.90,
    gateway: 'paypal',
    status: 'failed',
    createdAt: '2026-03-02T19:00:00Z',
    transactionRef: 'ch_paypal_err_39023'
  }
];

const SEED_REFUNDS: AdminRefund[] = [
  {
    id: 'ref_1',
    orderId: 'MM-28312',
    storeName: 'Aura Fashion',
    buyerName: 'Sarah Borg',
    amount: 39.00,
    reason: 'Buyer received incorrect shoe size. Requesting a quick cash-back refund or size exchange.',
    status: 'pending',
    createdAt: '2026-03-02T11:00:00Z'
  },
  {
    id: 'ref_2',
    orderId: 'MM-21045',
    storeName: 'MaltaTech Store',
    buyerName: 'Christian Muscat',
    amount: 40.50,
    reason: 'Defective sound drivers on delivery. Earbuds would not power on.',
    status: 'approved',
    createdAt: '2026-03-01T14:00:00Z',
    disputeNotes: 'Refunded back to Apple Pay account ref: ch_aplay_11028394bc. Completed compliance verification.'
  }
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_102',
    userEmail: 'buyer@eurodorbar.com',
    subject: 'Double charged during Stripe checkout',
    category: 'payment',
    priority: 'high',
    status: 'open',
    messages: [
      { sender: 'user', text: 'I tried to buy the smart watch and it said network error, so I checked out again. Now my bank statement shows two pending debits of €74.23!', createdAt: '2026-03-02T08:00:00Z' },
      { sender: 'admin', text: 'Hello Sarah, we will inspect the Stripe transaction history for order MM-29402 and reverse any duplicates right away.', createdAt: '2026-03-02T09:15:00Z' }
    ],
    createdAt: '2026-03-02T08:00:00Z'
  },
  {
    id: 'tkt_101',
    userEmail: 'fashion@eurodorbar.com',
    subject: 'Inquiry regarding shipping rates to Gozo',
    category: 'shipping',
    priority: 'low',
    status: 'closed',
    messages: [
      { sender: 'user', text: 'Does MaltaPost flat rates apply to Gozo for lightweight packages under 1kg?', createdAt: '2026-02-28T10:00:00Z' },
      { sender: 'admin', text: 'Yes Elena! MaltaPost flat rates apply equally for both Malta and Gozo addresses.', createdAt: '2026-02-28T11:30:00Z' }
    ],
    createdAt: '2026-02-28T10:00:00Z'
  }
];

const SEED_SETTINGS: WebsiteSettings = {
  name: 'EuroDorbar',
  logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
  favicon: '🇪🇺',
  themeColor: '#f97316', // Orange-500
  currency: 'EUR',
  language: 'en',
  timeZone: 'Europe/Malta (CET)',
  taxRate: 18, // Malta standard VAT
  maintenanceMode: false,
  metaTitle: 'EuroDorbar | Multi-Vendor Global E-Commerce Center',
  metaDescription: 'The ultimate global multi-vendor marketplace connecting international retailers with consumers with high quality logistics.',
  socialLinks: {
    facebook: 'https://facebook.com/eurodorbar',
    instagram: 'https://instagram.com/eurodorbar',
    twitter: 'https://twitter.com/eurodorbar'
  },
  emailTemplateWelcome: 'Dear {{name}},\nWelcome to EuroDorbar! Your digital gateway is now active.\nSincerely,\nTeam EuroDorbar',
  emailTemplateOrderPaid: 'Hi {{name}},\nThank you for your business! Order {{orderId}} of €{{amount}} has been paid successfully.\nSincerely,\nEuroDorbar Administration'
};

const SEED_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'zone_malta_local',
    name: 'Malta Domestic (Local)',
    countries: ['Malta', 'Gozo'],
    methods: [
      { id: 'meth_std', name: 'Standard MaltaPost', rate: 2.50, deliveryTime: '2-4 days', company: 'MaltaPost' },
      { id: 'meth_exp', name: 'Express Courier Van', rate: 7.00, deliveryTime: '1-2 days', company: 'MM Express Logistics' }
    ]
  },
  {
    id: 'zone_eu_intl',
    name: 'European Union (Zone A)',
    countries: ['Italy', 'Germany', 'France', 'Spain', 'Greece'],
    methods: [
      { id: 'meth_intl_std', name: 'DHL Standard Packet', rate: 12.00, deliveryTime: '7-12 days', company: 'DHL Express' },
      { id: 'meth_intl_air', name: 'FedEx Priority Air', rate: 24.50, deliveryTime: '3-5 days', company: 'FedEx' }
    ]
  }
];

const SEED_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_ad_1',
    adminUser: 'Marketplace Admin',
    action: 'Approved Store Application "Aura Fashion"',
    module: 'Sellers',
    ipAddress: '194.154.21.90',
    device: 'Chrome on macOS (Valletta)',
    createdAt: '2026-07-03T05:30:00Z'
  },
  {
    id: 'log_ad_2',
    adminUser: 'Marketplace Admin',
    action: 'Updated Website Currency Settings to EUR',
    module: 'Settings',
    ipAddress: '194.154.21.90',
    device: 'Chrome on macOS (Valletta)',
    createdAt: '2026-07-03T04:15:00Z'
  },
  {
    id: 'log_ad_3',
    adminUser: 'Marketplace Admin',
    action: 'Banned reported feedback comment on smart watch',
    module: 'Reviews',
    ipAddress: '83.211.90.15',
    device: 'Safari on iPhone (Sliema)',
    createdAt: '2026-07-02T22:10:00Z'
  }
];

const SEED_HELP_ARTICLES: HelpCenterArticle[] = [
  { id: 'faq_1', title: 'How does escrow payments keep me safe?', category: 'Buyers', content: 'Funds are held in escrow by EuroDorbar until the seller ships the item and the carrier tracking displays "Delivered". Only then does the seller receive the funds, protecting you from fraud.' },
  { id: 'faq_2', title: 'Registering as a Merchant on EuroDorbar', category: 'Sellers', content: 'Navigate to "Sell with us" on the top bar, enter your commercial VAT registry details, and upload store logos. Approvals are reviewed by our support team within 12 business hours.' }
];

const SEED_BLOGS: BlogArticle[] = [
  { id: 'blog_1', title: 'Why Multi-Vendor Commerce is thriving in Sliema & Birkirkara', excerpt: 'How Maltese physical retail storefronts are digitizing with custom automated systems.', content: 'Full analysis of high-street conversion rates in local suburbs...', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', author: 'Paul Pace', createdAt: '2026-06-20' }
];

export class AdminDatabase {
  private getStorageItem<T>(key: string, fallback: T): T {
    const data = localStorage.getItem(`mm_admin_${key}`);
    if (!data) {
      this.setStorageItem(key, fallback);
      return fallback;
    }
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    localStorage.setItem(`mm_admin_${key}`, JSON.stringify(value));
  }

  constructor() {
    this.init();
  }

  public init() {
    if (!localStorage.getItem('mm_admin_categories')) {
      this.setStorageItem('categories', SEED_CATEGORIES);
    }
    if (!localStorage.getItem('mm_admin_payments')) {
      this.setStorageItem('payments', SEED_PAYMENTS);
    }
    if (!localStorage.getItem('mm_admin_refunds')) {
      this.setStorageItem('refunds', SEED_REFUNDS);
    }
    if (!localStorage.getItem('mm_admin_tickets')) {
      this.setStorageItem('tickets', SEED_TICKETS);
    }
    if (!localStorage.getItem('mm_admin_settings')) {
      this.setStorageItem('settings', SEED_SETTINGS);
    }
    if (!localStorage.getItem('mm_admin_shipping_zones')) {
      this.setStorageItem('shipping_zones', SEED_SHIPPING_ZONES);
    }
    if (!localStorage.getItem('mm_admin_audit_logs')) {
      this.setStorageItem('audit_logs', SEED_AUDIT_LOGS);
    }
    if (!localStorage.getItem('mm_admin_help_articles')) {
      this.setStorageItem('help_articles', SEED_HELP_ARTICLES);
    }
    if (!localStorage.getItem('mm_admin_blogs')) {
      this.setStorageItem('blogs', SEED_BLOGS);
    }
    if (!localStorage.getItem('mm_admin_banners')) {
      this.setStorageItem('banners', [
        { id: 'slide_1', title: 'Summer Tech Deals', type: 'slider', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80', link: 'category/electronics' },
        { id: 'slide_2', title: 'Luxury Mediterranean Sunwear', type: 'slider', image: 'https://images.unsplash.com/photo-1441984969893-c534e9749007?auto=format&fit=crop&w=1200&q=80', link: 'category/fashion' }
      ]);
    }
  }

  // Categories
  public getCategories(): AdminCategory[] { return this.getStorageItem<AdminCategory[]>('categories', SEED_CATEGORIES); }
  public setCategories(categories: AdminCategory[]): void { this.setStorageItem('categories', categories); }

  // Payments
  public getPayments(): AdminPayment[] { return this.getStorageItem<AdminPayment[]>('payments', SEED_PAYMENTS); }
  public setPayments(payments: AdminPayment[]): void { this.setStorageItem('payments', payments); }

  // Refunds
  public getRefunds(): AdminRefund[] { return this.getStorageItem<AdminRefund[]>('refunds', SEED_REFUNDS); }
  public setRefunds(refunds: AdminRefund[]): void { this.setStorageItem('refunds', refunds); }

  // Support Tickets
  public getTickets(): SupportTicket[] { return this.getStorageItem<SupportTicket[]>('tickets', SEED_TICKETS); }
  public setTickets(tickets: SupportTicket[]): void { this.setStorageItem('tickets', tickets); }

  // Website Settings
  public getSettings(): WebsiteSettings { return this.getStorageItem<WebsiteSettings>('settings', SEED_SETTINGS); }
  public setSettings(settings: WebsiteSettings): void { this.setStorageItem('settings', settings); }

  // Shipping
  public getShippingZones(): ShippingZone[] { return this.getStorageItem<ShippingZone[]>('shipping_zones', SEED_SHIPPING_ZONES); }
  public setShippingZones(zones: ShippingZone[]): void { this.setStorageItem('shipping_zones', zones); }

  // Audit Logs
  public getAuditLogs(): AdminAuditLog[] { return this.getStorageItem<AdminAuditLog[]>('audit_logs', SEED_AUDIT_LOGS); }
  public setAuditLogs(logs: AdminAuditLog[]): void { this.setStorageItem('audit_logs', logs); }

  // Help articles & FAQ
  public getHelpArticles(): HelpCenterArticle[] { return this.getStorageItem<HelpCenterArticle[]>('help_articles', SEED_HELP_ARTICLES); }
  public setHelpArticles(articles: HelpCenterArticle[]): void { this.setStorageItem('help_articles', articles); }

  // Blogs
  public getBlogs(): BlogArticle[] { return this.getStorageItem<BlogArticle[]>('blogs', SEED_BLOGS); }
  public setBlogs(blogs: BlogArticle[]): void { this.setStorageItem('blogs', blogs); }

  // Banners
  public getBanners(): any[] { return this.getStorageItem<any[]>('banners', []); }
  public setBanners(banners: any[]): void { this.setStorageItem('banners', banners); }

  // Add Log Helper
  public logAction(adminUser: string, action: string, module: string) {
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      id: `log_ad_${Date.now()}`,
      adminUser,
      action,
      module,
      ipAddress: '194.154.21.90', // Valletta compliance proxy IP
      device: 'Chrome v124 on Linux (Admin console)',
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.setAuditLogs(logs);
  }
}

export const adminDb = new AdminDatabase();
