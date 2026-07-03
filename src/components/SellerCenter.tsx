import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { 
  Product, Seller, Store, Order, Review, Coupon, 
  Notification, Message, InventoryLog, User, ProductVariant 
} from '../types';
import { 
  LayoutDashboard, ShoppingBag, Package, ListOrdered, Tag, 
  Star, MessageSquare, Truck, UserCheck, Shield, Plus, Edit, 
  Trash2, Copy, Upload, ToggleLeft, ToggleRight, FileText, 
  CheckCircle, ArrowRight, RefreshCw, Send, AlertTriangle 
} from 'lucide-react';

interface SellerCenterProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function SellerCenter({ onNavigate, onStateChange, stateTrigger }: SellerCenterProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'inventory' | 'orders' | 'store' | 'coupons' | 'reviews' | 'messages' | 'shipping' | 'profile'>('dashboard');
  const [seller, setSeller] = useState<Seller | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Lists state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newChatText, setNewChatText] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '', category: 'Consumer Electronics', brand: '', sku: '', description: '',
    price: 39.99, discount: 10, stock: 50, minOrder: 1, weight: 0.2, shippingCost: 0,
    shippingTime: '1-3 days', images: '', videoUrl: '', specs: '', colors: '', sizes: '', tags: ''
  });

  // Shipment overlay
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [shipCarrier, setShipCarrier] = useState('MaltaPost');
  const [shipTracking, setShipTracking] = useState('');

  // Review reply state
  const [activeReviewIdForReply, setActiveReviewIdForReply] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // Printable states
  const [invoicePrintOrder, setInvoicePrintOrder] = useState<Order | null>(null);
  const [labelPrintOrder, setLabelPrintOrder] = useState<Order | null>(null);

  // New coupon state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'percentage' as Coupon['type'], value: 10, minSpend: 30, expiryDate: '2026-12-31'
  });

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user || user.role !== 'seller') {
      onNavigate('login');
      return;
    }
    setCurrentUser(user);

    const sell = db.getSellers().find(s => s.userId === user.id);
    if (!sell) {
      // Not registered as seller yet
      onNavigate('seller-registration');
      return;
    }
    setSeller(sell);

    const st = db.getStores().find(s => s.sellerId === sell.id);
    if (st) setStore(st);

    // Load data
    const prods = db.getProducts().filter(p => p.sellerId === sell.id);
    setProducts(prods);

    const ords = db.getOrders().filter(o => o.sellerId === sell.id);
    setOrders(ords);

    const revs = db.getReviews().filter(r => prods.some(p => p.id === r.productId));
    setReviews(revs);

    const coups = db.getCoupons().filter(c => c.sellerId === sell.id);
    setCoupons(coups);

    const logs = db.getInventoryLogs().filter(l => prods.some(p => p.id === l.productId));
    setInventoryLogs(logs);

    // Load Chat threads for seller
    const threads = db.getChatThreads(user.id);
    setChatThreads(threads);
    if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].chatId);
    }
  }, [stateTrigger, activeTab]);

  // Load chat messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      setChatMessages(db.getChatMessages(activeThreadId));
    }
  }, [activeThreadId, stateTrigger]);

  if (!seller || !store) return null;

  // Seller dynamic analytics
  const analytics = db.getSellerAnalytics(seller.id);

  // ----------------- PRODUCT HANDLERS -----------------
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '', category: 'Consumer Electronics', brand: '', sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '', price: 29.99, discount: 0, stock: 100, minOrder: 1, weight: 0.15,
      shippingCost: 0, shippingTime: '1-3 days', images: '', videoUrl: '', specs: 'Brand: Malta\nCondition: New',
      colors: 'Black, White, Blue', sizes: '', tags: 'wearables, gadgets'
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      category: prod.category,
      brand: prod.brand,
      sku: prod.sku,
      description: prod.description,
      price: prod.price,
      discount: prod.discount,
      stock: prod.stock,
      minOrder: prod.minOrder,
      weight: prod.weight,
      shippingCost: prod.shippingCost,
      shippingTime: prod.shippingTime,
      images: prod.images.join(', '),
      videoUrl: prod.videoUrl || '',
      specs: prod.specifications.map(s => `${s.key}: ${s.value}`).join('\n'),
      colors: prod.colors.join(', '),
      sizes: prod.sizes.join(', '),
      tags: prod.tags.join(', ')
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const allProducts = db.getProducts();

    // Parse sub-arrays
    const imageList = productForm.images.split(',').map(s => s.trim()).filter(Boolean);
    const imagesArray = imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80'];
    
    const colorsArray = productForm.colors.split(',').map(s => s.trim()).filter(Boolean);
    const sizesArray = productForm.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const tagsArray = productForm.tags.split(',').map(s => s.trim()).filter(Boolean);

    const specsArray = productForm.specs.split('\n').map(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        return { key: line.substring(0, idx).trim(), value: line.substring(idx + 1).trim() };
      }
      return { key: 'Feature', value: line.trim() };
    }).filter(s => s.key);

    const draftStatus = 'active';

    if (editingProduct) {
      // Edit
      const pIdx = allProducts.findIndex(p => p.id === editingProduct.id);
      if (pIdx !== -1) {
        const prevStock = allProducts[pIdx].stock;
        
        allProducts[pIdx] = {
          ...allProducts[pIdx],
          title: productForm.title,
          category: productForm.category,
          brand: productForm.brand,
          sku: productForm.sku,
          description: productForm.description,
          price: Number(productForm.price),
          discount: Number(productForm.discount),
          stock: Number(productForm.stock),
          minOrder: Number(productForm.minOrder),
          weight: Number(productForm.weight),
          shippingCost: Number(productForm.shippingCost),
          shippingTime: productForm.shippingTime,
          images: imagesArray,
          videoUrl: productForm.videoUrl || undefined,
          specifications: specsArray,
          colors: colorsArray,
          sizes: sizesArray,
          tags: tagsArray,
          updatedAt: new Date().toISOString()
        } as any;

        // Log stock difference
        const stockDiff = Number(productForm.stock) - prevStock;
        if (stockDiff !== 0) {
          db.logInventory(
            editingProduct.id,
            productForm.title,
            stockDiff,
            `Manual Stock Edit: ${stockDiff > 0 ? '+' : ''}${stockDiff}`
          );
        }

        db.setProducts(allProducts);
        alert('Product updated successfully!');
      }
    } else {
      // Add New
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        sellerId: seller.id,
        storeName: seller.storeName,
        title: productForm.title,
        category: productForm.category,
        brand: productForm.brand,
        sku: productForm.sku,
        description: productForm.description,
        specifications: specsArray,
        images: imagesArray,
        videoUrl: productForm.videoUrl || undefined,
        price: Number(productForm.price),
        discount: Number(productForm.discount),
        stock: Number(productForm.stock),
        minOrder: Number(productForm.minOrder),
        weight: Number(productForm.weight),
        shippingCost: Number(productForm.shippingCost),
        shippingTime: productForm.shippingTime,
        variants: [
          colorsArray.length > 0 ? { name: 'Color', options: colorsArray } : null,
          sizesArray.length > 0 ? { name: 'Size', options: sizesArray } : null
        ].filter(Boolean) as ProductVariant[],
        colors: colorsArray,
        sizes: sizesArray,
        tags: tagsArray,
        status: draftStatus,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        reviewsCount: 0,
        salesCount: 0
      };

      allProducts.unshift(newProduct);
      db.setProducts(allProducts);

      // Log initial stock inventory
      db.logInventory(
        newProduct.id,
        newProduct.title,
        newProduct.stock,
        'Initial product listing stock seeded'
      );

      alert('Product listed successfully!');
    }

    setShowProductModal(false);
    onStateChange();
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const all = db.getProducts().filter(p => p.id !== productId);
      db.setProducts(all);
      onStateChange();
    }
  };

  const handleDuplicateProduct = (prod: Product) => {
    const all = db.getProducts();
    const copy: Product = {
      ...prod,
      id: `prod_${Date.now()}`,
      sku: `${prod.sku}-COPY`,
      title: `Copy of ${prod.title}`,
      createdAt: new Date().toISOString(),
      salesCount: 0,
      reviewsCount: 0,
      rating: 5.0
    };
    all.unshift(copy);
    db.setProducts(all);
    
    db.logInventory(copy.id, copy.title, copy.stock, 'Duplicated product listing');
    alert('Product duplicated successfully!');
    onStateChange();
  };

  const handleToggleDraft = (productId: string) => {
    const all = db.getProducts();
    const idx = all.findIndex(p => p.id === productId);
    if (idx !== -1) {
      all[idx].status = all[idx].status === 'active' ? 'draft' : 'active';
      db.setProducts(all);
      onStateChange();
    }
  };

  const handleBulkUpload = () => {
    // Inject a few more highly optimized mock tech accessories instantly!
    const bulk = [
      {
        id: `prod_bulk_1_${Date.now()}`,
        sellerId: seller.id,
        storeName: seller.storeName,
        title: 'Maltese Cross Filigree Pendant - Solid 925 Sterling Silver',
        category: 'Fashion & Clothing',
        brand: 'VallettaSilver',
        sku: 'FASH-MAL-FIL',
        description: 'Exquisite Maltese cross filigree pendant handwoven from solid 925 sterling silver in Valletta. Symbolizes Maltese heritage.',
        specifications: [{ key: 'Metal', value: '925 Sterling Silver' }, { key: 'Origin', value: 'Handmade Valletta' }],
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
        price: 49.00, discount: 0, stock: 30, minOrder: 1, weight: 0.05, shippingCost: 0, shippingTime: '1-2 days',
        variants: [], colors: [], sizes: [], tags: ['filigree', 'cross', 'silver', 'pendant'], status: 'active',
        createdAt: new Date().toISOString(), rating: 5.0, reviewsCount: 0, salesCount: 0
      },
      {
        id: `prod_bulk_2_${Date.now()}`,
        sellerId: seller.id,
        storeName: seller.storeName,
        title: 'Gozo Salt Pans Coarse Sea Salt - 1kg Linen Sack',
        category: 'Home & Garden',
        brand: 'GozoHarvest',
        sku: 'HOME-GOZ-SALT',
        description: 'Coarse Mediterranean sea salt harvested naturally from the 350-year old salt pans in Xwejni, Gozo.',
        specifications: [{ key: 'Weight', value: '1 Kilogram' }, { key: 'Source', value: 'Xwejni Salt Pans, Gozo' }],
        images: ['https://images.unsplash.com/photo-1518110168045-882e54f4f2f7?auto=format&fit=crop&w=600&q=80'],
        price: 9.99, discount: 15, stock: 200, minOrder: 1, weight: 1.0, shippingCost: 2.0, shippingTime: '1-3 days',
        variants: [], colors: [], sizes: [], tags: ['salt', 'gozo', 'culinary', 'organic'], status: 'active',
        createdAt: new Date().toISOString(), rating: 5.0, reviewsCount: 0, salesCount: 0
      }
    ];

    const all = db.getProducts();
    bulk.forEach(b => {
      all.unshift(b as any);
      db.logInventory(b.id, b.title, b.stock, 'Bulk Product Upload listed');
    });
    db.setProducts(all);
    alert('Bulk Upload Successful! 2 Maltese specialty listings have been listed in your store.');
    onStateChange();
  };


  // ----------------- ORDER HANDLERS -----------------
  const handleAcceptOrder = (orderId: string) => {
    const all = db.getOrders();
    const idx = all.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      all[idx].status = 'processing';
      all[idx].updatedAt = new Date().toISOString();
      db.setOrders(all);
      
      db.addNotification(
        all[idx].buyerId,
        'Your Order is Processing!',
        `Seller accepted Order #${orderId} and is currently preparing your parcel.`,
        'order'
      );

      alert('Order accepted. Preparing shipment.');
      onStateChange();
    }
  };

  const handlePackOrder = (orderId: string) => {
    const all = db.getOrders();
    const idx = all.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      all[idx].status = 'packed';
      all[idx].updatedAt = new Date().toISOString();
      db.setOrders(all);
      alert('Order packed and labeled. Ready for carrier dispatch.');
      onStateChange();
    }
  };

  const openShipModal = (order: Order) => {
    setShipmentOrder(order);
    setShipCarrier('MaltaPost');
    setShipTracking(`MP-${Math.floor(1000000 + Math.random() * 9000000)}-MT`);
  };

  const handleShipOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentOrder) return;

    const all = db.getOrders();
    const idx = all.findIndex(o => o.id === shipmentOrder.id);
    if (idx !== -1) {
      all[idx].status = 'shipped';
      all[idx].trackingNumber = shipTracking;
      all[idx].carrier = shipCarrier;
      all[idx].updatedAt = new Date().toISOString();
      db.setOrders(all);

      // Notify customer
      db.addNotification(
        all[idx].buyerId,
        'Order Dispatched/Shipped!',
        `Your parcel from ${seller.storeName} has been dispatched via ${shipCarrier}. Track: ${shipTracking}.`,
        'order'
      );

      alert('Order marked as shipped. Customer and tracking updated.');
      setShipmentOrder(null);
      onStateChange();
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Cancel this customer order? This issues a refund instantly.')) {
      const all = db.getOrders();
      const idx = all.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        all[idx].status = 'cancelled';
        all[idx].updatedAt = new Date().toISOString();
        db.setOrders(all);
        
        // Notify customer
        db.addNotification(
          all[idx].buyerId,
          'Order Cancelled',
          `Order #${orderId} was cancelled by the store owner. Escrow refunded.`,
          'order'
        );

        alert('Order cancelled and customer notified.');
        onStateChange();
      }
    }
  };


  // ----------------- REVIEWS AND COUPONS -----------------
  const handleReplyReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewReplyText.trim() || !activeReviewIdForReply) return;

    const all = db.getReviews();
    const idx = all.findIndex(r => r.id === activeReviewIdForReply);
    if (idx !== -1) {
      all[idx].reply = reviewReplyText;
      db.setReviews(all);
      
      // Notify buyer of reply
      db.addNotification(
        all[idx].buyerId,
        'Seller Replied to your review',
        `Store owner of ${seller.storeName} responded to your comment on "${all[idx].productTitle}".`,
        'review'
      );

      alert('Response published successfully!');
      setReviewReplyText('');
      setActiveReviewIdForReply(null);
      onStateChange();
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    const all = db.getCoupons();
    const newC: Coupon = {
      id: `coup_${Date.now()}`,
      sellerId: seller.id,
      code: couponForm.code.toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minSpend: Number(couponForm.minSpend),
      expiryDate: couponForm.expiryDate,
      usesCount: 0
    };

    all.push(newC);
    db.setCoupons(all);
    alert('Discount coupon listed successfully!');
    setShowCouponForm(false);
    onStateChange();
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Delete this store coupon?')) {
      const all = db.getCoupons().filter(c => c.id !== id);
      db.setCoupons(all);
      onStateChange();
    }
  };


  // ----------------- CHAT HANDLERS -----------------
  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !activeThreadId || !currentUser) return;

    const thread = chatThreads.find(t => t.chatId === activeThreadId);
    if (!thread) return;

    const sent = db.sendMessage(currentUser.id, thread.buyerId, newChatText);
    setChatMessages(prev => [...prev, sent]);
    setNewChatText('');
    onStateChange();
  };


  // ----------------- PROFILE HANDLERS -----------------
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Update seller and store in db
    const allSellers = db.getSellers();
    const sIdx = allSellers.findIndex(s => s.id === seller.id);
    if (sIdx !== -1) {
      allSellers[sIdx] = seller;
      db.setSellers(allSellers);
    }

    const allStores = db.getStores();
    const stIdx = allStores.findIndex(st => st.sellerId === seller.id);
    if (stIdx !== -1) {
      allStores[stIdx] = store;
      db.setStores(allStores);
    }

    alert('Store and Profile settings saved successfully!');
    onStateChange();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col md:flex-row">
      
      {/* 1. SELLER NAVIGATION BAR (LEFT SIDEBAR) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-400 border-r border-slate-800 shrink-0 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
            <span className="bg-red-600 text-white rounded p-1 text-xs font-black">🇲🇹 SC</span>
            <div>
              <h2 className="font-extrabold text-sm text-white leading-none">Seller Center</h2>
              <span className="text-[10px] text-orange-500 font-extrabold">{seller.storeName}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-orange-500" /> Dashboard Analytics
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'products' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500" /> Catalog Products
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'inventory' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4 text-orange-500" /> Stock Inventory
              </span>
              {products.some(p => p.stock <= 5) && (
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full animate-bounce">
                  Alert
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'orders' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <ListOrdered className="w-4 h-4 text-orange-500" /> Store Orders
              </span>
              {orders.filter(o => o.status === 'paid' || o.status === 'processing').length > 0 && (
                <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {orders.filter(o => o.status === 'paid' || o.status === 'processing').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'coupons' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Tag className="w-4 h-4 text-orange-500" /> Store Coupons
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'reviews' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Star className="w-4 h-4 text-orange-500" /> Product Reviews
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'messages' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Buyer Chats
              </span>
              {chatThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {chatThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'shipping' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4 text-orange-500" /> Shipping Settings
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                activeTab === 'profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-orange-500" /> Store Profile
            </button>
          </nav>
        </div>

        {/* Foot Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-full py-1.5 text-center text-[10px] text-orange-400 font-black border border-orange-500/30 rounded-lg hover:bg-orange-500 hover:text-white transition-all uppercase"
          >
            Switch to Buyer View
          </button>
          <div className="text-[10px] text-slate-600 text-center">
            EuroDorbar System v2.6
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
        
        {/* TAB: DASHBOARD ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Seller Operations</h1>
                <p className="text-slate-400 text-xs mt-0.5">AliExpress Seller Center dashboard interface</p>
              </div>
              <button 
                onClick={() => onStateChange()} 
                className="p-2 rounded-lg bg-white dark:bg-slate-950 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Today's Sales</span>
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">€{analytics.todaySales.toFixed(2)}</p>
                <span className="text-green-500 text-[10px] font-bold">↑ 14% vs yesterday</span>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Monthly Sales</span>
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">€{analytics.monthlySales.toFixed(2)}</p>
                <span className="text-green-500 text-[10px] font-bold">↑ 22% vs last month</span>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Pending Orders</span>
                <p className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{analytics.pendingOrders}</p>
                <span className="text-slate-400 text-[10px]">Needs packaging dispatch</span>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Escrow Released (Revenue)</span>
                <p className="text-lg sm:text-2xl font-black text-green-600 dark:text-green-400 mt-1">€{analytics.totalRevenue.toFixed(2)}</p>
                <span className="text-slate-400 text-[10px]">Released on Delivered status</span>
              </div>
            </div>

            {/* Revenue Analytics Chart (Dynamic Responsive SVG) */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-6">Daily Revenue Growth (7-Day Trend)</h3>
              
              {/* Responsive SVG Bar and Line graph */}
              <div className="w-full h-48 sm:h-64 relative flex items-end justify-between px-4 pb-6">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none text-[8px] text-slate-300 dark:text-slate-800/80">
                  <div className="border-b w-full"></div>
                  <div className="border-b w-full"></div>
                  <div className="border-b w-full"></div>
                </div>

                {/* SVG Polyline and bars */}
                {analytics.dailySalesData.map((data, idx) => {
                  // Calculate dynamic heights
                  const maxVal = Math.max(...analytics.dailySalesData.map(d => d.revenue)) || 100;
                  const percentHeight = maxVal > 0 ? (data.revenue / maxVal) * 80 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end z-10 space-y-2 group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold p-1 rounded absolute -top-1 shadow">
                        €{data.revenue.toFixed(2)}
                      </div>

                      {/* Bar */}
                      <div 
                        className="bg-orange-500 rounded-t-md hover:bg-orange-600 w-6 sm:w-12 transition-all"
                        style={{ height: `${percentHeight}%`, minHeight: '6px' }}
                      ></div>
                      
                      {/* Label */}
                      <span className="text-[10px] text-slate-400 font-semibold">{data.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Top Products & Store Visitors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Top Performing Products</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-[11px]">
                  {analytics.topProducts.map((p) => (
                    <div key={p.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 truncate max-w-sm">{p.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sales Volume: {p.sales} units • Stock Left: {p.stock}</p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">€{p.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No product sales logged yet.</p>
                  )}
                </div>
              </div>

              {/* Visitors & Conversion Rates */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-4 flex flex-col justify-between">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Traffic conversion analytics</h3>
                
                <div className="grid grid-cols-2 gap-4 py-4 text-center">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
                    <span className="text-slate-400 text-[10px]">Unique Visitors</span>
                    <p className="text-xl sm:text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{analytics.visitors}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
                    <span className="text-slate-400 text-[10px]">Conversion Rate</span>
                    <p className="text-xl sm:text-3xl font-black mt-1 text-orange-500">{analytics.conversionRate}%</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                  Traffic analytics derived dynamically based on customer click rates. List more coupons or discounts to drive conversions higher!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CATALOG PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header row */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Catalog</h1>
                <p className="text-slate-400 text-xs mt-0.5">List, modify, duplicate or draft listings</p>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={handleBulkUpload}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-slate-700 dark:text-slate-300"
                >
                  <Upload className="w-3.5 h-3.5" /> Bulk Malta Specials
                </button>

                <button
                  onClick={openAddProduct}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 animate-pulse" /> Add New Product
                </button>
              </div>
            </div>

            {/* Products Data Table */}
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-4 w-1/2">Product Information</th>
                      <th className="p-4 text-center">Price (Sale)</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-center">Sales</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-[11px]">
                    {products.map((prod) => {
                      const finalPrice = prod.price * (1 - prod.discount / 100);
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="p-4 flex gap-3 items-center">
                            <img src={prod.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-100" alt="" />
                            <div className="min-w-0">
                              <p className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{prod.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{prod.category} • SKU: {prod.sku}</p>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold">
                            <p className="text-slate-900 dark:text-white">€{finalPrice.toFixed(2)}</p>
                            {prod.discount > 0 && (
                              <p className="text-[9px] text-red-500 font-bold">-{prod.discount}% (Reg: €{prod.price})</p>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                              prod.stock <= 5 
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            }`}>
                              {prod.stock} left
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-500">{prod.salesCount} sold</td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleToggleDraft(prod.id)}>
                              {prod.status === 'active' ? (
                                <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 justify-center w-20">
                                  ● Active
                                </span>
                              ) : (
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 justify-center w-20">
                                  ● Draft
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => openEditProduct(prod)}
                              title="Edit listing"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              title="Duplicate listing"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-orange-500"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              title="Delete listing"
                              className="p-1.5 rounded hover:bg-rose-100/50 text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">You have no products listed. Click "Add New Product" to start!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STOCK INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Inventory Warehouse</h1>
                <p className="text-slate-400 text-xs mt-0.5">Manage stock volumes and review historical restocks</p>
              </div>
            </div>

            {/* Low stock alerts */}
            {products.some(p => p.stock <= 5) && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-400 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-bold">Low Stock Warning Alerts!</p>
                  <p className="mt-0.5 leading-relaxed">Some listed items are critically low in inventory. Restock them immediately to prevent automatic search listing delisting and checkout failure.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Quick Restock Table */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="p-4 w-1/2">Product SKU & Title</th>
                        <th className="p-4 text-center">Remaining Stock</th>
                        <th className="p-4 text-right">Quick Add Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-[11px]">
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td className="p-4 flex gap-3 items-center">
                            <img src={prod.images[0]} className="w-8 h-8 rounded-lg object-cover bg-slate-50" alt="" />
                            <div className="min-w-0">
                              <p className="text-slate-800 dark:text-slate-200 truncate">{prod.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-mono uppercase">SKU: {prod.sku}</p>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                              prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            }`}>
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => {
                                const qty = parseInt(prompt('Restock quantity to ADD?', '25') || '0');
                                if (qty > 0) {
                                  const all = db.getProducts();
                                  const idx = all.findIndex(p => p.id === prod.id);
                                  if (idx !== -1) {
                                    all[idx].stock += qty;
                                    db.setProducts(all);
                                    db.logInventory(prod.id, prod.title, qty, `Manual restocking`);
                                    alert('Restocked successfully!');
                                    onStateChange();
                                  }
                                }
                              }}
                              className="bg-slate-100 hover:bg-orange-500 dark:bg-slate-800 dark:hover:bg-orange-500 text-slate-700 dark:text-slate-300 hover:text-white font-extrabold px-3 py-1 rounded-lg border border-transparent transition-all text-[10px]"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Inventory Logs */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Warehouse Logs</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto font-semibold text-[10px]">
                  {inventoryLogs.map((log) => (
                    <div key={log.id} className="py-2.5 first:pt-0">
                      <div className="flex justify-between text-slate-800 dark:text-slate-200">
                        <span className="truncate max-w-[140px] font-bold">{log.productTitle}</span>
                        <span className={`font-black ${log.change > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                          {log.change > 0 ? `+${log.change}` : log.change} units
                        </span>
                      </div>
                      <p className="text-slate-400 text-[9px] mt-0.5">{log.reason} • {new Date(log.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {inventoryLogs.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No warehouse transactions logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STORE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Purchased Orders</h1>
                <p className="text-slate-400 text-xs mt-0.5">Manage customer shipments, print packing slips, update transit states</p>
              </div>
            </div>

            {/* List Seller Orders */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 text-xs space-y-4"
                >
                  {/* Row 1: Ref info */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-50 dark:border-slate-800/60 font-semibold">
                    <div>
                      <p className="text-[11px]">Order reference ID: <strong className="text-slate-950 dark:text-white font-black text-xs">{order.id}</strong></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Paid Date: {new Date(order.createdAt).toLocaleDateString()} by {order.buyerName} ({order.buyerEmail})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">State:</span>
                      {order.status === 'paid' && <span className="bg-green-100 text-green-700 dark:bg-green-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Paid (Pending Accept)</span>}
                      {order.status === 'processing' && <span className="bg-blue-100 text-blue-700 dark:bg-blue-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Processing</span>}
                      {order.status === 'packed' && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Packed (Labeled)</span>}
                      {order.status === 'shipped' && <span className="bg-orange-100 text-orange-700 dark:bg-orange-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Shipped (Transit)</span>}
                      {order.status === 'delivered' && <span className="bg-teal-100 text-teal-700 dark:bg-teal-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Delivered (Completed)</span>}
                      {order.status === 'cancelled' && <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">Cancelled (Refunded)</span>}
                    </div>
                  </div>

                  {/* Row 2: Customer Address and items details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-slate-50 dark:border-slate-800/60 text-[11px] font-semibold leading-relaxed">
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide mb-1">Shipping Address</p>
                      <p className="text-slate-800 dark:text-slate-200 font-bold">{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
                      <p className="text-slate-500">{order.shippingAddress.address}, {order.shippingAddress.city}, Malta ({order.shippingAddress.zipCode})</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide mb-1">Consignment Items</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300">x{item.quantity} {item.title} {item.color && `(${item.color})`}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">€{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-bold text-orange-500">
                        <span>Paid Total:</span>
                        <span>€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Shipping Transit specifics */}
                  {order.trackingNumber && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-mono text-slate-400 flex justify-between items-center">
                      <span>Logistics Carrier: <strong>{order.carrier}</strong></span>
                      <span>Consignment Tracking ID: <strong className="text-slate-800 dark:text-slate-100">{order.trackingNumber}</strong></span>
                    </div>
                  )}

                  {/* Row 4: Action triggers */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setInvoicePrintOrder(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-[10px]"
                      >
                        Print Packing Slip
                      </button>
                      <button
                        onClick={() => setLabelPrintOrder(order)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-[10px]"
                      >
                        Print Shipping Label
                      </button>
                    </div>

                    <div className="flex gap-2 self-stretch sm:self-auto justify-end">
                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] shadow"
                        >
                          Accept & Process Order
                        </button>
                      )}

                      {order.status === 'processing' && (
                        <button
                          onClick={() => handlePackOrder(order.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] shadow"
                        >
                          Mark as Packed & Labeled
                        </button>
                      )}

                      {order.status === 'packed' && (
                        <button
                          onClick={() => openShipModal(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-[10px] shadow flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Dispatch Shipment
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-[10px]"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-bold">You have not received any orders yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: STORE COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Discount Coupons</h1>
                <p className="text-slate-400 text-xs mt-0.5">List store-specific discount codes to drive traffic conversions</p>
              </div>
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Create Store Coupon
              </button>
            </div>

            {/* Coupon Form */}
            {showCouponForm && (
              <form onSubmit={handleSaveCoupon} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold items-end">
                <div className="space-y-1">
                  <label className="text-slate-400">Coupon Promo Code</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-none uppercase font-bold"
                    placeholder="MALTASAVE10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Type of Discount</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as Coupon['type'] })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Rate reduction (€)</option>
                    <option value="free_shipping">Free Shipping reduction</option>
                  </select>
                </div>

                {couponForm.type !== 'free_shipping' && (
                  <div className="space-y-1">
                    <label className="text-slate-400">Discount Value (Rate/Pct)</label>
                    <input
                      type="number"
                      required
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-slate-400">Minimum Spend Threshold (€)</label>
                  <input
                    type="number"
                    required
                    value={couponForm.minSpend}
                    onChange={(e) => setCouponForm({ ...couponForm, minSpend: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-orange-500 text-white font-extrabold py-2 px-4 rounded-xl transition-all w-full h-9"
                  >
                    Save Coupon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCouponForm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl transition-colors h-9"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Coupons list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div 
                  key={c.id} 
                  className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-xs space-y-3 relative group"
                >
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-950/20 text-orange-600 rounded-xl">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-wide text-slate-900 dark:text-white uppercase">{c.code}</h4>
                      <p className="text-[10px] text-slate-400">Coupon Code</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-300 font-semibold text-[11px] leading-relaxed">
                    <p>Type: <strong className="text-slate-800 dark:text-slate-100 uppercase">{c.type.replace('_', ' ')}</strong></p>
                    <p>Value: <strong className="text-slate-800 dark:text-slate-100">{c.type === 'free_shipping' ? 'Free Post' : c.type === 'percentage' ? `${c.value}% off` : `€${c.value} off`}</strong></p>
                    <p>Min Spend Required: <strong className="text-slate-800 dark:text-slate-100">€{c.minSpend}</strong></p>
                    <p>Active Uses: <strong className="text-slate-800 dark:text-slate-100">{c.usesCount} checked</strong></p>
                    <p className="text-slate-400 font-normal">Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <p className="text-slate-400 text-center py-4 w-full col-span-3">No active coupons listed in your store.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: PRODUCT REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Product Reviews</h1>
                <p className="text-slate-400 text-xs mt-0.5">Reply to buyers comments and check satisfaction levels</p>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-4 text-xs">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center font-semibold">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{rev.buyerName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Purchased item: <strong className="text-orange-500">{rev.productTitle}</strong></p>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex text-yellow-500 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{rev.comment}</p>

                  {/* Existing reply display */}
                  {rev.reply && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border-l-2 border-orange-500 font-semibold text-[11px] leading-relaxed">
                      <p className="text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-wide font-black">My store reply:</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{rev.reply}</p>
                    </div>
                  )}

                  {/* Reply Action */}
                  {!rev.reply && activeReviewIdForReply !== rev.id && (
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setActiveReviewIdForReply(rev.id)}
                        className="text-[10px] font-bold bg-orange-100 hover:bg-orange-200 text-orange-700 px-3.5 py-1.5 rounded-lg border border-transparent transition-all"
                      >
                        Write Reply response
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Report this comment to EuroDorbar Admin as false/spam?')) {
                            alert('Review reported to administrators. It will be audited shortly.');
                          }
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Report Fake Review
                      </button>
                    </div>
                  )}

                  {/* Reply Form */}
                  {activeReviewIdForReply === rev.id && (
                    <form onSubmit={handleReplyReview} className="space-y-2 pt-2 border-t">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Write Response text</label>
                      <textarea
                        required
                        value={reviewReplyText}
                        onChange={(e) => setReviewReplyText(e.target.value)}
                        placeholder="Thank you for your feedback! We appreciate..."
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-none"
                      ></textarea>
                      <div className="flex gap-2.5">
                        <button type="submit" className="bg-slate-800 text-white font-extrabold px-3 py-1 rounded-lg text-[10px]">Submit reply</button>
                        <button type="button" onClick={() => setActiveReviewIdForReply(null)} className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-lg text-[10px]">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-slate-400 text-center py-4">No product reviews logged yet for your store items.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: CHATS MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Customer Messaging</h1>
                <p className="text-slate-400 text-xs mt-0.5">Chat directly with buyers who are shopping or tracking orders</p>
              </div>
            </div>

            {chatThreads.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold">No active chat queries received from buyers yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden h-[420px] shadow-sm text-xs">
                {/* Threads Left panel */}
                <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800/60 overflow-y-auto">
                  {chatThreads.map((thread) => (
                    <button
                      key={thread.chatId}
                      onClick={() => setActiveThreadId(thread.chatId)}
                      className={`w-full text-left p-3 flex items-start gap-2.5 transition-colors ${
                        activeThreadId === thread.chatId
                          ? 'bg-orange-50/40 dark:bg-orange-950/20 border-l-4 border-orange-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">{thread.buyerName}</h4>
                          {thread.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[8px] px-1 py-0.2 rounded-full font-bold">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{thread.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Chat dialog window */}
                <div className="md:col-span-8 flex flex-col justify-between h-full bg-slate-50/20 dark:bg-slate-900/10">
                  {activeThreadId ? (
                    <>
                      {/* Log */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[340px]">
                        {chatMessages.map((msg) => {
                          const isMe = msg.senderId === currentUser?.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] shadow-sm ${
                                isMe
                                  ? 'bg-orange-500 text-white rounded-br-none'
                                  : 'bg-white dark:bg-slate-900 border rounded-bl-none'
                              }`}>
                                <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                                <span className={`text-[8px] mt-1 block text-right font-medium ${isMe ? 'text-orange-100' : 'text-slate-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply field */}
                      <form onSubmit={handleSendChatReply} className="p-3 border-t bg-white dark:bg-slate-950 flex gap-2">
                        <input
                          type="text"
                          required
                          value={newChatText}
                          onChange={(e) => setNewChatText(e.target.value)}
                          placeholder="Type response to buyer..."
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                        <button type="submit" className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                      <p>Select a buyer thread conversation from the panel to open messaging console.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SHIPPING SETTINGS */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 max-w-2xl bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-5">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b pb-4">Logistics Settings</h1>
            
            <form onSubmit={handleSaveProfile} className="space-y-4 font-semibold text-[11px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Base Shipping Fee (€)</label>
                  <input
                    type="number"
                    required
                    value={productForm.shippingCost}
                    onChange={(e) => setProductForm({ ...productForm, shippingCost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400">Default fallback shipping cost for items</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Free Delivery Threshold (€)</label>
                  <input
                    type="number"
                    required
                    defaultValue={30}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400">Subtotal orders that get Free shipping automatically</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Default Processing Time</label>
                  <input
                    type="text"
                    required
                    value={productForm.shippingTime}
                    onChange={(e) => setProductForm({ ...productForm, shippingTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400">Simulated carrier dispatch delay warning</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Store Custom Shipping Policy Terms</label>
                <textarea
                  required
                  value={store.policies.shipping}
                  onChange={(e) => setStore({ ...store, policies: { ...store.policies, shipping: e.target.value } })}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 px-6 rounded-xl shadow transition-colors"
              >
                Save Shipping Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB: STORE PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-5">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight border-b pb-4">Store Profile Setup</h1>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-semibold text-[11px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">Unique Store Name</label>
                  <input
                    type="text"
                    required
                    value={store.name}
                    onChange={(e) => setStore({ ...store, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Business Company Registry Name</label>
                  <input
                    type="text"
                    required
                    value={seller.businessName}
                    onChange={(e) => setSeller({ ...seller, businessName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Store Logo URL</label>
                  <input
                    type="text"
                    required
                    value={store.logo}
                    onChange={(e) => setStore({ ...store, logo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Store Banner Cover URL</label>
                  <input
                    type="text"
                    required
                    value={store.banner}
                    onChange={(e) => setStore({ ...store, banner: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Support Contact Email</label>
                  <input
                    type="email"
                    required
                    value={store.contactEmail}
                    onChange={(e) => setStore({ ...store, contactEmail: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Support Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={store.contactPhone}
                    onChange={(e) => setStore({ ...store, contactPhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Store Public Slogan & Description</label>
                <textarea
                  required
                  value={store.description}
                  onChange={(e) => setStore({ ...store, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Store Exchange & Returns policy terms</label>
                <textarea
                  required
                  value={store.policies.returns}
                  onChange={(e) => setStore({ ...store, policies: { ...store.policies, returns: e.target.value } })}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 px-6 rounded-xl shadow transition-colors"
              >
                Save Store Profile Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveProduct}
            className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 max-w-3xl w-full rounded-2xl shadow-2xl p-6 relative font-sans text-xs space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-extrabold text-sm uppercase tracking-wide border-b pb-3.5">
              {editingProduct ? `Edit product listing: "${editingProduct.title}"` : 'List new product in store'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold text-[11px]">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Product Title Heading (High-density descriptors)</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  placeholder="e.g. AMOLED smartwatch with HR sensors and long battery life"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Category Selection</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-bold"
                >
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Fashion & Clothing">Fashion & Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Beauty & Health">Beauty & Health</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Toys & Hobbies">Toys & Hobbies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                    placeholder="e.g. Aura"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Store SKU reference</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Price Rate (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                    placeholder="e.g. 15 for 15% off"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Initial Stock count</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Minimum Order quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.minOrder}
                    onChange={(e) => setProductForm({ ...productForm, minOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Product Image URL (comma-separated for multi-images)</label>
                <input
                  type="text"
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-mono"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Product Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Shipping Delivery Fee (€)</label>
                  <input
                    type="number"
                    required
                    value={productForm.shippingCost}
                    onChange={(e) => setProductForm({ ...productForm, shippingCost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Specifications (Format: "Key: Value" on each line)</label>
                <textarea
                  value={productForm.specs}
                  onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none font-mono"
                  placeholder="Memory: 128MB&#10;Battery: 400mAh&#10;Material: Polycarbonate"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Variants Options (comma-separated lists)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                    placeholder="Colors: Black, Silver"
                  />
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none"
                    placeholder="Sizes: S, M, L"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Detailed Product Description</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none leading-relaxed"
                  placeholder="Explain details, user manual guides, warranty parameters..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-6 rounded-xl shadow-md transition-colors"
              >
                Publish Listing
              </button>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-6 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OVERLAY MODAL: DISPATCH SHIPMENT (CARRIER/TRACKING) */}
      {shipmentOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs font-semibold text-slate-800">
          <form 
            onSubmit={handleShipOrderSubmit}
            className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl relative font-sans space-y-4"
          >
            <h3 className="font-extrabold text-sm uppercase border-b pb-2">Secured Escrow Dispatch Shipment</h3>
            
            <p className="text-slate-400 text-[11px] font-normal leading-relaxed">
              Input the logistics courier company and parcel tracking number. This notifications triggers buyer confirmation and tracking page release.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400">Carrier Courier Agency</label>
                <select
                  value={shipCarrier}
                  onChange={(e) => setShipCarrier(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold focus:outline-none"
                >
                  <option value="MaltaPost">MaltaPost Parcel Service</option>
                  <option value="MilesExpress">MilesExpress Local Courier</option>
                  <option value="DHL Express">DHL Express Malta</option>
                  <option value="Store Delivery Van">Store Self-Delivery Van</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Tracking Reference Number</label>
                <input
                  type="text"
                  required
                  value={shipTracking}
                  onChange={(e) => setShipTracking(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 justify-end">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl">Confirm Dispatch</button>
              <button type="button" onClick={() => setShipmentOrder(null)} className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT DIALOG OVERLAY: PACKING SLIP INVOICE */}
      {invoicePrintOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs relative">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Merchant Packing Slip Slip</h3>
            <div className="border-t border-b py-4 space-y-2 border-dashed">
              <p className="font-bold text-sm">Fulfillment Store: {invoicePrintOrder.storeName}</p>
              <p>Order ID Reference: <strong className="font-bold text-sm">{invoicePrintOrder.id}</strong></p>
              <p>Purchased Date: {new Date(invoicePrintOrder.createdAt).toLocaleDateString()}</p>
              <p className="font-bold text-slate-500 pt-2">Billed Customer:</p>
              <p className="font-bold">{invoicePrintOrder.shippingAddress.name} ({invoicePrintOrder.shippingAddress.phone})</p>
              <p>{invoicePrintOrder.shippingAddress.address}, {invoicePrintOrder.shippingAddress.city}, Malta ({invoicePrintOrder.shippingAddress.zipCode})</p>
            </div>
            
            <div>
              <p className="font-bold uppercase text-[9px] tracking-wide text-slate-400 mb-2">Itemized checklist</p>
              <table className="w-full text-left font-semibold">
                <thead>
                  <tr className="border-b text-[9px] text-slate-400">
                    <th className="py-1">Description Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Escrow Val</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicePrintOrder.items.map((it, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">
                        <p className="font-bold text-slate-800">{it.title}</p>
                        <p className="text-[9px] text-slate-400">{it.color && `Color: ${it.color}`} {it.size && `Size: ${it.size}`}</p>
                      </td>
                      <td className="py-2 text-center">{it.quantity}</td>
                      <td className="py-2 text-right">€{(it.price * (1 - it.discount / 100) * it.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2.5 border-t pt-4">
              <button onClick={() => window.print()} className="bg-slate-800 text-white font-extrabold py-1.5 px-4 rounded-lg">Print Slip</button>
              <button onClick={() => setInvoicePrintOrder(null)} className="bg-slate-100 text-slate-600 font-bold py-1.5 px-4 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT DIALOG OVERLAY: SHIPPING LABEL */}
      {labelPrintOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs relative text-center">
            <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Logistics Dispatch Shipping Label</h3>
            
            <div className="border-4 border-slate-950 p-4 space-y-3 rounded-lg text-left">
              <div className="flex justify-between border-b-2 border-slate-950 pb-2">
                <span className="font-black text-xl">PARCEL</span>
                <span className="font-bold text-sm">MALTA POST</span>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">SHIP TO (CUSTOMER RECIPIENT):</p>
                <p className="font-black text-sm mt-1">{labelPrintOrder.shippingAddress.name}</p>
                <p className="font-extrabold text-slate-700">{labelPrintOrder.shippingAddress.address}</p>
                <p className="font-extrabold text-slate-700">{labelPrintOrder.shippingAddress.city}, MALTA</p>
                <p className="font-bold text-slate-600">TEL: {labelPrintOrder.shippingAddress.phone}</p>
                <p className="font-black text-base mt-2 tracking-widest">{labelPrintOrder.shippingAddress.zipCode}</p>
              </div>

              <div className="border-t-2 border-slate-950 pt-2 text-[9px] leading-relaxed text-slate-500 font-bold">
                <p>SENDER: {labelPrintOrder.storeName}</p>
                <p>REF ID: {labelPrintOrder.id}</p>
                <p className="text-[14px] text-slate-950 font-black mt-2 tracking-widest border border-slate-950 border-dashed p-1 text-center">
                  *MT-POST-DOMESTIC*
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-2.5 pt-2">
              <button onClick={() => window.print()} className="bg-slate-800 text-white font-extrabold py-1.5 px-4 rounded-lg">Print Label</button>
              <button onClick={() => setLabelPrintOrder(null)} className="bg-slate-100 text-slate-600 font-bold py-1.5 px-4 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
