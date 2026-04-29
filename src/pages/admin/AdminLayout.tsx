import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, ShoppingBag, Settings, BarChart2, Tag, Percent, Archive, Briefcase, Share2, Globe, Plus, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { loginWithGoogle, logout } from '../../firebase';

export const AdminLayout = () => {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, authLoading } = useAppContext();

  const SUPER_ADMINS = ['azmatfaiz9756@gmail.com']; // Allow this email specifically for super admin

  if (authLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>Loading...</div>;
  }

  if (!user || !user.email) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Admin Panel</div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Please sign in to access the dashboard</div>
          <button 
            onClick={() => loginWithGoogle()}
            style={{ width: '100%', padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Allow localhost for testing or check against specifically configured emails
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!SUPER_ADMINS.includes(user.email) && !isLocalhost) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>Access Denied</div>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Your account ({user.email}) does not have admin privileges.</div>
          <button 
            onClick={() => logout()}
            style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800';
    return location.pathname.startsWith(path) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800';
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="admin-root flex flex-col h-screen w-full overflow-hidden bg-slate-50 relative">
      {/* Mobile Top Header */}
      <div className="md:hidden flex h-16 items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs">DBC</div>
          <span className="font-bold text-white text-lg">Admin Panel</span>
        </div>
        <button className="text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={closeMenu}></div>
        )}

        {/* Sidebar */}
        <div className={`
          absolute md:relative z-50 flex flex-col w-[260px] h-full bg-slate-900 border-r border-slate-800 transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="hidden md:flex h-16 items-center gap-3 px-6 shrink-0 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shrink-0">DBC</div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-tight">Dubai Digital</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-wider">ADMIN PANEL</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full py-4 px-3 flex flex-col gap-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-2">OVERVIEW</div>
            <Link onClick={closeMenu} to="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin')}`}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link onClick={closeMenu} to="/admin/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/analytics')}`}>
              <BarChart2 size={18} /> Analytics
            </Link>
            
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">PROFILES</div>
            <Link onClick={closeMenu} to="/admin/profiles" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/profiles')}`}>
              <Users size={18} /> All Profiles
            </Link>
            <Link onClick={closeMenu} to="/admin/leads" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/leads')}`}>
               <Users size={18} /> Global Leads
            </Link>
            
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">eCommerce</div>
            <Link onClick={closeMenu} to="/admin/products" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/products')}`}>
               <Tag size={18} /> Products
            </Link>
            <Link onClick={closeMenu} to="/admin/banners" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/banners')}`}>
               <Tag size={18} /> Shop Banners
            </Link>
            <Link onClick={closeMenu} to="/admin/jobs" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/jobs')}`}>
               <Tag size={18} /> Job Openings
            </Link>
            <Link onClick={closeMenu} to="/admin/shop-orders" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/shop-orders')}`}>
               <ShoppingBag size={18} /> Shop Orders
            </Link>
            <Link onClick={closeMenu} to="/admin/promo-codes" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/promo-codes')}`}>
               <Percent size={18} /> Promo Codes
            </Link>
            
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">FINANCE</div>
            <Link onClick={closeMenu} to="/admin/wallets" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/wallets')}`}>
               <CreditCard size={18} /> Wallets
            </Link>
            <Link onClick={closeMenu} to="/admin/referrals" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/referrals')}`}>
               <Users size={18} /> Referrals
            </Link>
            
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">DIRECTORY</div>
            <Link onClick={closeMenu} to="/admin/directory" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/directory')}`}>
               <Users size={18} /> Directory
            </Link>

            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">SUPPORT</div>
            <Link onClick={closeMenu} to="/admin/super-agent" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/super-agent')}`}>
               <MessageSquare size={18} /> Super Agent Chat
            </Link>

            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-6">SYSTEM</div>
            <Link onClick={closeMenu} to="/admin/dns-help" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/dns-help')}`}>
               <Globe size={18} /> DNS / Domains
            </Link>
            <Link onClick={closeMenu} to="/admin/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/settings')}`}>
               <Settings size={18} /> Settings
            </Link>
          </div>
          
          <div className="mt-auto p-4 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">{user.email?.substring(0, 2).toUpperCase() || 'SA'}</div>
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <div className="text-sm font-medium text-slate-200">Super Admin</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
              <button onClick={() => logout()} className="text-slate-500 hover:text-slate-300 p-1">
                 <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
            <div className="text-lg md:text-xl font-bold text-slate-800 truncate">
              {location.pathname === '/admin' ? 'Dashboard' : 
               location.pathname === '/admin/profiles' ? 'Profile Management' : 
               location.pathname === '/admin/products' ? 'Products' :
               location.pathname === '/admin/shop-orders' ? 'Shop Orders' :
               location.pathname === '/admin/promo-codes' ? 'Promo Codes' :
               location.pathname === '/admin/analytics' ? 'Analytics' :
               'Admin Panel'}
            </div>
            <div className="relative shrink-0">
              <button 
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2" 
                onClick={() => setShowQuickAdd(!showQuickAdd)}
              >
                <Plus size={16} /> <span className="hidden sm:inline">Quick Add</span>
              </button>
              {showQuickAdd && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
                  <Link to="/admin/products" onClick={() => setShowQuickAdd(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">+ Add Product</Link>
                  <Link to="/admin/promo-codes" onClick={() => setShowQuickAdd(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">+ Add Promo Code</Link>
                  <Link to="/admin/profiles" onClick={() => setShowQuickAdd(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">+ Create Profile</Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <Link to="/admin/wallets" onClick={() => setShowQuickAdd(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">+ Credit Wallet</Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
