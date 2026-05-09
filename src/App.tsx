import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useEffect, useState } from 'react';
import { doc, getDocFromServer, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AdminLayout } from './pages/admin/AdminLayout';
import { FrontendLayout } from './pages/frontend/FrontendLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfiles from './pages/admin/Profiles';
import AdminAnalytics from './pages/admin/Analytics';
import AdminProducts from './pages/admin/Products';
import AdminShopOrders from './pages/admin/ShopOrders';
import AdminPromoCodes from './pages/admin/PromoCodes';
import AdminWallets from './pages/admin/Wallets';
import AdminSettings from './pages/admin/Settings';
import AdminReferrals from './pages/admin/Referrals';
import AdminDirectory from './pages/admin/Directory';
import AdminLeads from './pages/admin/Leads';
import AdminCards from './pages/admin/Cards';
import BannerSettings from './pages/admin/BannerSettings';
import AdminJobs from './pages/admin/AdminJobs';

// Live Agent for Platform
import LiveAgentPanel from './pages/dashboard/LiveAgentPanel';

// Frontend Pages
import FrontendHome from './pages/frontend/Home';
import FrontendTemplates from './pages/frontend/Templates';
import FrontendShop from './pages/frontend/Shop';
import FrontendWallet from './pages/frontend/Wallet';
import FrontendPlans from './pages/frontend/Plans';
import FrontendReferrals from './pages/frontend/Referrals';
import FrontendLeaderboard from './pages/frontend/Leaderboard';
import PrivacyPolicy from './pages/frontend/PrivacyPolicy';
import TermsConditions from './pages/frontend/TermsConditions';
import ContactUs from './pages/frontend/ContactUs';
import FeaturesDetail from './pages/frontend/FeaturesDetail';
import FullProfile from './pages/profile/FullProfile';
import ProfileStore from './pages/profile/ProfileStore';
import RedirectHandler from './pages/RedirectHandler';

import AdminDNSHelp from './pages/admin/DNSHelp';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import SeedDemo from './pages/SeedDemo';

import ScrollToTop from './components/ScrollToTop';

export default function App() {
  const [domainProfileId, setDomainProfileId] = useState<string | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);

  useEffect(() => {
    async function checkDomain() {
      const hostname = window.location.hostname;
      const mainDomains = [
        'localhost', 
        '127.0.0.1', 
        'vibecard.ae',
        'vibedigitalconnect.com',
        'ais-dev-pn2tu27zkvta4z3zy6bt5q-406651789755.europe-west1.run.app',
        'ais-pre-pn2tu27zkvta4z3zy6bt5q-406651789755.europe-west1.run.app'
      ];

      // If it's a main domain, we use standard routing
      const isMainDomain = mainDomains.some(d => hostname.includes(d));
      
      if (!isMainDomain) {
        try {
          const q = query(collection(db, 'profiles'), where('customDomain', '==', hostname));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setDomainProfileId(snap.docs[0].id);
          }
        } catch (e) {
          console.error("Domain check failed", e);
        }
      }
      setIsCheckingDomain(false);
    }
    
    checkDomain();

    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'settings', 'system'));
        console.log("Firebase connection successful.");
      } catch (error: any) {
        if(error.code === 'unknown' && error.message.includes('auth/network-request-failed')) {
          console.warn("Firebase Auth unreachable. This might be a temporary network issue.");
        } else if(error.message.includes('the client is offline')) {
          console.error("Firebase is in offline mode. Please check your internet connection and Firebase configuration.");
        } else {
          console.error("Firebase connection test failed:", error.message || error);
        }
      }
    }
    testConnection();
  }, []);

  if (isCheckingDomain) {
    return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }

  // If we are on a custom domain, ONLY show the profile
  if (domainProfileId) {
    if (window.location.pathname.startsWith('/store')) {
      return (
        <HelmetProvider>
          <AppProvider>
            <Toaster position="top-center" />
            <BrowserRouter>
              <ProfileStore forcedId={domainProfileId} />
            </BrowserRouter>
          </AppProvider>
        </HelmetProvider>
      );
    }
    return (
      <HelmetProvider>
        <AppProvider>
          <Toaster position="top-center" />
          <BrowserRouter>
            <FullProfile forcedId={domainProfileId} />
          </BrowserRouter>
        </AppProvider>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <AppProvider>
        <Toaster position="top-center" />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Frontend Website Routes */}
            <Route path="/" element={<FrontendLayout />}>
              <Route index element={<FrontendHome />} />
              <Route path="templates" element={<FrontendTemplates />} />
              <Route path="shop" element={<FrontendShop />} />
              <Route path="wallet" element={<FrontendWallet />} />
              <Route path="plans" element={<FrontendPlans />} />
              <Route path="referrals" element={<FrontendReferrals />} />
              <Route path="leaderboard" element={<FrontendLeaderboard />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsConditions />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="features" element={<FeaturesDetail />} />
            </Route>

            {/* Business Owner Dashboard */}
            <Route path="/dashboard" element={<OwnerDashboard />} />

            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="profiles" element={<AdminProfiles />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="banners" element={<BannerSettings />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="shop-orders" element={<AdminShopOrders />} />
              <Route path="promo-codes" element={<AdminPromoCodes />} />
              <Route path="wallets" element={<AdminWallets />} />
              <Route path="referrals" element={<AdminReferrals />} />
              <Route path="directory" element={<AdminDirectory />} />
              <Route path="cards" element={<AdminCards />} />
              <Route path="super-agent" element={<div className="h-[calc(100vh-64px)] w-full"><LiveAgentPanel profileId="platform" /></div>} />
              <Route path="dns-help" element={<AdminDNSHelp />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* QR Redirect Handler */}
            <Route path="/q/:serial" element={<RedirectHandler />} />

            {/* Independent Profile View Route */}
            <Route path="/profile/:id/store" element={<ProfileStore />} />
            <Route path="/:id/store" element={<ProfileStore />} />
            <Route path="/profile/:id" element={<FullProfile />} />
            <Route path="/:id" element={<FullProfile />} />

            {/* Hidden Demo Seeder */}
            <Route path="/seed-demo" element={<SeedDemo />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}
