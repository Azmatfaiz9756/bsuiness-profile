import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentModal } from '../../components/PaymentModal';

export default function FrontendPlans() {
  const { siteSettings, user, setIsLoginModalOpen, selectedCountry } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const trialPeriod = siteSettings.trialPeriod || '1 Month';
  
  // Use country specific plans if available, else fallback to Global or default
  const defaultPlans = [
    { name: 'Basic', price: 'Free', popular: false, badge: 'BASIC', features: ['5 Services', 'Basic Profile', 'QR Code'] },
    { name: 'Pro', price: '$19', popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot', 'Lead Management'] },
    { name: 'Premium', price: '$49', popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain'] },
    { name: 'Enterprise', price: '$199', popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate Branding', 'Admin Dashboard'] }
  ];
  
  const plans = siteSettings?.countryPlans?.[selectedCountry] || siteSettings?.countryPlans?.['Global'] || defaultPlans;

  const handleStartTrial = async (plan: any) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (plan.price === 'Free') {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../firebase');
        // If the user has a profile, update their plan to Free. If not, they'll create it later.
        const userRef = doc(db, 'profiles', user.uid);
        const refCode = localStorage.getItem('dbc_referred_by');
        const updateData: any = { plan: plan.name, updatedAt: new Date().toISOString() };
        if (refCode) {
          updateData.referredBy = refCode;
        }
        await updateDoc(userRef, updateData);
        alert(`Successfully subscribed to ${plan.name} plan!`);
      } catch (err) {
        console.error("Trial start error:", err);
        alert('Could not start trial. Please try again or create a profile first.');
      }
    } else {
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="px-4 py-8 md:py-16 bg-slate-50 min-h-screen">
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        plan={selectedPlan} 
      />
      
      <div className="text-center mb-10">
        <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 mb-4 tracking-wide uppercase">
          {trialPeriod} FREE TRIAL
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">Simple, transparent pricing</h2>
        <p className="text-sm md:text-base text-slate-500">No hidden fees. Cancel anytime. All plans include {trialPeriod.toLowerCase()} free trial.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
        {plans.map((plan: any) => (
          <div key={plan.name} className={`rounded-2xl p-6 text-center shadow-sm border ${plan.popular ? 'bg-blue-50/50 border-blue-500 shadow-blue-100' : 'bg-white border-slate-200'}`}>
            <div className={`text-[10px] font-bold rounded-full px-3 py-1 inline-block mb-4 tracking-wide ${plan.popular ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
               {plan.badge}
            </div>
            <div className={`text-base font-extrabold mb-1 ${plan.popular ? 'text-blue-600' : 'text-slate-900'}`}>{plan.name}</div>
            <div className="text-3xl font-black text-slate-900 mb-6">{plan.price}<sub className="text-xs text-slate-500 font-medium bottom-0">/yr</sub></div>
            
            <div className="text-left flex flex-col gap-3 mb-8">
               {plan.features && plan.features.length > 0 ? plan.features.map((feature: string, idx: number) => (
                 <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                   <span className="text-emerald-500 font-bold mt-0.5">✓</span> {feature}
                 </div>
               )) : (
                 <>
                   <div className="flex items-start gap-2 text-sm text-slate-600">
                     <span className="text-emerald-500 font-bold mt-0.5">✓</span> Digital profile page
                   </div>
                   <div className="flex items-start gap-2 text-sm text-slate-600">
                     <span className="text-emerald-500 font-bold mt-0.5">✓</span> Basic NFC card
                   </div>
                   <div className="flex items-start gap-2 text-sm text-slate-600">
                     <span className="text-emerald-500 font-bold mt-0.5">✓</span> Wallet + top-up
                   </div>
                 </>
               )}
            </div>
            
            <button onClick={() => handleStartTrial(plan)} className={`w-full justify-center py-2.5 rounded-lg text-sm font-bold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}`}>
              Start Free Trial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
