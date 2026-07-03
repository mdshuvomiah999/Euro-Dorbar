import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { User, CartItem, Product } from '../types';
import { 
  Search, ShoppingCart, Heart, User as UserIcon, LogOut, Sun, Moon, 
  Store, Shield, Menu, ChevronDown, MapPin, Sparkles, Bell, MessageSquare,
  Mic, Camera, Scan, Clock as HistoryIcon, Trash, X, ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ onNavigate, onStateChange, stateTrigger, isDark, onToggleDarkMode }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Product[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // AliExpress Search Upgrades
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState('Listening...');
  const [imageSearchActive, setImageSearchActive] = useState(false);
  const [barcodeSearchActive, setBarcodeSearchActive] = useState(false);
  const [scanningLaser, setScanningLaser] = useState(false);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    
    const cart = db.getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    
    setWishCount(db.getWishlist().length);
    
    const user = db.getCurrentUser();
    if (user) {
      const seller = db.getSellers().find(s => s.userId === user.id);
      const recId = user.role === 'seller' && seller ? seller.id : user.id;
      setUnreadNotifications(db.getNotifications().filter(n => n.recipientId === recId && !n.read).length);
    } else {
      setUnreadNotifications(0);
    }

    const history = JSON.parse(localStorage.getItem('mm_search_history') || '[]');
    setSearchHistory(history);
  }, [stateTrigger]);

  const addSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    let history = JSON.parse(localStorage.getItem('mm_search_history') || '[]');
    history = history.filter((h: string) => h.toLowerCase() !== query.trim().toLowerCase());
    history.unshift(query.trim());
    history = history.slice(0, 10);
    localStorage.setItem('mm_search_history', JSON.stringify(history));
    setSearchHistory(history);
  };

  const clearHistoryItem = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let history = JSON.parse(localStorage.getItem('mm_search_history') || '[]');
    history = history.filter((h: string) => h.toLowerCase() !== query.toLowerCase());
    localStorage.setItem('mm_search_history', JSON.stringify(history));
    setSearchHistory(history);
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('mm_search_history');
    setSearchHistory([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      addSearchToHistory(query);
      onNavigate('home', { query });
      setShowAutocomplete(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(true); // Keep open to show history & trending!
      return;
    }

    const allProducts = db.getProducts().filter(p => p.status === 'active');
    const filtered = allProducts.filter(p => 
      p.title.toLowerCase().includes(val.toLowerCase()) || 
      p.category.toLowerCase().includes(val.toLowerCase()) || 
      p.brand.toLowerCase().includes(val.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(val.toLowerCase()))
    );

    setAutocompleteSuggestions(filtered.slice(0, 6));
    setShowAutocomplete(true);
  };

  const handleSuggestionClick = (prod: Product) => {
    setSearchQuery(prod.title);
    addSearchToHistory(prod.title);
    setShowAutocomplete(false);
    onNavigate('product-detail', { productId: prod.id });
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    onStateChange();
    onNavigate('home');
  };

  const categories = [
    'Consumer Electronics',
    'Fashion & Clothing',
    'Home & Garden',
    'Beauty & Health',
    'Sports & Outdoors',
    'Toys & Hobbies'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      {/* 1. TOP MICRO BAR */}
      <div className="bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400 py-1 px-4 border-b border-slate-100 dark:border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" /> Ship to: <strong className="text-slate-700 dark:text-slate-300">Malta</strong>
            </span>
            <span>Local multi-vendor marketplace in the Mediterranean</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-orange-500 transition-colors"
            >
              Buyer Protection
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => {
                if (currentUser && currentUser.role === 'seller') {
                  onNavigate('seller-center');
                } else if (currentUser && currentUser.role === 'buyer') {
                  onNavigate('seller-registration');
                } else {
                  onNavigate('login');
                }
              }} 
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              Sell on EuroDorbar
            </button>
            <span className="text-slate-300">|</span>
            <span>English / EUR €</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 focus:outline-none"
          >
            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg px-2 py-1 text-sm sm:text-base font-extrabold shadow-sm flex items-center gap-0.5">
              🇪🇺 ED
            </span>
            <span className="text-slate-800 dark:text-slate-100">
              Euro<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Dorbar</span>
            </span>
          </button>
        </div>

        {/* Dynamic Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="I am shopping for..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm pl-4 pr-32 py-2 sm:py-2.5 rounded-l-full border-2 border-orange-500 focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceSearchActive(true);
                    setVoiceSearchText('Listening...');
                    setTimeout(() => setVoiceSearchText('Analyzing voice pattern...'), 1200);
                    setTimeout(() => {
                      const words = ["Wireless Earbuds", "Smart Watch", "Aviator Sunglasses", "Espresso Machine", "RGB LED Strip"];
                      const randomWord = words[Math.floor(Math.random() * words.length)];
                      setSearchQuery(randomWord);
                      addSearchToHistory(randomWord);
                      setVoiceSearchActive(false);
                      onNavigate('home', { query: randomWord });
                    }, 2500);
                  }}
                  className="p-1 hover:text-orange-500 rounded transition-colors"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageSearchActive(!imageSearchActive)}
                  className="p-1 hover:text-orange-500 rounded transition-colors"
                  title="Image Search"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBarcodeSearchActive(true);
                    setScanningLaser(true);
                    setTimeout(() => {
                      setScanningLaser(false);
                      const mockSKU = "SKU-TECH-WATCH-01";
                      setSearchQuery(mockSKU);
                      addSearchToHistory(mockSKU);
                      setBarcodeSearchActive(false);
                      onNavigate('home', { query: mockSKU });
                    }, 2000);
                  }}
                  className="p-1 hover:text-orange-500 rounded transition-colors"
                  title="Scan SKU / Barcode"
                >
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-r-full font-bold transition-all shadow-sm shrink-0 border-2 border-orange-500 hover:border-orange-600 border-l-0"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && (
            <div className="absolute top-11 sm:top-12 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" /> 
                  {searchQuery ? 'Live Suggestions' : 'Search Assistant'}
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowAutocomplete(false)} 
                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* EMPTY QUERY STATE: History + Trending */}
              {!searchQuery && (
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {/* Recent Searches */}
                  {searchHistory.length > 0 ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <HistoryIcon className="w-3.5 h-3.5" /> Recent Searches
                        </h4>
                        <button 
                          onClick={clearAllHistory}
                          className="text-[10px] text-red-500 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <Trash className="w-2.5 h-2.5" /> Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {searchHistory.map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setSearchQuery(item);
                              addSearchToHistory(item);
                              setShowAutocomplete(false);
                              onNavigate('home', { query: item });
                            }}
                            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700/50 py-1 px-2.5 rounded-full text-xs font-semibold cursor-pointer group transition-all text-slate-700 dark:text-slate-300"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={(e) => clearHistoryItem(item, e)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-400 text-xs">
                      No recent search history.
                    </div>
                  )}

                  {/* Trending Keywords */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-2.5">
                      <span className="text-red-500 text-xs font-black animate-pulse">🔥</span> Trending Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Smart Watch", "Wireless Earbuds", "Aviator Sunglasses", "RGB LED Strip", "Leather Jacket", "Espresso Machine"].map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            addSearchToHistory(tag);
                            setShowAutocomplete(false);
                            onNavigate('home', { query: tag });
                          }}
                          className="text-xs bg-orange-50 dark:bg-slate-900 border border-orange-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white hover:border-transparent py-1.5 px-3 rounded-xl transition-all font-semibold flex items-center gap-1"
                        >
                          <span className="text-orange-500 font-extrabold">#</span> {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE QUERY STATE: Product suggestions */}
              {searchQuery && (
                <div className="max-h-80 overflow-y-auto">
                  {autocompleteSuggestions.length > 0 ? (
                    autocompleteSuggestions.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSuggestionClick(prod)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-colors"
                      >
                        <img src={prod.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{prod.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{prod.category} • {prod.brand}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-orange-600 dark:text-orange-400">
                            €{(prod.price * (1 - prod.discount / 100)).toFixed(2)}
                          </p>
                          {prod.discount > 0 && (
                            <p className="text-[9px] text-red-500 font-black">-{prod.discount}%</p>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      <p className="font-semibold mb-1">No exact product matches found.</p>
                      <button
                        type="button"
                        onClick={() => {
                          addSearchToHistory(searchQuery);
                          onNavigate('home', { query: searchQuery });
                          setShowAutocomplete(false);
                        }}
                        className="text-orange-500 hover:underline font-bold mt-1"
                      >
                        Search for "{searchQuery}" across all categories ➔
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Dark Mode */}
          <button 
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 sm:h-5 sm:w-5" /> : <Moon className="w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* Quick Hub Access based on Roles */}
          {currentUser?.role === 'seller' && (
            <button
              onClick={() => onNavigate('seller-center')}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shadow-sm"
            >
              <Store className="w-4 h-4" /> Seller Center
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin-center')}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all shadow-sm"
            >
              <Shield className="w-4 h-4" /> Admin Center
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => onNavigate('account', { tab: 'wishlist' })}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative transition-colors"
          >
            <Heart className="w-4 sm:h-5 sm:w-5" />
            {wishCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] sm:text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={() => onNavigate('cart')}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative transition-colors"
          >
            <ShoppingCart className="w-4 sm:h-5 sm:w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] sm:text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Popover / Toggle */}
          <div className="relative group">
            <button
              onClick={() => onNavigate('account')}
              className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors focus:outline-none"
            >
              {currentUser ? (
                <img 
                  src={currentUser.avatar} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 ring-2 ring-orange-500/20" 
                  alt="" 
                />
              ) : (
                <div className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <UserIcon className="w-4 sm:h-5 sm:w-5" />
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl scale-0 group-hover:scale-100 origin-top-right transition-all duration-200 z-50 p-2 text-xs">
              {currentUser ? (
                <div>
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex gap-1">
                      <span className="text-[8px] font-bold uppercase bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
                        {currentUser.role}
                      </span>
                      {unreadNotifications > 0 && (
                        <span className="text-[8px] font-bold uppercase bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Bell className="w-2.5 h-2.5" /> {unreadNotifications} New
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('account')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" /> My Account / Orders
                  </button>
                  <button
                    onClick={() => onNavigate('account', { tab: 'wishlist' })}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors font-medium flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-slate-400" /> My Wishlist
                  </button>
                  {currentUser.role === 'seller' && (
                    <button
                      onClick={() => onNavigate('seller-center')}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 dark:text-red-400 transition-colors font-bold flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-red-400" /> Seller Center Dashboard
                    </button>
                  )}
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('admin-center')}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors font-bold flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-400" /> Admin Panel
                    </button>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="p-2 text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-3 font-medium">Join EuroDorbar today!</p>
                  <button
                    onClick={() => onNavigate('login')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2 rounded-lg transition-all shadow-sm mb-2"
                  >
                    Login / Register
                  </button>
                  <button
                    onClick={() => onNavigate('seller-registration')}
                    className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 rounded-lg transition-colors text-[11px]"
                  >
                    Register as Seller
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES & NAV LINKS */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 bg-white dark:bg-slate-950 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {/* Mega Categories Button */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCategoryMenu(true)}
                onMouseLeave={() => setShowCategoryMenu(false)}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 text-slate-800 dark:text-slate-100 font-extrabold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <Menu className="w-4 h-4 text-orange-500" /> Categories <ChevronDown className="w-3 h-3" />
              </button>

              {/* Mega Drawer */}
              {showCategoryMenu && (
                <div 
                  onMouseEnter={() => setShowCategoryMenu(true)}
                  onMouseLeave={() => setShowCategoryMenu(false)}
                  className="absolute top-[38px] left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-2"
                >
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 mb-1.5 border-y border-slate-100 dark:border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Marketplace Aisles</span>
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onNavigate('search', { category: cat });
                        setShowCategoryMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center justify-between"
                    >
                      {cat}
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-orange-100 px-1.5 py-0.2 rounded font-mono">➡</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('home')} className="hover:text-orange-500 transition-colors">Home</button>
            <button onClick={() => onNavigate('search', { query: 'deal' })} className="hover:text-orange-500 transition-colors text-red-600 dark:text-red-400 font-bold flex items-center gap-0.5">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Super Deals
            </button>
            <button onClick={() => onNavigate('search', { category: 'Consumer Electronics' })} className="hover:text-orange-500 transition-colors">Electronics</button>
            <button onClick={() => onNavigate('search', { category: 'Fashion & Clothing' })} className="hover:text-orange-500 transition-colors">Apparel</button>
            <button onClick={() => onNavigate('search', { category: 'Home & Garden' })} className="hover:text-orange-500 transition-colors">Smart Home</button>
            <button onClick={() => onNavigate('search', { query: 'new' })} className="hover:text-orange-500 transition-colors">New Arrivals</button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">Live</span>
            <span>Local Warehouses: Next-Day Delivery across Malta!</span>
          </div>
        </div>
      </div>

      {/* Voice Search Simulation Overlay */}
      {voiceSearchActive && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25"></div>
              <div className="bg-gradient-to-tr from-orange-500 to-red-600 text-white p-5 rounded-full relative z-10">
                <Mic className="w-8 h-8 animate-bounce" />
              </div>
            </div>
            <h3 className="font-black text-lg mb-2 text-slate-800 dark:text-slate-100">{voiceSearchText}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px]">Say something like "leather jacket", "smart watch", or "headphones"</p>
            <button
              onClick={() => setVoiceSearchActive(false)}
              className="mt-6 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 px-6 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Search Sample Upload Overlay */}
      {imageSearchActive && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Camera className="w-4 h-4 text-orange-500" /> Image Search Simulation</h3>
              <button onClick={() => setImageSearchActive(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Choose an item image from your photo roll or select a sample catalog object below to search by visual resemblance:</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { name: 'Classic Leather Jacket', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80', query: 'jacket' },
                { name: 'Smart Fitness Tracker', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=150&q=80', query: 'watch' },
                { name: 'Acoustic Soundphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80', query: 'headphone' },
                { name: 'Espresso Maker Machine', image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=150&q=80', query: 'espresso' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.name);
                    addSearchToHistory(item.name);
                    setImageSearchActive(false);
                    onNavigate('home', { query: item.query });
                  }}
                  className="border border-slate-100 dark:border-slate-850 rounded-xl p-2 flex items-center gap-2.5 cursor-pointer hover:bg-orange-50/50 dark:hover:bg-slate-900 hover:border-orange-200 transition-all group"
                >
                  <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" alt="" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange-500 truncate">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={() => {
                  setSearchQuery('Smart Watch Model X');
                  addSearchToHistory('Smart Watch Model X');
                  setImageSearchActive(false);
                  onNavigate('home', { query: 'watch' });
                }}
              />
              <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 group-hover:scale-105 transition-transform" />
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Upload Photos / Capture Image</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG up to 10MB (Drag & drop here)</p>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanning Simulation Overlay */}
      {barcodeSearchActive && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center text-slate-800 dark:text-slate-100">
            <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-5 overflow-hidden flex flex-col items-center justify-center">
              {scanningLaser && (
                <div className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] top-0 animate-bounce"></div>
              )}
              <Scan className="w-12 h-12 text-slate-400 mb-2 animate-pulse" />
              <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded text-slate-650 dark:text-slate-400">ALIGN BARCODE / SKU</span>
            </div>
            <h3 className="font-black text-sm mb-1">Scanning Code / SKU...</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px]">Simulating laser scanner focus. Searching database for item SKU match...</p>
            <button
              onClick={() => setBarcodeSearchActive(false)}
              className="mt-5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 px-6 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
