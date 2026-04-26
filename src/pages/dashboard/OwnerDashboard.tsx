import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, Calendar, MessageSquare, Image, Shield, Send } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

function DashboardChatTester({ profile }: { profile: any }) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'ar' | null>(null);

  const greetings = {
    hi: `Namaste! Main ${profile?.name} ka AI assistant hoon. Main aapki kaise madad kar sakta hoon?`,
    en: `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`,
    ar: `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`
  };

  const prompts = {
    hi: `Aap ${profile.name} ke AI assistant hain. Aapko hamesha North India ki aam Hindustani (Hindi-Urdu mix) mein baat karni hai jo Delhi style mein boli jati hai.
Polite rahein aur 'Aap' ka use karein, lekin bohot zyada mushkil Urdu words use na karein. 
Simple words zyada use karein, sanskrit-heavy words (jaise 'vistar', 'mukhya', 'adhik') bilkul use na karein. Unki jagah 'zyada info', 'khas', 'zyada' use karein.
Context: Aap ${profile.name} (Title: ${profile.title} at ${profile.company}) ko represent karte hain.
Bio: ${profile.bio}. Contact email: ${profile.email}. Phone: ${profile.phone}.`,
    en: `You are a professional AI business assistant for ${profile?.name} (Title: ${profile?.title} at ${profile?.company}).
Your tone should be helpful, clear, and professional. 
Context: ${profile?.bio}. Contact: Email: ${profile?.email}, Phone: ${profile?.phone}.`,
    ar: `أنت مساعد ذكي محترف لـ ${profile?.name} (المسمى الوظيفي: ${profile?.title} في ${profile?.company}).
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة خليجية بيضاء أو فصحى مهذبة).
السياق: ${profile?.bio}. التواصل: البريد: ${profile?.email}, الهاتف: ${profile?.phone}.`
  };

  useEffect(() => {
    if (selectedLang) {
      setMessages([{ role: 'model', content: greetings[selectedLang] }]);
    }
  }, [selectedLang]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !selectedLang) return;
    const newMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      contents.push({
        role: 'user',
        parts: [{ text: newMsg }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: profile.aiPrompt || prompts[selectedLang],
        },
        contents: contents,
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Connection error' }]);
      }
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setMessages(prev => [...prev, { role: 'model', content: 'Network or API error' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!selectedLang ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>Select test language:</span>
              <button onClick={() => setSelectedLang('en')} style={{ width: '150px', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>English</button>
              <button onClick={() => setSelectedLang('hi')} style={{ width: '150px', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>Hindustani</button>
              <button onClick={() => setSelectedLang('ar')} style={{ width: '150px', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>Arabic</button>
           </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ background: msg.role === 'user' ? '#2563eb' : '#fff', color: msg.role === 'user' ? '#fff' : '#1e293b', border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 12, borderBottomRightRadius: msg.role === 'user' ? 0 : 12, borderBottomLeftRadius: msg.role === 'model' ? 0 : 12, fontSize: 14 }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && <div style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: '#64748b' }}>Typing...</div>}
      </div>
      {selectedLang && (
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: 8 }}>
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Test message..." 
            style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid #cbd5e1', outline: 'none' }} 
          />
          <button onClick={sendMessage} style={{ background: '#2563eb', color: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
        </div>
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  const { user, authLoading } = useAppContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [sidebarTab, setSidebarTab] = useState('profile');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [emailError, setEmailError] = useState('');
  const [campaignData, setCampaignData] = useState({ subject: '', message: '', ctaLink: '' });
  const [campaignLoading, setCampaignLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setFormData(docSnap.data());
        } else {
          // Initialize empty profile
          const emptyProfile = {
            id: `DBC${Date.now().toString().slice(-9)}`,
            slug: user.uid.substring(0, 8),
            name: user.displayName || '',
            email: user.email || '',
            ownerId: user.uid,
            plan: 'Basic',
            status: 'Active',
            views: 0,
            seo: { title: '', desc: '', keywords: '' },
          };
          setProfile(emptyProfile);
          setFormData(emptyProfile);
          // Auto create
          await setDoc(docRef, emptyProfile);
          
          // Trigger Welcome Email
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: emptyProfile.email,
                subject: 'Swaagat hai! Welcome to DBC Network',
                type: 'welcome',
                data: {
                  name: emptyProfile.name,
                  profileUrl: `${window.location.origin}/profile/${emptyProfile.slug}`
                }
              })
            });
          } catch (emailErr) {
            console.error("Welcome email failed:", emailErr);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  // Fetch appointments when sidebarTab matches
  useEffect(() => {
    if (sidebarTab === 'appointments' && profile?.id) {
      import('firebase/firestore').then(({ collection, query, where, getDocs, orderBy }) => {
        const q = query(collection(db, 'appointments'), where('profileId', '==', profile.id));
        getDocs(q).then(snapshot => {
          setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      });
    }
  }, [sidebarTab, profile]);

  if (authLoading || loading) return <div style={{padding: 40}}>Loading Dashboard...</div>;
  if (!user) return <Navigate to="/" />;
  if (!profile && !loading) return <div style={{padding: 40}}>Error: Profile could not be loaded. Please check your permissions or try again.</div>;

  const handleSave = async () => {
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Invalid email format');
      alert('Please correct the email address before saving.');
      return;
    }
    setEmailError('');

    try {
      await setDoc(doc(db, 'profiles', user.uid), formData, { merge: true });
      setProfile(formData);
      alert('Profile updated and published securely!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      <div style={{ width: 250, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Business Portal</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>DBC Access</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 0' }}>
          <div onClick={() => setSidebarTab('profile')} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: sidebarTab === 'profile' ? '#0f172a' : 'transparent', borderLeft: sidebarTab === 'profile' ? '3px solid #3b82f6' : '3px solid transparent', color: sidebarTab === 'profile' ? '#fff' : '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}><LayoutDashboard size={18} /> My Profile</div>
          <div onClick={() => setSidebarTab('appointments')} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: sidebarTab === 'appointments' ? '#0f172a' : 'transparent', borderLeft: sidebarTab === 'appointments' ? '3px solid #3b82f6' : '3px solid transparent', color: sidebarTab === 'appointments' ? '#fff' : '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}><Calendar size={18} /> Appointments</div>
          <div onClick={() => setSidebarTab('chatbot')} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: sidebarTab === 'chatbot' ? '#0f172a' : 'transparent', borderLeft: sidebarTab === 'chatbot' ? '3px solid #3b82f6' : '3px solid transparent', color: sidebarTab === 'chatbot' ? '#fff' : '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}><MessageSquare size={18} /> AI Chatbot</div>
          <div onClick={() => setSidebarTab('campaigns')} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: sidebarTab === 'campaigns' ? '#0f172a' : 'transparent', borderLeft: sidebarTab === 'campaigns' ? '3px solid #3b82f6' : '3px solid transparent', color: sidebarTab === 'campaigns' ? '#fff' : '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}><Send size={18} /> Email Campaigns</div>
          <div onClick={() => setSidebarTab('plan')} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, background: sidebarTab === 'plan' ? '#0f172a' : 'transparent', borderLeft: sidebarTab === 'plan' ? '3px solid #3b82f6' : '3px solid transparent', color: sidebarTab === 'plan' ? '#fff' : '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}><Settings size={18} /> Subscription</div>
        </div>
        <div style={{ padding: '20px' }}><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>← Back to Site</Link></div>
      </div>

      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Manage Your Digital Card</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to={`/profile/${profile?.slug || profile?.id}`} className="btn btn-outline" style={{ background: '#fff', padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: 8, textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}>Preview Live</Link>
            <button onClick={handleSave} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {sidebarTab === 'profile' && (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                 <button onClick={() => setActiveTab('basic')} style={{ padding: '16px 20px', background: activeTab === 'basic' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'basic' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'basic' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Basic Info</button>
                 <button onClick={() => setActiveTab('contact')} style={{ padding: '16px 20px', background: activeTab === 'contact' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'contact' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'contact' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Contact & Location</button>
                 <button onClick={() => setActiveTab('social')} style={{ padding: '16px 20px', background: activeTab === 'social' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'social' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'social' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Socials</button>
                 <button onClick={() => setActiveTab('business')} style={{ padding: '16px 20px', background: activeTab === 'business' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'business' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'business' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Services & Business</button>
                 <button onClick={() => setActiveTab('media')} style={{ padding: '16px 20px', background: activeTab === 'media' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'media' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'media' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Media & Gallery</button>
                 <button onClick={() => setActiveTab('bank')} style={{ padding: '16px 20px', background: activeTab === 'bank' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'bank' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'bank' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Bank Details</button>
                 <button onClick={() => setActiveTab('widgets')} style={{ padding: '16px 20px', background: activeTab === 'widgets' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'widgets' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'widgets' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Action Buttons</button>
              </div>
              <div style={{ padding: 24 }}>
                {activeTab === 'basic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Profile Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Job Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Company</label>
                      <input type="text" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Email</label>
                      <input 
                        type="email" 
                        value={formData.email || ''} 
                        onChange={e => {
                          setFormData({...formData, email: e.target.value});
                          if (emailError) setEmailError('');
                        }} 
                        style={{ padding: 12, border: emailError ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} 
                      />
                      {emailError && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{emailError}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Bio</label>
                      <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Phone Number</label>
                        <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} placeholder="+971 50 123 4567" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>WhatsApp Number</label>
                        <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} placeholder="Include country code without +" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Personal/Business Website</label>
                        <input type="url" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} placeholder="https://..." />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Building / Office Address</label>
                        <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} placeholder="Office 123, Tower..." />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Google Maps Link (Get Directions)</label>
                        <input type="url" value={formData.mapLink || ''} onChange={e => setFormData({...formData, mapLink: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                     {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'github'].map(network => (
                         <div key={network} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'capitalize' }}>{network}</label>
                           <input type="text" value={formData.socials?.[network] || ''} onChange={e => setFormData({...formData, socials: {...(formData.socials || {}), [network]: e.target.value}})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder={`${network} username/link...`} />
                         </div>
                     ))}
                  </div>
                )}

                {activeTab === 'business' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Services & Products</h3>
                        <button onClick={() => setFormData({...formData, services: [...(formData.services || []), { name: '', desc: '', price: '', priceType: 'Fixed' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Service</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.services || []).map((svc: any, index: number) => (
                           <div key={`svc-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'flex', gap: 12 }}>
                               <input type="text" placeholder="Service Name" value={svc.name || ''} onChange={e => { const s = [...formData.services]; s[index].name = e.target.value; setFormData({...formData, services: s}); }} style={{ flex: 2, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <select value={svc.priceType || 'Fixed'} onChange={e => { const s = [...formData.services]; s[index].priceType = e.target.value; setFormData({...formData, services: s}); }} style={{ width: '150px', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}>
                                 <option value="Fixed">Fixed Price</option>
                                 <option value="Hourly">Hourly Rate</option>
                                 <option value="Call for Price">Call for Price</option>
                                 <option value="Custom">Custom</option>
                               </select>
                               {(!svc.priceType || svc.priceType === 'Fixed' || svc.priceType === 'Hourly') && (
                                 <input type="text" placeholder={svc.priceType === 'Hourly' ? "Rate (e.g. AED 150)" : "Price (e.g. AED 500)"} value={svc.price || ''} onChange={e => { const s = [...formData.services]; s[index].price = e.target.value; setFormData({...formData, services: s}); }} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               )}
                             </div>
                             <textarea placeholder="Service Description..." value={svc.desc || ''} onChange={e => { const s = [...formData.services]; s[index].desc = e.target.value; setFormData({...formData, services: s}); }} rows={2} style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                               <button onClick={() => { const s = [...formData.services]; s.splice(index, 1); setFormData({...formData, services: s}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.services || formData.services.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No services added yet.</div>}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Team Members</h3>
                        <button onClick={() => setFormData({...formData, team: [...(formData.team || []), { name: '', role: '', image: '', desc: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Team Member</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.team || []).map((member: any, index: number) => (
                           <div key={`tm-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                               <input type="text" placeholder="Name" value={member.name || ''} onChange={e => { const t = [...formData.team]; t[index].name = e.target.value; setFormData({...formData, team: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="text" placeholder="Role/Title" value={member.role || ''} onChange={e => { const t = [...formData.team]; t[index].role = e.target.value; setFormData({...formData, team: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="text" placeholder="Photo URL" value={member.image || ''} onChange={e => { const t = [...formData.team]; t[index].image = e.target.value; setFormData({...formData, team: t}); }} style={{ gridColumn: 'span 2', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             </div>
                             <textarea placeholder="Short Bio (Optional)" value={member.desc || ''} onChange={e => { const t = [...formData.team]; t[index].desc = e.target.value; setFormData({...formData, team: t}); }} rows={2} style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                               <button onClick={() => { const t = [...formData.team]; t.splice(index, 1); setFormData({...formData, team: t}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.team || formData.team.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No team members added.</div>}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Client Testimonials</h3>
                        <button onClick={() => setFormData({...formData, testimonials: [...(formData.testimonials || []), { name: '', role: '', quote: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Testimonial</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.testimonials || []).map((test: any, index: number) => (
                           <div key={`ts-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                               <input type="text" placeholder="Client Name" value={test.name || ''} onChange={e => { const t = [...formData.testimonials]; t[index].name = e.target.value; setFormData({...formData, testimonials: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="text" placeholder="Company/Role" value={test.role || ''} onChange={e => { const t = [...formData.testimonials]; t[index].role = e.target.value; setFormData({...formData, testimonials: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             </div>
                             <textarea placeholder="Client Quote" value={test.quote || ''} onChange={e => { const t = [...formData.testimonials]; t[index].quote = e.target.value; setFormData({...formData, testimonials: t}); }} rows={3} style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                               <button onClick={() => { const t = [...formData.testimonials]; t.splice(index, 1); setFormData({...formData, testimonials: t}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.testimonials || formData.testimonials.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No testimonials added.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Gallery / Portfolio</h3>
                        <button onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Image Link</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(formData.gallery || []).map((imgUrl: string, index: number) => (
                           <div key={index} style={{ display: 'flex', gap: 12 }}>
                             <input type="url" placeholder="Image URL (e.g. https://domain.com/img.jpg)" value={imgUrl} onChange={e => { const g = [...formData.gallery]; g[index] = e.target.value; setFormData({...formData, gallery: g}); }} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             <button onClick={() => { const g = [...formData.gallery]; g.splice(index, 1); setFormData({...formData, gallery: g}); }} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
                           </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>YouTube Videos</h3>
                        <button onClick={() => setFormData({...formData, videos: [...(formData.videos || []), '']})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Video Link</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(formData.videos || []).map((vidUrl: string, index: number) => (
                           <div key={index} style={{ display: 'flex', gap: 12 }}>
                             <input type="url" placeholder="YouTube Embed URL (https://youtube.com/embed/...)" value={vidUrl} onChange={e => { const v = [...formData.videos]; v[index] = e.target.value; setFormData({...formData, videos: v}); }} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             <button onClick={() => { const v = [...formData.videos]; v.splice(index, 1); setFormData({...formData, videos: v}); }} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                       <h3 style={{ margin: 0, fontSize: 16 }}>Bank Accounts</h3>
                       <button onClick={() => setFormData({...formData, bankAccounts: [...(formData.bankAccounts || []), { country: 'UAE', bankName: '', accountName: '', accountNumber: '', iban: '', swift: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Account</button>
                    </div>
                    {(formData.bankAccounts || []).map((acc: any, index: number) => (
                       <div key={index} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Bank Name</label>
                           <input type="text" value={acc.bankName || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].bankName = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Country</label>
                           <input type="text" value={acc.country || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].country = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Account Name</label>
                           <input type="text" value={acc.accountName || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].accountName = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Account Number</label>
                           <input type="text" value={acc.accountNumber || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].accountNumber = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>IBAN</label>
                           <input type="text" value={acc.iban || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].iban = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }} />
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                           <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>SWIFT Code</label>
                           <input type="text" value={acc.swift || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].swift = e.target.value; setFormData({...formData, bankAccounts: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'monospace' }} />
                         </div>
                         <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                           <button onClick={() => { const b = [...formData.bankAccounts]; b.splice(index, 1); setFormData({...formData, bankAccounts: b}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove Account</button>
                         </div>
                       </div>
                    ))}
                    {(!formData.bankAccounts || formData.bankAccounts.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No bank details provided.</div>}
                  </div>
                )}

                {activeTab === 'widgets' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                     <div>
                       <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Booking Appointments Button</h3>
                       {profile.plan === 'Basic' || profile.plan === 'Pro' ? (
                         <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 20, borderRadius: 12 }}>
                           <p style={{ margin: 0, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>External Appointment Booking Link is not available on your current plan.</p>
                           <p style={{ fontSize: 13, color: '#b91c1c', marginTop: 4 }}>Note: Our built-in booking feature is available for all plans.</p>
                           <button onClick={() => setSidebarTab('plan')} style={{ marginTop: 12, background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Upgrade Plan</button>
                         </div>
                       ) : (
                         <div>
                           <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Calendly / External Booking Link</label>
                           <input type="text" value={formData.meetingUrl || ''} onChange={e => setFormData({...formData, meetingUrl: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} placeholder="https://calendly.com/yourname" />
                           <p style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>If provided, a custom "Book Meeting" button will redirect visitors to this link instead of using the built-in system.</p>
                         </div>
                       )}
                     </div>
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === 'appointments' && (
            <div style={{ padding: 24 }}>
               <h3 style={{ margin: '0 0 16px', fontSize: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>My Appointments</h3>
               {appointments.length === 0 ? (
                 <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 12, color: '#64748b' }}>
                    <Calendar size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No appointments booked yet.</p>
                 </div>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {appointments.map(apt => (
                     <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc' }}>
                       <div>
                         <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{apt.customerName}</div>
                         <div style={{ fontSize: 13, color: '#64748b' }}>{apt.customerEmail}</div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                         <div style={{ fontWeight: 600, color: '#2563eb' }}>{apt.date}</div>
                         <div style={{ fontSize: 13, color: '#475569' }}>{apt.time}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {sidebarTab === 'chatbot' && (
            <div style={{ padding: 24 }}>
               <h3 style={{ margin: '0 0 16px', fontSize: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>AI Chatbot Configuration</h3>
               {profile.plan === 'Basic' ? (
                 <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: 32, borderRadius: 12, textAlign: 'center' }}>
                   <MessageSquare size={48} color="#ef4444" style={{ margin: '0 auto 16px', opacity: 0.7 }} />
                   <h4 style={{ margin: '0 0 8px', color: '#991b1b', fontSize: 18 }}>Premium Feature</h4>
                   <p style={{ margin: 0, color: '#b91c1c', fontSize: 14, maxWidth: 400, marginInline: 'auto' }}>AI Chatbot is not available on your current plan. Upgrade to pro or higher to let an AI assistant answer client queries 24/7.</p>
                   <button onClick={() => setSidebarTab('plan')} style={{ marginTop: 20, background: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Upgrade Plan</button>
                 </div>
               ) : (
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                   <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 24, borderRadius: 12 }}>
                     <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#1e3a8a', marginBottom: 8 }}>System Prompt / Context</label>
                     <p style={{ margin: '0 0 16px', fontSize: 14, color: '#1e40af', lineHeight: 1.5 }}>Provide instructions, business hours, services, and how the AI should answer questions. This acts as the memory for your AI Assistant.</p>
                     <textarea 
                       placeholder="Example: Aap ek behad muhazzib AI assistant hain Ahmed's law firm ke liye. Aapka maqsad logo ke basic sawalon ke asaan aur tehzeeb daari se jawab dena hai..." 
                       value={formData.aiPrompt || ''} 
                       onChange={e => setFormData({...formData, aiPrompt: e.target.value})} 
                       rows={12} 
                       style={{ width: '100%', padding: 16, border: '1px solid #93c5fd', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14 }}
                     ></textarea>
                     <button onClick={handleSave} style={{ marginTop: 16, background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Save Prompt</button>
                   </div>
                   
                   <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
                     <div style={{ background: '#0f172a', color: '#fff', padding: 16, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Test Your Chatbot</span>
                        <button onClick={() => { localStorage.removeItem(`chat_history_${profile.id}`); window.location.reload(); }} style={{ background: 'none', border: '1px solid #334155', color: '#cbd5e1', padding: '4px 8px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Clear History</button>
                     </div>
                     <DashboardChatTester profile={profile} />
                   </div>
                 </div>
               )}
            </div>
          )}

          {sidebarTab === 'campaigns' && (
            <div style={{ padding: 24 }}>
               <h3 style={{ margin: '0 0 16px', fontSize: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>Advertising & Marketing Campaigns</h3>
               <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, maxWidth: 600 }}>
                  <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Send professional email notifications to your clients about your latest services, offers, or business updates.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Email Subject</label>
                        <input 
                          type="text" 
                          placeholder="Special Offer on Our Services..." 
                          value={campaignData.subject}
                          onChange={e => setCampaignData({...campaignData, subject: e.target.value})}
                          style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} 
                        />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Campaign Message</label>
                        <textarea 
                          placeholder="Tell your clients what's new..." 
                          rows={6} 
                          value={campaignData.message}
                          onChange={e => setCampaignData({...campaignData, message: e.target.value})}
                          style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit' }} 
                        />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Call to Action (CTA) Link</label>
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          value={campaignData.ctaLink}
                          onChange={e => setCampaignData({...campaignData, ctaLink: e.target.value})}
                          style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} 
                        />
                     </div>
                     
                     <button 
                        onClick={async () => {
                           if (!campaignData.subject || !campaignData.message) {
                             alert('Please fill in at least the subject and message.');
                             return;
                           }
                           setCampaignLoading(true);
                           try {
                             await fetch('/api/send-email', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                 to: profile.email,
                                 subject: campaignData.subject,
                                 type: 'ad',
                                 data: {
                                   message: campaignData.message,
                                   ctaLink: campaignData.ctaLink || '#'
                                 }
                               })
                             });
                             alert('Campaign sent to your email for review!');
                             setCampaignData({ subject: '', message: '', ctaLink: '' });
                           } catch (err) {
                             console.error(err);
                             alert('Failed to send campaign');
                           }
                           setCampaignLoading(false);
                        }}
                        disabled={campaignLoading}
                        style={{ 
                          marginTop: 8, background: '#2563eb', color: '#fff', border: 'none', 
                          padding: '12px 24px', borderRadius: 8, fontWeight: 700, 
                          cursor: campaignLoading ? 'not-allowed' : 'pointer',
                          opacity: campaignLoading ? 0.7 : 1
                        }}
                     >
                        {campaignLoading ? 'Launching Campaign...' : 'Launch Campaign'}
                     </button>
                  </div>
               </div>
            </div>
          )}

          {sidebarTab === 'plan' && (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Current Plan: <span style={{ color: '#2563eb' }}>{profile.plan || 'Free'}</span></h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Upgrade your plan to unlock more features like Custom Domain, AI Chatbot, and Booking links.</p>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: '#0f172a' }}>
                     {profile.plan === 'Premium' ? '$49/mo' : profile.plan === 'Pro' ? '$19/mo' : 'Free'}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                   <div style={{ border: '1px solid #e2e8f0', padding: 20, borderRadius: 12, opacity: profile.plan === 'Basic' ? 0.5 : 1 }}>
                     <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Basic</h4>
                     <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Free</div>
                     <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 8 }}>
                       <li>Basic Profile</li>
                       <li>5 Services</li>
                     </ul>
                     {profile.plan === 'Basic' ? <button disabled style={{ width: '100%', padding: 10, marginTop: 16, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9' }}>Current Plan</button> : <button onClick={() => { setFormData({...formData, plan: 'Basic'}); setTimeout(handleSave, 100); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: 10, marginTop: 16, borderRadius: 8, cursor: 'pointer' }}>Select Basic</button>}
                   </div>
                   <div style={{ border: '1px solid #e2e8f0', padding: 20, borderRadius: 12, opacity: profile.plan === 'Pro' ? 0.5 : 1 }}>
                     <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Pro</h4>
                     <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>$19/mo</div>
                     <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 8 }}>
                       <li>Pro Profile</li>
                       <li>Custom AI Chatbot</li>
                       <li>Unlimited Services</li>
                     </ul>
                     {profile.plan === 'Pro' ? <button disabled style={{ width: '100%', padding: 10, marginTop: 16, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9' }}>Current Plan</button> : <button onClick={() => { setFormData({...formData, plan: 'Pro'}); setTimeout(handleSave, 100); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: 10, marginTop: 16, borderRadius: 8, cursor: 'pointer' }}>Select Pro</button>}
                   </div>
                   <div style={{ border: '2px solid #2563eb', padding: 20, borderRadius: 12, opacity: profile.plan === 'Premium' ? 0.5 : 1, position: 'relative' }}>
                     <div style={{ position: 'absolute', top: -12, right: 16, background: '#2563eb', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>MOST POPULAR</div>
                     <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#2563eb' }}>Premium</h4>
                     <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>$49/mo</div>
                     <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 8 }}>
                       <li>Everything in Pro</li>
                       <li>External Booking Links</li>
                       <li>Custom Domain</li>
                     </ul>
                     {profile.plan === 'Premium' ? <button disabled style={{ width: '100%', padding: 10, marginTop: 16, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9' }}>Current Plan</button> : <button onClick={() => { setFormData({...formData, plan: 'Premium'}); setTimeout(handleSave, 100); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: 10, marginTop: 16, borderRadius: 8, cursor: 'pointer' }}>Select Premium</button>}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
