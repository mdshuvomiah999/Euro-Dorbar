import React, { useState } from 'react';
import { db } from '../../utils/db';
import { adminDb } from '../../utils/adminDb';
import { 
  DollarSign, ShoppingBag, Users, Store, FolderTree, Tag, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Compass, Flame, Award
} from 'lucide-react';

interface DashboardPanelProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function DashboardPanel({ onNavigate }: DashboardPanelProps) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredTrafficIdx, setHoveredTrafficIdx] = useState<number | null>(null);

  // Fetch real-time data for Overview Cards
  const orders = db.getOrders();
  const products = db.getProducts();
  const sellers = db.getSellers();
  const users = db.getUsers();
  const categories = adminDb.getCategories();
  const coupons = db.getCoupons();
  const refunds = adminDb.getRefunds();

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'paid' || o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const totalCustomers = users.filter(u => u.role === 'buyer').length;
  const activeCustomers = totalCustomers; // All seeded buyers active

  const totalSellers = sellers.length;
  const pendingSellers = sellers.filter(s => s.status === 'pending').length;

  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const totalCategories = categories.length;
  const couponsUsed = coupons.reduce((sum, c) => sum + c.usesCount, 0);
  const pendingRefunds = refunds.filter(r => r.status === 'pending').length;

  // Fake static revenue distributions for visual aesthetic
  const dailyRevenue = [
    { day: 'Mon', revenue: 420, orders: 4 },
    { day: 'Tue', revenue: 680, orders: 7 },
    { day: 'Wed', revenue: 510, orders: 5 },
    { day: 'Thu', revenue: 990, orders: 11 },
    { day: 'Fri', revenue: 1250, orders: 15 },
    { day: 'Sat', revenue: 840, orders: 9 },
    { day: 'Sun', revenue: 1150, orders: 12 },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 18200 },
    { month: 'Feb', revenue: 22400 },
    { month: 'Mar', revenue: 28900 },
    { month: 'Apr', revenue: 24100 },
    { month: 'May', revenue: 35000 },
    { month: 'Jun', revenue: 42100 },
  ];

  const trafficSources = [
    { source: 'Direct Search', value: 45, color: '#f97316' },
    { source: 'Google organic', value: 25, color: '#3b82f6' },
    { source: 'Facebook Ads', value: 18, color: '#10b981' },
    { source: 'TikTok Shop Referral', value: 12, color: '#8b5cf6' }
  ];

  // Top products from real sales count
  const topProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4);

  // Top categories from products assignment
  const topCategories = categories.map(cat => {
    const count = products.filter(p => p.category === cat.name).length;
    return { name: cat.name, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Overview Section */}
      <div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-orange-500" /> Platform Financials & Volumes
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Revenue */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Total Revenue</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">€{totalRevenue.toFixed(2)}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.2% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Total Orders</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{orders.length}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <span className="text-amber-500">{pendingOrders} Pending</span>
                <span>•</span>
                <span className="text-green-500">{completedOrders} Deliv</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Buyers</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalCustomers}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{activeCustomers} Active currently</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Sellers */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Registered Sellers</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalSellers}</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                <span>{pendingSellers} Pending approval</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Micro Status Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">Out Of Stock</span>
          <p className="text-lg font-black mt-1 text-rose-600">{outOfStockProducts}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Low Stock</span>
          <p className="text-lg font-black mt-1 text-amber-500">{lowStockProducts}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
          <p className="text-lg font-black mt-1 text-slate-800 dark:text-white">{totalCategories}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Coupons Used</span>
          <p className="text-lg font-black mt-1 text-indigo-500">{couponsUsed}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Refund Requests</span>
          <p className="text-lg font-black mt-1 text-rose-500">{pendingRefunds}</p>
        </div>
      </div>

      {/* 3. Interactive Analytical Charts - Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* L1: Line Chart (Revenue by Day) - span 8 */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[360px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Revenue Analysis by Day</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Maltese Island Sales Activity</p>
            </div>
            <span className="text-xs font-black bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High: €1,250
            </span>
          </div>

          {/* Pure SVG Line Chart */}
          <div className="relative mt-6 flex-1 flex items-end">
            <svg viewBox="0 0 500 150" className="w-full h-44 overflow-visible">
              {/* Grids */}
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800/60" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800/60" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" className="dark:stroke-slate-800/60" />

              {/* Area path gradient */}
              <path
                d="M 10 150 L 10 100 L 90 70 L 170 90 L 250 40 L 330 10 L 410 50 L 490 20 L 490 150 Z"
                fill="url(#orange-grad)"
                opacity="0.12"
              />

              {/* Line path */}
              <path
                d="M 10 100 L 90 70 L 170 90 L 250 40 L 330 10 L 410 50 L 490 20"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Gradients definition */}
              <defs>
                <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Interaction Circles */}
              {dailyRevenue.map((d, idx) => {
                const x = 10 + idx * 80;
                const ys = [100, 70, 90, 40, 10, 50, 20];
                const y = ys[idx];

                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r={hoveredDayIdx === idx ? '7' : '4.5'}
                      fill={hoveredDayIdx === idx ? '#ea580c' : '#f97316'}
                      stroke="#fff"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredDayIdx(idx)}
                      onMouseLeave={() => setHoveredDayIdx(null)}
                    />
                    {/* Tick Label */}
                    <text x={x} y="145" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Float Tooltip */}
            {hoveredDayIdx !== null && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl px-4 py-2 text-[10px] font-bold shadow-xl border border-slate-800 dark:border-slate-200 z-10 transition-all">
                <p className="text-[9px] uppercase tracking-wider text-slate-400">Day: {dailyRevenue[hoveredDayIdx].day}</p>
                <p className="text-xs font-black text-orange-500">Revenue: €{dailyRevenue[hoveredDayIdx].revenue}</p>
                <p>Volume: {dailyRevenue[hoveredDayIdx].orders} Paid Orders</p>
              </div>
            )}
          </div>
        </div>

        {/* L2: Traffic Sources (Donut Chart) - span 4 */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Traffic Distribution</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Top Acquisition Channels</p>
          </div>

          {/* SVG Donut */}
          <div className="relative my-4 flex justify-center items-center">
            <svg width="150" height="150" viewBox="0 0 100 100">
              {/* Direct Search: strokeDasharray="282.7" */}
              <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f1f5f9" strokeWidth="10" className="dark:stroke-slate-800/60" />
              
              {/* Direct Search (45%) */}
              <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f97316" strokeWidth="10" 
                strokeDasharray={`${2 * Math.PI * 35 * 0.45} ${2 * Math.PI * 35 * 0.55}`} 
                strokeDashoffset="0"
                className="cursor-pointer hover:stroke-orange-600 transition-all duration-200"
                onMouseEnter={() => setHoveredTrafficIdx(0)}
                onMouseLeave={() => setHoveredTrafficIdx(null)}
              />

              {/* Google Organic (25%) */}
              <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" strokeWidth="10" 
                strokeDasharray={`${2 * Math.PI * 35 * 0.25} ${2 * Math.PI * 35 * 0.75}`} 
                strokeDashoffset={`-${2 * Math.PI * 35 * 0.45}`}
                className="cursor-pointer hover:stroke-blue-600 transition-all duration-200"
                onMouseEnter={() => setHoveredTrafficIdx(1)}
                onMouseLeave={() => setHoveredTrafficIdx(null)}
              />

              {/* Facebook Ads (18%) */}
              <circle cx="50" cy="50" r="35" fill="transparent" stroke="#10b981" strokeWidth="10" 
                strokeDasharray={`${2 * Math.PI * 35 * 0.18} ${2 * Math.PI * 35 * 0.82}`} 
                strokeDashoffset={`-${2 * Math.PI * 35 * 0.70}`}
                className="cursor-pointer hover:stroke-emerald-600 transition-all duration-200"
                onMouseEnter={() => setHoveredTrafficIdx(2)}
                onMouseLeave={() => setHoveredTrafficIdx(null)}
              />

              {/* TikTok Shop (12%) */}
              <circle cx="50" cy="50" r="35" fill="transparent" stroke="#8b5cf6" strokeWidth="10" 
                strokeDasharray={`${2 * Math.PI * 35 * 0.12} ${2 * Math.PI * 35 * 0.88}`} 
                strokeDashoffset={`-${2 * Math.PI * 35 * 0.88}`}
                className="cursor-pointer hover:stroke-violet-600 transition-all duration-200"
                onMouseEnter={() => setHoveredTrafficIdx(3)}
                onMouseLeave={() => setHoveredTrafficIdx(null)}
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">Direct</span>
              <p className="text-xl font-black text-slate-800 dark:text-white">45%</p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-800">
            {trafficSources.map((t, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                <span className="truncate">{t.source} ({t.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Monthly Revenue (Bar Chart) & Top Sellers / Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Monthly Revenue (Bar Chart) - span 5 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Monthly Revenue Comparison</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Annual fiscal tracking</p>
          </div>

          {/* SVG Columns Bar Chart */}
          <div className="relative mt-6 flex-1 flex items-end">
            <svg viewBox="0 0 300 120" className="w-full h-36 overflow-visible">
              {monthlyRevenue.map((m, idx) => {
                const width = 24;
                const gap = 16;
                const x = 12 + idx * (width + gap);
                
                // Scale revenue (max 42100 is 100 height)
                const height = (m.revenue / 43000) * 100;
                const y = 100 - height;

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx="4"
                      fill={hoveredMonthIdx === idx ? '#f97316' : '#fdba74'}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                    />
                    <text x={x + width/2} y="115" textAnchor="middle" fontSize="8" fontWeight="black" fill="#94a3b8">
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredMonthIdx !== null && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white rounded-xl px-3 py-1.5 text-[9px] font-extrabold shadow-md">
                {monthlyRevenue[hoveredMonthIdx].month}: €{monthlyRevenue[hoveredMonthIdx].revenue.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Column Right: Top categories & Top Selling Products Bento - span 7 */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-500" /> Best Performing Products
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Ranked by local Malta sales counts</p>
          </div>

          <div className="mt-4 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No items sold on platform yet.</p>
            ) : (
              topProducts.map((p, idx) => {
                const salesTarget = 1600;
                const percent = Math.min(100, Math.round(((p.salesCount || 0) / salesTarget) * 100));

                return (
                  <div key={p.id} className="flex items-center gap-4 text-xs font-semibold">
                    <span className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black text-center flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100 dark:border-slate-800" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-slate-800 dark:text-slate-200 font-black text-[11px]">{p.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{p.storeName} • {p.category}</span>
                        <strong className="text-slate-700 dark:text-slate-300">{p.salesCount || 0} items sold</strong>
                      </div>
                      
                      {/* Progress Line */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
