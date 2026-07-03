import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { CartItem, StoreCartGroup, Coupon, Product } from '../types';
import { Trash2, Store, Gift, ChevronRight, Tag, ArrowRight, ShoppingBag, Heart, Bookmark } from 'lucide-react';

interface BuyerCartProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function BuyerCart({ onNavigate, onStateChange, stateTrigger }: BuyerCartProps) {
  const [cartGroups, setCartGroups] = useState<StoreCartGroup[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [rawCart, setRawCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    const cart = db.getCart();
    setRawCart(cart);

    // Group cart items by seller
    const groupsMap = new Map<string, CartItem[]>();
    cart.forEach(item => {
      const list = groupsMap.get(item.sellerId) || [];
      list.push(item);
      groupsMap.set(item.sellerId, list);
    });

    const groups: StoreCartGroup[] = [];
    const products = db.getProducts();

    groupsMap.forEach((items, sellerId) => {
      // Find shipping cost
      const totalWeight = items.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return sum + (prod?.weight || 0.1) * item.quantity;
      }, 0);

      // Simple shipping rule: max shipping cost of items in group, or free if subtotal > €30
      const groupSubtotal = items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
      let shippingCost = Math.max(...items.map(item => item.shippingCost));
      if (groupSubtotal >= 30) shippingCost = 0; // Free shipping rule!

      groups.push({
        sellerId,
        storeName: items[0].storeName,
        shippingCost,
        items,
        subtotal: groupSubtotal,
        discountAmount: 0,
        total: groupSubtotal + shippingCost,
        appliedCoupon: undefined
      });
    });

    setCartGroups(groups);
    setAvailableCoupons(db.getCoupons());

    // Auto check all items on initial load
    if (cart.length > 0 && selectedItemIds.length === 0) {
      setSelectedItemIds(cart.map(item => item.productId));
    }

