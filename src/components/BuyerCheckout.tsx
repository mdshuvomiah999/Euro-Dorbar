import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { CartItem, StoreCartGroup, User, Order } from '../types';
import { CreditCard, MapPin, ShieldCheck, ArrowLeft, Send } from 'lucide-react';

interface BuyerCheckoutProps {
  groups: StoreCartGroup[];
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function BuyerCheckout({ groups, onNavigate, onStateChange, stateTrigger }: BuyerCheckoutProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form states
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'revolut' | 'bov' | 'cod'>('card');
  const [shippingOptions, setShippingOptions] = useState<Record<string, 'standard' | 'express'>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setShippingName(user.name || '');
      setShippingPhone(user.phone || '');
      setShippingAddress(user.address || '');
      setShippingCity('Valletta');
      setShippingZip('VLT 1115');
    } else {
      onNavigate('login');
    }
  }, [stateTrigger]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingZip.trim()) {
      alert('Please fill out all shipping details.');
      return;
    }

    if (groups.length === 0) {
      alert('Your checkout session is empty.');
      onNavigate('home');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Process checkout via database class
      const result = db.checkout(
        currentUser!.id,
        shippingName,
        currentUser!.email,
        groups,
        {
          name: shippingName,
          phone: shippingPhone,
          address: shippingAddress,
          city: shippingCity,
          country: 'Malta',
          zipCode: shippingZip
        }
      );

      setIsProcessing(false);

      if (result.success) {
        alert('Payment successful! Your multi-vendor order has been placed. Sellers have been notified.');
        onStateChange();
        onNavigate('account', { tab: 'orders' });
      } else {
        alert(result.error || 'An error occurred during checkout.');
      }
    }, 1500);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let shipping = 0;
    let discount = 0;

    groups.forEach(group => {
      const groupSubtotal = group.items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
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

      const isExpress = shippingOptions[group.sellerId] === 'express';
      let groupShipping = group.appliedCoupon?.type === 'free_shipping' ? 0 : group.shippingCost;
      if (isExpress) {
        groupShipping += 4.50; // Express delivery premium
      }
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

  const summary = calculateTotals();

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back control */}
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center gap-1 hover:text-orange-500 font-bold bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 text-xs mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide border-b pb-4 mb-6">Multi-Vendor Secure Checkout</h1>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* L1: INPUT DETAILS (Left 7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery address card */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" /> 1. Shipping Destination (Malta)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-500">Contact Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                    placeholder="Sarah Borg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Phone Number (MT)</label>
                  <input
                    type="text"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                    placeholder="+356 7912 3456"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-500">Physical Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                    placeholder="15, Triq il-Repubblika"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">City / Locality</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                    placeholder="Valletta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Zip / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                    placeholder="VLT 1115"
                  />
                </div>
              </div>
            </div>

            {/* Payment card */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-500" /> 2. Secure Payment Gateway
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="font-bold">Card Payment</p>
                    <p className="text-[9px] text-slate-400">Visa / Mastercard</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('revolut')}
                  className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'revolut'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="font-bold">Revolut</p>
                    <p className="text-[9px] text-slate-400">Instant Mobile Transfer</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bov')}
                  className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'bov'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">🏦</span>
                  <div>
                    <p className="font-bold">BOV Pay</p>
                    <p className="text-[9px] text-slate-400">Bank of Valletta Pay</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">💶</span>
                  <div>
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-[9px] text-slate-400">Pay at door on dispatch</p>
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 font-semibold">
                  <div className="col-span-2 space-y-1">
                    <label className="text-slate-400 text-[10px]">Cardholder Number</label>
                    <input type="text" placeholder="4000 1234 5678 9010" className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">Expiry (MM/YY)</label>
                    <input type="text" placeholder="12/28" className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">CVC Code</label>
                    <input type="password" placeholder="***" className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-xl focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* L2: ORDER SUMMARY REVIEW (Right 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b pb-2.5 mb-4">Review Store Consignments</h3>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                {groups.map((group) => {
                  const groupSubtotal = group.items.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
                  let discountVal = 0;
                  if (group.appliedCoupon) {
                    if (group.appliedCoupon.type === 'percentage') discountVal = groupSubtotal * (group.appliedCoupon.value / 100);
                    else if (group.appliedCoupon.type === 'fixed') discountVal = group.appliedCoupon.value;
                  }
                  const groupShipping = group.appliedCoupon?.type === 'free_shipping' ? 0 : group.shippingCost;

                  return (
                    <div key={group.sellerId} className="pt-3 first:pt-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-orange-500 mb-2">
                        <span>📦 Shipping from:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{group.storeName}</strong>
                      </div>

                      {group.items.map((item) => (
                        <div key={item.productId} className="flex gap-2 text-xs py-1">
                          <span className="text-slate-400">x{item.quantity}</span>
                          <span className="truncate flex-1 font-semibold">{item.title}</span>
                          <span className="font-bold shrink-0">€{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}

                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
                        <span>Base Delivery Cost:</span>
                        <span>{groupShipping === 0 ? 'Free Shipping' : `€${groupShipping.toFixed(2)}`}</span>
                      </div>
                      {discountVal > 0 && (
                        <div className="flex justify-between items-center text-[10px] text-green-600 font-bold mt-0.5">
                          <span>Coupon Applied ({group.appliedCoupon?.code}):</span>
                          <span>-€{discountVal.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Delivery Speed Selector Option per seller package */}
                      <div className="mt-3.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Select Delivery Mode:</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...shippingOptions };
                              updated[group.sellerId] = 'standard';
                              setShippingOptions(updated);
                            }}
                            className={`py-1.5 px-2 rounded-lg border font-bold transition-colors ${
                              shippingOptions[group.sellerId] !== 'express'
                                ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Standard (7-12d) • {groupShipping === 0 ? 'FREE' : `€${groupShipping.toFixed(2)}`}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...shippingOptions };
                              updated[group.sellerId] = 'express';
                              setShippingOptions(updated);
                            }}
                            className={`py-1.5 px-2 rounded-lg border font-bold transition-colors ${
                              shippingOptions[group.sellerId] === 'express'
                                ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Express Courier (2-3d) • €{(groupShipping + 4.50).toFixed(2)}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-50 dark:border-slate-800/40 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bag Subtotal</span>
                  <span>€{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-slate-400">Coupons Discount</span>
                  <span>-€{summary.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping Delivery Fees</span>
                  <span>{summary.shipping === 0 ? 'FREE' : `€${summary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-slate-50 dark:border-slate-800/40 my-2"></div>
                <div className="flex justify-between text-base font-black">
                  <span>Grand Total</span>
                  <span className="text-orange-500">€{summary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-101 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>Processing Safe Escrow...</>
                ) : (
                  <>Confirm and Place Order (Escrow secured)</>
                )}
              </button>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl mt-4 text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Secure checkout. EuroDorbar holds funds in escrow until dispatch verification!
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
