import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Globe, Smartphone, CreditCard, Save, TrendingUp, Key } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...siteSettings });
  const [adminRegion, setAdminRegion] = useState('Global');
  
  // Separate state for keys because they shouldn't live in public firestore 'settings'
  const [apiKeys, setApiKeys] = useState({ STRIPE_SECRET_KEY: '', GEMINI_API_KEY: '' });
  const [savingKeys, setSavingKeys] = useState(false);

  React.useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleReferralChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updatedList = { ...(prev.countryReferrals || {}) };
      if (!updatedList[adminRegion]) updatedList[adminRegion] = {};
      updatedList[adminRegion] = { ...updatedList[adminRegion], [field]: value };
      return { ...prev, countryReferrals: updatedList };
    });
  };

  const handlePlanChange = (idx: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const updatedPlans = { ...(prev.countryPlans || {}) };
      if (!updatedPlans[adminRegion]) updatedPlans[adminRegion] = [];
      const plansArray = [...updatedPlans[adminRegion]];
      if (plansArray[idx]) {
        plansArray[idx] = { ...plansArray[idx], [field]: value };
      }
      updatedPlans[adminRegion] = plansArray;
      return { ...prev, countryPlans: updatedPlans };
    });
  };

  const handleSave = async () => {
    if (activeTab === 'env') {
      handleSaveEnv();
      return;
    }
    
    try {
      await setDoc(doc(db, 'settings', 'system'), formData, { merge: true });
      setSiteSettings(formData);
      alert('Settings saved successfully!');
    } catch (e: any) {
      console.error(e);
      alert('Failed to save settings: ' + e.message);
    }
  };
  
  const handleSaveEnv = async () => {
    if (!apiKeys.STRIPE_SECRET_KEY && !apiKeys.GEMINI_API_KEY) {
      alert("Please enter at least one key to update.");
      return;
    }
    try {
      setSavingKeys(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/admin/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeys)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update env keys');
      alert("Global environment keys updated successfully on the server!");
      setApiKeys({ STRIPE_SECRET_KEY: '', GEMINI_API_KEY: '' });
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    } finally {
      setSavingKeys(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>System Settings</h2>
        <button onClick={handleSave} disabled={savingKeys} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: savingKeys ? 'not-allowed' : 'pointer' }}>
          <Save size={18} /> {savingKeys ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {[
          { id: 'general', label: 'General / App', icon: <Smartphone size={16} /> },
          { id: 'seo', label: 'Global SEO', icon: <Search size={16} /> },
          { id: 'ecommerce', label: 'E-commerce', icon: <CreditCard size={16} /> },
          { id: 'plans', label: 'Plans & Referral', icon: <TrendingUp size={16} /> },
          { id: 'env', label: 'API Keys & Env', icon: <Key size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: 'none', background: 'transparent', 
              color: activeTab === tab.id ? '#2563eb' : '#6b7280', 
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent', 
              fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap'
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
              <input type="text" value={formData.contactEmail || ''} onChange={e => handleChange('contactEmail', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Support Phone</label>
              <input type="text" value={formData.contactPhone || ''} onChange={e => handleChange('contactPhone', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Company Location / Address</label>
            <input type="text" value={formData.contactAddress || ''} onChange={e => handleChange('contactAddress', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Primary Color (Hex)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="color" defaultValue="#0f172a" style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
              <input type="text" defaultValue="#0f172a" style={{ width: 120, padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Social Media Links</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input type="text" placeholder="Facebook URL" value={formData.socialFacebook || ''} onChange={e => handleChange('socialFacebook', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              <input type="text" placeholder="Twitter / X URL" value={formData.socialTwitter || ''} onChange={e => handleChange('socialTwitter', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              <input type="text" placeholder="LinkedIn URL" value={formData.socialLinkedin || ''} onChange={e => handleChange('socialLinkedin', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
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
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Region Specific Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={18} color="#6b7280" />
              <select 
                value={adminRegion}
                onChange={e => setAdminRegion(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', fontWeight: 600, color: '#374151' }}
              >
                <option value="Global">Global Region</option>
                <option value="India">India</option>
                <option value="UAE">UAE</option>
              </select>
            </div>
          </div>

          {/* Referral Rules */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Referral Rewards ({adminRegion})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Free Trial Period (Global Settings)</label>
                <input type="text" value={formData.trialPeriod || ''} onChange={e => handleChange('trialPeriod', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Referral Success Window (Days)</label>
                <input type="number" value={formData.referralPurchaseWindow || 0} onChange={e => handleChange('referralPurchaseWindow', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Currency</label>
                <input type="text" value={formData.countryReferrals?.[adminRegion]?.currency || ''} onChange={e => handleReferralChange('currency', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Welcome Bonus (New User Wallet)</label>
                <input type="number" value={formData.countryReferrals?.[adminRegion]?.welcomeBonus || 0} onChange={e => handleReferralChange('welcomeBonus', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Normal User Sharing Reward</label>
                <input type="number" value={formData.countryReferrals?.[adminRegion]?.normalUserReward || 0} onChange={e => handleReferralChange('normalUserReward', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Profile Owner Shared Reward</label>
                <input type="number" value={formData.countryReferrals?.[adminRegion]?.profileOwnerReward || 0} onChange={e => handleReferralChange('profileOwnerReward', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Profile Owner Direct Commission</label>
                <input type="number" value={formData.countryReferrals?.[adminRegion]?.directCommission || 0} onChange={e => handleReferralChange('directCommission', Number(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Subscription Plans ({adminRegion})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {(formData.countryPlans?.[adminRegion] || []).map((plan: any, idx: number) => (
                <div key={idx} style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 16, background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Plan Name</label>
                      <input 
                        type="text" 
                        value={plan.name} 
                        onChange={e => handlePlanChange(idx, 'name', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Price (Label)</label>
                      <input 
                        type="text" 
                        value={plan.price} 
                        onChange={e => handlePlanChange(idx, 'price', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Badge Text</label>
                      <input 
                        type="text" 
                        value={plan.badge} 
                        onChange={e => handlePlanChange(idx, 'badge', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Included Features & Modules</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                      {[
                        'Custom Templates', 'E-commerce Shop', 'Lead Capture Form',
                        'Appointment Booking', 'AI Chatbot', 'Analytics Dashboard',
                        'Referral Program', 'Premium Themes', 'Custom Domain Link',
                        'SEO Tools', 'WhatsApp Integration', 'Digital Business Card'
                      ].map(feature => {
                        const isChecked = plan.features?.includes(feature);
                        return (
                          <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={e => {
                                const currentFeatures = plan.features || [];
                                const newFeatures = e.target.checked 
                                  ? [...currentFeatures, feature] 
                                  : currentFeatures.filter((f: string) => f !== feature);
                                handlePlanChange(idx, 'features', newFeatures);
                              }}
                              style={{ width: 16, height: 16 }}
                            />
                            {feature}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="checkbox" 
                      checked={plan.popular} 
                      onChange={e => handlePlanChange(idx, 'popular', e.target.checked)}
                      id={`popular-${adminRegion}-${idx}`}
                    />
                    <label htmlFor={`popular-${adminRegion}-${idx}`} style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Mark as Recommended/Popular Plan</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'env' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, display: 'flex', gap: 12, color: '#1e40af' }}>
            <Key size={24} />
            <div>
              <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>Global Environment Variables</h4>
              <p style={{ margin: 0, fontSize: 14 }}>These keys are saved directly to your server's .env file and active process. No restart required. For security, current keys are hidden.</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>VITE_STRIPE_SECRET_KEY / STRIPE_SECRET_KEY</label>
            <input 
              type="password" 
              placeholder="sk_test_..." 
              value={apiKeys.STRIPE_SECRET_KEY} 
              onChange={e => setApiKeys(prev => ({ ...prev, STRIPE_SECRET_KEY: e.target.value }))} 
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
            />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Super Admin Server-side Stripe Key for checkout sessions.</p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>GEMINI_API_KEY / VITE_GEMINI_API_KEY</label>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              value={apiKeys.GEMINI_API_KEY} 
              onChange={e => setApiKeys(prev => ({ ...prev, GEMINI_API_KEY: e.target.value }))} 
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
            />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>The default fall-back AI Key if a specific profile owner has not added their own key.</p>
          </div>
        </div>
      )}

    </div>
  );
}
