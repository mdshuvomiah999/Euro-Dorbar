import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { User, Seller, Store } from '../types';
import { Shield, Store as StoreIcon, ArrowRight, ArrowLeft, Mail, Check, AlertCircle } from 'lucide-react';

interface SellerRegistrationProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function SellerRegistration({ onNavigate, onStateChange, stateTrigger }: SellerRegistrationProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Brand Details
  const [storeLogo, setStoreLogo] = useState('https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=150&q=80');
  const [storeBanner, setStoreBanner] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');

  // Step 3: Verification & Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user) {
      onNavigate('login');
      return;
    }
    setCurrentUser(user);

    // If already registered as seller, check if pending or approved
    const existingSeller = db.getSellers().find(s => s.userId === user.id);
    if (existingSeller) {
      if (existingSeller.status === 'approved') {
        onNavigate('seller-center');
      } else if (existingSeller.status === 'pending') {
        setStep(4); // Wait screen
      } else if (existingSeller.status === 'rejected') {
        setStep(5); // Rejected screen
      }
    }
  }, [stateTrigger]);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessName.trim() || !storeName.trim() || !contactEmail.trim() || !contactPhone.trim() || !address.trim()) {
      setErrorMsg('Please fill out all mandatory business details.');
      return;
    }

    // Validate store name uniqueness
    const nameExists = db.getStores().some(s => s.name.toUpperCase() === storeName.trim().toUpperCase());
    if (nameExists) {
      setErrorMsg('This store name is already registered by another vendor. Select a unique name.');
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Write a brief store description to welcome buyers.');
      return;
    }
    setErrorMsg('');
    setStep(3);

    // Send Simulated OTP
    if (!otpSent) {
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(simulatedOtp);
      setOtpSent(true);
      console.log(`[EuroDorbar SMS OTP]: ${simulatedOtp}`);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreedToTerms) {
      setErrorMsg('You must accept the Merchant Marketplace terms.');
      return;
    }

    if (enteredOtp !== otpCode) {
      setErrorMsg('Invalid simulated verification PIN. Check your registration form console log details.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Save seller registration
      const sellers = db.getSellers();
      const newSeller: Seller = {
        id: `seller_${Date.now()}`,
        userId: currentUser!.id,
        businessName,
        storeName,
        email: contactEmail,
        phone: contactPhone,
        country: 'Malta',
        address,
        logo: storeLogo,
        banner: storeBanner,
        description,
        termsAccepted: agreedToTerms,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const stores = db.getStores();
      const newStore: Store = {
        id: `store_${Date.now()}`,
        sellerId: newSeller.id,
        name: storeName,
        logo: storeLogo,
        banner: storeBanner,
        description,
        categories: ['General Merchandise'],
        followersCount: 10,
        rating: 4.5,
        reviewsCount: 1,
        contactEmail,
        contactPhone,
        policies: {
          shipping: 'We ship packages from our physical Malta warehouse within 24 hours of payment verification. Domestic postal times range from 1-3 days depending on locality.',
          returns: 'Defective products can be returned within 14 days of receipt. Buyers can request exchange or complete refund of funds held in escrow.'
        }
      };

      sellers.push(newSeller);
      stores.push(newStore);

      db.setSellers(sellers);
      db.setStores(stores);

      // Force change current user's role to seller
      const users = db.getUsers();
      const uIdx = users.findIndex(u => u.id === currentUser!.id);
      if (uIdx !== -1) {
        users[uIdx].role = 'seller';
        db.setUsers(users);
        db.setCurrentUser(users[uIdx]);
      }

      // Send Admin Notification
      db.addNotification(
        'admin',
        'New Merchant Registration Pending',
        `Seller "${storeName}" is awaiting registry approval from the administration portal.`,
        'system'
      );

      setIsSubmitting(false);
      setStep(4);
      onStateChange();
    }, 1200);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-12">
        
        {/* Progress Header */}
        {step <= 3 && (
          <div className="text-center mb-8 space-y-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Become a EuroDorbar Seller</h1>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">Onboard as a local merchant to access direct escrow sales and MaltaPost logistics integrations.</p>

            {/* Breadcrumb Steps */}
            <div className="flex items-center justify-center gap-6 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <span className={step === 1 ? 'text-orange-500' : 'text-slate-300'}>1. Business</span>
              <span>•</span>
              <span className={step === 2 ? 'text-orange-500' : 'text-slate-300'}>2. Store Brand</span>
              <span>•</span>
              <span className={step === 3 ? 'text-orange-500' : 'text-slate-300'}>3. Verification</span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* STEP 1: BUSINESS REGISTRY */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase tracking-wide border-b pb-3 text-slate-400">1. Commercial Registry Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500">Registered Business Name (Company/LLC)</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                  placeholder="e.g. Borg Trading Ltd"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Desired Store Display Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none font-bold text-orange-500"
                  placeholder="e.g. Borg Electronics Hub"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Merchant Corporate Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                  placeholder="borgtrading@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Corporate Phone Number (MT)</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                  placeholder="+356 2134 5678"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-500">Corporate Office Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none"
                  placeholder="Triq il-Knisja, Mosta"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              Configure Storefront branding <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: BRANDING */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase tracking-wide border-b pb-3 text-slate-400">2. Storefront Layout Customization</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500">Store Logo Emblem URL</label>
                <input
                  type="text"
                  required
                  value={storeLogo}
                  onChange={(e) => setStoreLogo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Store banner Cover URL</label>
                <input
                  type="text"
                  required
                  value={storeBanner}
                  onChange={(e) => setStoreBanner(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-500">Store Slogan & Public bio description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none leading-relaxed"
                  placeholder="Welcome to Borg Trading, your premier source for quality consumer electronics imported directly to Malta..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                Proceed to Security Agreement <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3 rounded-xl transition-colors text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SECURITY VERIFICATION & AGREEMENT */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase tracking-wide border-b pb-3 text-slate-400">3. Verification & Merchant Security Escrow Agreement</h3>

            {/* Sim SMS Alert banner */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/60 p-4 rounded-2xl font-semibold leading-relaxed text-[11px] text-orange-800 dark:text-orange-400">
              <p className="font-bold flex items-center gap-1.5"><Mail className="w-4 h-4 text-orange-500 animate-bounce" /> Simulated OTP Verification</p>
              <p className="mt-1">A simulated registry OTP verification pin code has been generated. Input the code to sign terms:</p>
              <p className="mt-1 font-mono text-xs text-slate-950 dark:text-white bg-white dark:bg-slate-900 p-1.5 rounded inline-block font-bold">OTP CODE: {otpCode}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-500">Input Verification Pin</label>
                <input
                  type="text"
                  required
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:outline-none text-center text-sm font-bold tracking-widest font-mono"
                  placeholder="------"
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none border-t pt-3 font-medium leading-relaxed text-slate-500">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded text-orange-500 focus:ring-orange-500"
                />
                <span>
                  I accept the Borg-Admin Multi-vendor Escrow Policies. I agree that funds will be held in safe escrow until dispatch logistics are verified by tracking numbers.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Storefront...' : 'Agree & Submit Registration'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3.5 rounded-xl transition-colors text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: REGISTRATION SUBMITTED / PENDING WAIT */}
        {step === 4 && (
          <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-5 text-xs font-semibold max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Registration Pending Approval</h2>
            
            <p className="text-slate-400 leading-relaxed text-[11px] font-medium">
              Thank you! Your merchant request has been logged successfully on the blockchain registry. EuroDorbar administrators have been alerted to audit your business and logo.
            </p>

            {/* Sandbox helper explanation */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border p-4 rounded-2xl text-left text-orange-800 dark:text-orange-400">
              <p className="font-bold flex items-center gap-1">🛠 Sandbox Registry Bypass:</p>
              <p className="mt-1 text-[10px] leading-relaxed font-semibold">
                Since this is a simulated sandbox workspace, you can instantly approve this seller profile by switching to the **Admin Role** in the top floating control bar! Once approved, your seller console activates.
              </p>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Return to Buyer Home
            </button>
          </div>
        )}

        {/* STEP 5: REGISTRATION REJECTED */}
        {step === 5 && (
          <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-4 text-xs font-semibold max-w-md mx-auto">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Store Application Rejected</h2>
            
            <p className="text-slate-400 leading-relaxed text-[11px] font-medium">
              Unfortunately, your commercial registry papers or banner URLs did not pass administrative compliance audit. Please edit your application or contact merchant support.
            </p>

            <button
              onClick={() => {
                // Re-enable editing
                const sellers = db.getSellers().filter(s => s.userId !== currentUser?.id);
                db.setSellers(sellers);
                setStep(1);
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Edit and Resubmit Application
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
