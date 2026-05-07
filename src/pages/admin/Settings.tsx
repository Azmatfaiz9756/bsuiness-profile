import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Globe, Smartphone, CreditCard, Save, TrendingUp, Key, Sparkles, Wand2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ProxyGoogleGenAI } from '../../lib/gemini';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...siteSettings });
  const [adminRegion, setAdminRegion] = useState('Global');
  
  // Separate state for keys because they shouldn't live in public firestore 'settings'
  const [apiKeys, setApiKeys] = useState({ STRIPE_SECRET_KEY: '', GEMINI_API_KEY: '' });
  const [savingKeys, setSavingKeys] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

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
      const apiUrl = '';
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

  const generateAiMarquee = async () => {
    try {
      setGeneratingAi(true);
      const ai = new ProxyGoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Generate a catchy, short, and professional scrolling marquee text for a Digital Business Card platform.
      Rules:
      - Use emojis and icons for high visibility.
      - Keep it professional yet urgent (Hurry up, limited time, etc).
      - Include focus on NFC cards, saving contacts, or digital profiles.
      - It should be in 1 line.
      - Return ONLY the text, nothing else.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const text = result.candidates[0].content.parts[0].text.trim();
      handleChange('marqueeText', text);
    } catch (err) {
      console.error(err);
      alert("AI Generation failed. Ensure VITE_GEMINI_API_KEY is set.");
    } finally {
      setGeneratingAi(false);
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
          { id: 'promotions', label: 'Promotions', icon: <Sparkles size={16} /> },
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

      {activeTab === 'promotions' && (
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, display: 'flex', gap: 12, color: '#1e40af' }}>
            <Sparkles size={24} />
            <div>
              <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>Free Trial & Promotion Banner</h4>
              <p style={{ margin: 0, fontSize: 14 }}>Manage global free trial rules and the marketing banner shown to all visitors. These changes apply instantly to the homepage and pricing sections.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <input 
              type="checkbox" 
              checked={formData.trialEnabled || false} 
              onChange={e => handleChange('trialEnabled', e.target.checked)}
              id="trialEnabled"
              style={{ width: 20, height: 20 }}
            />
            <div>
              <label htmlFor="trialEnabled" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#111827', cursor: 'pointer' }}>Enable Global Free Trial Offer</label>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>If enabled, a promotional banner will appear and eligible plans will show trial buttons.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Trial Duration (Months)</label>
              <input 
                type="number" 
                value={formData.trialMonths || 1} 
                onChange={e => handleChange('trialMonths', Number(e.target.value))} 
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Banner Accent Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                 <input 
                    type="color" 
                    value={formData.bannerColor || '#2563eb'} 
                    onChange={e => handleChange('bannerColor', e.target.value)} 
                    style={{ width: 44, height: 44, padding: 2, border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', background: '#fff' }} 
                 />
                 <input 
                    type="text" 
                    value={formData.bannerColor || '#2563eb'} 
                    onChange={e => handleChange('bannerColor', e.target.value)} 
                    style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
                 />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Banner Headline</label>
            <input 
              type="text" 
              value={formData.trialHeadline || 'HURRY UP! GET 1 MONTH FREE TRIAL ON PRO VERSION'} 
              onChange={e => handleChange('trialHeadline', e.target.value)} 
              placeholder="e.g. HURRY UP! GET 1 MONTH FREE TRIAL"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Banner Button Text</label>
            <input 
              type="text" 
              value={formData.trialBtnText || 'CLAIM NOW'} 
              onChange={e => handleChange('trialBtnText', e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8 }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Promotion Banner Slides</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(formData.promotionSlides || []).map((slide: any, sIdx: number) => (
                <div key={sIdx} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Headline</label>
                      <input 
                        type="text" 
                        value={slide.headline} 
                        onChange={e => {
                          const updated = [...formData.promotionSlides];
                          updated[sIdx].headline = e.target.value;
                          handleChange('promotionSlides', updated);
                        }}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Button Text</label>
                      <input 
                        type="text" 
                        value={slide.btnText} 
                        onChange={e => {
                          const updated = [...formData.promotionSlides];
                          updated[sIdx].btnText = e.target.value;
                          handleChange('promotionSlides', updated);
                        }}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Link URL</label>
                      <input 
                        type="text" 
                        value={slide.link} 
                        onChange={e => {
                          const updated = [...formData.promotionSlides];
                          updated[sIdx].link = e.target.value;
                          handleChange('promotionSlides', updated);
                        }}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Background Color</label>
                      <input 
                        type="color" 
                        value={slide.color} 
                        onChange={e => {
                          const updated = [...formData.promotionSlides];
                          updated[sIdx].color = e.target.value;
                          handleChange('promotionSlides', updated);
                        }}
                        style={{ width: '100%', height: 40, padding: 2, border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', background: '#fff' }} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = formData.promotionSlides.filter((_: any, i: number) => i !== sIdx);
                      handleChange('promotionSlides', updated);
                    }}
                    style={{ marginTop: 12, border: 'none', background: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Remove Slide
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const updated = [...(formData.promotionSlides || []), { id: Date.now().toString(), headline: 'NEW OFFER!', btnText: 'CHECK NOW', link: '/', color: '#2563eb' }];
                  handleChange('promotionSlides', updated);
                }}
                style={{ padding: '10px 16px', border: '1px dashed #d1d5db', borderRadius: 12, background: '#fff', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add New Promotion Slide
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Scrolling Marquee Settings</label>
            <div style={{ background: '#f9fafb', padding: 24, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input 
                    type="checkbox" 
                    checked={formData.marqueeEnabled || false} 
                    onChange={e => handleChange('marqueeEnabled', e.target.checked)}
                    id="marqueeEnabled"
                    style={{ width: 20, height: 20 }}
                  />
                  <label htmlFor="marqueeEnabled" style={{ fontSize: 14, fontWeight: 700, color: '#111827', cursor: 'pointer' }}>Show Global Scrolling Marquee</label>
               </div>
               
               <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>Marquee Content</label>
                    <button 
                      onClick={generateAiMarquee}
                      disabled={generatingAi}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', border: '1px solid #d1d5db', fontSize: 11, fontWeight: 700, color: '#374151', cursor: generatingAi ? 'not-allowed' : 'pointer' }}
                    >
                      <Wand2 size={12} className={generatingAi ? 'animate-spin' : ''} /> {generatingAi ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <textarea 
                    value={formData.marqueeText || ''} 
                    onChange={e => handleChange('marqueeText', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}
                  />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Background Color</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <input 
                          type="color" 
                          value={formData.marqueeBgColor || '#2563eb'} 
                          onChange={e => handleChange('marqueeBgColor', e.target.value)} 
                          style={{ width: 36, height: 36, padding: 2, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }} 
                       />
                       <input 
                          type="text" 
                          value={formData.marqueeBgColor || '#2563eb'} 
                          onChange={e => handleChange('marqueeBgColor', e.target.value)} 
                          style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} 
                       />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Text Color</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <input 
                          type="color" 
                          value={formData.marqueeTextColor || '#ffffff'} 
                          onChange={e => handleChange('marqueeTextColor', e.target.value)} 
                          style={{ width: 36, height: 36, padding: 2, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }} 
                       />
                       <input 
                          type="text" 
                          value={formData.marqueeTextColor || '#ffffff'} 
                          onChange={e => handleChange('marqueeTextColor', e.target.value)} 
                          style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} 
                       />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>Scroll Speed</label>
                    <input 
                      type="number" 
                      value={formData.marqueeSpeed || 30} 
                      onChange={e => handleChange('marqueeSpeed', Number(e.target.value))} 
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}
                    />
                    <p style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Time in sec (Higher is slower)</p>
                  </div>
               </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Apply Trial to Following Plans</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['Pro', 'Premium', 'Enterprise'].map(plan => (
                <label key={plan} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', background: (formData.trialPlans || []).includes(plan) ? '#f0f9ff' : 'white' }}>
                  <input 
                    type="checkbox" 
                    checked={(formData.trialPlans || []).includes(plan)}
                    onChange={e => {
                      const current = formData.trialPlans || [];
                      const updated = e.target.checked ? [...current, plan] : current.filter((p: string) => p !== plan);
                      handleChange('trialPlans', updated);
                    }}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{plan} Plan</span>
                </label>
              ))}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Plan Name</label>
                      <input 
                        type="text" 
                        value={plan.name} 
                        onChange={e => handlePlanChange(idx, 'name', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Actual Price</label>
                      <input 
                        type="text" 
                        value={plan.price} 
                        onChange={e => handlePlanChange(idx, 'price', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Old Price (Strike)</label>
                      <input 
                        type="text" 
                        value={plan.originalPrice || ''} 
                        onChange={e => handlePlanChange(idx, 'originalPrice', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Off %</label>
                      <input 
                        type="number" 
                        value={plan.discount || 0} 
                        onChange={e => handlePlanChange(idx, 'discount', Number(e.target.value))}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>Badge Text</label>
                      <input 
                        type="text" 
                        value={plan.badge} 
                        onChange={e => handlePlanChange(idx, 'badge', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} 
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
