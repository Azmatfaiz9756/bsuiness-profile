import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { loginWithGoogle, logout } from '../../firebase';

export const FrontendLayout = () => {
  const location = useLocation();
  const { user, authLoading } = useAppContext();
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="frontend-root">
      <div className="nav">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">DBC</div>
          <div className="nav-logo-text">Dubai Digital Connect</div>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Directory</Link>
          <Link to="/templates" className={`nav-link ${isActive('/templates')}`}>Templates</Link>
          <Link to="/shop" className={`nav-link ${isActive('/shop')}`}>Shop</Link>
          <Link to="/wallet" className={`nav-link ${isActive('/wallet')}`}>Wallet</Link>
          <Link to="/referrals" className={`nav-link ${isActive('/referrals')}`}>Referrals</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Rank</Link>
          <Link to="/plans" className={`nav-link ${isActive('/plans')}`}>Plans</Link>
        </div>
        <div className="nav-right">
          <Link to="/admin" className="btn btn-outline btn-sm">Super Admin</Link>
          {authLoading ? (
            <span style={{color: '#64748b'}}>Loading...</span>
          ) : user ? (
            <>
              <Link to="/dashboard" className="btn btn-blk btn-sm">Owner Dashboard</Link>
              <button onClick={logout} className="btn btn-outline btn-sm">Sign Out</button>
            </>
          ) : (
            <button onClick={handleLogin} className="btn btn-blk btn-sm">Business Login</button>
          )}
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};
