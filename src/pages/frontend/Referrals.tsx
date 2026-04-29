import React, { useMemo } from 'react';
import { Share2, Users, Gift, TrendingUp, Copy, LogIn } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendReferrals() {
  const { siteSettings, user, setIsLoginModalOpen, profiles } = useAppContext();
  
  const referralCode = useMemo(() => {
    if (!user) return 'LOGIN-TO-VIEW';
    const userProfile = profiles.find((p: any) => p.ownerId === user.uid || p.email === user.email);
    if (userProfile && userProfile.id) return userProfile.id;
    return `DBC-${user.uid.substring(0, 8).toUpperCase()}`;
  }, [user, profiles]);

  const referralLink = user ? `${window.location.origin}/plans?ref=${referralCode}` : '';
  
  const trialPeriod = siteSettings?.trialPeriod || '1 Month';
  const purchaseWindow = siteSettings?.referralPurchaseWindow || 35;
  const referralNormalUserReward = siteSettings?.referralNormalUserReward || 1;
  const referralProfileOwnerReward = siteSettings?.referralProfileOwnerReward || 5;
  const referralDirectCommission = siteSettings?.referralDirectCommission || 20;
  const currency = siteSettings?.currency || 'AED';

  const copyRef = () => {
    if (!user) return;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-8 md:p-12 rounded-3xl text-center mb-8 shadow-lg shadow-blue-500/20">
        <Gift size={48} className="mx-auto mb-6 text-white" />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Refer & Earn Rewards</h1>
        <div className="text-base md:text-lg text-blue-50 max-w-2xl mx-auto mb-8 leading-relaxed space-y-4">
          <p>
            When you share a business profile and it leads to a premium plan sale within {purchaseWindow} days, everyone wins! All new profiles get a {trialPeriod} Free Trial.
          </p>
          <ul className="text-left list-disc pl-5 mt-4 space-y-2 bg-black/10 rounded-xl p-4 backdrop-blur-sm">
            <li><strong>As a Normal User:</strong> Share any profile. If they purchase a plan, you earn <strong>{referralNormalUserReward} {currency}</strong> per sale, and the profile owner earns <strong>{referralProfileOwnerReward} {currency}</strong>.</li>
            <li><strong>As a Profile Owner:</strong> Share your own profile directly. If someone signs up and buys a plan through your link, you earn a <strong>{referralDirectCommission} {currency}</strong> direct commission!</li>
          </ul>
        </div>

        {user ? (
          <div className="bg-white p-2 rounded-xl flex flex-col md:flex-row gap-2 max-w-md mx-auto shadow-sm">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="flex-1 border-none bg-transparent px-4 py-2 md:py-0 text-sm font-medium text-slate-900 outline-none text-center md:text-left"
            />
            <button onClick={copyRef} className="bg-slate-900 text-white border-none px-6 py-2.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
              <Copy size={16} /> Copy
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-white text-blue-600 border-none px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
            >
              <LogIn size={20} /> Login to Access Your Referral Link
            </button>
          </div>
        )}
      </div>

      {user && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <Users size={20} />
                <div className="font-semibold text-sm">Total Referrals</div>
              </div>
              <div className="text-3xl font-black text-slate-900">0</div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <TrendingUp size={20} />
                <div className="font-semibold text-sm">Active Conversions</div>
              </div>
              <div className="text-3xl font-black text-emerald-600">0</div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <Gift size={20} />
                <div className="font-semibold text-sm">Total Earned</div>
              </div>
              <div className="text-3xl font-black text-blue-600">{currency} 0</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
            <h2 className="text-xl md:text-2xl font-extrabold mb-6">Recent Referrals</h2>
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Share2 size={48} className="mb-4 opacity-20" />
              <p>You haven't referred anyone yet.</p>
              <p className="text-sm mt-2">Share your link and start earning today!</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

