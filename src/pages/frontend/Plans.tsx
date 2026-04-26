import React from 'react';

export default function FrontendPlans() {
  return (
    <div className="section">
      <div style={{textAlign: 'center', marginBottom: 28}}>
        <div style={{display: 'inline-block', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 'var(--r999)', padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 12}}>
          7 DAYS FREE TRIAL
        </div>
        <div className="section-title">Simple, transparent pricing</div>
        <div className="section-sub">No hidden fees. Cancel anytime. All plans include 7-day free trial.</div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 800, margin: '0 auto 24px'}}>
        {[
          { name: 'Standard', price: 'AED 299', popular: false, badge: 'STANDARD', badgeClass: 'badge-gray', color: 'var(--blk2)' },
          { name: 'Premium', price: 'AED 599', popular: true, badge: 'MOST POPULAR', badgeClass: 'badge-blue', color: 'var(--blue)' },
          { name: 'Business Pro', price: 'AED 1,199', popular: false, badge: 'BUSINESS PRO', badgeClass: 'badge-purple', color: 'var(--blk2)' }
        ].map(plan => (
          <div key={plan.name} style={{background: plan.popular ? '#f0f7ff' : 'var(--w)', border: `1.5px solid ${plan.popular ? 'var(--blue)' : 'var(--bdr)'}`, borderRadius: 'var(--r16)', padding: 24, textAlign: 'center'}}>
            <div style={{fontSize: 10, fontWeight: 700, background: plan.popular ? '#dbeafe' : '#f1f5f9', color: plan.popular ? '#1e40af' : '#475569', padding: '4px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 12}}>
               {plan.badge}
            </div>
            <div style={{fontSize: 16, fontWeight: 800, color: plan.color, marginBottom: 4}}>{plan.name}</div>
            <div style={{fontSize: 28, fontWeight: 900, color: 'var(--blk2)', marginBottom: 20}}>{plan.price}<sub style={{fontSize: 12, color: 'var(--gray)', fontWeight: 400}}>/yr</sub></div>
            
            <div style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24}}>
               <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray2)'}}>
                 <span style={{color: 'var(--grn)', fontWeight: 700}}>✓</span> Digital profile page
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray2)'}}>
                 <span style={{color: 'var(--grn)', fontWeight: 700}}>✓</span> Basic NFC card
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray2)'}}>
                 <span style={{color: 'var(--grn)', fontWeight: 700}}>✓</span> Wallet + top-up
               </div>
            </div>
            
            <button className={`btn w-full justify-center ${plan.popular ? 'btn-blue' : 'btn-outline'}`}>
              Start Free Trial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
