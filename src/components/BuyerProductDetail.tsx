import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { Product, Seller, Review, User, CartItem } from '../types';
import { 
  Star, Heart, ShoppingCart, Truck, ShieldCheck, 
  MessageSquare, ChevronRight, Store, ArrowLeft, MessageCircle, HelpCircle,
  Play, RotateCcw, Volume2, Maximize2, ChevronLeft, X
} from 'lucide-react';

interface BuyerProductDetailProps {
  productId: string;
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function BuyerProductDetail({ productId, onNavigate, onStateChange, stateTrigger }: BuyerProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Advanced media states
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'photo' | 'video' | '360'>('photo');
  const [angle360, setAngle360] = useState(0);

  // Q&A states
  const [questions, setQuestions] = useState<{ id: string; user: string; text: string; answer: string | null; createdAt: string }[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  useEffect(() => {
    const prod = db.getProducts().find(p => p.id === productId);
    if (prod) {
      setProduct(prod);
      setActiveImage(prod.images[0]);
      
      // Load color and size defaults if available
      if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
      if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);

      // Load Seller Info
      const sell = db.getSellers().find(s => s.id === prod.sellerId);
      if (sell) {
        setSeller(sell);
        const store = db.getStores().find(s => s.sellerId === sell.id);
        setFollowers(store?.followersCount || 100);
      }

      // Load Reviews
      const revs = db.getReviews().filter(r => r.productId === prod.id);
      setReviews(revs);

      // Load Wishlist state
      setIsWished(db.getWishlist().includes(prod.id));

      // Load Q&As
      const localQAKey = `mm_product_qa_${prod.id}`;
      const savedQA = localStorage.getItem(localQAKey);
      if (savedQA) {
        setQuestions(JSON.parse(savedQA));
      } else {
        // Pre-seeded Q&As
        const seeded = [
          {
            id: 'qa1',
            user: 'Kurt V.',
            text: 'Is delivery actually fast across Malta?',
            answer: 'Yes! We ship from our local warehouse in Valletta. Delivery usually takes 24 hours to central localities and Gozo.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'qa2',
            user: 'Marie S.',
            text: 'Does this item include EU standard wall adapter plugs?',
            answer: 'Yes, all electronic devices shipped on EuroDorbar come with standard BS 1363 (three-pin G plug) or appropriate EU adapters.',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        localStorage.setItem(localQAKey, JSON.stringify(seeded));
        setQuestions(seeded);
      }
    }
    
    setCurrentUser(db.getCurrentUser());
  }, [productId, stateTrigger]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 font-bold">Product not found or has been draft-archived.</p>
        <button onClick={() => onNavigate('home')} className="mt-4 text-orange-500 hover:underline">Return Home</button>
      </div>
    );
  }

  const salePrice = product.price * (1 - product.discount / 100);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const handleToggleWishlist = () => {
    let wish = db.getWishlist();
    if (isWished) {
      wish = wish.filter(id => id !== product.id);
      setIsWished(false);
    } else {
      wish.push(product.id);
      setIsWished(true);
    }
    db.setWishlist(wish);
    onStateChange();
  };

  const handleAddToCart = (buyNow = false) => {
    const cart = db.getCart();
    const existing = cart.find(item => 
      item.productId === product.id && 
      item.color === selectedColor && 
      item.size === selectedSize
    );

    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        alert(`Cannot exceed available stock of ${product.stock} items.`);
        return;
      }
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        sellerId: product.sellerId,
        storeName: product.storeName,
        title: product.title,
        image: product.images[0],
        price: product.price,
        discount: product.discount,
        shippingCost: product.shippingCost,
        quantity: quantity,
        color: selectedColor || undefined,
        size: selectedSize || undefined
      });
    }

    db.setCart(cart);
    onStateChange();

    if (buyNow) {
      onNavigate('cart');
    } else {
      alert('Product added to shopping cart!');
    }
  };

  const handleChatInitiate = () => {
    const user = db.getCurrentUser();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (user.id === seller?.userId) {
      alert('You cannot chat with yourself.');
      return;
    }

    // Seed initial message if thread empty
    const sellerUser = db.getUsers().find(u => u.role === 'seller' && u.email === seller?.email);
    if (sellerUser) {
      const chatId = `${user.id}_${seller?.id}`;
      const existingMsg = db.getMessages().find(m => m.chatId === chatId);
      if (!existingMsg) {
        db.sendMessage(
          user.id,
          sellerUser.id,
          `Hi! I am interested in your product: "${product.title}". Is it available?`
        );
      }
      onNavigate('account', { tab: 'messages', chatId });
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getCurrentUser();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please write a comment.');
      return;
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      buyerId: user.id,
      buyerName: user.name,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    const allRevs = db.getReviews();
    allRevs.unshift(newReview);
    db.setReviews(allRevs);

    // Dynamic product rating recalculation
    const prodRevs = allRevs.filter(r => r.productId === product.id);
    const avgRating = prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length;
    
    const allProducts = db.getProducts();
    const pIdx = allProducts.findIndex(p => p.id === product.id);
    if (pIdx !== -1) {
      allProducts[pIdx].rating = Number(avgRating.toFixed(1));
      allProducts[pIdx].reviewsCount = prodRevs.length;
      db.setProducts(allProducts);
      setProduct(allProducts[pIdx]);
    }

    // Add notification to seller
    if (seller) {
      db.addNotification(
        seller.id,
        'New Product Review',
        `Buyer ${user.name} rated "${product.title}" ${reviewRating} stars.`,
        'review'
      );
    }

    setReviews(prodRevs);
    setReviewComment('');
    alert('Review submitted successfully!');
    onStateChange();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Breadcrumbs Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold">
          <button onClick={() => onNavigate('home')} className="hover:text-orange-500">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => onNavigate('search', { category: product.category })} className="hover:text-orange-500">{product.category}</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px] text-slate-400 font-medium">{product.title}</span>
        </div>
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 hover:text-orange-500 font-bold bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* L1: PRODUCT IMAGES (Left 5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Media Mode Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold border border-slate-200/50 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setMediaMode('photo')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                mediaMode === 'photo'
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Photos
            </button>
            <button
              type="button"
              onClick={() => setMediaMode('video')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
                mediaMode === 'video'
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Play className="w-3 h-3 fill-current" /> Video
            </button>
            <button
              type="button"
              onClick={() => setMediaMode('360')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
                mediaMode === '360'
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <RotateCcw className="w-3 h-3" /> 360° View
            </button>
          </div>

          {/* MAIN MEDIA COMPONENT BOX */}
          <div className="w-full aspect-square bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden relative shadow-sm group">
            {mediaMode === 'photo' && (
              <div 
                className="w-full h-full relative cursor-zoom-in overflow-hidden"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  setZoomPos({ x, y });
                }}
                onClick={() => {
                  const imgIdx = product.images.indexOf(activeImage);
                  setLightboxIndex(imgIdx !== -1 ? imgIdx : 0);
                  setLightboxOpen(true);
                }}
              >
                {/* Regular Image */}
                <img 
                  src={activeImage} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${zoomActive ? 'opacity-0' : 'opacity-100'}`} 
                  alt={product.title} 
                />

                {/* Magnified Hover Zoom */}
                {zoomActive && (
                  <div 
                    className="absolute inset-0 bg-no-repeat scale-105 transition-transform duration-100"
                    style={{
                      backgroundImage: `url(${activeImage})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '200%',
                    }}
                  />
                )}

                {/* Zoom Helper Corner Label */}
                <div className="absolute bottom-3 left-3 bg-slate-950/70 text-white font-bold text-[9px] px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Maximize2 className="w-2.5 h-2.5" /> Hover to Zoom / Click to Expand
                </div>

                {/* Lightbox Trigger Corner Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const imgIdx = product.images.indexOf(activeImage);
                    setLightboxIndex(imgIdx !== -1 ? imgIdx : 0);
                    setLightboxOpen(true);
                  }}
                  className="absolute bottom-3 right-3 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg hover:scale-105 text-slate-600 dark:text-slate-300 transition-transform"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {mediaMode === 'video' && (
              <div className="w-full h-full bg-slate-900 flex flex-col justify-between p-4 relative text-white">
                {/* Animated video graphics */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
                  <div className="w-64 h-64 border-4 border-dashed border-orange-500 rounded-full animate-spin-slow" />
                </div>

                <div className="flex justify-between items-center z-10">
                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Live Demo
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">1080p HD</span>
                </div>

                {/* Video main showcase product rotate */}
                <div className="flex flex-col items-center justify-center space-y-3 z-10">
                  <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-orange-500/30 bg-slate-950 p-2 animate-bounce-slow">
                    <img src={activeImage} className="w-full h-full object-cover rounded-xl" alt="" />
                  </div>
                  <p className="text-[11px] font-bold text-orange-400 text-center uppercase tracking-wider animate-pulse">
                    🎥 Displaying 1-Minute Live Demo Walkthrough
                  </p>
                </div>

                {/* Custom Video controls bar */}
                <div className="bg-slate-950/85 backdrop-blur-md p-2 rounded-xl flex items-center justify-between gap-3 text-xs z-10 border border-slate-800">
                  <button className="text-orange-500 hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                  <span className="font-mono text-[9px] text-slate-300 shrink-0">0:18 / 1:12</span>
                  <button className="text-slate-300 hover:text-white">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {mediaMode === '360' && (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col justify-between p-4 relative">
                <div className="text-center z-10">
                  <span className="text-[10px] bg-orange-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Interactive 360° Rotator
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Use slider to spin product</p>
                </div>

                {/* Draggable product container */}
                <div className="flex items-center justify-center my-auto py-2">
                  <div 
                    className="w-48 h-48 rounded-2xl bg-white dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800 transition-all duration-200"
                    style={{
                      transform: `rotateY(${angle360}deg) skewY(${angle360 / 30}deg)`,
                      boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.15)',
                    }}
                  >
                    <img src={activeImage} className="w-full h-full object-cover rounded-xl" alt="" />
                  </div>
                </div>

                {/* Rotational Trackbar Slider */}
                <div className="space-y-2 z-10">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Angle: {angle360}°</span>
                    <span>360° Spin Tracker</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle360}
                    onChange={(e) => setAngle360(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* GALLERY THUMBNAILS ROW */}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMediaMode('photo');
                  setActiveImage(img);
                }}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white shrink-0 transition-all relative ${
                  mediaMode === 'photo' && activeImage === img ? 'border-orange-500 scale-95 shadow-sm' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
                {idx === 1 && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Logistics Summary Panel */}
          <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Shipping cost: {product.shippingCost === 0 ? 'Free Delivery' : `€${product.shippingCost.toFixed(2)}`}</p>
                <p className="text-slate-400 mt-0.5">Estimated delivery: {product.shippingTime} with tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-800/40 pt-2.5">
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">7-Day Seller Warranty</p>
                <p className="text-slate-400 mt-0.5">Contact seller directly if item doesn't match descriptions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* L2: DETAILS COLUMN (Center 7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            {/* Top brand */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.brand} Brand
              </span>
              <span className="text-slate-400 text-[10px] font-mono font-semibold">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {product.title}
            </h1>

            {/* Rating / Orders */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center text-yellow-500 gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} 
                    />
                  ))}
                </div>
                <strong className="font-bold text-slate-800 dark:text-slate-200">{product.rating}</strong>
                <span className="text-slate-400">({reviews.length} customer reviews)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-semibold">{product.salesCount} sold</span>
            </div>

            {/* Pricing Panel */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">€{salePrice.toFixed(2)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xs sm:text-sm text-slate-400 line-through">€{product.price.toFixed(2)}</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                      -{product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">VAT inclusive. local shipping rates calculated during multi-vendor group checkout.</p>
            </div>

            {/* VARIANT COLORS SELECTION */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Select Color: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedColor}</strong></p>
                <div className="flex gap-2.5">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ${
                        selectedColor === col
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VARIANT SIZES SELECTION */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Select Size: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedSize}</strong></p>
                <div className="flex gap-2.5">
                  {product.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs w-10 h-10 rounded-xl border-2 font-bold flex items-center justify-center transition-all ${
                        selectedSize === sz
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quantity:</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => prev - 1)}
                    className="px-3.5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 font-extrabold text-sm text-slate-800 dark:text-slate-200">{quantity}</span>
                  <button 
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3.5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">({product.stock} items available)</span>
              </div>
            </div>

            {/* PURCHASE BUTTONS */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/40">
              <button
                onClick={() => handleAddToCart(false)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/60 font-extrabold py-3 px-4 rounded-xl shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Cart
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                Buy Now
              </button>
            </div>

            {/* Quick Favorite */}
            <button
              onClick={handleToggleWishlist}
              className={`w-full py-2 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                isWished 
                  ? 'bg-rose-50 border-rose-200 text-rose-500' 
                  : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
              {isWished ? 'Added to My Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* SELLER STORE MINI CARD */}
          {seller && (
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                <img src={seller.logo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1">
                    <Store className="w-4 h-4 text-orange-500" /> {seller.storeName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-1 truncate max-w-sm">{seller.description}</p>
                  
                  <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start text-[11px] font-semibold">
                    <span className="text-yellow-500 flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-current" /> 4.8 Rating</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{followers} Followers</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 shrink-0 self-stretch sm:self-auto justify-center">
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                    isFollowing
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </button>

                <button
                  onClick={handleChatInitiate}
                  className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-colors"
                  title="Message Seller"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('store', { sellerId: seller.id })}
                  className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
                >
                  Visit Store
                </button>
              </div>
            </div>
          )}

          {/* PRODUCT DESCRIPTION / SPECS TABS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2.5 border-b border-slate-50 dark:border-slate-800 mb-3.5">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2.5 border-b border-slate-50 dark:border-slate-800 mb-3.5">
                  Specifications
                </h3>
                <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {product.specifications.map((spec, idx) => (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                          <td className="bg-slate-50 dark:bg-slate-900/40 font-bold px-4 py-2.5 text-slate-500 w-1/3">{spec.key}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* REVIEWS SECTION */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2.5 border-b border-slate-50 dark:border-slate-800 mb-3.5 flex items-center justify-between">
              Customer Reviews <span>({reviews.length})</span>
            </h3>

            {/* List Reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No reviews yet for this product. Be the first to leave feedback!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="font-bold text-slate-700 dark:text-slate-300">{rev.buyerName}</strong>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="flex text-yellow-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>

                    {/* Seller reply */}
                    {rev.reply && (
                      <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border-l-2 border-orange-500 mt-2 text-xs">
                        <p className="font-extrabold text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-wide">Store Owner Reply:</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{rev.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleAddReview} className="border-t border-slate-50 dark:border-slate-800/40 pt-5 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wide">Write a Review</h4>
              
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-yellow-500 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      placeholder="Share your experience with this item..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 text-center rounded-xl border">
                  <p className="text-xs text-slate-500 mb-2">You must be logged in to leave a review.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-orange-600 text-xs font-bold hover:underline"
                  >
                    Login / Register
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* PRODUCT QUESTIONS & ANSWERS (Q&A) SECTION */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6 mt-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2.5 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-500" /> Questions & Answers ({questions.length})
            </h3>

            {/* List existing Q&As */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No questions asked yet. Have doubts? Ask the seller or community!</p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-start">
                        <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] px-1.5 py-0.5 rounded-sm shrink-0">Q</span>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{q.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 font-medium">By {q.user}</span>
                    </div>

                    <div className="flex gap-2 items-start pl-2 border-l border-slate-200 dark:border-slate-800">
                      <span className="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-extrabold text-[10px] px-1.5 py-0.5 rounded-sm shrink-0">A</span>
                      {q.answer ? (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{q.answer}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-medium">Pending answer from seller...</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ask a question form */}
            <div className="border-t border-slate-50 dark:border-slate-800/40 pt-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wide">Have a question?</h4>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Ask about shipping, material, specifications..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-200 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newQuestionText.trim()) {
                      alert('Please enter a valid question.');
                      return;
                    }
                    const userName = currentUser ? currentUser.name : 'Guest Buyer';
                    const newQA = {
                      id: `qa_${Date.now()}`,
                      user: userName,
                      text: newQuestionText.trim(),
                      answer: 'Thanks for your question! The store manager will review and answer within 12 hours.',
                      createdAt: new Date().toISOString()
                    };
                    const updated = [newQA, ...questions];
                    setQuestions(updated);
                    if (product) {
                      localStorage.setItem(`mm_product_qa_${product.id}`, JSON.stringify(updated));
                    }
                    setNewQuestionText('');
                    alert('Your question has been posted successfully!');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-orange-500 dark:hover:bg-orange-600 font-bold text-xs px-5 rounded-xl transition-all"
                >
                  Ask Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col justify-between p-6 select-none text-white">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400">
              Image {lightboxIndex + 1} of {product.images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-800 text-slate-300 hover:text-white hover:scale-105 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central image view */}
          <div className="flex-1 flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
            <button
              onClick={() => {
                setLightboxIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-h-[70vh] max-w-[80vw] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl relative bg-slate-950 p-2">
              <img
                src={product.images[lightboxIndex]}
                className="max-h-[65vh] object-contain mx-auto rounded-xl select-none"
                alt=""
              />
            </div>

            <button
              onClick={() => {
                setLightboxIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer thumbnails row */}
          <div className="flex justify-center gap-3 pb-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-900 shrink-0 transition-all ${
                  lightboxIndex === idx ? 'border-orange-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
