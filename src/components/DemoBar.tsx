import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { User, Seller } from '../types';
import { Shield, User as UserIcon, Store, RefreshCw, Layers, CheckCircle, Clock } from 'lucide-react';

interface DemoBarProps {
  onNavigate: (view: string, params?: any) => void;
  onStateChange: () => void;
  stateTrigger: number;
}

export default function DemoBar({ onNavigate, onStateChange, stateTrigger }: DemoBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    setSellers(db.getSellers());
    setUsers(db.getUsers());
  }, [stateTrigger, isOpen]);

  const handleUserSwitch = (userId: string) => {
    const foundUser = db.getUsers().find(u => u.id === userId);
    if (foundUser) {
      db.setCurrentUser(foundUser);
      onStateChange();
      if (foundUser.role === 'seller') {
        const hasStore = db.getSellers().some(s => s.userId === foundUser.id);
        if (hasStore) {
          onNavigate('seller-center');
        } else {
          onNavigate('seller-registration');
        }
      } else if (foundUser.role === 'admin') {
        onNavigate('admin-center');
      } else {
        onNavigate('home');
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset local database to initial seed data? This clears your custom actions.')) {
      db.resetDatabase();
      onStateChange();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-all duration-300 scale-95 hover:scale-100"
      >
        <Layers className="w-5 h-5 animate-pulse" />
        <span className="text-sm">Demo Control Hub</span>
        <span className="bg-white text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
          {currentUser?.role === 'buyer' ? 'Buyer' : currentUser?.role === 'seller' ? 'Seller' : 'Admin'}
        </span>
      </button>

      {/* Control Drawer */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 transition-all duration-300 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              Role Quick Switcher
            </h3>
            <button
              onClick={handleReset}
              title="Reset Database"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 my-2 leading-relaxed">
            Switch between simulated users to test multi-vendor purchase loops, order management, and store setups.
          </p>

          <div className="space-y-3 mt-3">
            {/* Buyer Roles */}
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Buyers
              </span>
              <div className="space-y-1.5 mt-1">
                {users
                  .filter(u => u.role === 'buyer')
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSwitch(user.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                        currentUser?.id === user.id
                          ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} className="w-6 h-6 rounded-full bg-slate-200" alt="" />
                        <div>
                          <p className="truncate max-w-[140px]">{user.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        Buyer
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Seller Roles */}
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Sellers
              </span>
              <div className="space-y-1.5 mt-1">
                {sellers.map(seller => {
                  const sellerUser = users.find(u => u.id === seller.userId);
                  if (!sellerUser) return null;
                  const isCurrent = currentUser?.id === sellerUser.id;
                  return (
                    <button
                      key={seller.id}
                      onClick={() => handleUserSwitch(sellerUser.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={seller.logo} className="w-6 h-6 rounded-full bg-slate-200 object-cover" alt="" />
                        <div>
                          <p className="truncate max-w-[140px]">{seller.storeName}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{seller.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {seller.status === 'approved' ? (
                          <span className="text-[8px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                            <CheckCircle className="w-2 h-2" /> Appr
                          </span>
                        ) : (
                          <span className="text-[8px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                            <Clock className="w-2 h-2" /> Pend
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Role */}
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Administrators
              </span>
              <div className="space-y-1.5 mt-1">
                {users
                  .filter(u => u.role === 'admin')
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSwitch(user.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                        currentUser?.id === user.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} className="w-6 h-6 rounded-full bg-slate-200" alt="" />
                        <div>
                          <p className="truncate max-w-[140px]">{user.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              EuroDorbar Demonstration Environment
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
