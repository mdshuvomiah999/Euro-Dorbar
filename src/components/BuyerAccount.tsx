import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { Order, CartItem, Message, ChatThread, Notification, User, Product } from '../types';
import { 
  ShoppingBag, MessageSquare, Heart, Bell, Trash2, 
  ShoppingCart, Star, CheckCircle, Truck, Package, Clock, Eye, Send 
} from 'lucide-react';

interface BuyerAccountProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
  initialTab?: string;
  initialChatId?: string;
}

export default function BuyerAccount({ onNavigate, onStateChange, stateTrigger, initialTab = 'orders', initialChatId }: BuyerAccountProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialChatId || null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Print Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user) {
      onNavigate('login');
      return;
    }
    setCurrentUser(user);

    // Fetch user specific data
    const allOrders = db.getOrders().filter(o => o.buyerId === user.id);
    setOrders(allOrders);

    // Fetch wishlist details
    const wishIds = db.getWishlist();
    const wishProds = db.getProducts().filter(p => wishIds.includes(p.id));
    setWishlistProducts(wishProds);

    // Fetch notifications
    const allNotifs = db.getNotifications().filter(n => n.recipientId === user.id);
    setNotifications(allNotifs);

    // Fetch chat threads
    const threads = db.getChatThreads(user.id);
    setChatThreads(threads);

    if (initialChatId) {
      setActiveThreadId(initialChatId);
      setActiveTab('messages');
    } else if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].chatId);
    }
  }, [stateTrigger, initialTab, initialChatId]);

  // Load chat messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      const msgs = db.getChatMessages(activeThreadId);
      setChatMessages(msgs);
    }
  }, [activeThreadId, stateTrigger]);

  const handleMarkAsDelivered = (orderId: string) => {
    const allOrders = db.getOrders();
    const oIdx = allOrders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
      allOrders[oIdx].status = 'delivered';
      allOrders[oIdx].updatedAt = new Date().toISOString();
      db.setOrders(allOrders);
      
      // Notify seller
      db.addNotification(
        allOrders[oIdx].sellerId,
        'Order Completed by Buyer',
        `Buyer ${currentUser?.name} marked Order #${orderId} as Delivered. Funds released to escrow!`,
        'order'
      );

      alert('Order successfully marked as Delivered! You can now write a review for these items.');
      onStateChange();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeThreadId || !currentUser) return;

    const thread = chatThreads.find(t => t.chatId === activeThreadId);
    if (!thread) return;

    // Resolve recipient user id (which is the seller's user ID)
    const sellerInfo = db.getSellers().find(s => s.id === thread.sellerId);
    if (!sellerInfo) return;

    const sent = db.sendMessage(currentUser.id, sellerInfo.userId, newMessageText);
    setChatMessages(prev => [...prev, sent]);
    setNewMessageText('');
    
    // Quick seller simulated reply generator (makes chat incredibly satisfying!)
    setTimeout(() => {
      db.sendMessage(
        sellerInfo.userId,
        currentUser.id,
        `Hello ${currentUser.name}! Thank you for your message. We have received your query and will assist you shortly!`
      );
      onStateChange();
    }, 2000);

    onStateChange();
  };

  const handleRemoveWishlist = (prodId: string) => {
    let wish = db.getWishlist().filter(id => id !== prodId);
    db.setWishlist(wish);
    onStateChange();
  };

  const handleAddWishToCart = (prod: Product) => {
    const cart = db.getCart();
    const existing = cart.find(item => item.productId === prod.id);

    if (existing) {
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
    alert('Product added to shopping cart!');
  };

  const handleClearNotifications = () => {
    const allNotifs = db.getNotifications().map(n => {
      if (n.recipientId === currentUser?.id) n.read = true;
      return n;
    });
    db.setNotifications(allNotifs);
    onStateChange();
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    const styles: Record<Order['status'], string> = {
      pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      packed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
      shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
      delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
      refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
    };

    return (
      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 1. LEFT SIDEBAR NAVIGATION */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            {currentUser && (
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-50 dark:border-slate-800">
                <img src={currentUser.avatar} className="w-12 h-12 rounded-full bg-slate-100" alt="" />
                <div className="min-w-0">
                  <h2 className="font-extrabold text-sm truncate">{currentUser.name}</h2>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                  activeTab === 'orders'
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-orange-500" /> My Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                  activeTab === 'messages'
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-orange-500" /> Live Chat Box
                </span>
                {chatThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {chatThreads.reduce((sum, t) => sum + t.unreadCount, 0)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Heart className="w-4 h-4 text-orange-500" /> My Wishlist ({wishlistProducts.length})
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-orange-500" /> Notifications
                </span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. MAIN WORKSPACE */}
          <div className="lg:col-span-3 min-h-[480px]">
            {/* TAB: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">My Purchase Logs</h2>
                  <span className="text-xs text-slate-400">Escrow Protected Orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold">You have not placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 text-xs space-y-4"
                      >
                        {/* Order Subheader */}
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800/60 font-semibold text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span>Order ID: <strong className="text-slate-950 dark:text-white font-bold">{order.id}</strong></span>
                            <span>•</span>
                            <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Status:</span>
                            {getOrderStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                              <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0" alt="" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate text-slate-800 dark:text-slate-200">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Quantity: {item.quantity} • {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-black text-slate-900 dark:text-white">€{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total / Quick Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/60 font-semibold text-[11px]">
                          <div>
                            <span className="text-slate-400">Merchant: <strong className="text-orange-500">{order.storeName}</strong></span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Total Paid: <strong className="text-slate-950 dark:text-white text-xs font-bold">€{order.total.toFixed(2)}</strong> (incl. shipping)</p>
                          </div>

                          <div className="flex gap-2.5 self-stretch sm:self-auto justify-end">
                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold"
                            >
                              Print Invoice
                            </button>

                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleMarkAsDelivered(order.id)}
                                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold flex items-center gap-1 shadow"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Mark as Delivered
                              </button>
                            )}

                            {order.status === 'delivered' && (
                              <button
                                onClick={() => onNavigate('product-detail', { productId: order.items[0].productId })}
                                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold"
                              >
                                Write Product Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MESSAGE CENTER (Two column pane) */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">Direct Messenger</h2>
                  <span className="text-xs text-slate-400">Negotiations & Support Threads</span>
                </div>

                {chatThreads.length === 0 ? (
                  <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold">You have no active message conversations with sellers.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden h-[420px] shadow-sm">
                    {/* Left Threads Column */}
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
                          <img src={thread.storeLogo} className="w-8 h-8 rounded-full object-cover border" alt="" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-[11px] truncate">{thread.storeName}</h4>
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

                    {/* Right Active Message Box */}
                    <div className="md:col-span-8 flex flex-col justify-between h-full bg-slate-50/20 dark:bg-slate-900/10">
                      {activeThreadId ? (
                        <>
                          {/* Chat Messages Log */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[340px]">
                            {chatMessages.map((msg) => {
                              const isMe = msg.senderId === currentUser?.id;
                              return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-sm ${
                                    isMe
                                      ? 'bg-orange-500 text-white rounded-br-none'
                                      : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-bl-none'
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

                          {/* Send Input Form */}
                          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-2">
                            <input
                              type="text"
                              value={newMessageText}
                              onChange={(e) => setNewMessageText(e.target.value)}
                              placeholder="Type a message to support..."
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs p-6 text-center">
                          <p>Select a conversations thread to begin messaging sellers.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">Saved Items List</h2>
                  <span className="text-xs text-slate-400">Wishlisted Favourites</span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold">Your wishlist is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((prod) => (
                      <div 
                        key={prod.id}
                        className="bg-white dark:bg-slate-950 rounded-xl p-3 border shadow-sm text-xs relative group flex flex-col justify-between"
                      >
                        <button
                          onClick={() => handleRemoveWishlist(prod.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors z-10 bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div 
                          onClick={() => onNavigate('product-detail', { productId: prod.id })}
                          className="cursor-pointer space-y-2"
                        >
                          <div className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden relative">
                            <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-bold truncate text-slate-800 dark:text-slate-200">{prod.title}</h4>
                          <p className="font-black text-slate-900 dark:text-white">€{(prod.price * (1 - prod.discount / 100)).toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => handleAddWishToCart(prod)}
                          className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" /> Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">Account Notifications</h2>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-xs text-orange-500 hover:underline font-bold"
                    >
                      Clear All Unread
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold">You have no new notification logs.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between text-xs gap-3 ${
                          notif.read
                            ? 'bg-white border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-slate-500'
                            : 'bg-orange-50/30 border-orange-100 dark:bg-orange-950/10 dark:border-orange-900/30 text-slate-800 dark:text-slate-100 font-medium'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            {notif.type === 'order' && '🛒'}
                            {notif.type === 'message' && '💬'}
                            {notif.type === 'review' && '⭐'}
                            {notif.type === 'low_stock' && '⚠'}
                            {notif.type === 'system' && '⚙'}
                            {notif.title}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 block font-normal">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl p-6 relative font-sans text-xs">
            {/* Header info */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="bg-orange-600 text-white rounded font-black text-xs px-2 py-1">🇪🇺 ED</span>
                <h3 className="font-black text-base mt-2">EuroDorbar Escrow Invoice</h3>
                <p className="text-slate-400 mt-0.5">Secure payment voucher for local delivery</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-500">Invoice: {invoiceOrder.invoiceNumber}</p>
                <p className="text-slate-400 mt-0.5">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Order Ref: {invoiceOrder.id}</p>
              </div>
            </div>

            {/* Bill to address */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-[11px]">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wide">Billed Recipient</p>
                <p className="font-bold text-slate-800 mt-1">{invoiceOrder.shippingAddress.name}</p>
                <p className="text-slate-500">{invoiceOrder.shippingAddress.address}</p>
                <p className="text-slate-500">{invoiceOrder.shippingAddress.city}, Malta ({invoiceOrder.shippingAddress.zipCode})</p>
                <p className="text-slate-500">Phone: {invoiceOrder.shippingAddress.phone}</p>
              </div>

              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wide">Fulfillment Store</p>
                <p className="font-bold text-slate-800 mt-1">{invoiceOrder.storeName}</p>
                <p className="text-slate-500">Secured via EuroDorbar Escrow Escort</p>
                <p className="text-slate-400 mt-1.5 font-medium flex items-center gap-1 text-[10px]"><span className="text-green-500">✔</span> Escrow Secured Status: <strong className="uppercase text-green-600">{invoiceOrder.status}</strong></p>
              </div>
            </div>

            {/* Invoice Line items */}
            <div className="py-4 border-b border-slate-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 font-bold text-[10px] uppercase border-b pb-2">
                    <th className="py-1">Description</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Unit Price</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {invoiceOrder.items.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5">
                        <p className="font-bold text-slate-800">{item.title}</p>
                        {item.color && <span className="text-[9px] text-slate-400 mr-2">Color: {item.color}</span>}
                        {item.size && <span className="text-[9px] text-slate-400">Size: {item.size}</span>}
                      </td>
                      <td className="text-center py-2.5">{item.quantity}</td>
                      <td className="text-right py-2.5">€{(item.price * (1 - item.discount / 100)).toFixed(2)}</td>
                      <td className="text-right py-2.5">€{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Row */}
            <div className="flex justify-end pt-4 font-semibold text-[11px] space-y-1.5 flex-col items-end">
              <div className="flex justify-between w-60">
                <span className="text-slate-400">Consignment Subtotal:</span>
                <span>€{invoiceOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-60 text-green-600 font-bold">
                <span>Coupons Discount:</span>
                <span>-€{invoiceOrder.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-60">
                <span>Shipping Delivery Fees:</span>
                <span>€{invoiceOrder.shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 my-1 w-60"></div>
              <div className="flex justify-between w-60 font-black text-xs text-orange-600">
                <span>Total Amount Paid:</span>
                <span>€{invoiceOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Print trigger and close */}
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-1.5 px-4 rounded-lg"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold py-1.5 px-4 rounded-lg"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
