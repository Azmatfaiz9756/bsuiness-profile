import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { logout } from '../../firebase';
import { Menu, X } from 'lucide-react';
import { LoginModal } from '../../components/LoginModal';

export const FrontendLayout = () => {
  const location = useLocation();
  const { user, authLoading, isLoginModalOpen, setIsLoginModalOpen } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path ? 'active bg-slate-100' : '';

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="frontend-root w-full overflow-x-hidden relative">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {/* Desktop & Mobile Header */}
      <div className="nav flex h-[64px] items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200 sticky top-0 z-50">
        <Link to="/" className="nav-logo flex items-center gap-2">
          <div className="nav-logo-icon w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shrink-0">DBC</div>
          <div className="nav-logo-text font-bold text-slate-900 hidden sm:block whitespace-nowrap">Dubai Digital Connect</div>
        </Link>
        
        {/* Desktop Links */}
        <div className="nav-links hidden md:flex items-center gap-6">
          <Link to="/" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/')}`}>Directory</Link>
          <Link to="/templates" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/templates')}`}>Templates</Link>
          <Link to="/shop" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/shop')}`}>Shop</Link>
          <Link to="/wallet" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/wallet')}`}>Wallet</Link>
          <Link to="/referrals" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/referrals')}`}>Referrals</Link>
          <Link to="/leaderboard" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/leaderboard')}`}>Rank</Link>
          <Link to="/plans" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/plans')}`}>Plans</Link>
        </div>

        {/* Desktop Auth */}
        <div className="nav-right hidden md:flex items-center gap-3">
          {authLoading ? (
            <span className="text-slate-500 text-sm">Loading...</span>
          ) : user ? (
            <>
              <Link to="/dashboard" className="btn btn-blk btn-sm bg-slate-900 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-800 transition-colors">Owner Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm border border-slate-300 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-50 transition-colors">Sign Out</button>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="btn btn-blk btn-sm bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">Business Login</button>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button className="md:hidden p-2 -mr-2 text-slate-600 shrink-0 select-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[64px] bg-white z-40 overflow-y-auto border-t border-slate-100 shadow-xl flex flex-col">
          <div className="flex flex-col p-4 gap-2">
            <Link onClick={closeMenu} to="/" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/')}`}>Directory</Link>
            <Link onClick={closeMenu} to="/templates" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/templates')}`}>Templates</Link>
            <Link onClick={closeMenu} to="/shop" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/shop')}`}>Shop</Link>
            <Link onClick={closeMenu} to="/wallet" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/wallet')}`}>Wallet</Link>
            <Link onClick={closeMenu} to="/referrals" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/referrals')}`}>Referrals</Link>
            <Link onClick={closeMenu} to="/leaderboard" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/leaderboard')}`}>Rank</Link>
            <Link onClick={closeMenu} to="/plans" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/plans')}`}>Plans</Link>
            
            <div className="h-px bg-slate-200 my-4"></div>

            {authLoading ? (
              <span className="p-3 text-center text-slate-500">Loading...</span>
            ) : user ? (
              <>
                <Link onClick={closeMenu} to="/dashboard" className="p-3 text-center rounded-lg bg-slate-900 text-white text-base font-medium transition-colors hover:bg-slate-800">Owner Dashboard</Link>
                <button onClick={handleLogout} className="p-3 text-center rounded-lg border border-slate-300 text-slate-700 font-medium transition-colors hover:bg-slate-50">Sign Out</button>
              </>
            ) : (
              <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="p-3 text-center rounded-lg bg-blue-600 text-white font-medium transition-colors hover:bg-blue-700">Business Login</button>
            )}
          </div>
        </div>
      )}

      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};
