import React from 'react';

export default function FrontendPlans() {
  return (
    <div className="px-4 py-8 md:py-16 bg-slate-50 min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 mb-4 tracking-wide">
          7 DAYS FREE TRIAL
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">Simple, transparent pricing</h2>
        <p className="text-sm md:text-base text-slate-500">No hidden fees. Cancel anytime. All plans include 7-day free trial.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
        {[
          { name: 'Standard', price: 'AED 299', popular: false, badge: 'STANDARD' },
          { name: 'Premium', price: 'AED 599', popular: true, badge: 'MOST POPULAR' },
          { name: 'Business Pro', price: 'AED 1,199', popular: false, badge: 'BUSINESS PRO' }
        ].map(plan => (
          <div key={plan.name} className={`rounded-2xl p-6 text-center shadow-sm border ${plan.popular ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-slate-200'}`}>
            <div className={`text-[10px] font-bold rounded-full px-3 py-1 inline-block mb-4 tracking-wide ${plan.popular ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
               {plan.badge}
            </div>
            <div className={`text-base font-extrabold mb-1 ${plan.popular ? 'text-blue-600' : 'text-slate-900'}`}>{plan.name}</div>
            <div className="text-3xl font-black text-slate-900 mb-6">{plan.price}<sub className="text-xs text-slate-500 font-medium bottom-0">/yr</sub></div>
            
            <div className="text-left flex flex-col gap-3 mb-8">
               <div className="flex items-start gap-2 text-sm text-slate-600">
                 <span className="text-emerald-500 font-bold mt-0.5">✓</span> Digital profile page
               </div>
               <div className="flex items-start gap-2 text-sm text-slate-600">
                 <span className="text-emerald-500 font-bold mt-0.5">✓</span> Basic NFC card
               </div>
               <div className="flex items-start gap-2 text-sm text-slate-600">
                 <span className="text-emerald-500 font-bold mt-0.5">✓</span> Wallet + top-up
               </div>
            </div>
            
            <button className={`w-full justify-center py-2.5 rounded-lg text-sm font-bold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}`}>
              Start Free Trial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
