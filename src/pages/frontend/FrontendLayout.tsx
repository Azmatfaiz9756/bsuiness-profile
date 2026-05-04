import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { logout } from '../../firebase';
import { Menu, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { LoginModal } from '../../components/LoginModal';
import AnimatedLogo from '../../components/AnimatedLogo';
import toast from 'react-hot-toast';

export const FrontendLayout = () => {
  const location = useLocation();
  const { user, authLoading, isLoginModalOpen, setIsLoginModalOpen, siteSettings, selectedCountry, setSelectedCountry } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path ? 'active bg-slate-100' : '';

  const [currentLang, setCurrentLang] = useState(user?.language || 'en');

  useEffect(() => {
    // Capture referral code if present
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('dbc_referred_by', refCode);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode === 'en' ? '' : langCode; // Sometimes English is default/empty
      if(langCode === 'en' && !select.querySelector(`option[value="${langCode}"]`)) {
        // To clear translation
        const iframe = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
        const clearBtn = iframe?.contentWindow?.document.querySelector('.goog-te-button button') as HTMLButtonElement | null;
        if(clearBtn) clearBtn.click();
        
        // Alternatively set cookie
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.reload();
        return;
      }
      select.dispatchEvent(new Event('change'));
    } else {
      // If translate widget is not loaded yet, or to force English clear
      if(langCode === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.reload();
      } else {
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        window.location.reload();
      }
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isShop = location.pathname === '/shop';

  return (
    <div className="frontend-root w-full overflow-x-hidden relative">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {/* Promotion Banner */}
      {!isShop && (
        <div className="bg-slate-900 text-white py-2.5 relative overflow-hidden border-b border-slate-800 shadow-xl">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
          
          <div className="animate-marquee flex whitespace-nowrap items-center">
            {/* Duplicated content for seamless scrolling */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                <span className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-sky-400">
                  <Sparkles size={14} className="text-yellow-400 animate-pulse shrink-0" /> 
                  Premium Networking
                </span>
                <span className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">
                  <Zap size={14} className="text-blue-400 shrink-0" /> 
                  1-Month FREE Trial active
                </span>
                <span className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                   <ShieldCheck size={14} className="text-emerald-400 shrink-0" /> 
                   Secure & Private
                </span>
                <Link to="/plans" className="text-[10px] md:text-xs font-black uppercase tracking-widest bg-blue-600 px-4 py-1 rounded-full hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20">
                  Claim Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Desktop & Mobile Header */}
      {!isShop && (
        <div className="nav flex h-[72px] md:h-[80px] items-center justify-between px-4 md:px-8 bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
          <Link to="/" className="nav-logo flex items-center gap-3 z-10 group">
            <AnimatedLogo size={10} theme="light" />
            <div className="hidden md:flex flex-col">
              <span className="nav-logo-text font-black text-slate-900 whitespace-nowrap leading-tight text-lg tracking-tighter uppercase italic">
                VIBE<span className="text-blue-600"> Digital Connect</span>
              </span>
              <span className="text-[8px] text-slate-400 font-bold tracking-[0.2em] uppercase">HAADI GLOBAL VENTURES FZE LLC</span>
            </div>
          </Link>

          {/* Centered Mobile Title */}
          <Link to="/" className="md:hidden absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center w-[50%]">
            <span className="font-black text-slate-900 whitespace-nowrap leading-tight text-base tracking-tighter uppercase italic">VIBE<span className="text-blue-600"> Digital Connect</span></span>
            <span className="text-[7px] text-slate-400 font-bold tracking-widest uppercase truncate w-full">HAADI GLOBAL VENTURES FZE LLC</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="nav-links hidden md:flex items-center gap-6">
            <Link to="/" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/')}`}>Directory</Link>
            <Link to="/templates" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/templates')}`}>Templates</Link>
            <Link to="/features" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/features')}`}>Features</Link>
            <Link to="/shop" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/shop')}`}>Shop</Link>
            {user && (
              <Link to="/wallet" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/wallet')}`}>Wallet</Link>
            )}
            <Link to="/referrals" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/referrals')}`}>Referrals</Link>
            <Link to="/leaderboard" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/leaderboard')}`}>Rank</Link>
            <Link to="/plans" className={`nav-link px-2 py-1 rounded text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive('/plans')}`}>Plans</Link>
            
            <div className="h-4 w-px bg-slate-200"></div>

            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                localStorage.setItem('dbc_country', e.target.value);
              }}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              <option value="Global">🌎 Global</option>
              <option value="India">🇮🇳 India</option>
              <option value="UAE">🇦🇪 UAE</option>
            </select>

            <div className="h-4 w-px bg-slate-200"></div>

            {/* Language Selector */}
            <select 
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 cursor-pointer"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="ar">🇦🇪 AR</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
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
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && !isShop && (
        <div className="md:hidden fixed inset-0 top-[64px] bg-white z-[60] overflow-y-auto border-t border-slate-100 shadow-xl flex flex-col">
          <div className="flex flex-col p-4 gap-2">
            <Link onClick={closeMenu} to="/" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/')}`}>Directory</Link>
            <Link onClick={closeMenu} to="/templates" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/templates')}`}>Templates</Link>
            <Link onClick={closeMenu} to="/features" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/features')}`}>Features</Link>
            <Link onClick={closeMenu} to="/shop" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/shop')}`}>Shop</Link>
            {user && (
              <Link onClick={closeMenu} to="/wallet" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/wallet')}`}>Wallet</Link>
            )}
            <Link onClick={closeMenu} to="/referrals" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/referrals')}`}>Referrals</Link>
            <Link onClick={closeMenu} to="/leaderboard" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/leaderboard')}`}>Rank</Link>
            <Link onClick={closeMenu} to="/plans" className={`p-3 rounded-lg text-base font-medium text-slate-700 ${isActive('/plans')}`}>Plans</Link>
            
            <div className="h-px bg-slate-200 my-4"></div>

            <div className="flex flex-col px-3 gap-2 pb-4">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  localStorage.setItem('dbc_country', e.target.value);
                  closeMenu();
                }}
                className="bg-slate-100 p-2 rounded-lg flex-1 font-medium text-slate-700 outline-none"
              >
                <option value="Global">🌎 Global</option>
                <option value="India">🇮🇳 India</option>
                <option value="UAE">🇦🇪 UAE</option>
              </select>

              <select 
                value={currentLang}
                onChange={(e) => {
                  handleLanguageChange(e.target.value);
                  closeMenu();
                }}
                className="bg-slate-100 p-2 rounded-lg flex-1 font-medium text-slate-700 outline-none"
              >
                <option value="en">English (US)</option>
                <option value="ar">Arabic (UAE)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

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

      <div className="w-full flex-1">
        <Outlet />
      </div>

      {/* Global Footer */}
      {!isShop && (
        <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 text-slate-400 font-sans mt-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6 group cursor-default">
                  <AnimatedLogo size={10} />
                  <div className="flex flex-col">
                    <span className="font-black text-white text-lg tracking-tighter leading-tight uppercase italic">{siteSettings?.siteName || 'VIBE Digital Connect'}</span>
                    <span className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase">HAADI GLOBAL VENTURES</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-slate-500 font-medium">
                  {siteSettings?.seoDesc || 'The ultimate platform for premium professional networking. AI-powered digital business cards designed for the modern executive.'}
                </p>
                <div className="flex gap-4">
                  {siteSettings.socialTwitter && (
                    <a href={siteSettings.socialTwitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">𝕏</a>
                  )}
                  {siteSettings.socialLinkedin && (
                    <a href={siteSettings.socialLinkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">in</a>
                  )}
                  {siteSettings.socialFacebook && (
                    <a href={siteSettings.socialFacebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">f</a>
                  )}
                  {!siteSettings.socialTwitter && !siteSettings.socialLinkedin && !siteSettings.socialFacebook && (
                    <>
                      <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">𝕏</a>
                      <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">in</a>
                      <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">f</a>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Platform</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/" className="hover:text-blue-400 transition-colors">Directory Listing</Link></li>
                  <li><Link to="/templates" className="hover:text-blue-400 transition-colors">Premium Templates</Link></li>
                  <li><Link to="/shop" className="hover:text-blue-400 transition-colors">NFC Hardware</Link></li>
                  <li><Link to="/plans" className="hover:text-blue-400 transition-colors">Pricing & Plans</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Resources</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/referrals" className="hover:text-blue-400 transition-colors">Affiliate Program</Link></li>
                  <li><Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link></li>
                  <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Help & Support</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal & Company</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                  <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-900 text-xs">
              <p>© {new Date().getFullYear()} VIBE Digital Connect by Haadi Global Ventures Fze LLC. All rights reserved.</p>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Systems Operational
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
