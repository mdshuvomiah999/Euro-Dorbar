import React, { useState, useEffect } from 'react';
import { db } from './utils/db';
import DemoBar from './components/DemoBar';
import Header from './components/Header';
import Footer from './components/Footer';
import BuyerHome from './components/BuyerHome';
import BuyerProductDetail from './components/BuyerProductDetail';
import BuyerStoreView from './components/BuyerStoreView';
import BuyerCart from './components/BuyerCart';
import BuyerCheckout from './components/BuyerCheckout';
import BuyerAccount from './components/BuyerAccount';
import SellerCenter from './components/SellerCenter';
import SellerRegistration from './components/SellerRegistration';
import AdminCenter from './components/AdminCenter';
import AuthPortal from './components/AuthPortal';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [params, setParams] = useState<any>({});
  const [isDark, setIsDark] = useState<boolean>(false);
  const [stateTrigger, setStateTrigger] = useState<number>(0);

  // Initialize DB and load dark mode preference
  useEffect(() => {
    db.init();
    const storedDark = localStorage.getItem('mm_theme_dark') === 'true';
    setIsDark(storedDark);
    if (storedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleStateChange = () => {
    setStateTrigger(prev => prev + 1);
  };

  const handleNavigate = (view: string, navigationParams: any = {}) => {
    setActiveView(view);
    setParams(navigationParams);
    // Scroll to top on every view transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('mm_theme_dark', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Render the appropriate component based on the activeView state
  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <BuyerHome
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
            params={params}
          />
        );
      case 'product-detail':
        return (
          <BuyerProductDetail
            productId={params.productId || 'prod_1'}
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'store':
        return (
          <BuyerStoreView
            sellerId={params.sellerId}
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'cart':
        return (
          <BuyerCart
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'checkout':
        return (
          <BuyerCheckout
            groups={params.groups || []}
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'account':
        return (
          <BuyerAccount
            initialTab={params.tab || 'orders'}
            initialChatId={params.chatId}
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'seller-center':
        return (
          <SellerCenter
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'seller-registration':
        return (
          <SellerRegistration
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'admin-center':
        return (
          <AdminCenter
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      case 'login':
      case 'register':
        return (
          <AuthPortal
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
          />
        );
      default:
        return (
          <BuyerHome
            onNavigate={handleNavigate}
            onStateChange={handleStateChange}
            stateTrigger={stateTrigger}
            params={params}
          />
        );
    }
  };

  // Determine if header and footer should render (we hide them on full-screen Seller Center and Admin consoles for clean dedicated space)
  const isDedicatedConsole = activeView === 'seller-center' || activeView === 'admin-center';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Floating Demo utility control bar */}
      <DemoBar
        onNavigate={handleNavigate}
        onStateChange={handleStateChange}
        stateTrigger={stateTrigger}
      />

      {/* Main Header (Omit on dedicated consoles) */}
      {!isDedicatedConsole && (
        <Header
          onNavigate={handleNavigate}
          onStateChange={handleStateChange}
          stateTrigger={stateTrigger}
          isDark={isDark}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}

      {/* Primary Routing view segment */}
      <main className={`${isDedicatedConsole ? 'pt-16' : 'pt-0'}`}>
        {renderMainContent()}
      </main>

      {/* Main Footer (Omit on dedicated consoles) */}
      {!isDedicatedConsole && (
        <Footer
          onNavigate={handleNavigate}
          stateTrigger={stateTrigger}
        />
      )}

    </div>
  );
}
