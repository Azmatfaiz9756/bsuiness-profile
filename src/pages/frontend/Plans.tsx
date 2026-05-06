import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentModal } from '../../components/PaymentModal';

export default function FrontendPlans() {
  const { siteSettings, user, setIsLoginModalOpen, selectedCountry } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const trialMonths = siteSettings?.trialMonths || 1;
  const trialPeriod = siteSettings?.trialPeriod || `${trialMonths} Month${trialMonths > 1 ? 's' : ''}`;
  const trialEnabled = siteSettings?.trialEnabled || false;
  const trialPlans = siteSettings?.trialPlans || ['Pro'];
  
  // Use country specific plans if available, else fallback to Global or default
  const defaultPlans = [
    { name: 'Basic', price: 'Free', popular: false, badge: 'BASIC', features: ['Digital Profile Page', 'NFC Card Connectivity', '5 Business Services', 'Basic QR Code', 'Standard Support'] },
    { name: 'Pro', price: '$19', popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot Integration', 'Lead Management System', 'Lead Capture Form', 'Referral Program', 'WhatsApp Integration', 'Digital Business Card', 'Appointment Booking', 'Advanced Analytics', 'Custom Branding'] },
    { name: 'Premium', price: '$49', popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain Mapping', 'Custom Templates', 'E-commerce Shop', 'Analytics Dashboard', 'Premium Themes', 'SEO Tools', 'Team/Staff Management (2 Seats)', 'VIP Support', 'API Access'] },
    { name: 'Enterprise', price: '$199', popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate White-labeling', 'Advanced Admin Dashboard', 'Custom Domain Link', 'Dedicated Account Manager', 'Custom Integrations', 'Bulk Export Tools', 'Priority Development', 'All Premium Features'] }
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
        const userRef = doc(db, 'profiles', user.uid);
        const refCode = localStorage.getItem('dbc_referred_by');
        const updateData: any = { plan: plan.name, updatedAt: new Date().toISOString() };
        if (refCode) {
          updateData.referredBy = refCode;
        }
        await updateDoc(userRef, updateData);
        alert(`Successfully subscribed to ${plan.name} plan!`);
        window.location.reload();
      } catch (err) {
        console.error("Trial start error:", err);
        alert('Could not start trial. Please try again or create a profile first.');
      }
    } else if (trialEnabled && trialPlans.includes(plan.name)) {
        const confirmTrial = window.confirm(`Start your ${trialMonths}-month FREE trial of the ${plan.name} plan? No credit card required.`);
        if (confirmTrial) {
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../../firebase');
            const userRef = doc(db, 'profiles', user.uid);
            
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + trialMonths);
            
            const updateData: any = { 
              plan: plan.name, 
              isTrial: true,
              expiry: expiryDate.toISOString().split('T')[0],
              updatedAt: new Date().toISOString() 
            };
            
            await updateDoc(userRef, updateData);
            alert(`Your ${trialMonths}-month free trial of ${plan.name} is now active! Expires on ${updateData.expiry}`);
            window.location.href = '/dashboard';
          } catch (err) {
            console.error("Trial activation error:", err);
            setSelectedPlan(plan);
            setIsPaymentModalOpen(true);
          }
        }
    } else {
        // Not a trial plan or trial disabled, go straight to payment
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
        {trialEnabled && (
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 mb-4 tracking-wide uppercase">
            LIMITED OFFER: {trialMonths} MONTH{trialMonths > 1 ? 'S' : ''} FREE TRIAL ON {trialPlans.join(' & ')}
          </div>
        )}
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">Simple, transparent pricing</h2>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">Choose the plan that fits your growth. {trialEnabled ? `Get started with our ${trialPlans[0]} plan trial today.` : 'Get started with our premium plans today.'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
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
              {plan.price === 'Free' ? 'Choose Basic' : (trialEnabled && trialPlans.includes(plan.name) ? 'Start Free Trial' : 'Buy Now')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
