import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Globe, Smartphone, CreditCard, Save, TrendingUp } from 'lucide-react';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...siteSettings });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSiteSettings(formData);
    alert('Settings saved successfully!');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>System Settings</h2>
        <button onClick={handleSave} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {[
          { id: 'general', label: 'General / App', icon: <Smartphone size={16} /> },
          { id: 'seo', label: 'Global SEO', icon: <Search size={16} /> },
          { id: 'ecommerce', label: 'E-commerce', icon: <CreditCard size={16} /> },
          { id: 'plans', label: 'Plans & Referral', icon: <TrendingUp size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: 'none', background: 'transparent', 
              color: activeTab === tab.id ? '#2563eb' : '#6b7280', 
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent', 
              fontWeight: 600, cursor: 'pointer', fontSize: 14 
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Platform Name</label>
            <input type="text" value={formData.siteName || ''} onChange={e => handleChange('siteName', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Support Email</label>
              <input type="text" defaultValue="support@dbc.ae" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Support Phone</label>
              <input type="text" defaultValue="+971 800 12345" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Primary Color (Hex)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="color" defaultValue="#0f172a" style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
              <input type="text" defaultValue="#0f172a" style={{ width: 120, padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, display: 'flex', gap: 12, color: '#1e40af' }}>
            <Search size={24} />
            <div>
              <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>Google Top Rank Setup</h4>
              <p style={{ margin: 0, fontSize: 14 }}>These meta tags define how your platform appears on Google and sharing platforms. Ensure relevant keywords are used.</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Global SEO Title (Meta Title)</label>
            <input type="text" value={formData.seoTitle || ''} onChange={e => handleChange('seoTitle', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Ideal length: 50-60 characters</p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Global SEO Description (Meta Description)</label>
            <textarea value={formData.seoDesc || ''} onChange={e => handleChange('seoDesc', e.target.value)} rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit' }} />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Ideal length: 150-160 characters</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Target Keywords</label>
            <input type="text" value={formData.seoKeywords || ''} onChange={e => handleChange('seoKeywords', e.target.value)} placeholder="Comma separated, e.g. nfc, smart card, networking" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Profile Specific SEO Format</label>
            <input type="text" defaultValue="{Profile Name} | {Company} | DBC Official Member" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#f9fafb' }} />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Template for automated SEO generation of user profiles.</p>
          </div>
        </div>
      )}

      {activeTab === 'ecommerce' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Base Currency</label>
              <select value={formData.currency || 'USD'} onChange={e => handleChange('currency', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }}>
                <option value="AED">AED - Emirati Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Tax Rate (%)</label>
              <input type="number" defaultValue="5" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Promo Codes (Active)</label>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>DBC10</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Flat 10% Off on all physical products</div>
               </div>
               <button style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Revoke</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Referral Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Free Trial Period</label>
                <input type="text" value={formData.trialPeriod || ''} onChange={e => handleChange('trialPeriod', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Referral Success Window (Days)</label>
                <input type="number" value={formData.referralPurchaseWindow || 0} onChange={e => handleChange('referralPurchaseWindow', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Referrer Reward (Amount)</label>
                <input type="number" value={formData.referrerReward || 0} onChange={e => handleChange('referrerReward', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Referee Reward (Amount)</label>
                <input type="number" value={formData.refereeReward || 0} onChange={e => handleChange('refereeReward', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Manage Subscription Plans</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(formData.plans || []).map((plan: any, idx: number) => (
                <div key={idx} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Plan Name</label>
                      <input 
                        type="text" 
                        value={plan.name} 
                        onChange={e => {
                          const newPlans = [...formData.plans];
                          newPlans[idx].name = e.target.value;
                          setFormData({...formData, plans: newPlans});
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Price (Label)</label>
                      <input 
                        type="text" 
                        value={plan.price} 
                        onChange={e => {
                          const newPlans = [...formData.plans];
                          newPlans[idx].price = e.target.value;
                          setFormData({...formData, plans: newPlans});
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Badge Text</label>
                      <input 
                        type="text" 
                        value={plan.badge} 
                        onChange={e => {
                          const newPlans = [...formData.plans];
                          newPlans[idx].badge = e.target.value;
                          setFormData({...formData, plans: newPlans});
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="checkbox" 
                      checked={plan.popular} 
                      onChange={e => {
                        const newPlans = [...formData.plans];
                        newPlans[idx].popular = e.target.checked;
                        setFormData({...formData, plans: newPlans});
                      }}
                      id={`popular-${idx}`}
                    />
                    <label htmlFor={`popular-${idx}`} style={{ fontSize: 13, color: '#374151' }}>Mark as Popular</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
