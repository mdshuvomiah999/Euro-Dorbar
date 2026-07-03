import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { 
  Home, Menu, ShoppingCart, MessageSquare, User, 
  HelpCircle, ShieldCheck, Truck, RefreshCw, Smartphone 
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  stateTrigger: number;
}

export default function Footer({ onNavigate, stateTrigger }: FooterProps) {
  const years = new Date().getFullYear();
  const [cartCount, setCartCount] = useState(0);
  const currentView: string = '';

  useEffect(() => {
    const cart = db.getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [stateTrigger]);

  return (
    <footer className="bg-slate-900 text-slate-400 font-sans border-t border-slate-800 transition-colors duration-200">
      {/* 1. SELLER & TRUST BADGES */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-8 px-4 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900 rounded-xl text-orange-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Safe Local Payments</h4>
              <p className="text-xs text-slate-400 mt-1">Encrypted transactions supporting card, BOV Pay, Revolut and Cash on delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900 rounded-xl text-orange-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Next-Day Malta Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Dispatched directly from local multi-vendor warehouses across Malta and Gozo.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900 rounded-xl text-orange-500 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-1">Easy return authorization and drop-off points located in Birkirkara and Sliema.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900 rounded-xl text-orange-500 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">24/7 Buyer Protection</h4>
              <p className="text-xs text-slate-400 mt-1">Receive refunds or replacements if items do not match seller descriptions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER LINKS */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Shopping Help</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Help Center</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Buyer Protection</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Local Delivery Fees</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Terms & Conditions</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Collaborate with us</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('seller-registration')} className="hover:text-white hover:underline text-orange-400 dark:text-orange-300 font-bold text-left">Register as Seller</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Seller Center Portal</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Affiliate Program</button></li>
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:underline transition-colors text-left">Logistics Solutions</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Popular Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('search', { category: 'Consumer Electronics' })} className="hover:text-white hover:underline transition-colors text-left">Consumer Electronics</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'Fashion & Clothing' })} className="hover:text-white hover:underline transition-colors text-left">Fashion & Clothing</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'Home & Garden' })} className="hover:text-white hover:underline transition-colors text-left">Home & Garden</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'Sports & Outdoors' })} className="hover:text-white hover:underline transition-colors text-left">Sports & Outdoors</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">EuroDorbar Brand</h4>
          <p className="text-xs leading-relaxed">
            Inspired by AliExpress, custom engineered for global e-commerce. Shop smart, buy local, and support businesses across regions.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="bg-slate-800 text-slate-100 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              🔒 SSL Encrypted
            </span>
            <span className="bg-slate-800 text-slate-100 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              🇪🇺 EU Compliance
            </span>
          </div>
        </div>
      </div>

      {/* 3. LOGOS AND COPYRIGHT */}
      <div className="bg-slate-950 py-6 px-4 text-center border-t border-slate-800/60 pb-20 sm:pb-8">
        <p className="text-[11px] text-slate-500">
          &copy; {years} EuroDorbar Multi-Vendor Marketplace. All rights reserved. Built with precision for global commerce.
        </p>
        <p className="text-[9px] text-slate-600 mt-1">
          Demo Storefront — Powered by localized localStorage schemas. Designed with high-density card lists, real-time seller chat threads, and dynamic order analytics engines.
        </p>
      </div>

      {/* 4. STICKY MOBILE NAVIGATION BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-1 px-4 flex items-center justify-between z-30 sm:hidden transition-colors duration-200">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            currentView === 'home' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            currentView === 'search' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => onNavigate('account', { tab: 'messages' })}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            currentView === 'account' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => onNavigate('cart')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold relative ${
            currentView === 'cart' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[8px] px-1.5 py-0.2 rounded-full font-bold">
              {cartCount}
            </span>
          )}
          <span>Cart</span>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
            currentView === 'account' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </button>
      </div>
    </footer>
  );
}
