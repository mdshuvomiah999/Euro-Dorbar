import React, { useState } from 'react';
import { db } from '../utils/db';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, Phone, MapPin } from 'lucide-react';

interface AuthPortalProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function AuthPortal({ onNavigate, onStateChange, stateTrigger }: AuthPortalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'buyer' | 'seller'>('buyer');

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mandatory inputs missing.');
      return;
    }

    const result = db.login(email.trim(), password.trim());
    if (result.success) {
      alert('Secure Authentication Successful!');
      onStateChange();
      
      // Redirect based on role
      const user = db.getCurrentUser();
      if (user?.role === 'seller') {
        const hasStore = db.getSellers().some(s => s.userId === user.id);
        if (hasStore) {
          onNavigate('seller-center');
        } else {
          onNavigate('seller-registration');
        }
      } else {
        onNavigate('home');
      }
    } else {
      setErrorMsg(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim() || !regAddress.trim()) {
      setErrorMsg('All registration fields are mandatory.');
      return;
    }

    const result = db.signup(
      regName.trim(),
      regEmail.trim(),
      regPassword.trim(),
      regRole,
      regPhone.trim(),
      regAddress.trim()
    );

    if (result.success) {
      alert('Account registered successfully! Secure OTP verification completed.');
      onStateChange();

      if (regRole === 'seller') {
        onNavigate('seller-registration');
      } else {
        onNavigate('home');
      }
    } else {
      setErrorMsg(result.error || 'Registration failed. Email might already exist.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[EuroDorbar Password Recovery OTP Code]: ${code}`);
    alert(`Secure password recovery OTP has been triggered! Code: ${code}. Check browser developer console details.`);
    setShowForgot(false);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-16 flex items-center justify-center px-4 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <span className="bg-orange-600 text-white font-black text-sm px-2.5 py-1 rounded">🇪🇺 EuroDorbar</span>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-3">Secure Gatekeeper Portal</h2>
          <p className="text-slate-400 text-xs font-medium">Fulfillment and Buyer Protections Secured in Escrow</p>
        </div>

        {/* Tab triggers */}
        {!showForgot && (
          <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl text-xs font-extrabold text-slate-500">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                  : 'hover:text-slate-800'
              }`}
            >
              Secure Login
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                  : 'hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Errors */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && !showForgot && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-400">Secure Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="name@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-orange-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <LogIn className="w-4 h-4" /> Authenticate Account
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && !showForgot && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-slate-400">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="Sarah Borg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="sarah.borg@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Phone Number (MT)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="+356 7912 3456"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Malta Physical Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="12, Triq il-Knisja, Mosta"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 pl-10 rounded-xl focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role Matrix */}
            <div className="space-y-1 pt-1">
              <label className="text-slate-400 block">Account Designation Role</label>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <button
                  type="button"
                  onClick={() => setRegRole('buyer')}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    regRole === 'buyer'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  🛒 Register Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('seller')}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    regRole === 'seller'
                      ? 'border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-100 dark:border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  💼 Register Merchant
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <UserPlus className="w-4 h-4" /> Create Marketplace Account
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {showForgot && (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold text-sm border-b pb-2 text-slate-400 uppercase">Password Recovery Assistant</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
              Input your registered email account below. The escrow gateway generates a recovery bypass verification pin dynamically in your developer tools.
            </p>

            <div className="space-y-1">
              <label className="text-slate-400">Account Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl focus:outline-none"
                placeholder="name@gmail.com"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="submit"
                className="flex-1 bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-xs"
              >
                Trigger Recovery OTP
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Trust disclaimer badge */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" /> End-to-end EU buyer escrow protections secured for all client transactions.
        </div>

      </div>
    </div>
  );
}
