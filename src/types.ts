/**
 * EuroDorbar Multi-Vendor Marketplace Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  storeName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  logo: string;
  banner: string;
  description: string;
  termsAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  categories: string[];
  followersCount: number;
  rating: number;
  reviewsCount: number;
  contactEmail: string;
  contactPhone: string;
  policies: {
    shipping: string;
    returns: string;
  };
}

export interface ProductVariant {
  name: string; // e.g. "Color" or "Size"
  options: string[]; // e.g. ["Red", "Blue"]
}

export interface Product {
  id: string;
  sellerId: string;
  storeName: string;
  title: string;
  category: string;
  brand: string;
  sku: string;
  description: string;
  specifications: { key: string; value: string }[];
  images: string[];
  videoUrl?: string;
  price: number;
  discount: number; // percentage (e.g. 15 for 15%)
  stock: number;
  minOrder: number;
  weight: number; // in kg
  shippingCost: number;
  shippingTime: string; // e.g. "7-15 days"
  variants: ProductVariant[];
  colors: string[];
  sizes: string[];
  tags: string[];
  status: 'draft' | 'active';
  createdAt: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
}

export interface CartItem {
  productId: string;
  sellerId: string;
  storeName: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  shippingCost: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface StoreCartGroup {
  sellerId: string;
  storeName: string;
  shippingCost: number;
  items: CartItem[];
  appliedCoupon?: Coupon;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  color?: string;
  size?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  reported?: boolean;
}

export interface Coupon {
  id: string;
  sellerId: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percentage value or flat rate discount
  minSpend: number;
  expiryDate: string;
  maxUses?: number;
  usesCount: number;
  isFirstOrder?: boolean;
}

export interface Notification {
  id: string;
  recipientId: string; // user id or seller id
  title: string;
  message: string;
  type: 'order' | 'system' | 'message' | 'review' | 'low_stock';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  chatId: string; // "buyerId_sellerId"
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatThread {
  chatId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  storeName: string;
  storeLogo: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productTitle: string;
  change: number; // e.g. -5, +20
  reason: string; // e.g. "Order #123", "Restock"
  createdAt: string;
}

export interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface StoreCartGroup {
  sellerId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  appliedCoupon?: Coupon;
}