    // Load Save for Later items
    const saved = localStorage.getItem('mm_save_for_later');
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
  }, [stateTrigger]);

  const handleUpdateQuantity = (productId: string, diff: number) => {
    const cart = db.getCart();
    const itemIdx = cart.findIndex(item => item.productId === productId);
    if (itemIdx !== -1) {
      const prod = db.getProducts().find(p => p.id === productId);
      if (prod) {
        const nextQty = cart[itemIdx].quantity + diff;
        if (nextQty <= 0) {
          cart.splice(itemIdx, 1);
        } else if (nextQty > prod.stock) {
          alert(`Only ${prod.stock} items left in stock.`);
          return;
        } else {
          cart[itemIdx].quantity = nextQty;
        }
        db.setCart(cart);
        onStateChange();
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    let cart = db.getCart();
    cart = cart.filter(item => item.productId !== productId);
    db.setCart(cart);
    onStateChange();
  };

  const handleSaveForLater = (item: CartItem) => {
    let cart = db.getCart().filter(i => i.productId !== item.productId);
    db.setCart(cart);

    let saved = [...savedItems];
    if (!saved.some(i => i.productId === item.productId)) {
      saved.unshift(item);
    }
    setSavedItems(saved);
    localStorage.setItem('mm_save_for_later', JSON.stringify(saved));
    
    setSelectedItemIds(selectedItemIds.filter(id => id !== item.productId));
    onStateChange();
  };

  const handleMoveToWishlist = (item: CartItem) => {
    let wish = db.getWishlist();
    if (!wish.includes(item.productId)) {
      wish.push(item.productId);
      db.setWishlist(wish);
    }

    let cart = db.getCart().filter(i => i.productId !== item.productId);
    db.setCart(cart);

    setSelectedItemIds(selectedItemIds.filter(id => id !== item.productId));
    onStateChange();
    alert(`"${item.title}" moved to Wishlist!`);
  };

  const handleMoveBackToCart = (item: CartItem) => {
    const updatedSaved = savedItems.filter(i => i.productId !== item.productId);
    setSavedItems(updatedSaved);
    localStorage.setItem('mm_save_for_later', JSON.stringify(updatedSaved));

    let cart = db.getCart();
    if (!cart.some(i => i.productId === item.productId)) {
      cart.push(item);
      db.setCart(cart);
    }
    
    setSelectedItemIds([...selectedItemIds, item.productId]);
    onStateChange();
  };

  const handleRemoveSavedItem = (productId: string) => {
    const updatedSaved = savedItems.filter(i => i.productId !== productId);
    setSavedItems(updatedSaved);
    localStorage.setItem('mm_save_for_later', JSON.stringify(updatedSaved));
  };

  const handleApplyCoupon = (groupIndex: number, couponCode: string) => {
    const group = cartGroups[groupIndex];
    const coupon = availableCoupons.find(c => 
      c.sellerId === group.sellerId && 
      c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!coupon) {
      alert('Invalid coupon code for this seller’s store.');
      return;
    }

    const subtotal = group.items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
    if (subtotal < coupon.minSpend) {
      alert(`Minimum spend of €${coupon.minSpend} required to apply this coupon.`);
      return;
    }

    const updatedGroups = [...cartGroups];
    updatedGroups[groupIndex].appliedCoupon = coupon;
    setCartGroups(updatedGroups);
    alert(`Coupon "${coupon.code}" applied successfully to ${group.storeName}!`);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let shipping = 0;
    let discount = 0;

    cartGroups.forEach(group => {
      const checkedItems = group.items.filter(item => selectedItemIds.includes(item.productId));
      if (checkedItems.length === 0) return;

      const groupSubtotal = checkedItems.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
      subtotal += groupSubtotal;

      let groupDiscount = 0;
      if (group.appliedCoupon) {
        if (group.appliedCoupon.type === 'percentage') {
          groupDiscount = groupSubtotal * (group.appliedCoupon.value / 100);
        } else if (group.appliedCoupon.type === 'fixed') {
          groupDiscount = group.appliedCoupon.value;
        }
      }
      discount += groupDiscount;

      let groupShipping = group.appliedCoupon?.type === 'free_shipping' ? 0 : group.shippingCost;
      shipping += groupShipping;
    });

    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      shipping,
      discount,
      total
    };
  };

  const handleCheckoutTrigger = () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    const selectedGroups = cartGroups.map(group => {
      const checkedItems = group.items.filter(item => selectedItemIds.includes(item.productId));
      return {
        ...group,
        items: checkedItems,
        subtotal: checkedItems.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0)
      };
    }).filter(group => group.items.length > 0);

    if (selectedGroups.length === 0) {
      alert('Please check at least one product checkbox to proceed with checkout.');
      return;
    }

    onNavigate('checkout', { groups: selectedGroups });
  };

  if (rawCart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Your shopping cart is empty</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Fill it with premium products imported directly to Malta with unbeatable deals!</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const summary = calculateTotals();

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide border-b pb-4 mb-6">Shopping Cart ({rawCart.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* L1: CART LISTINGS (Left 8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bulk Controls Row */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={rawCart.length > 0 && selectedItemIds.length === rawCart.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItemIds(rawCart.map(item => item.productId));
                    } else {
                      setSelectedItemIds([]);
                    }
                  }}
                  className="rounded border-slate-300 dark:border-slate-800 text-orange-500 focus:ring-orange-500 w-4 h-4 accent-orange-500 shrink-0 cursor-pointer"
                  id="select-all-cart"
                />
                <label htmlFor="select-all-cart" className="cursor-pointer select-none text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10px]">
                  Select All ({rawCart.length} items)
                </label>
              </div>

              {selectedItemIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove the ${selectedItemIds.length} selected items from your cart?`)) {
                      let cart = db.getCart().filter(item => !selectedItemIds.includes(item.productId));
                      db.setCart(cart);
                      setSelectedItemIds([]);
                      onStateChange();
                    }
                  }}
                  className="text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Selected ({selectedItemIds.length})
                </button>
              )}
            </div>

            {cartGroups.map((group, groupIdx) => {
              const groupSubtotal = group.items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
              
              // Get available coupons for this group's seller to display as helpful helper tips!
              const storeCoupons = availableCoupons.filter(c => c.sellerId === group.sellerId);

              return (
                <div 
                  key={group.sellerId}
                  className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Store Header */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 py-3 px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-orange-500" />
                      <span className="font-extrabold text-xs tracking-wide">{group.storeName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {groupSubtotal >= 30 ? (
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase">
                        Eligible for Free Shipping
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Add €{(30 - groupSubtotal).toFixed(2)} more for Free Shipping
                      </span>
                    )}
                  </div>

                  {/* Group Items */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-4">
                    {group.items.map((item) => {
                      const itemFinalPrice = item.price * (1 - item.discount / 100);
                      const isChecked = selectedItemIds.includes(item.productId);
                      return (
                        <div key={item.productId} className="py-4 flex gap-4 first:pt-0 last:pb-0 items-center">
                          {/* Item Selector Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedItemIds(selectedItemIds.filter(id => id !== item.productId));
                              } else {
                                setSelectedItemIds([...selectedItemIds, item.productId]);
                              }
                            }}
                            className="rounded border-slate-300 dark:border-slate-800 text-orange-500 focus:ring-orange-500 w-4 h-4 accent-orange-500 shrink-0 cursor-pointer"
                          />

                          <img src={item.image} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-50 border shrink-0" alt="" />
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-bold text-xs sm:text-sm truncate hover:text-orange-500 cursor-pointer" onClick={() => onNavigate('product-detail', { productId: item.productId })}>
                              {item.title}
                            </h3>
                            
                            {(item.color || item.size) && (
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                                Selected: {item.color && `Color: ${item.color}`} {item.size && `| Size: ${item.size}`}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>Shipping: €{item.shippingCost.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
                              {/* Quantity counter */}
                              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 text-xs">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.productId, -1)}
                                  className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  -
                                </button>
                                <span className="px-3 font-extrabold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.productId, 1)}
                                  className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  +
                                </button>
                              </div>

                              {/* Save for later, move to wishlist and delete actions */}
                              <div className="flex items-center gap-3.5 text-[10px] font-bold text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => handleSaveForLater(item)}
                                  className="text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:underline"
                                  title="Saves this item to purchase at a later date"
                                >
                                  <Bookmark className="w-3 h-3" /> Save for Later
                                </button>
                                <span className="text-slate-200">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveToWishlist(item)}
                                  className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 hover:underline"
                                >
                                  <Heart className="w-3 h-3" /> Move to Wishlist
                                </button>
                                <span className="text-slate-200">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.productId)}
                                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 hover:underline"
                                  title="Remove from Shopping Bag"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <p className="font-black text-xs sm:text-sm">€{(itemFinalPrice * item.quantity).toFixed(2)}</p>
                            {item.discount > 0 && (
                              <p className="text-[10px] text-slate-400 line-through">€{(item.price * item.quantity).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Store specific coupon application */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Available store coupons as helpful tags */}
                    <div className="text-xs space-y-1.5 w-full md:w-auto">
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Available Store Coupons:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {storeCoupons.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">No coupons active for this store.</span>
                        ) : (
                          storeCoupons.map(c => (
                            <button
                              key={c.code}
                              onClick={() => handleApplyCoupon(groupIdx, c.code)}
                              className="text-[10px] font-bold bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/60 flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3 text-orange-500" /> {c.code} ({c.type === 'percentage' ? `${c.value}% off` : c.type === 'free_shipping' ? 'Free Ship' : `€${c.value} off`})
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Apply coupon form */}
                    <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        id={`coupon-input-${groupIdx}`}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] rounded-lg px-2.5 py-1.5 font-bold uppercase focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById(`coupon-input-${groupIdx}`) as HTMLInputElement)?.value;
                          if (val) handleApplyCoupon(groupIdx, val);
                        }}
                        className="bg-slate-800 dark:bg-slate-700 hover:bg-orange-500 text-white dark:hover:bg-orange-500 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Applied Coupon Display */}
                  {group.appliedCoupon && (
                    <div className="bg-green-50 dark:bg-green-950/20 px-4 py-2 border-t border-green-100 dark:border-green-900/40 flex items-center justify-between text-xs text-green-700 dark:text-green-400">
                      <p className="flex items-center gap-1.5 font-bold">
                        <Gift className="w-4 h-4 text-green-500" /> Store Coupon Applied: "{group.appliedCoupon.code}"
                      </p>
                      <button 
                        onClick={() => {
                          const updated = [...cartGroups];
                          updated[groupIdx].appliedCoupon = undefined;
                          setCartGroups(updated);
                        }}
                        className="text-slate-400 hover:text-rose-500 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* L2: ORDER SUMMARY (Right 4 columns) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider pb-2 border-b mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bag Subtotal</span>
                  <span>€{summary.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Store Coupons applied</span>
                  <span className="text-green-600">-€{summary.discount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Shipping Cost</span>
                  <span>{summary.shipping === 0 ? <strong className="text-green-600">FREE</strong> : `€${summary.shipping.toFixed(2)}`}</span>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-800/40 my-3"></div>

                <div className="flex justify-between text-base font-black">
                  <span>Grand Total</span>
                  <span className="text-orange-500">€{summary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutTrigger}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-101"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl mt-4 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                🛡 EU Buyer Protection & Safe Refund Guarantees active
              </div>
            </div>
          </div>
        </div>

        {/* SAVE FOR LATER SECTION */}
        {savedItems.length > 0 && (
          <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-500" /> Saved For Later ({savedItems.length})
            </h2>
            <p className="text-xs text-slate-400">Items saved here won't be cleared when checking out. Click "Move to Cart" to restore them anytime.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedItems.map((item) => (
                <div 
                  key={item.productId}
                  className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 shadow-xs"
                >
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-slate-50 border shrink-0" alt="" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">€{item.price.toFixed(2)} {item.discount > 0 && `(${item.discount}% Off)`}</p>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() => handleMoveBackToCart(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Move back to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedItem(item.productId)}
                        className="text-rose-500 hover:text-rose-600 font-bold text-[10px] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
