import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { adminDb } from '../utils/adminDb';
import { 
  ShieldAlert, LayoutDashboard, Users, Store, FolderTree, Tag, AlertTriangle, 
  Settings, Key, LogOut, Moon, Sun, Bell, HelpCircle, Activity, ShoppingBag, 
  CreditCard, Truck, Ticket, Layout, Star, MessageSquare, FileSpreadsheet, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';

// Sub panels imports
import DashboardPanel from './admin/DashboardPanel';
import { UserPanel, SellerPanel, ProductPanel, CategoryPanel, OrderPanel } from './admin/ManagementPanels';
import { 
  PaymentPanel, ShippingPanel, CouponPanel, ContentPanel, ReviewPanel, 
  SupportPanel, NotificationPanel, ReportPanel, SettingsPanel, SecurityPanel 
} from './admin/OperationPanels';

interface AdminCenterProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

type AdminTab = 
  | 'dashboard' | 'users' | 'sellers' | 'products' | 'categories' 
  | 'orders' | 'payments' | 'shipping' | 'coupons' | 'content' 
  | 'reviews' | 'support' | 'notifications' | 'reports' | 'settings' | 'security';

export default function AdminCenter({ onNavigate, onStateChange, stateTrigger }: AdminCenterProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Authenticate and fetch current user on load
  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user || user.role !== 'admin') {
      onNavigate('login');
      return;
    }
    setAdminUser(user);
    
    // Check local preferences
    const prefersDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, [stateTrigger]);

  const handleLogout = () => {
    db.setCurrentUser(null);
    onNavigate('login');
    onStateChange();
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    adminDb.logAction('Marketplace Admin', `Toggled Dark Mode preference: ${nextDark}`, 'System');
  };

  // Nav categories structure for clean sidebar sorting
  const navCategories = [
    {
      title: 'Analytics & Main',
      items: [
        { id: 'dashboard', label: 'Console Overview', icon: LayoutDashboard },
        { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'Core Commerce',
      items: [
        { id: 'users', label: 'Customer Registry', icon: Users },
        { id: 'sellers', label: 'Store Compliance', icon: Store },
        { id: 'products', label: 'Catalog Control', icon: ShoppingBag },
        { id: 'categories', label: 'Category Hierarchy', icon: FolderTree },
        { id: 'orders', label: 'Escrow Registry', icon: Tag },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'payments', label: 'Gateway Routes', icon: CreditCard },
        { id: 'shipping', label: 'Logistics zones', icon: Truck },
        { id: 'coupons', label: 'Platform Coupons', icon: Ticket },
        { id: 'content', label: 'sliders & FAQs', icon: Layout },
      ]
    },
    {
      title: 'Support & Moderation',
      items: [
        { id: 'reviews', label: 'Review Control', icon: Star },
        { id: 'support', label: 'Help Desk Chat', icon: MessageSquare },
        { id: 'notifications', label: 'Broadcasting Hub', icon: Bell },
      ]
    },
    {
      title: 'Governance',
      items: [
        { id: 'settings', label: 'Core Variables', icon: Settings },
        { id: 'security', label: 'Audit Log Trails', icon: Lock },
      ]
    }
  ];

  // Render appropriate tab pane
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPanel onNavigate={onNavigate} />;
      case 'users':
        return <UserPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'sellers':
        return <SellerPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'products':
        return <ProductPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'categories':
        return <CategoryPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'orders':
        return <OrderPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'payments':
        return <PaymentPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'shipping':
        return <ShippingPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'coupons':
        return <CouponPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'content':
        return <ContentPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'reviews':
        return <ReviewPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'support':
        return <SupportPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'notifications':
        return <NotificationPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'reports':
        return <ReportPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'settings':
        return <SettingsPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      case 'security':
        return <SecurityPanel onStateChange={onStateChange} stateTrigger={stateTrigger} />;
      default:
        return <DashboardPanel onNavigate={onNavigate} />;
    }
  };

  if (!adminUser) return null;

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside 
        className={`bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 dark:border-slate-900 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo Brand Title */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0" />
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <span className="font-black text-sm uppercase tracking-wider text-white">EuroDorbar</span>
                  <p className="text-[9px] text-orange-400 font-extrabold uppercase tracking-widest mt-0.5">Enterprise Admin</p>
                </div>
              )}
            </div>
            
            {/* Collapse toggle */}
            {!isSidebarCollapsed && (
              <button 
                type="button" 
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sidebar Nav links lists */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider px-3.5 block mb-1">
                    {cat.title}
                  </span>
                )}
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id as AdminTab)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 relative group ${
                          isActive 
                            ? 'bg-orange-500 text-white font-extrabold shadow-sm' 
                            : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                        {isSidebarCollapsed && (
                          <span className="absolute left-20 bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md">
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer control collapse-state */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {isSidebarCollapsed && (
            <button 
              type="button" 
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full flex justify-center p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 px-2">
              <img src={adminUser.avatar} className="w-9 h-9 rounded-full border border-slate-700 object-cover" alt="" />
              <div className="min-w-0">
                <p className="text-white font-extrabold text-xs truncate">{adminUser.name}</p>
                <p className="text-[10px] text-slate-500 font-semibold truncate uppercase">{adminUser.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* STICKY CONTROL HEADER */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-900/60 flex justify-between items-center px-6 sticky top-0 z-20 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Current Scope:</span>
            <span className="text-xs font-black uppercase text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg">
              {activeTab.replace('_', ' ')}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Live UTC clock indicator */}
            <span className="font-mono text-[10px] text-slate-400 font-bold hidden sm:block">
              SERVER LOG: LIVE (UTC)
            </span>

            {/* Dark Mode toggle */}
            <button 
              type="button" 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              title="Toggle screen theme mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Platform Re-trigger sync */}
            <button 
              type="button" 
              onClick={onStateChange}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
              title="Synchronize database"
            >
              <Activity className="w-4 h-4 text-orange-500" />
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/10 px-3.5 py-1.5 rounded-xl transition-all text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA BODY */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {renderContent()}
          </div>
        </main>
        
      </div>
    </div>
  );
}
