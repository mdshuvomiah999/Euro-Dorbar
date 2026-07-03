import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { Product, Seller, Store } from '../types';
import { Star, Heart, ShoppingCart, Store as StoreIcon, ShieldCheck, Phone, Mail, FileText } from 'lucide-react';

interface BuyerStoreViewProps {
  sellerId: string;
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function BuyerStoreView({ sellerId, onNavigate, onStateChange, stateTrigger }: BuyerStoreViewProps) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const sell = db.getSellers().find(s => s.id === sellerId);
    if (sell) {
      setSeller(sell);
      
      const st = db.getStores().find(s => s.sellerId === sell.id);
      if (st) {
        setStore(st);
        setFollowers(st.followersCount || 100);
      }

      // Load products for this store
      const prods = db.getProducts().filter(p => p.sellerId === sell.id && p.status === 'active');
      setProducts(prods);
    }
    setWishlist(db.getWishlist());
  }, [sellerId, stateTrigger]);

  if (!seller || !store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 font-bold">Store not found or is currently suspended.</p>
        <button onClick={() => onNavigate('home')} className="mt-4 text-orange-500 hover:underline">Return Home</button>
      </div>
    );
  }

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
  };

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
    alert('Product successfully added to cart!');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. STORE HERO BANNER */}
      <div className="relative w-full h-[180px] sm:h-[280px] bg-slate-900 overflow-hidden">
        <img src={store.banner} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        {/* Overlaid Store branding metadata */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img src={store.logo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/10 shadow-lg bg-white shrink-0" />
            <div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <StoreIcon className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500 fill-current" /> {store.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
                {store.description}
              </p>
              
              <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start text-xs font-semibold text-slate-200">
                <span className="text-yellow-400 flex items-center gap-0.5"><Star className="w-4 h-4 fill-current" /> 4.8 Store Rating</span>
                <span>•</span>
                <span>{followers} Followers</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 justify-center">
            <button
              onClick={handleFollowToggle}
              className={`px-5 py-2 rounded-full font-black text-xs border shadow-md transition-all ${
                isFollowing
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-800 border-white/20 hover:bg-slate-50'
              }`}
            >
              {isFollowing ? 'Following Store' : '+ Follow Store'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Info Cards */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Store Contacts</h3>
            
            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="truncate">{store.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{store.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider text-[10px]">Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Store Policies Card */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Merchant Policies</h3>
            
            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <p className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4 text-orange-500" /> Shipping & Fulfillment
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{store.policies.shipping}</p>
              </div>

              <div className="border-t border-slate-50 dark:border-slate-800/40 pt-3">
                <p className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4 text-orange-500" /> Exchanges & Returns
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{store.policies.returns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Products list */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">Published Products ({products.length})</h2>
            <span className="text-xs text-slate-400">Showing local physical warehouse stock</span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
              <p className="text-slate-400 text-xs font-bold">This store currently has no active product listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => {
                const salePrice = prod.price * (1 - prod.discount / 100);
                const isWished = wishlist.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => onNavigate('product-detail', { productId: prod.id })}
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-3 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between"
                  >
                    <div>
                      {/* Wish button */}
                      <button
                        onClick={(e) => handleToggleWishlist(prod.id, e)}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm focus:outline-none transition-colors ${
                          isWished
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isWished ? 'fill-current' : ''}`} />
                      </button>

                      <div className="w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative mb-2.5">
                        <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>

                      <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[32px] leading-tight mb-1">
                        {prod.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                        <div className="flex items-center text-yellow-500 gap-0.5 font-bold">
                          <Star className="w-3 h-3 fill-current" /> {prod.rating}
                        </div>
                        <span>•</span>
                        <span>{prod.salesCount}+ sold</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-2">
                        <div>
                          <p className="text-xs sm:text-sm font-black">€{salePrice.toFixed(2)}</p>
                          {prod.discount > 0 && (
                            <p className="text-[9px] text-slate-400 line-through">€{prod.price.toFixed(2)}</p>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
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
  );
}
