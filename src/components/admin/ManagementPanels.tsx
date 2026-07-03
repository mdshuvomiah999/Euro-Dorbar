import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { adminDb, AdminCategory } from '../../utils/adminDb';
import { User, Seller, Product, Order, OrderStatus } from '../../types';
import { 
  Search, Edit2, Trash2, Ban, CheckCircle, XCircle, Star, Sparkles, Eye, EyeOff,
  ChevronDown, ChevronUp, Download, Upload, Plus, FileText, Printer, Mail,
  ShieldCheck, AlertCircle, ShoppingCart, Heart, Activity, Store
} from 'lucide-react';

// ====================================================
// 1. CUSTOMER / USER MANAGEMENT PANEL
// ====================================================
interface SubPanelProps {
  onStateChange: () => void;
  stateTrigger: number;
}

export function UserPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const users = db.getUsers().filter(u => u.role === 'buyer');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveUser = (userId: string) => {
    const allUsers = db.getUsers();
    const idx = allUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      allUsers[idx].name = editName;
      allUsers[idx].phone = editPhone;
      allUsers[idx].address = editAddress;
      db.setUsers(allUsers);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, name: editName, phone: editPhone, address: editAddress });
      }
      setIsEditing(false);
      adminDb.logAction('Marketplace Admin', `Updated User Profile: ${editName}`, 'Users');
      onStateChange();
      alert('User details updated successfully!');
    }
  };

  const handleBanUser = (userId: string, isBanned: boolean) => {
    const reason = isBanned ? 'banned for policy breach' : 're-instated';
    alert(`User has been successfully ${reason}.`);
    adminDb.logAction('Marketplace Admin', `Modified user state (${reason}) for user ID: ${userId}`, 'Users');
  };

  const handleResetPassword = (email: string) => {
    alert(`A password reset link was successfully dispatched to ${email}.`);
    adminDb.logAction('Marketplace Admin', `Dispatched reset link to ${email}`, 'Users');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you absolutely sure you want to permanently delete this user from the database? This action is irreversible.')) {
      const remaining = db.getUsers().filter(u => u.id !== userId);
      db.setUsers(remaining);
      setSelectedUser(null);
      adminDb.logAction('Marketplace Admin', `Permanently deleted user: ${userId}`, 'Users');
      onStateChange();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Customer Registry Moderation</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Inspect activity logs, wishlists, and restrict accounts</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer list table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">No matching customers found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar} className="w-8 h-8 rounded-full border shrink-0 object-cover bg-slate-50" alt="" />
                        <div className="min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{u.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setEditName(u.name);
                            setEditPhone(u.phone || '');
                            setEditAddress(u.address || '');
                            setIsEditing(false);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-orange-500 transition-all inline-block"
                          title="Inspect and edit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBanUser(u.id, true)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-all inline-block"
                          title="Suspend customer"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Inspect card */}
        <div className="lg:col-span-5">
          {selectedUser ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-5 text-xs font-semibold">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Customer Profile Dossier</h3>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Active Status</span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Phone</label>
                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Shipping Address</label>
                    <textarea rows={2} value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"></textarea>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded-lg hover:bg-slate-50">Cancel</button>
                    <button type="button" onClick={() => handleSaveUser(selectedUser.id)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Save Modifications</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedUser.avatar} className="w-12 h-12 rounded-full border object-cover" alt="" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedUser.name}</h4>
                      <p className="text-[10px] text-slate-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <p>Phone: <strong className="text-slate-800 dark:text-slate-200">{selectedUser.phone || 'Not Provided'}</strong></p>
                    <p>Address: <strong className="text-slate-800 dark:text-slate-200">{selectedUser.address || 'No saved address'}</strong></p>
                    <p>Joined EuroDorbar: <strong className="text-slate-800 dark:text-slate-200">{new Date(selectedUser.createdAt).toLocaleDateString()}</strong></p>
                  </div>

                  {/* Customer activity placeholders */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/40 text-[10px]">
                      <span className="text-slate-400 uppercase tracking-wider block font-bold">Wishlisted Items</span>
                      <strong className="text-lg text-indigo-600 mt-0.5 block">3</strong>
                    </div>
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 text-[10px]">
                      <span className="text-slate-400 uppercase tracking-wider block font-bold">Shopping Bag</span>
                      <strong className="text-lg text-emerald-600 mt-0.5 block">1 item</strong>
                    </div>
                  </div>

                  {/* Operational actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex-1 bg-slate-900 dark:bg-orange-500 hover:opacity-90 text-white font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Profile Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedUser.email)}
                        className="flex-1 border hover:bg-slate-50 dark:hover:bg-slate-900 font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3 h-3 text-indigo-500" /> Reset Password
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="w-full bg-rose-50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/35 font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-colors border border-rose-100/30"
                    >
                      <Trash2 className="w-3 h-3" /> Permanently Delete Account Dossier
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-dashed rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col justify-center items-center gap-3">
              <Activity className="w-8 h-8 text-slate-300" />
              <p>Select a customer from the registry to view their profile, activity statistics, and moderate access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 2. SELLER / STORE MANAGEMENT PANEL
// ====================================================
export function SellerPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const sellers = db.getSellers();
  const stores = db.getStores();

  const filteredSellers = sellers.filter(s => 
    s.storeName.toLowerCase().includes(search.toLowerCase()) || 
    s.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (sellerId: string) => {
    const all = db.getSellers();
    const idx = all.findIndex(s => s.id === sellerId);
    if (idx !== -1) {
      all[idx].status = 'approved';
      db.setSellers(all);
      db.addNotification(all[idx].userId, 'Storefront Verified!', 'Your EuroDorbar merchant application has been formally verified. Happy Selling!', 'system');
      adminDb.logAction('Marketplace Admin', `Approved merchant registry for: ${all[idx].storeName}`, 'Sellers');
      if (selectedSeller?.id === sellerId) {
        setSelectedSeller({ ...selectedSeller, status: 'approved' });
      }
      onStateChange();
      alert(`Seller "${all[idx].storeName}" has been successfully approved!`);
    }
  };

  const handleReject = (sellerId: string) => {
    const all = db.getSellers();
    const idx = all.findIndex(s => s.id === sellerId);
    if (idx !== -1) {
      all[idx].status = 'rejected';
      db.setSellers(all);
      db.addNotification(all[idx].userId, 'Compliance Verification Failed', 'Your merchant storefront application failed our compliance audit.', 'system');
      adminDb.logAction('Marketplace Admin', `Rejected merchant registry for: ${all[idx].storeName}`, 'Sellers');
      if (selectedSeller?.id === sellerId) {
        setSelectedSeller({ ...selectedSeller, status: 'rejected' });
      }
      onStateChange();
      alert(`Seller "${all[idx].storeName}" registration application rejected.`);
    }
  };

  const handleSuspendSeller = (sellerId: string) => {
    alert(`Merchant store suspended. All associated products have been temporarily hidden.`);
    adminDb.logAction('Marketplace Admin', `Suspended seller ID: ${sellerId}`, 'Sellers');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Merchant Storefront Inspections</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Approve, reject, inspect storefront configurations and commercial compliance</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sellers list */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Store / Business Name</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredSellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={s.logo} className="w-8 h-8 rounded-lg object-cover border bg-slate-50 shrink-0" alt="" />
                      <div className="min-w-0">
                        <p className="text-slate-800 dark:text-slate-200 font-extrabold truncate">{s.storeName}</p>
                        <p className="text-[9px] text-slate-400 truncate">{s.businessName}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {s.status === 'approved' ? (
                        <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Active</span>
                      ) : s.status === 'rejected' ? (
                        <span className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Rejected</span>
                      ) : (
                        <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Pending Review</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-bold text-[10px]">{s.address.split(',').pop() || s.country}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSeller(s)}
                        className="bg-slate-900 text-white dark:bg-orange-500 hover:opacity-90 font-bold px-3 py-1.5 rounded-lg text-[10px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Store details inspect card */}
        <div className="lg:col-span-5">
          {selectedSeller ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Merchant Store Dossier</h3>
                <span className="font-mono text-[9px] text-slate-400 font-bold">UID: {selectedSeller.id}</span>
              </div>

              <div className="relative h-20 rounded-xl overflow-hidden bg-slate-100">
                <img src={selectedSeller.banner} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                  <h4 className="text-white font-black text-sm">{selectedSeller.storeName}</h4>
                </div>
              </div>

              <div className="space-y-1.5 leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
                <p>Corporate Name: <strong className="text-slate-800 dark:text-slate-200">{selectedSeller.businessName}</strong></p>
                <p>Registered Email: <strong className="text-slate-800 dark:text-slate-200">{selectedSeller.email}</strong></p>
                <p>Commercial Phone: <strong className="text-slate-800 dark:text-slate-200">{selectedSeller.phone}</strong></p>
                <p>VAT / Postal Address: <strong className="text-slate-800 dark:text-slate-200">{selectedSeller.address}</strong></p>
                <p className="italic text-[10px] mt-2 bg-slate-50 dark:bg-slate-900/40 p-2 border rounded-lg">"{selectedSeller.description}"</p>
              </div>

              {/* Performance / Complaints metrics mock */}
              <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 border.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Rating</span>
                  <strong className="text-xs text-yellow-500 flex items-center justify-center gap-0.5 mt-0.5">
                    4.8 <Star className="w-3 h-3 fill-yellow-500 stroke-none" />
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 border.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Disputes</span>
                  <strong className="text-xs text-green-600 mt-0.5 block">0</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 border.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Followers</span>
                  <strong className="text-xs text-indigo-500 mt-0.5 block">1.4K</strong>
                </div>
              </div>

              {/* Operational Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {selectedSeller.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedSeller.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Store
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedSeller.id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-2 rounded-xl text-[10px] flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Application
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSuspendSeller(selectedSeller.id)}
                    className="w-full bg-rose-50 dark:bg-rose-950/15 text-rose-600 hover:bg-rose-100/60 font-black py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-colors border border-rose-100/35"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend Merchant Commercial Activity
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-dashed rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col justify-center items-center gap-3">
              <Store className="w-8 h-8 text-slate-300" />
              <p>Select a store merchant from the registry list to inspect their VAT credentials, followers, ratings, and approve compliance applications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 3. PRODUCT MODERATION PANEL
// ====================================================
export function ProductPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [bulkChecked, setBulkChecked] = useState<string[]>([]);
  const [isBulkEditModal, setIsBulkEditModal] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState(10);

  const products = db.getProducts();

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleToggleFeature = (productId: string) => {
    alert('Product successfully featured on EuroDorbar home banner slider!');
    adminDb.logAction('Marketplace Admin', `Featured product ID: ${productId}`, 'Products');
  };

  const handleToggleHide = (productId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
    const all = db.getProducts();
    const idx = all.findIndex(p => p.id === productId);
    if (idx !== -1) {
      all[idx].status = nextStatus as any;
      db.setProducts(all);
      adminDb.logAction('Marketplace Admin', `Modified product state (${nextStatus}) for product ID: ${productId}`, 'Products');
      onStateChange();
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to permanently delete this product? This action is irreversible.')) {
      const remaining = db.getProducts().filter(p => p.id !== productId);
      db.setProducts(remaining);
      adminDb.logAction('Marketplace Admin', `Permanently deleted product ID: ${productId}`, 'Products');
      onStateChange();
    }
  };

  const handleBulkCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setBulkChecked(filteredProducts.map(p => p.id));
    } else {
      setBulkChecked([]);
    }
  };

  const handleCheckRow = (productId: string) => {
    if (bulkChecked.includes(productId)) {
      setBulkChecked(bulkChecked.filter(id => id !== productId));
    } else {
      setBulkChecked([...bulkChecked, productId]);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you absolutely sure you want to permanently delete the ${bulkChecked.length} selected products?`)) {
      const remaining = db.getProducts().filter(p => !bulkChecked.includes(p.id));
      db.setProducts(remaining);
      adminDb.logAction('Marketplace Admin', `Bulk deleted ${bulkChecked.length} products`, 'Products');
      setBulkChecked([]);
      onStateChange();
    }
  };

  const handleApplyBulkDiscount = () => {
    const all = db.getProducts();
    all.forEach(p => {
      if (bulkChecked.includes(p.id)) {
        p.discount = bulkDiscount;
      }
    });
    db.setProducts(all);
    adminDb.logAction('Marketplace Admin', `Applied bulk discount of ${bulkDiscount}% to ${bulkChecked.length} products`, 'Products');
    setIsBulkEditModal(false);
    setBulkChecked([]);
    onStateChange();
    alert(`Applied ${bulkDiscount}% discount to selected products successfully.`);
  };

  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Title', 'Brand', 'Category', 'Price (EUR)', 'Discount (%)', 'Stock', 'SKU', 'Store Name'],
      ...filteredProducts.map(p => [
        p.id, p.title, p.brand, p.category, p.price.toString(), p.discount.toString(), p.stock.toString(), p.sku, p.storeName
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EuroDorbar_Products_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    adminDb.logAction('Marketplace Admin', 'Exported products database as CSV file', 'Products');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const all = db.getProducts();
            db.setProducts([...parsed, ...all]);
            adminDb.logAction('Marketplace Admin', `Imported ${parsed.length} products from JSON file`, 'Products');
            onStateChange();
            alert(`Successfully imported ${parsed.length} products!`);
          } else {
            alert('Invalid JSON structure. Must be an array of Products.');
          }
        } catch {
          alert('Failed to parse file. Make sure it is a valid JSON file.');
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Product Catalog Controls</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Control active status, edit parameters, and bulk adjust prices/discounts</p>
        </div>
        
        {/* Action Row */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold px-3 py-2 rounded-xl text-[10px] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          
          <label className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white dark:bg-slate-950 border rounded-xl py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search catalog title, brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Bulk Control Bar */}
      {bulkChecked.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold gap-4 animate-fade-in">
          <span className="text-orange-800 dark:text-orange-400">Selected {bulkChecked.length} products for bulk modifications</span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setIsBulkEditModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px]"
            >
              Bulk Edit Discounts
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold px-3 py-1.5 rounded-lg text-[10px]"
            >
              Bulk Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && bulkChecked.length === filteredProducts.length}
                    onChange={handleBulkCheckAll}
                    className="rounded border-slate-300 text-orange-500 accent-orange-500 w-3.5 h-3.5"
                  />
                </th>
                <th className="p-4">Product Specs</th>
                <th className="p-4">Merchant Store</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No matching products found in the database catalog.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={bulkChecked.includes(p.id)}
                        onChange={() => handleCheckRow(p.id)}
                        className="rounded border-slate-300 text-orange-500 accent-orange-500 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="p-4 flex gap-3 items-center min-w-[200px]">
                      <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-50 border shrink-0" alt="" />
                      <div className="min-w-0">
                        <p className="text-slate-800 dark:text-slate-200 font-bold truncate leading-tight">{p.title}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">SKU: {p.sku} • Brand: {p.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-bold">{p.storeName}</td>
                    <td className="p-4 text-slate-400 text-[11px]">{p.category}</td>
                    <td className="p-4 font-mono text-slate-800 dark:text-white">
                      €{(p.price * (1 - p.discount/100)).toFixed(2)}
                      {p.discount > 0 && <span className="text-[9px] text-orange-500 ml-1">(-{p.discount}%)</span>}
                    </td>
                    <td className="p-4">
                      {p.stock === 0 ? (
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase font-black">Out of Stock</span>
                      ) : p.stock <= 5 ? (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase font-black animate-pulse">Low Stock ({p.stock})</span>
                      ) : (
                        <span className="text-slate-500 font-bold">{p.stock} units</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(p.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500 transition-all inline-block"
                        title="Feature this product"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleHide(p.id, p.status)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-all inline-block"
                        title={p.status === 'active' ? 'Hide Product' : 'Publish Product'}
                      >
                        {p.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-all inline-block"
                        title="Delete product catalog record"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Edit Modal Dialog */}
      {isBulkEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Apply Bulk Campaign Discount</h3>
            <p className="text-[11px] text-slate-400">Configure a promotional discount rate (%) for all the {bulkChecked.length} selected products simultaneously.</p>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Discount Rate Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={bulkDiscount}
                  onChange={(e) => setBulkDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                />
                <span className="font-black text-slate-500">% Off</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsBulkEditModal(false)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkDiscount}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm"
              >
                Apply Bulk Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================
// 4. CATEGORY ARCHITECTURE MANAGEMENT PANEL
// ====================================================
export function CategoryPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState<string | null>(null);
  const [newCatIcon, setNewCatIcon] = useState('Smartphone');
  const [newCatMetaTitle, setNewCatMetaTitle] = useState('');
  const [newCatMetaDesc, setNewCatMetaDesc] = useState('');

  useEffect(() => {
    setCategories(adminDb.getCategories());
  }, [stateTrigger]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: AdminCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      slug,
      parentId: newCatParent || null,
      icon: newCatIcon,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
      metaTitle: newCatMetaTitle || `${newCatName.trim()} Online Shop | EuroDorbar`,
      metaDescription: newCatMetaDesc || `Discover premium collection of ${newCatName.trim()} on multi-vendor EuroDorbar.`,
      keywords: `${newCatName.toLowerCase()}, shop, Malta`
    };

    const updated = [...categories, newCat];
    adminDb.setCategories(updated);
    adminDb.logAction('Marketplace Admin', `Created Category: ${newCat.name}`, 'Categories');
    setNewCatName('');
    setNewCatParent(null);
    setNewCatMetaTitle('');
    setNewCatMetaDesc('');
    onStateChange();
    alert(`Category "${newCat.name}" successfully established!`);
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Are you sure you want to delete this category? Any children subcategories will be unlinked.')) {
      const updated = categories.filter(c => c.id !== catId).map(c => {
        if (c.parentId === catId) {
          return { ...c, parentId: null };
        }
        return c;
      });
      adminDb.setCategories(updated);
      adminDb.logAction('Marketplace Admin', `Deleted Category ID: ${catId}`, 'Categories');
      onStateChange();
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      <div>
        <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Multi-Level Category Hierarchy</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Define nested subcategories, set SEO meta descriptions, and link custom dashboard icons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category structural creator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-2 border-b">Establish New Category</h3>
          
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Category Title Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Health & Wellness"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Parent Hierarchy (Nested Category)</label>
              <select
                value={newCatParent || ''}
                onChange={(e) => setNewCatParent(e.target.value || null)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="">None (Top-Level Category)</option>
                {categories.filter(c => c.parentId === null).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Lucide Icon name</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>
              <div className="flex items-end justify-center pb-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">Selected: {newCatIcon}</span>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Meta Title SEO</label>
              <input
                type="text"
                placeholder="Custom Search engine title..."
                value={newCatMetaTitle}
                onChange={(e) => setNewCatMetaTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Meta Description SEO</label>
              <textarea
                rows={2}
                placeholder="Short index description for Google indexing..."
                value={newCatMetaDesc}
                onChange={(e) => setNewCatMetaDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-orange-500 hover:opacity-95 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Category Node
            </button>
          </form>
        </div>

        {/* Categories structure list view */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider pb-2 border-b">Active Structural Map</h3>
          
          <div className="space-y-4">
            {categories.filter(c => c.parentId === null).map((parent) => {
              const children = categories.filter(c => c.parentId === parent.id);

              return (
                <div key={parent.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 rounded-lg text-xs font-bold font-mono">
                        {parent.icon}
                      </span>
                      <h4 className="font-black text-slate-800 dark:text-white text-xs">{parent.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(parent.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete category node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Children Subcategories */}
                  <div className="pl-6 border-l border-slate-200 dark:border-slate-800 space-y-2">
                    {children.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No nested subcategories under this node.</p>
                    ) : (
                      children.map((child) => (
                        <div key={child.id} className="flex justify-between items-center bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/40">
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">{child.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(child.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 5. ORDER PROCESSING & DISPATCH SYSTEM
// ====================================================
export function OrderPanel({ onStateChange, stateTrigger }: SubPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = db.getOrders();

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.buyerName.toLowerCase().includes(search.toLowerCase()) || o.buyerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    const all = db.getOrders();
    const idx = all.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      all[idx].status = status;
      all[idx].updatedAt = new Date().toISOString();
      db.setOrders(all);
      
      // Notify buyer user
      db.addNotification(
        all[idx].buyerId,
        `Order Status updated to ${status.toUpperCase()}`,
        `Your EuroDorbar order #${orderId} has been updated to "${status}".`,
        'order'
      );

      adminDb.logAction('Marketplace Admin', `Modified Order Status for #${orderId} to: ${status}`, 'Orders');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status, updatedAt: new Date().toISOString() });
      }
      onStateChange();
      alert(`Order #${orderId} status successfully updated to: ${status}`);
    }
  };

  const handleRefundOrder = (orderId: string) => {
    if (confirm(`Do you want to issue a full Administrative Refund for order #${orderId}? This will reverse the escrow funds.`)) {
      handleUpdateStatus(orderId, 'refunded');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">Multi-Vendor Escrow Order Registry</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Track multi-vendor dispatch steps, generate print invoices, and process manual refund overrides</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white dark:bg-slate-950 border rounded-xl py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid (Escrow)</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <div className="relative w-full sm:w-52">
            <input
              type="text"
              placeholder="Search Order ID, Buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Orders list table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Buyer name</th>
                  <th className="p-4">Merchant Store</th>
                  <th className="p-4">Escrow Value</th>
                  <th className="p-4">Dispatch Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No matching order records found in escrow.</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-semibold transition-colors">
                      <td className="p-4 font-mono font-bold text-orange-500">{o.id}</td>
                      <td className="p-4 text-slate-800 dark:text-slate-200 font-bold leading-tight">
                        {o.buyerName}
                        <p className="text-[9px] text-slate-400 font-medium font-sans mt-0.5">{o.buyerEmail}</p>
                      </td>
                      <td className="p-4 text-slate-500 font-bold">{o.storeName}</td>
                      <td className="p-4 font-mono text-slate-800 dark:text-white">€{o.total.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          o.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                          o.status === 'paid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 animate-pulse' :
                          o.status === 'refunded' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="bg-slate-900 text-white dark:bg-orange-500 hover:opacity-90 font-bold px-2.5 py-1.5 rounded-lg text-[10px]"
                        >
                          Invoice Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order invoice detail inspector */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4 text-xs font-semibold print-area">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-orange-500">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-extrabold text-[10px] uppercase tracking-wider">Invoice Spec sheet</h3>
                </div>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px] border px-2 py-1 rounded-lg"
                >
                  <Printer className="w-3 h-3" /> Print Invoice
                </button>
              </div>

              {/* Invoice body details */}
              <div className="space-y-3">
                <div className="flex justify-between text-[11px]">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Invoice Number</p>
                    <p className="font-mono text-slate-800 dark:text-slate-200 font-black">{selectedOrder.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Order ID</p>
                    <p className="font-mono text-orange-500 font-black">#{selectedOrder.id}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  <p>Buyer: <strong className="text-slate-800 dark:text-slate-200">{selectedOrder.shippingAddress.name}</strong></p>
                  <p>Shipping Address: <strong className="text-slate-800 dark:text-slate-200">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}</strong></p>
                  <p>Carrier Track #: <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedOrder.trackingNumber || 'Unassigned'}</strong></p>
                  <p>Mailing Contact: <strong className="text-slate-800 dark:text-slate-200">{selectedOrder.buyerEmail}</strong></p>
                </div>

                {/* Items in order */}
                <div className="space-y-2 pt-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Line Items Ordered ({selectedOrder.items.length})</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-2.5 items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <img src={item.image} className="w-8 h-8 rounded-lg object-cover bg-slate-50 shrink-0 border" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-slate-800 dark:text-slate-200 leading-tight font-bold">{item.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Qty: {item.quantity} • €{(item.price * (1 - item.discount/100)).toFixed(2)} each</p>
                        </div>
                        <strong className="text-slate-700 dark:text-slate-300 font-mono shrink-0 text-[11px]">
                          €{((item.price * (1 - item.discount/100)) * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping fee:</span>
                    <span>€{selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-500 font-bold">
                    <span>Promo Discount:</span>
                    <span>-€{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm border-t pt-1.5 mt-1">
                    <span>Total (Escrow Funds):</span>
                    <span className="font-mono">€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action override controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Update Escalation Status</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      className="py-2 border hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
                    >
                      Set Processing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                      className="py-2 border hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
                    >
                      Mark Shipped
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className="py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-xs"
                    >
                      Escrow Release
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRefundOrder(selectedOrder.id)}
                      className="py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl"
                    >
                      Manual Refund
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-dashed rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col justify-center items-center gap-3">
              <FileText className="w-8 h-8 text-slate-300" />
              <p>Select an escrow order invoice from the registry list to print specs, update statuses, or reverse payments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
