import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { adminDb, SupportTicket, ShippingZone, WebsiteSettings, HelpCenterArticle, BlogArticle } from '../../utils/adminDb';
import { Coupon, Review } from '../../types';
import { 
  CreditCard, Shield, Truck, Ticket, Layout, Star, MessageSquare, Bell, FileSpreadsheet,
  Settings, Key, Plus, Trash2, Check, RefreshCw, Send, Lock, UserCheck, AlertTriangle, HelpCircle, FileText
} from 'lucide-react';

interface SubPanelProps {
  onStateChange: () => void;
  stateTrigger: number;
}

// ====================================================
// 1. PAYMENT GATEWAYS MANAGEMENT PANEL
// ====================================================
export function PaymentPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [gateways, setGateways] = useState({
    stripe: true, paypal: true, visa: true, mastercard: true, apple_pay: true, google_pay: true, cod: false
  });
  
  const payments = adminDb.getPayments();
  const totalVolume = payments.reduce((sum, p) => p.status === 'success' ? sum + p.amount : sum, 0);

  const handleToggleGateway = (gate: keyof typeof gateways) => {
    const updated = { ...gateways, [gate]: !gateways[gate] };
    setGateways(updated);
    adminDb.logAction('Marketplace Admin', `Toggled Payment Gateway state: ${gate as string} to ${!gateways[gate]}`, 'Payments');
    alert(`Payment Gateway "${(gate as string).toUpperCase()}" status updated!`);
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Secure Payment Gateway Control</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Manage Active payment processors, transaction routes and escrow values</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gateway active cards */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b">Active Merchant Routers</h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            {Object.entries(gateways).map(([key, active]) => (
              <div key={key} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  <span className="font-extrabold text-[11px] uppercase tracking-wide text-slate-700 dark:text-slate-300">{key.replace('_', ' ')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleGateway(key as any)}
                  className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border transition-all ${
                    active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {active ? 'Gateway Connected' : 'Gateway Offline'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History ledger */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Transaction Ledger Logs</h3>
            <span className="text-[10px] text-green-600 font-mono font-black">Success Flow Volume: €{totalVolume.toFixed(2)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-[11px]">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="p-3 font-mono font-bold text-slate-400 text-[10px]">{p.transactionRef}</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{p.orderId}</td>
                    <td className="p-3">{p.buyerName}</td>
                    <td className="p-3 uppercase tracking-wider text-[9px] text-indigo-500 font-black">{p.gateway}</td>
                    <td className="p-3 font-mono">€{p.amount.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        p.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 2. SHIPPING & LOGISTICS MANAGEMENT PANEL
// ====================================================
export function ShippingPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [newCarrier, setNewCarrier] = useState('');
  const [newCarrierRate, setNewCarrierRate] = useState(3.5);

  useEffect(() => {
    setZones(adminDb.getShippingZones());
  }, [stateTrigger]);

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newCarrier.trim()) return;

    const newZone: ShippingZone = {
      id: `zone_${Date.now()}`,
      name: newZoneName,
      countries: ['Malta', 'Gozo', 'EU Nodes'],
      methods: [
        { id: `meth_${Date.now()}`, name: `${newCarrier} Express`, rate: newCarrierRate, deliveryTime: '2-3 business days', company: newCarrier }
      ]
    };

    const updated = [...zones, newZone];
    adminDb.setShippingZones(updated);
    adminDb.logAction('Marketplace Admin', `Configured Shipping Logistics Zone: ${newZoneName}`, 'Shipping');
    setNewZoneName('');
    setNewCarrier('');
    onStateChange();
    alert(`Logistics Zone "${newZoneName}" successfully created!`);
  };

  const handleDeleteZone = (id: string) => {
    const updated = zones.filter(z => z.id !== id);
    adminDb.setShippingZones(updated);
    adminDb.logAction('Marketplace Admin', `Deleted Shipping Zone ID: ${id}`, 'Shipping');
    onStateChange();
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Maltese Domestic & International Logistics Control</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Configure default courier options, local zoning rates, and dispatch timelines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Logistics manager creator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b">Establish Dispatch Route</h3>
          
          <form onSubmit={handleCreateZone} className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Logistics Zone Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Malta Southern District"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Default Delivery Carrier</label>
              <input
                type="text"
                required
                placeholder="e.g. MaltaPost, MilesExpress"
                value={newCarrier}
                onChange={(e) => setNewCarrier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Standard Flat Rate Fee (EUR)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newCarrierRate}
                onChange={(e) => setNewCarrierRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Link Logistics Gateway
            </button>
          </form>
        </div>

        {/* Existing Routes list map */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b">Active Delivery Companies</h3>
          
          <div className="space-y-4">
            {zones.map(z => (
              <div key={z.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-orange-500" /> {z.name}
                  </h4>
                  <button type="button" onClick={() => handleDeleteZone(z.id)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pl-6 border-l border-slate-200 dark:border-slate-800 space-y-2">
                  {z.methods.map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 uppercase tracking-wide">{m.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">Carrier: {m.company} • Timeframe: {m.deliveryTime}</p>
                      </div>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs">€{m.rate.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 3. CAMPAIGN COUPON PROMOTIONS PANEL
// ====================================================
export function CouponPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState<Coupon['type']>('percentage');
  const [val, setVal] = useState(15);
  const [minSpend, setMinSpend] = useState(20);

  useEffect(() => {
    setCoupons(db.getCoupons());
  }, [stateTrigger]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}`,
      sellerId: 'user_admin', // Global level admin coupon
      code: code.trim().toUpperCase(),
      type,
      value: val,
      minSpend,
      expiryDate: '2026-12-31',
      usesCount: 0
    };

    const all = db.getCoupons();
    all.unshift(newCoupon);
    db.setCoupons(all);
    adminDb.logAction('Marketplace Admin', `Created Global Promo Coupon: ${code.trim().toUpperCase()}`, 'Coupons');
    setCode('');
    onStateChange();
    alert(`Global Coupon code "${newCoupon.code}" created successfully!`);
  };

  const handleDeleteCoupon = (id: string) => {
    const remaining = db.getCoupons().filter(c => c.id !== id);
    db.setCoupons(remaining);
    adminDb.logAction('Marketplace Admin', `Permanently deleted coupon: ${id}`, 'Coupons');
    onStateChange();
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Campaign & Coupon Vouchers</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Create Percentage, Flat rate, Free Shipping, and global-level EuroDorbar coupon offers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Creator panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b">Establish Coupon Code</h3>
          
          <form onSubmit={handleCreateCoupon} className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Coupon Promo Code</label>
              <input
                type="text"
                required
                placeholder="e.g. VALLETTA15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none uppercase font-black tracking-widest text-orange-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Reduction Category type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300 font-bold"
              >
                <option value="percentage">Percentage Reduction (%)</option>
                <option value="fixed">Flat-Rate Deductible (EUR)</option>
                <option value="free_shipping">Free Shipping override</option>
              </select>
            </div>

            {type !== 'free_shipping' && (
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Coupon Value</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={val}
                  onChange={(e) => setVal(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none font-bold"
                />
              </div>
            )}

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Minimum Checkout Spend (EUR)</label>
              <input
                type="number"
                min="0"
                value={minSpend}
                onChange={(e) => setMinSpend(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Ticket className="w-4 h-4" /> Issue Platform Voucher
            </button>
          </form>
        </div>

        {/* Existing Coupons table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b">Active Promo Codes</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3">Promo Code</th>
                  <th className="p-3">Deduction Type</th>
                  <th className="p-3">Reduction Value</th>
                  <th className="p-3">Min Spend</th>
                  <th className="p-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold text-slate-700 dark:text-slate-300">
                    <td className="p-3 font-mono font-black text-orange-500 text-[11px]">{c.code}</td>
                    <td className="p-3 uppercase tracking-wider text-[9px] text-slate-500">{c.type.replace('_', ' ')}</td>
                    <td className="p-3 font-mono text-slate-800 dark:text-white">
                      {c.type === 'percentage' ? `${c.value}% Off` : c.type === 'fixed' ? `€${c.value.toFixed(2)} Off` : 'FREE Delivery'}
                    </td>
                    <td className="p-3 font-mono">€{c.minSpend}</td>
                    <td className="p-3 text-right">
                      <button type="button" onClick={() => handleDeleteCoupon(c.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 4. CONTENT & FAQ CONFIGURATOR PANEL
// ====================================================
export function ContentPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<HelpCenterArticle[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  
  const [newFaqTitle, setNewFaqTitle] = useState('');
  const [newFaqContent, setNewFaqContent] = useState('');

  useEffect(() => {
    setBanners(adminDb.getBanners());
    setFaqs(adminDb.getHelpArticles());
    setBlogs(adminDb.getBlogs());
  }, [stateTrigger]);

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqTitle.trim() || !newFaqContent.trim()) return;

    const newArticle: HelpCenterArticle = {
      id: `faq_${Date.now()}`,
      title: newFaqTitle,
      category: 'General Support',
      content: newFaqContent
    };

    const updated = [...faqs, newArticle];
    adminDb.setHelpArticles(updated);
    adminDb.logAction('Marketplace Admin', `Published Support Article: ${newFaqTitle}`, 'Content');
    setNewFaqTitle('');
    setNewFaqContent('');
    onStateChange();
    alert('FAQ/Help Article published successfully!');
  };

  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    adminDb.setHelpArticles(updated);
    adminDb.logAction('Marketplace Admin', `Deleted Help Article ID: ${id}`, 'Content');
    onStateChange();
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">EuroDorbar Visual & Editorial Content Configurator</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Manage promotional homepage sliders, announcements, blogs, FAQs, and help center articles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Banner sliding list */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b flex items-center gap-2">
            <Layout className="w-4 h-4 text-orange-500" /> Active Hero Slider Campaigns
          </h3>

          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b.id} className="relative h-24 rounded-xl overflow-hidden border">
                <img src={b.image} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-4">
                  <h4 className="text-white font-black text-sm">{b.title}</h4>
                  <p className="text-[10px] text-orange-400 mt-1 font-mono">{b.link}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Publisher */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-1.5 border-b flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-orange-500" /> FAQ & Help Center Articles ({faqs.length})
          </h3>

          <form onSubmit={handleCreateFaq} className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Article Subject Question</label>
              <input
                type="text"
                required
                placeholder="e.g. How does escrow release protection work?"
                value={newFaqTitle}
                onChange={e => setNewFaqTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Help Article Content</label>
              <textarea
                required
                rows={2}
                placeholder="Detailed advice text answers..."
                value={newFaqContent}
                onChange={e => setNewFaqContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 focus:outline-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-2.5 rounded-xl shadow-xs"
            >
              Publish FAQ Article
            </button>
          </form>

          <div className="divide-y space-y-3 max-h-48 overflow-y-auto pt-2">
            {faqs.map(f => (
              <div key={f.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-[11px]">{f.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{f.content}</p>
                </div>
                <button type="button" onClick={() => handleDeleteFaq(f.id)} className="text-slate-400 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 5. REVIEW MODERATION PANEL
// ====================================================
export function ReviewPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(db.getReviews());
  }, [stateTrigger]);

  const handleDeleteReview = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this buyer review? It will be cleared from listings.')) {
      const remaining = db.getReviews().filter(r => r.id !== id);
      db.setReviews(remaining);
      adminDb.logAction('Marketplace Admin', `Deleted inappropriate buyer review ID: ${id}`, 'Reviews');
      onStateChange();
      alert('Review successfully removed.');
    }
  };

  const handleApproveFlag = (id: string) => {
    alert('Review content verified as clean. Moderate Flag dismissed.');
    adminDb.logAction('Marketplace Admin', `Approved reported feedback comment: ${id}`, 'Reviews');
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Feedback & Review Moderation</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Moderate flagged comments, review commercial abuse claims, and delete inappropriate content</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-4">Customer</th>
                <th className="p-4">Associated Product</th>
                <th className="p-4">Star rating</th>
                <th className="p-4">Feedback Content</th>
                <th className="p-4 text-right">Moderation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-[11px] font-semibold">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{r.buyerName}</td>
                  <td className="p-4 text-slate-500 font-bold truncate max-w-[150px]">{r.productTitle}</td>
                  <td className="p-4 text-yellow-500 flex items-center gap-0.5 mt-2">
                    {r.rating} <Star className="w-3.5 h-3.5 fill-yellow-500 stroke-none" />
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 max-w-[250px] truncate">"{r.comment}"</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleApproveFlag(r.id)}
                      className="text-emerald-600 hover:underline bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-md"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(r.id)}
                      className="text-rose-500 hover:underline bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-md"
                    >
                      Delete Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 6. CUSTOMER TICKETS & SUPPORT DESK
// ====================================================
export function SupportPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setTickets(adminDb.getTickets());
  }, [stateTrigger]);

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;

    const all = adminDb.getTickets();
    const idx = all.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      all[idx].messages.push({
        sender: 'admin',
        text: replyText.trim(),
        createdAt: new Date().toISOString()
      });
      all[idx].status = 'processing';
      adminDb.setTickets(all);
      adminDb.logAction('Marketplace Admin', `Replied to Ticket #${ticketId}`, 'Support');
      setReplyText('');
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(all[idx]);
      }
      onStateChange();
    }
  };

  const handleCloseTicket = (ticketId: string) => {
    const all = adminDb.getTickets();
    const idx = all.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      all[idx].status = 'closed';
      adminDb.setTickets(all);
      adminDb.logAction('Marketplace Admin', `Closed Support Ticket #${ticketId}`, 'Support');
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(all[idx]);
      }
      onStateChange();
      alert(`Ticket #${ticketId} closed successfully!`);
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Maltese Island Digital Help Desk</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Solve buyer payment disputes, shipping complaints, and vendor arguments directly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket listing */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px] p-4">
                  <th className="p-3">Email / Subject</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-[11px]">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold transition-colors">
                    <td className="p-3">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{t.subject}</p>
                      <p className="text-[9px] text-slate-400 font-medium font-sans mt-0.5">{t.userEmail}</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(t)}
                        className="bg-slate-900 text-white dark:bg-orange-500 hover:opacity-90 font-bold px-2.5 py-1.5 rounded-lg text-[10px]"
                      >
                        Chat UI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Chat Simulated interface */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between h-[380px]">
              <div className="flex justify-between items-center pb-2.5 border-b">
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">Dispute chat: {selectedTicket.subject}</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold font-mono">Tkt ref: #{selectedTicket.id}</p>
                </div>
                {selectedTicket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold px-3 py-1.5 rounded-lg text-[10px]"
                  >
                    Solve Dispute
                  </button>
                )}
              </div>

              {/* Message scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 text-[11px]">
                {selectedTicket.messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[75%] font-medium ${
                      m.sender === 'admin' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-900 border text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 font-mono">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {selectedTicket.status === 'closed' ? (
                <div className="bg-slate-50 dark:bg-slate-900/60 text-center py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                  This help desk ticket has been marked as completed/solved.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official corporate admin response..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-[11px] focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(selectedTicket.id)}
                    className="bg-slate-900 dark:bg-orange-500 hover:opacity-90 text-white rounded-xl px-4 flex items-center justify-center shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-dashed rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs h-[380px] flex flex-col justify-center items-center gap-3">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p>Select an ongoing help desk complaint ticket from the ledger to load the real-time moderator corporate chat interface.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 7. NOTIFICATION HUB & SMS ALERTS
// ====================================================
export function NotificationPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    // Simulate sending to all users
    db.addNotification('user_buyer_1', notifTitle, notifMessage, 'system');
    db.addNotification('seller_tech_id', notifTitle, notifMessage, 'system');
    adminDb.logAction('Marketplace Admin', `Broadcasted Global Notification: ${notifTitle}`, 'Notifications');
    
    setNotifTitle('');
    setNotifMessage('');
    onStateChange();
    alert('Push Notification broadcasted successfully to all platform sellers and buyer nodes!');
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Notification Broadcasting Hub</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Publish global announcement banner messages, push notifications and email template broadcasts</p>
      </div>

      <div className="max-w-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-2 border-b flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-orange-500" /> Send Broadcast Push Alert
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-3">
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Broadcasting Header Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Scheduled MaltaPost maintenance tonight"
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Alert Message Text</label>
            <textarea
              required
              rows={3}
              placeholder="Alert content text..."
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3.5 py-2 focus:outline-none"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <Bell className="w-4 h-4" /> Broadcast push to all active sockets
          </button>
        </form>
      </div>
    </div>
  );
}

// ====================================================
// 8. REPORTS GENERATION & DOCUMENT EXPORT PANEL
// ====================================================
export function ReportPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const handleExportData = (type: string) => {
    alert(`Successfully compiled financial worksheets for "${type}". Starting spreadsheet CSV downloads...`);
    adminDb.logAction('Marketplace Admin', `Generated platform PDF tax report: ${type}`, 'Reports');
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Corporate Analytical Financial Reporting</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Compile quarterly VAT, platform commission earnings, and multi-vendor inventory logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">Commission Report</span>
            <p className="text-[10px] text-slate-400 mt-1">Export exact monthly platform commission earnings worksheets.</p>
          </div>
          <button type="button" onClick={() => handleExportData('Commission Worksheet')} className="w-full bg-slate-950 dark:bg-orange-500 text-white py-2 rounded-xl flex items-center justify-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Spreadsheet
          </button>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">VAT / Tax Statements</span>
            <p className="text-[10px] text-slate-400 mt-1">Maltese Island standard 18% consumer VAT ledger reports.</p>
          </div>
          <button type="button" onClick={() => handleExportData('VAT Worksheet')} className="w-full bg-slate-950 dark:bg-orange-500 text-white py-2 rounded-xl flex items-center justify-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Compile VAT PDF
          </button>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">Inventory restock reports</span>
            <p className="text-[10px] text-slate-400 mt-1">Identify products falling below safe threshold ratios.</p>
          </div>
          <button type="button" onClick={() => handleExportData('Inventory restock logs')} className="w-full bg-slate-950 dark:bg-orange-500 text-white py-2 rounded-xl flex items-center justify-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Restock List
          </button>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">Seller Rating Report</span>
            <p className="text-[10px] text-slate-400 mt-1">Audit merchant feedback comments, ratings and complaints.</p>
          </div>
          <button type="button" onClick={() => handleExportData('Ratings log report')} className="w-full bg-slate-950 dark:bg-orange-500 text-white py-2 rounded-xl flex items-center justify-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Rating CSV
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 9. WEBSITE SYSTEM SETTINGS PANEL
// ====================================================
export function SettingsPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  const [name, setName] = useState('');
  const [tax, setTax] = useState(18);
  const [timezone, setTimezone] = useState('');
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const s = adminDb.getSettings();
    setSettings(s);
    if (s) {
      setName(s.name);
      setTax(s.taxRate);
      setTimezone(s.timeZone);
      setMaintenance(s.maintenanceMode);
    }
  }, [stateTrigger]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const updated: WebsiteSettings = {
      ...settings,
      name,
      taxRate: tax,
      timeZone: timezone,
      maintenanceMode: maintenance
    };

    adminDb.setSettings(updated);
    adminDb.logAction('Marketplace Admin', 'Saved revised system settings parameters', 'Settings');
    onStateChange();
    alert('EuroDorbar main settings variables saved successfully!');
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Main Core settings parameters</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Configure platform branding title, tax rates, standard billing currencies, and maintenance mode controls</p>
      </div>

      <div className="max-w-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Corporate App Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Default Standard VAT (%)</label>
              <input type="number" value={tax} onChange={e => setTax(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Local Time Zone</label>
            <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 focus:outline-none" />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border">
            <div>
              <p className="text-[11px] text-slate-700 dark:text-slate-200 uppercase tracking-wide">Maintenance Lock Mode</p>
              <p className="text-[9px] text-slate-400 font-medium">Bypass buyer traffic and lock storefront displays with a maintenance template</p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenance(!maintenance)}
              className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border transition-all ${
                maintenance ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              {maintenance ? 'Lock Mode ON' : 'Lock Mode OFF'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-3 rounded-xl shadow-xs flex items-center justify-center gap-1"
          >
            <Settings className="w-4 h-4" /> Save Core Server Variables
          </button>
        </form>
      </div>
    </div>
  );
}

// ====================================================
// 10. ACCESS SECURITY & ACTION LOGS PANEL
// ====================================================
export function SecurityPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(adminDb.getAuditLogs());
  }, [stateTrigger]);

  const handleClearLogs = () => {
    if (confirm('Clear audit database?')) {
      adminDb.setAuditLogs([]);
      onStateChange();
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Access Security & Audit Trail Logs</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Track moderator IP proxy addresses, administrative modifications, and inspect session histories</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-orange-500" /> Operational Audit Trails
          </h3>
          <button type="button" onClick={handleClearLogs} className="text-rose-500 hover:underline">
            Wipe Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px] p-4">
                <th className="p-3">Moderator</th>
                <th className="p-3">Action logged</th>
                <th className="p-3">Admin Module</th>
                <th className="p-3">Logged IP Address</th>
                <th className="p-3">Date-Time Stamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <strong>{l.adminUser}</strong>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{l.action}</td>
                  <td className="p-3 text-[10px] text-indigo-500 uppercase tracking-wider">{l.module}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{l.ipAddress}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{new Date(l.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
