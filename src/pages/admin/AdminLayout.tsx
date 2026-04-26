import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, ShoppingBag, Settings, BarChart2, Tag, Percent, Archive, Briefcase, Share2, Globe, Plus, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { loginWithGoogle, logout } from '../../firebase';

export const AdminLayout = () => {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
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
    if (path === '/admin') return location.pathname === '/admin' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <div className="admin-root">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">DBC</div>
          <div>
            <div className="logo-text">Dubai Digital</div>
            <div className="logo-sub">ADMIN PANEL</div>
          </div>
        </div>
        <nav>
          <div className="nav-section">OVERVIEW</div>
          <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
            <LayoutDashboard size={18} className="nav-icon" /> Dashboard
          </Link>
          <Link to="/admin/analytics" className={`nav-item ${isActive('/admin/analytics')}`}>
            <BarChart2 size={18} className="nav-icon" /> Analytics
          </Link>
          
          <div className="nav-section">PROFILES</div>
          <Link to="/admin/profiles" className={`nav-item ${isActive('/admin/profiles')}`}>
            <Users size={18} className="nav-icon" /> All Profiles
          </Link>
          
          <div className="nav-section">eCommerce</div>
          <Link to="/admin/products" className={`nav-item ${isActive('/admin/products')}`}>
             <Tag size={18} className="nav-icon" /> Products
          </Link>
          <Link to="/admin/shop-orders" className={`nav-item ${isActive('/admin/shop-orders')}`}>
             <ShoppingBag size={18} className="nav-icon" /> Shop Orders
          </Link>
          <Link to="/admin/promo-codes" className={`nav-item ${isActive('/admin/promo-codes')}`}>
             <Percent size={18} className="nav-icon" /> Promo Codes
          </Link>
          
          <div className="nav-section">FINANCE</div>
          <Link to="/admin/wallets" className={`nav-item ${isActive('/admin/wallets')}`}>
             <CreditCard size={18} className="nav-icon" /> Wallets
          </Link>
          <Link to="/admin/referrals" className={`nav-item ${isActive('/admin/referrals')}`}>
             <Users size={18} className="nav-icon" /> Referrals
          </Link>
          
          <div className="nav-section">DIRECTORY</div>
          <Link to="/admin/directory" className={`nav-item ${isActive('/admin/directory')}`}>
             <Users size={18} className="nav-icon" /> Directory
          </Link>

          <div className="nav-section">SYSTEM</div>
          <Link to="/admin/dns-help" className={`nav-item ${isActive('/admin/dns-help')}`}>
             <Globe size={18} className="nav-icon" /> DNS / Domains
          </Link>
          <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings')}`}>
             <Settings size={18} className="nav-icon" /> Settings
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="admin-badge">
            <div className="avatar">{user.email?.substring(0, 2).toUpperCase() || 'SA'}</div>
            <div className="avatar-info">
              <div className="avatar-name">Super Admin</div>
              <div className="avatar-role" style={{ fontSize: 10, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
            <button onClick={() => logout()} style={{marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
               <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="main">
        <div className="topbar">
          <div className="page-title">
            {location.pathname === '/admin' ? 'Dashboard' : 
             location.pathname === '/admin/profiles' ? 'Profile Management' : 
             location.pathname === '/admin/products' ? 'Products' :
             location.pathname === '/admin/shop-orders' ? 'Shop Orders' :
             location.pathname === '/admin/promo-codes' ? 'Promo Codes' :
             location.pathname === '/admin/analytics' ? 'Analytics' :
             'Admin Panel'}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="topbar-btn btn-gold" onClick={() => setShowQuickAdd(!showQuickAdd)}>
              + Quick Add
            </button>
            {showQuickAdd && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: 200, zIndex: 100 }}>
                <Link to="/admin/products" onClick={() => setShowQuickAdd(false)} style={{ display: 'block', padding: '10px 16px', color: '#334155', textDecoration: 'none', borderBottom: '1px solid #f1f5f9' }}>+ Add Product</Link>
                <Link to="/admin/promo-codes" onClick={() => setShowQuickAdd(false)} style={{ display: 'block', padding: '10px 16px', color: '#334155', textDecoration: 'none', borderBottom: '1px solid #f1f5f9' }}>+ Add Promo Code</Link>
                <Link to="/admin/profiles" onClick={() => setShowQuickAdd(false)} style={{ display: 'block', padding: '10px 16px', color: '#334155', textDecoration: 'none', borderBottom: '1px solid #f1f5f9' }}>+ Create Profile</Link>
                <Link to="/admin/wallets" onClick={() => setShowQuickAdd(false)} style={{ display: 'block', padding: '10px 16px', color: '#334155', textDecoration: 'none' }}>+ Credit Wallet</Link>
              </div>
            )}
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
