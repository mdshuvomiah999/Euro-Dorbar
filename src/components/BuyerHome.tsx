import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { Product } from '../types';
import { 
  Sparkles, Flame, Clock, Heart, ShoppingCart, Star, 
  ChevronLeft, ChevronRight, BadgePercent, ShieldCheck, Award, TrendingUp 
} from 'lucide-react';

interface BuyerHomeProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
  params?: any;
}

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1200&q=80',
    title: 'Super Tech Carnival',
    subtitle: 'Save up to 50% off Smart Wearables & Sound Systems at MaltaTech Store',
    tag: 'MALTA TECH WEEK',
    btnText: 'Explore Gadgets',
    action: { view: 'search', params: { query: 'deal' } }
  },
  {
    image: 'https://images.unsplash.com/photo-1441984969893-c534e9749007?auto=format&fit=crop&w=1200&q=80',
    title: 'Premium Mediterranean Style',
    subtitle: 'Classic Aviators, Leather Bikers & Summer Knit Sneakers at Aura Fashion',
    tag: 'AURA EXCLUSIVES',
    btnText: 'Shop New Look',
    action: { view: 'search', params: { category: 'Fashion & Clothing' } }
  },
  {
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    title: 'Smart Spaces, Cozy Living',
    subtitle: 'Automated Lighting, RGBIC strips & Barista Coffee Machines',
    tag: 'LUMINA PRE-LAUNCH',
    btnText: 'View Smart Home',
    action: { view: 'search', params: { category: 'Home & Garden' } }
  }
];

