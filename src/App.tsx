import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { HelmetProvider } from 'react-helmet-async';

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
import FullProfile from './pages/profile/FullProfile';

import AdminDNSHelp from './pages/admin/DNSHelp';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';

export default function App() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <HelmetProvider>
      <AppProvider>
        <BrowserRouter>
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
              <Route path="super-agent" element={<div className="h-[calc(100vh-64px)] w-full"><LiveAgentPanel profileId="platform" /></div>} />
              <Route path="dns-help" element={<AdminDNSHelp />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Independent Profile View Route */}
            <Route path="/profile/:id" element={<FullProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}