export default function BuyerHome({ onNavigate, onStateChange, stateTrigger, params }: BuyerHomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'bestsellers' | 'new'>('recommended');
  
  // Real-time Countdown timer for Flash Deals (counts down 2h 45m from mount)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 44, seconds: 59 });

  // Advanced Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);
  const [fastDelivery, setFastDelivery] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [condition, setCondition] = useState<string>(''); // 'new' | 'refurbished' | ''
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [originCountry, setOriginCountry] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('best'); // 'best' | 'popular' | 'newest' | 'price-asc' | 'price-desc'
  const [isListView, setIsListView] = useState<boolean>(false); // list vs grid visual preference

  useEffect(() => {
    // Load products and wishlist
    setProducts(db.getProducts().filter(p => p.status === 'active'));
    setWishlist(db.getWishlist());
  }, [stateTrigger]);

  useEffect(() => {
    if (params?.category) {
      setSelectedCategory(params.category);
    } else {
      setSelectedCategory('');
    }
    // Auto-reset other filters on fresh search
    setSelectedBrand('');
    setSelectedSeller('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setFreeShipping(false);
    setFastDelivery(false);
    setMinDiscount(0);
    setCondition('');
    setInStockOnly(false);
    setOriginCountry('');
    setSortBy('best');
  }, [params]);

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 59, seconds: 59 }; // Reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel cycle
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(carouselTimer);
  }, []);

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let currentWish = db.getWishlist();
    if (currentWish.includes(productId)) {
      currentWish = currentWish.filter(id => id !== productId);
    } else {
      currentWish.push(productId);
    }
    db.setWishlist(currentWish);
    setWishlist(currentWish);
    onStateChange();
  };

  const handleAddToCart = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const cart = db.getCart();
    const existing = cart.find(item => item.productId === prod.id);

    if (existing) {
      if (existing.quantity >= prod.stock) {
        alert('Cannot add more items. Out of stock.');
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({
        productId: prod.id,
        sellerId: prod.sellerId,
        storeName: prod.storeName,
        title: prod.title,
        image: prod.images[0],
        price: prod.price,
        discount: prod.discount,
        shippingCost: prod.shippingCost,
        quantity: 1
      });
    }

    db.setCart(cart);
    onStateChange();
    
    // Quick notification style toast
    const toast = document.getElementById('quick-toast');
    if (toast) {
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
      }, 2500);
    }
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Flash Deals: high discount products (discount >= 25%)
  const flashDeals = products.filter(p => p.discount >= 25).slice(0, 4);
  
  // Super Deals: discount >= 30%
  const superDeals = products.filter(p => p.discount >= 30);

  // Filter catalog based on tab or active advanced search query
  const getFilteredProducts = () => {
    const isSearching = !!(params?.query || params?.category);

    if (!isSearching) {
      if (activeTab === 'bestsellers') {
        return [...products].sort((a, b) => b.salesCount - a.salesCount);
      }
      if (activeTab === 'new') {
        return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return products; // recommended (default)
    }

    // Advanced search mode active:
    let list = [...products];

    // 1. Text Query (from search bar / params)
    const q = (params?.query || '').trim().toLowerCase();
    if (q) {
      if (q.startsWith('sku-')) {
        // Search by SKU
        list = list.filter(p => p.sku?.toLowerCase().includes(q) || p.id.toLowerCase().includes(q.replace('sku-', '')));
      } else {
        list = list.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.category.toLowerCase().includes(q) || 
          p.brand.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
    }

    // 2. Category Filter
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }

    // 3. Brand Filter
    if (selectedBrand) {
      list = list.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // 4. Seller Filter
    if (selectedSeller) {
      list = list.filter(p => p.storeName.toLowerCase().includes(selectedSeller.toLowerCase()));
    }

    // 5. Price Filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      list = list.filter(p => (p.price * (1 - p.discount / 100)) >= min);
    }
    if (!isNaN(max)) {
      list = list.filter(p => (p.price * (1 - p.discount / 100)) <= max);
    }

    // 6. Rating Filter
    if (minRating > 0) {
      list = list.filter(p => {
        const reviews = db.getReviews().filter(r => r.productId === p.id);
        if (reviews.length === 0) return 4.0 >= minRating; // Seeded items are assumed 4.0 stars by default
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return avg >= minRating;
      });
    }

    // 7. Free Shipping
    if (freeShipping) {
      list = list.filter(p => p.shippingCost === 0);
    }

    // 8. Fast Delivery (shipping cost is small, or tags include local/fast)
    if (fastDelivery) {
      list = list.filter(p => p.shippingCost < 3 || p.tags.some(t => t.toLowerCase().includes('local') || t.toLowerCase().includes('fast')));
    }

    // 9. Min Discount
    if (minDiscount > 0) {
      list = list.filter(p => p.discount >= minDiscount);
    }

    // 10. Condition
    if (condition) {
      list = list.filter(p => {
        const cond = (p as any).condition || 'new';
        return cond.toLowerCase() === condition.toLowerCase();
      });
    }

    // 11. In stock only
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // 12. Country of Origin
    if (originCountry) {
      list = list.filter(p => {
        const orig = (p as any).countryOfOrigin || 'Malta';
        return orig.toLowerCase() === originCountry.toLowerCase();
      });
    }

    // --- SORTING ---
    if (sortBy === 'popular') {
      list.sort((a, b) => b.salesCount - a.salesCount);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const priceA = a.price * (1 - a.discount / 100);
        const priceB = b.price * (1 - b.discount / 100);
        return priceA - priceB;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const priceA = a.price * (1 - a.discount / 100);
        const priceB = b.price * (1 - b.discount / 100);
        return priceB - priceA;
      });
    }

    return list;
  };

  const categories = [
    { name: 'Consumer Electronics', icon: '💻', count: products.filter(p => p.category === 'Consumer Electronics').length },
    { name: 'Fashion & Clothing', icon: '👔', count: products.filter(p => p.category === 'Fashion & Clothing').length },
    { name: 'Home & Garden', icon: '🏡', count: products.filter(p => p.category === 'Home & Garden').length },
    { name: 'Beauty & Health', icon: '💄', count: 0 },
    { name: 'Sports & Outdoors', icon: '🏂', count: 0 },
    { name: 'Toys & Hobbies', icon: '🎮', count: 0 }
  ];

  const isSearching = !!(params?.query || params?.category);

  if (isSearching) {
    const filteredList = getFilteredProducts();
    const queryStr = params.query || '';
    const catStr = params.category || '';

    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
        {/* Toast */}
        <div 
          id="quick-toast" 
          className="fixed bottom-10 left-10 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold py-3 px-5 rounded-xl shadow-2xl transition-all duration-300 opacity-0 translate-y-2 flex items-center gap-2 pointer-events-none"
        >
          <span className="text-orange-500">✔</span> Product successfully added to shopping cart!
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-semibold">
            <button onClick={() => onNavigate('home')} className="hover:text-orange-500">EuroDorbar</button>
            <span>/</span>
            <span>Search Results</span>
            {(queryStr || catStr) && (
              <>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">
                  {queryStr ? `"${queryStr}"` : catStr}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* LEFT SIDEBAR FILTERS */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 h-fit">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Advanced Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBrand('');
                    setSelectedSeller('');
                    setMinPrice('');
                    setMaxPrice('');
                    setMinRating(0);
                    setFreeShipping(false);
                    setFastDelivery(false);
                    setMinDiscount(0);
                    setCondition('');
                    setInStockOnly(false);
                    setOriginCountry('');
                  }}
                  className="text-[10px] text-red-500 hover:underline font-black"
                >
                  Clear All
                </button>
              </div>

              {/* Filter 1: Category Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Fashion & Clothing">Fashion & Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Beauty & Health">Beauty & Health</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                </select>
              </div>

              {/* Filter 2: Brands */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Brand</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {['MaltaTech', 'Aura', 'Lumina', 'Apple', 'Sony', 'Samsung', 'Nike', 'Zara'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedBrand.toLowerCase() === brand.toLowerCase()}
                        onChange={() => setSelectedBrand(selectedBrand.toLowerCase() === brand.toLowerCase() ? '' : brand)}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 3: Price Inputs */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Price Range (€)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-2 text-xs font-semibold text-center focus:outline-none focus:border-orange-500 text-slate-700 dark:text-slate-350"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-2 text-xs font-semibold text-center focus:outline-none focus:border-orange-500 text-slate-700 dark:text-slate-350"
                  />
                </div>
              </div>

              {/* Filter 4: Ratings Star Clicker */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Minimum Rating</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[4.5, 4.0, 3.5, 3.0].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        minRating === stars
                          ? 'border-orange-500 bg-orange-50/50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                          : 'border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      ★ {stars}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 5: Discount Range */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Discount Percentage</label>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setMinDiscount(minDiscount === pct ? 0 : pct)}
                      className={`py-1 px-2.5 rounded-full border text-[10px] font-bold transition-all ${
                        minDiscount === pct
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-slate-100 dark:border-slate-850 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      {pct}%+ OFF
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 6 & 7 & 8: Boolean Toggles */}
              <div className="pt-2 border-t border-slate-50 dark:border-slate-850 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={freeShipping}
                    onChange={() => setFreeShipping(!freeShipping)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                  />
                  <span>Free Shipping</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={fastDelivery}
                    onChange={() => setFastDelivery(!fastDelivery)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                  />
                  <span>Fast Local Delivery</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Filter 9: Condition */}
              <div className="pt-2 border-t border-slate-50 dark:border-slate-850">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Product Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {['new', 'refurbished'].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setCondition(condition === cond ? '' : cond)}
                      className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold capitalize transition-all border ${
                        condition === cond
                          ? 'border-orange-500 bg-orange-50/50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                          : 'border-slate-100 dark:border-slate-850 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 10: Country of Origin */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Country of Origin</label>
                <select
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Any Country</option>
                  <option value="Malta">Malta 🇲🇹</option>
                  <option value="Italy">Italy 🇮🇹</option>
                  <option value="China">China 🇨🇳</option>
                  <option value="Germany">Germany 🇩🇪</option>
                </select>
              </div>
            </div>

            {/* RIGHT MAIN RESULTS PORT */}
            <div className="lg:col-span-3 space-y-6">
              {/* TOP HEADER: SORTING & VIEW OPTIONS */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-400">
                    Showing <strong className="text-slate-800 dark:text-slate-200">{filteredList.length}</strong> items for {queryStr ? `"${queryStr}"` : 'category'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold shrink-0">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="best">Best Match 🎯</option>
                      <option value="popular">Most Popular 🔥</option>
                      <option value="newest">Newest Arrivals 🆕</option>
                      <option value="price-asc">Price: Low to High 📈</option>
                      <option value="price-desc">Price: High to Low 📉</option>
                    </select>
                  </div>

                  {/* View Switcher */}
                  <div className="flex border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setIsListView(false)}
                      className={`px-3 py-2 transition-all font-bold ${!isListView ? 'bg-orange-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400'}`}
                      title="Grid View"
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsListView(true)}
                      className={`px-3 py-2 transition-all font-bold ${isListView ? 'bg-orange-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400'}`}
                      title="List View"
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* LIST OF CURRENTLY APPLIED FILTER BADGES */}
              {(selectedCategory || selectedBrand || selectedSeller || minPrice || maxPrice || minRating > 0 || freeShipping || fastDelivery || minDiscount > 0 || condition || inStockOnly || originCountry) && (
                <div className="flex flex-wrap items-center gap-2 bg-orange-50/30 dark:bg-orange-950/5 p-3 rounded-xl border border-orange-100/55 dark:border-orange-900/10">
                  <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wide">Active Filters:</span>
                  {selectedCategory && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Category: {selectedCategory}
                      <button onClick={() => setSelectedCategory('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {selectedBrand && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Brand: {selectedBrand}
                      <button onClick={() => setSelectedBrand('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {minPrice && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Min €{minPrice}
                      <button onClick={() => setMinPrice('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {maxPrice && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Max €{maxPrice}
                      <button onClick={() => setMaxPrice('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      ★ {minRating}+
                      <button onClick={() => setMinRating(0)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {freeShipping && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Free Shipping
                      <button onClick={() => setFreeShipping(false)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {fastDelivery && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Fast Delivery
                      <button onClick={() => setFastDelivery(false)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {minDiscount > 0 && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      {minDiscount}%+ Off
                      <button onClick={() => setMinDiscount(0)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {condition && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      Condition: {condition}
                      <button onClick={() => setCondition('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                  {originCountry && (
                    <span className="text-[10px] bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 py-1 px-2 rounded-full font-semibold flex items-center gap-1">
                      From: {originCountry}
                      <button onClick={() => setOriginCountry('')} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  )}
                </div>
              )}

              {/* GRID / LIST PRODUCTS AREA */}
              {filteredList.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-16 text-center space-y-4">
                  <div className="text-4xl text-slate-300 dark:text-slate-650">🔍</div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No products matched your exact filters</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your price bounds, rating thresholds, or checking alternative product categories.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedBrand('');
                      setSelectedSeller('');
                      setMinPrice('');
                      setMaxPrice('');
                      setMinRating(0);
                      setFreeShipping(false);
                      setFastDelivery(false);
                      setMinDiscount(0);
                      setCondition('');
                      setInStockOnly(false);
                      setOriginCountry('');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-6 rounded-xl shadow-md transition-all animate-pulse"
                  >
                    Reset Filter Panel
                  </button>
                </div>
              ) : isListView ? (
                /* LINEAR LIST VIEW */
                <div className="space-y-4">
                  {filteredList.map((prod) => {
                    const salePrice = prod.price * (1 - prod.discount / 100);
                    const isWished = wishlist.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => onNavigate('product-detail', { productId: prod.id })}
                        className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex gap-5"
                      >
                        <div className="w-40 h-40 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative shrink-0">
                          <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                          {prod.discount > 0 && (
                            <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                              -{prod.discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                {prod.category} • {prod.brand}
                              </span>
                              <button
                                onClick={(e) => handleToggleWishlist(prod.id, e)}
                                className={`p-1.5 rounded-full border shadow-sm transition-all focus:outline-none ${
                                  isWished
                                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-1.5 hover:text-orange-500 transition-colors">
                              {prod.title}
                            </h3>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                              <div className="flex items-center text-yellow-500 gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <strong className="font-semibold">{prod.rating}</strong>
                              </div>
                              <span>•</span>
                              <span>{prod.salesCount}+ sold</span>
                              <span>•</span>
                              <span className="text-slate-500 dark:text-slate-400 font-semibold">Store: <strong className="text-orange-500">{prod.storeName}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between border-t border-slate-50 dark:border-slate-800/40 pt-3">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                                  €{salePrice.toFixed(2)}
                                </span>
                                {prod.discount > 0 && (
                                  <span className="text-xs text-slate-400 line-through">
                                    €{prod.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400">VAT incl. • {prod.shippingCost === 0 ? 'Free Shipping' : `Delivery: €${prod.shippingCost.toFixed(2)}`}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod, e);
                              }}
                              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {filteredList.map((prod) => {
                    const salePrice = prod.price * (1 - prod.discount / 100);
                    const isWished = wishlist.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => onNavigate('product-detail', { productId: prod.id })}
                        className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3.5 cursor-pointer shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-300 relative group flex flex-col justify-between"
                      >
                        <div>
                          <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5">
                            <button
                              onClick={(e) => handleToggleWishlist(prod.id, e)}
                              className={`p-2 rounded-full border shadow-sm transition-all focus:outline-none ${
                                isWished
                                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                                  : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {prod.discount > 0 && (
                            <span className="absolute top-3.5 left-3.5 z-10 bg-orange-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                              -{prod.discount}% OFF
                            </span>
                          )}

                          <div className="w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative mb-3">
                            <img src={prod.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                          </div>

                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            {prod.category}
                          </span>

                          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug mb-1">
                            {prod.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                            <div className="flex items-center text-yellow-500 gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <strong className="font-semibold">{prod.rating}</strong>
                            </div>
                            <span>•</span>
                            <span>{prod.salesCount}+ sold</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-4 text-[10px] border-t border-slate-50 dark:border-slate-900/50 pt-2.5">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">By <strong className="text-orange-500">{prod.storeName}</strong></span>
                            {prod.shippingCost === 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-1.5 py-0.2 rounded">Free Del</span>
                            ) : (
                              <span className="text-slate-400 font-semibold">Del: €{prod.shippingCost.toFixed(2)}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                  €{salePrice.toFixed(2)}
                                </span>
                                {prod.discount > 0 && (
                                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                                    €{prod.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400">VAT incl.</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod, e);
                              }}
                              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-12 font-sans transition-colors duration-200">
      {/* Quick Add Visual Toast */}
      <div 
        id="quick-toast" 
        className="fixed bottom-10 left-10 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold py-3 px-5 rounded-xl shadow-2xl transition-all duration-300 opacity-0 translate-y-2 flex items-center gap-2 pointer-events-none"
      >
        <span className="text-orange-500">✔</span> Product successfully added to shopping cart!
      </div>

      {/* Hero Banner Grid (Desktop layout) */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Category Sidebar (adjacent to slider in AliExpress style) */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hidden lg:block h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="text-orange-500 text-base">🛒</span> Malta Aisles
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onNavigate('search', { category: cat.name })}
                  className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-900/60 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  {cat.count > 0 && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-400 dark:text-slate-500 px-1.5 py-0.2 rounded-full">
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-orange-500 font-extrabold flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-orange-500" /> Buyer Protection 100% Guaranteed
            </p>
          </div>
        </div>

        {/* Hero Banner Slider */}
        <div className="lg:col-span-3 relative bg-slate-900 rounded-2xl overflow-hidden h-[260px] sm:h-[380px] shadow-md group">
          <img 
            src={CAROUSEL_SLIDES[activeSlide].image} 
            alt="" 
            className="w-full h-full object-cover opacity-60 absolute inset-0 transition-all duration-700 ease-in-out scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"></div>
          
          {/* Slide Text Content */}
          <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 max-w-lg z-10 text-white">
            <span className="bg-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              {CAROUSEL_SLIDES[activeSlide].tag}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-3 mb-2 tracking-tight drop-shadow-sm leading-none">
              {CAROUSEL_SLIDES[activeSlide].title}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm drop-shadow font-medium">
              {CAROUSEL_SLIDES[activeSlide].subtitle}
            </p>
            <button
              onClick={() => {
                const act = CAROUSEL_SLIDES[activeSlide].action;
                onNavigate(act.view, act.params);
              }}
              className="mt-4 sm:mt-6 bg-white hover:bg-orange-500 text-slate-900 hover:text-white text-xs font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 transform scale-95 hover:scale-100 shadow-lg"
            >
              {CAROUSEL_SLIDES[activeSlide].btnText}
            </button>
          </div>

          {/* Manual controls */}
          <button
            onClick={() => setActiveSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeSlide === idx ? 'w-5 bg-orange-500' : 'bg-white/50'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. FLASH DEALS AREA */}
      <div className="max-w-7xl mx-auto px-4 mt-2 mb-8">
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          {/* Header row with clock */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-1.5">
                  Flash Deals <span className="bg-yellow-400 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Hot</span>
                </h2>
                <p className="text-[11px] text-red-100">Mediterranean super savings, limited quantities!</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold bg-slate-950/30 rounded-full py-1.5 px-4 self-stretch sm:self-auto justify-center">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-[11px] text-red-200 uppercase tracking-wider font-bold">Ends In:</span>
              <div className="flex items-center gap-1 font-mono">
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-black text-xs sm:text-sm">{formatTime(timeLeft.hours)}</span>
                <span className="text-yellow-300 font-black">:</span>
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-black text-xs sm:text-sm">{formatTime(timeLeft.minutes)}</span>
                <span className="text-yellow-300 font-black">:</span>
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-black text-xs sm:text-sm">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          {/* Flash Deals Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {flashDeals.map((prod) => {
              const salePrice = prod.price * (1 - prod.discount / 100);
              return (
                <div 
                  key={prod.id}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="bg-white dark:bg-slate-950 rounded-xl p-3 text-slate-800 dark:text-slate-100 cursor-pointer hover:shadow-2xl transition-all duration-300 relative border border-white/5 group flex flex-col justify-between"
                >
                  <div>
                    {/* Badge */}
                    <span className="absolute top-2 left-2 z-10 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase shadow-sm">
                      <BadgePercent className="w-3 h-3" /> -{prod.discount}% OFF
                    </span>
                    
                    {/* Image */}
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative mb-2.5">
                      <img 
                        src={prod.images[0]} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300 line-clamp-2 min-h-[32px] leading-tight mb-1">
                      {prod.title}
                    </h3>

                    {/* Store / Rating */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mb-2">
                      <span className="font-bold text-orange-600 dark:text-orange-400">{prod.storeName}</span>
                      <span>•</span>
                      <span className="flex items-center text-yellow-500 font-semibold gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> {prod.rating}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Progress Bar (Simulated stock status) */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                        <span>Left: <strong>{prod.stock}</strong> items</span>
                        <span className="text-red-500 font-bold">Selling Fast</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-orange-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (prod.stock / 200) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Price and Cart Quick Add */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900 dark:text-white">€{salePrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 line-through">€{prod.price.toFixed(2)}</span>
                        </div>
                        <span className="text-[8px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold">Local Stock</span>
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(prod, e)}
                        className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md hover:scale-105 active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. SUPER DEALS SLIDER GRID */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase text-xs tracking-wider">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Super Deals Zone
            </h3>
            <span className="text-[11px] text-slate-400">High Discount Classics</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {superDeals.map((prod) => {
              const salePrice = prod.price * (1 - prod.discount / 100);
              return (
                <div
                  key={prod.id}
                  onClick={() => onNavigate('product-detail', { productId: prod.id })}
                  className="group cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden mb-2">
                    <img src={prod.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                      -{prod.discount}%
                    </span>
                  </div>
                  <h4 className="text-[11px] font-semibold truncate text-slate-700 dark:text-slate-300">{prod.title}</h4>
                  <p className="text-xs font-black mt-0.5">€{salePrice.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. MAIN CATALOG BLOCK (With tabs) */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wide transition-all border-b-2 px-1 focus:outline-none ${
              activeTab === 'recommended'
                ? 'border-orange-500 text-orange-500 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recommended For You
          </button>
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wide transition-all border-b-2 px-1 focus:outline-none ${
              activeTab === 'bestsellers'
                ? 'border-orange-500 text-orange-500 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wide transition-all border-b-2 px-1 focus:outline-none ${
              activeTab === 'new'
                ? 'border-orange-500 text-orange-500 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            New Arrivals
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {getFilteredProducts().map((prod) => {
            const salePrice = prod.price * (1 - prod.discount / 100);
            const isWished = wishlist.includes(prod.id);
            return (
              <div
                key={prod.id}
                onClick={() => onNavigate('product-detail', { productId: prod.id })}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3.5 cursor-pointer shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-slate-700 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  {/* Action overlay buttons (Wishlist & Quick View) */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleWishlist(prod.id, e)}
                      className={`p-2 rounded-full border shadow-sm transition-all focus:outline-none ${
                        isWished
                          ? 'bg-rose-50 border-rose-200 text-rose-500'
                          : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Discount Badge */}
                  {prod.discount > 0 && (
                    <span className="absolute top-3.5 left-3.5 z-10 bg-orange-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                      -{prod.discount}% OFF
                    </span>
                  )}

                  {/* Main Product Image */}
                  <div className="w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative mb-3">
                    <img 
                      src={prod.images[0]} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>

                  {/* Category / Brand */}
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {prod.category}
                  </span>

                  {/* Product Title */}
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug mb-1">
                    {prod.title}
                  </h3>

                  {/* Rating / Sales */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                    <div className="flex items-center text-yellow-500 gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <strong className="font-semibold">{prod.rating}</strong>
                    </div>
                    <span>•</span>
                    <span>{prod.salesCount}+ sold</span>
                  </div>
                </div>

                <div>
                  {/* Seller / Shipping Badge */}
                  <div className="flex justify-between items-center mb-4 text-[10px] border-t border-slate-50 dark:border-slate-900/50 pt-2.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">By <strong className="text-orange-500">{prod.storeName}</strong></span>
                    {prod.shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-1.5 py-0.2 rounded">Free Del</span>
                    ) : (
                      <span className="text-slate-400">Del: €{prod.shippingCost.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Pricing Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          €{salePrice.toFixed(2)}
                        </span>
                        {prod.discount > 0 && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                            €{prod.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400">VAT incl.</span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
