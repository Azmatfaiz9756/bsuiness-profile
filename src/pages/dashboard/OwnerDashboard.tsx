import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, Calendar, MessageSquare, Image as ImageIcon, Shield, Send, Menu, X, BarChart3, MapPin, Link as LinkIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

function DashboardChatTester({ profile }: { profile: any }) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'ar' | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const greetings = {
    hi: `Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon?`,
    en: `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`,
    ar: `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`
  };

  const prompts = {
    hi: `Aap ${profile.name} ke AI assistant hain. Aapko ekdum aam Hindustani (Hindi-Urdu mix) mein baat karni hai jo hum roz-mara ki zindagi mein bolte hain. 

SANSKRIT AUR MUSHIKL URDU BILKUL USE NA KAREIN:
- No formal Urdu: 'janab', 'khidmat', 'nawazish', 'bayan', 'ittefaq', 'naye daur', 'maharat', 'guftagu', 'faraham', 'jadid', 'mutabiq', 'silsile', 'lehja' - Yeh sab bilkul use na karein.
- No formal Hindi/Sanskrit: 'vistar', 'mukhya', 'adhik', 'yogdaan', 'parinaam' - Yeh sab bhi bilkul use na karein.

INKI JAGAH YE EK DUM SIMPLE WORDS USE KAREIN:
- 'baat-cheet' (guftagu ki jagah)
- 'help / madad' (khidmat ki jagah)
- 'details / info' (vistar ki jagah)
- 'kaam' (silsile ki jagah)
- 'khass' (mukhya ki jagah)
- 'zyada' (adhik ki jagah)
- 'aaj kal ka' (naye daur ki jagah)
- 'talent / hunar' (maharat ki jagah)

Aapka andaaz bilkul friendly aur normal insaan jaisa hona chahiye, koi shayarana ya bohot formal baat nahi karni.

Greeting Style:
"Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon? Kya aap ${profile.name} sir se kisi khass topic pe baat-cheet karna chahte hain, ya humari company ${profile.company} ki services ke baare mein kuch jaanna chahte hain?"

Context: Aap ${profile.name} (Work: ${profile.title} at ${profile.company}) ko represent karte hain.
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

  const sendMessage = async (customMessage?: string) => {
    const textToSend = customMessage !== undefined ? customMessage : input.trim();
    if (!textToSend || loading || !selectedLang) return;
    
    if (customMessage === undefined) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const modelName = 'gemini-flash-latest';
      const systemInstruction = profile.aiPrompt || prompts[selectedLang];

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [...history, { role: 'user', parts: [{ text: textToSend }] }],
        config: {
          systemInstruction: systemInstruction,
          tools: [{
            functionDeclarations: [
              {
                name: "book_appointment",
                description: "Book an appointment. Requires name, email, date (YYYY-MM-DD), and time (HH:mm).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    date: { type: Type.STRING },
                    time: { type: Type.STRING },
                    service: { type: Type.STRING }
                  },
                  required: ["name", "email", "date", "time"]
                }
              },
              {
                name: "send_inquiry",
                description: "Send a contact inquiry. Requires name, email, and message.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    message: { type: Type.STRING }
                  },
                  required: ["name", "email", "message"]
                }
              }
            ]
          }]
        }
      });

      if (response.functionCalls) {
        const results = [];
        for (const fc of response.functionCalls) {
          const col = fc.name === 'book_appointment' ? 'appointments' : 'leads';
          try {
            await addDoc(collection(db, col), {
              ...fc.args,
              profileId: profile.id,
              createdAt: serverTimestamp(),
              status: fc.name === 'book_appointment' ? 'Pending' : 'New',
              source: 'Dashboard Tester'
            });
            results.push({ name: fc.name, response: { success: true } });
          } catch (e) {
            results.push({ name: fc.name, response: { success: false, error: "DB Error" } });
          }
        }

        const finalResponse = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...history, 
            { role: 'user', parts: [{ text: textToSend }] },
            { role: 'model', parts: response.functionCalls.map(fc => ({ functionCall: fc })) },
            { role: 'user', parts: results.map(r => ({ functionResponse: r })) }
          ],
          config: { systemInstruction }
        });

        if (finalResponse.text) {
          setMessages(prev => [...prev, { role: 'model', content: finalResponse.text || '' }]);
        }
      } else if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
      }
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setMessages(prev => [...prev, { role: 'model', content: 'Connection error' }]);
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

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
            name: user.displayName || 'Jane Doe',
            title: 'Founding Partner',
            company: 'Acme Corp',
            bio: 'I help businesses scale their digital presence through strategic planning and innovative technology solutions. With over 10 years of experience, my goal is to deliver exceptional value.',
            email: user.email || 'hello@example.com',
            phone: '+971 50 123 4567',
            address: 'Dubai Internet City, Building 1, Dubai, UAE',
            ownerId: user.uid,
            plan: 'Pro',
            status: 'Active',
            views: 0,
            seo: { title: '', desc: '', keywords: '' },
            announcement: 'Special Offer: 20% off all consultations this month!',
            socials: {
              linkedin: 'janedoe',
              twitter: 'janedoe',
              whatsapp: '971501234567',
              instagram: 'janedoe'
            },
            services: [
              { name: 'Digital Strategy', desc: 'Comprehensive digital transformation planning', price: 'AED 500', priceType: 'Hourly' },
              { name: '1-to-1 Consultation', desc: 'Direct strategy session', price: 'AED 1500', priceType: 'Fixed' }
            ],
            products: [
              { name: 'Growth Playbook 2024', description: 'A complete PDF guide to scaling startups.', price: 'AED 100', image: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?w=400&q=80', link: '' },
              { name: 'Premium Theme', description: 'Ready to use digital business card theme.', price: 'AED 250', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80', link: '' }
            ],
            testimonials: [
              { name: 'Ahmed Ali', role: 'CEO, TechWave', quote: 'Jane absolutely transformed our business. Highly recommended!', rating: 5 },
              { name: 'Sarah Smith', role: 'Founder, DesignCo', quote: 'Professional, sharp, and incredibly effective strategy sessions.', rating: 5 }
            ],
            faqs: [
              { question: 'What forms of payment do you accept?', answer: 'We accept bank transfers, credit cards, and PayPal.' },
              { question: 'Do you offer online consultations?', answer: 'Yes, all our 1-to-1 consultations can be held via Zoom or Google Meet.' }
            ],
            hours: {
              Monday: { open: '09:00', close: '18:00', closed: false },
              Tuesday: { open: '09:00', close: '18:00', closed: false },
              Wednesday: { open: '09:00', close: '18:00', closed: false },
              Thursday: { open: '09:00', close: '18:00', closed: false },
              Friday: { open: '09:00', close: '14:00', closed: false },
              Saturday: { open: '00:00', close: '00:00', closed: true },
              Sunday: { open: '09:00', close: '18:00', closed: false }
            },
            paymentLinks: [
              { platform: 'Stripe', url: 'https://buy.stripe.com/test_123', qrCodeUrl: '' }
            ],
            bankAccounts: [
              { bankName: 'Emirates NBD', country: 'UAE', accountName: 'Jane Doe', accountNumber: '12345678901234', iban: 'AE120260000000012345678', swift: 'EBIZAEAXXX' }
            ]
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

  // Fetch appointments & leads when sidebarTab matches
  useEffect(() => {
    if (sidebarTab === 'appointments' && profile?.id) {
      import('firebase/firestore').then(({ collection, query, where, getDocs, orderBy }) => {
        const fetchAll = async () => {
          try {
            const aptsQ = query(collection(db, 'appointments'), where('profileId', '==', profile.id));
            const leadsQ = query(collection(db, 'leads'), where('profileId', '==', profile.id));
            
            const [aptsSnap, leadsSnap] = await Promise.all([getDocs(aptsQ), getDocs(leadsQ)]);
            
            const data = [
              ...aptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), _type: 'appointment' })),
              ...leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), _type: 'lead' }))
            ].sort((a: any, b: any) => {
               // Sort by createdAt desc if possible
               const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
               const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
               return tb - ta;
            });
            
            setAppointments(data);
          } catch(err) {
            console.error(err);
          }
        };
        fetchAll();
      });
    }
  }, [sidebarTab, profile]);

  if (authLoading || loading) return <div style={{padding: 40}}>Loading Dashboard...</div>;
  if (!user) return <Navigate to="/" />;
  if (!profile && !loading) return <div style={{padding: 40}}>Error: Profile could not be loaded. Please check your permissions or try again.</div>;

  const handleSave = async () => {
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Invalid email format');
      showToast('Please correct the email address before saving.');
      return;
    }
    setEmailError('');

    try {
      await setDoc(doc(db, 'profiles', user.uid), formData, { merge: true });
      setProfile(formData);
      showToast('Profile updated and published securely!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 w-full overflow-x-hidden relative">
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999, fontWeight: 600 }}>
          {toastMessage}
        </div>
      )}
      {/* Mobile Top Header */}
      <div className="md:hidden flex h-16 items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs">DBC</div>
          <span className="font-bold text-white text-lg">Business Portal</span>
        </div>
        <button className="text-slate-400 hover:text-white" onClick={() => setActiveTab(activeTab === 'mobile-menu' ? 'basic' : 'mobile-menu')}>
          {activeTab === 'mobile-menu' ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {activeTab === 'mobile-menu' && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActiveTab('basic')}></div>
        )}

        {/* Sidebar */}
        <div className={`
          absolute md:relative z-50 flex flex-col w-[260px] h-full bg-slate-900 border-r border-slate-800 transition-transform duration-300
          ${activeTab === 'mobile-menu' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="hidden md:flex flex-col px-5 py-6 border-b border-slate-800">
            <h2 className="m-0 text-lg font-extrabold text-white">Business Portal</h2>
            <span className="text-xs text-slate-400 mt-1">DBC Access</span>
          </div>

          <div className="flex flex-col flex-1 py-4 overflow-y-auto">
            <button onClick={() => { setSidebarTab('profile'); if(activeTab === 'mobile-menu') setActiveTab('basic'); }} className={`px-5 py-3 flex items-center gap-3 text-left transition-colors border-l-4 ${sidebarTab === 'profile' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <LayoutDashboard size={18} /> My Profile
            </button>
            <button onClick={() => { setSidebarTab('analytics'); if(activeTab === 'mobile-menu') setActiveTab('basic'); }} className={`px-5 py-3 flex items-center gap-3 text-left transition-colors border-l-4 ${sidebarTab === 'analytics' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <BarChart3 size={18} /> Analytics & Views
            </button>
            <button onClick={() => { setSidebarTab('appointments'); if(activeTab === 'mobile-menu') setActiveTab('basic'); }} className={`px-5 py-3 flex items-center gap-3 text-left transition-colors border-l-4 ${sidebarTab === 'appointments' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <Calendar size={18} /> Appointments & Leads
            </button>
            <button onClick={() => { setSidebarTab('chatbot'); if(activeTab === 'mobile-menu') setActiveTab('basic'); }} className={`px-5 py-3 flex items-center gap-3 text-left transition-colors border-l-4 ${sidebarTab === 'chatbot' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <MessageSquare size={18} /> AI Chatbot
            </button>
            <button onClick={() => { setSidebarTab('plan'); if(activeTab === 'mobile-menu') setActiveTab('basic'); }} className={`px-5 py-3 flex items-center gap-3 text-left transition-colors border-l-4 ${sidebarTab === 'plan' ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <Settings size={18} /> Subscription
            </button>
          </div>
          
          <div className="p-5 border-t border-slate-800 shrink-0">
            <Link to="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
              <h1 className="m-0 text-xl md:text-2xl font-extrabold text-slate-900">Manage Your Digital Card</h1>
              <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 shrink-0">
                <button onClick={() => {
                  setFormData({
                    ...formData,
                    name: 'Jane Doe',
                    title: 'Strategic Consultant',
                    company: 'Visionary Corp',
                    bio: 'I help businesses scale their digital presence through strategic planning. With over 10 years of experience, my goal is to deliver exceptional value and growth.',
                    phone: '+971 50 123 4567',
                    email: 'hello@example.com',
                    address: 'Dubai Internet City, Building 1, Dubai, UAE',
                    announcement: '🌟 Special Offer: 20% off all consultations this month!',
                    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
                    bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
                    socials: { linkedin: 'yourname', twitter: 'yourname', whatsapp: '971501234567', instagram: 'yourname', youtube: 'yourchannel' },
                    services: [
                      { name: 'Digital Strategy', desc: 'Comprehensive digital transformation planning.', price: 'AED 500', priceType: 'Hourly' },
                      { name: '1-to-1 Consultation', desc: 'Direct strategy session over Zoom.', price: 'AED 1500', priceType: 'Fixed' }
                    ],
                    products: [
                      { name: 'Growth Playbook 2024', description: 'A complete PDF guide to scaling startups.', price: 'AED 100', image: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?w=400&q=80', link: '' },
                      { name: 'Premium Strategy Video', description: 'Exclusive access to my mastermind seminar recording.', price: 'AED 250', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80', link: '' }
                    ],
                    testimonials: [
                      { name: 'Ahmed Ali', role: 'CEO, TechWave', quote: 'Absolutely transformed our business model. Highly recommended!', rating: 5 },
                      { name: 'Sarah Smith', role: 'Founder, DesignCo', quote: 'Professional, sharp, and incredibly effective sessions.', rating: 5 }
                    ],
                    faqs: [
                      { question: 'What forms of payment do you accept?', answer: 'We accept bank transfers, credit cards, and PayPal.' },
                      { question: 'Do you offer online consultations?', answer: 'Yes, all our 1-to-1 consultations can be held via Zoom or Google Meet.' }
                    ],
                    hours: {
                      Monday: { open: '09:00', close: '18:00', closed: false }, Tuesday: { open: '09:00', close: '18:00', closed: false }, Wednesday: { open: '09:00', close: '18:00', closed: false }, Thursday: { open: '09:00', close: '18:00', closed: false }, Friday: { open: '09:00', close: '14:00', closed: false }, Saturday: { open: '00:00', close: '00:00', closed: true }, Sunday: { open: '09:00', close: '18:00', closed: false }
                    },
                    paymentLinks: [ { platform: 'Stripe', url: 'https://buy.stripe.com/test_123', qrCodeUrl: '' } ],
                    bankAccounts: [ { bankName: 'Emirates NBD', country: 'UAE', accountName: 'Your Name', accountNumber: '12345678901234', iban: 'AE120260000000012345678', swift: 'EBIZAEAXXX' } ],
                    gallery: [
                      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
                      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80'
                    ],
                    videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
                    customButtons: [
                       { label: 'Book Consultation', url: 'https://calendly.com', icon: 'Calendar', isPrimary: true },
                       { label: 'Download Resume', url: 'https://example.com/resume.pdf', icon: 'FileText', isPrimary: false }
                    ]
                  });
                  alert('Demo content loaded! Click "Save Changes" to publish.');
                }} className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold hover:bg-slate-200 transition-colors shrink-0">Load Demo Content</button>
                <Link to={`/profile/${profile?.slug || profile?.id}`} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold hover:bg-slate-50 transition-colors shrink-0">Preview Live</Link>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm shrink-0">Save Changes</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {sidebarTab === 'profile' && (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                 <button onClick={() => setActiveTab('basic')} style={{ padding: '16px 20px', background: activeTab === 'basic' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'basic' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'basic' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Basic Info</button>
                 <button onClick={() => setActiveTab('contact')} style={{ padding: '16px 20px', background: activeTab === 'contact' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'contact' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'contact' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Contact & Location</button>
                 <button onClick={() => setActiveTab('social')} style={{ padding: '16px 20px', background: activeTab === 'social' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'social' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'social' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Socials</button>
                 <button onClick={() => setActiveTab('business')} style={{ padding: '16px 20px', background: activeTab === 'business' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'business' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'business' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Services</button>
                 <button onClick={() => setActiveTab('products')} style={{ padding: '16px 20px', background: activeTab === 'products' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'products' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'products' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Products (Store)</button>
                 <button onClick={() => setActiveTab('testimonials')} style={{ padding: '16px 20px', background: activeTab === 'testimonials' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'testimonials' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'testimonials' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Testimonials</button>
                 <button onClick={() => setActiveTab('faq')} style={{ padding: '16px 20px', background: activeTab === 'faq' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'faq' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'faq' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>FAQs</button>
                 <button onClick={() => setActiveTab('hours')} style={{ padding: '16px 20px', background: activeTab === 'hours' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'hours' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'hours' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Business Hours</button>
                 <button onClick={() => setActiveTab('media')} style={{ padding: '16px 20px', background: activeTab === 'media' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'media' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'media' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Media & Gallery</button>
                 <button onClick={() => setActiveTab('bank')} style={{ padding: '16px 20px', background: activeTab === 'bank' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'bank' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'bank' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Bank Details</button>
                 <button onClick={() => setActiveTab('widgets')} style={{ padding: '16px 20px', background: activeTab === 'widgets' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'widgets' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'widgets' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>Action Buttons</button>
                 {(profile.plan === 'Pro' || profile.plan === 'Enterprise') && (
                   <button onClick={() => setActiveTab('theme')} style={{ padding: '16px 20px', background: activeTab === 'theme' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'theme' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: activeTab === 'theme' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>💎 Theme</button>
                 )}
              </div>
              <div style={{ padding: 24 }}>
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Profile Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Profile Photo URL</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." value={formData.photoUrl || ''} onChange={e => setFormData({...formData, photoUrl: e.target.value})} style={{ flex: 1, padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                           {formData.photoUrl && <img src={formData.photoUrl} className="w-full h-full object-cover" />}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Banner Image URL</label>
                      <input type="text" placeholder="https://..." value={formData.bannerUrl || ''} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Job Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Business Category</label>
                      <select 
                        value={formData.category || 'Technology'} 
                        onChange={e => setFormData({...formData, category: e.target.value})} 
                        style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}
                      >
                        {['Technology', 'Real Estate', 'Finance', 'Consulting', 'Design', 'Medical', 'Retail', 'Education'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>City (UAE)</label>
                      <select 
                        value={formData.city || 'Dubai'} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}
                      >
                        {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Company</label>
                      <input type="text" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Promotional Banner / Announcement</label>
                      <input type="text" value={formData.announcement || ''} placeholder="e.g. 50% Off Winter Sale!" onChange={e => setFormData({...formData, announcement: e.target.value})} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }} />
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
                      <div className="flex justify-between items-center">
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Bio</label>
                        <button 
                          onClick={async () => {
                            if (!formData.name && !formData.title) {
                              alert("Please enter Name and Job Title first.");
                              return;
                            }
                            // Set a loading state indicator via a local flag or just directly modifying button text.
                            const btn = document.getElementById("ai-bio-btn");
                            if(btn) btn.innerHTML = "Generating...";
                            try {
                              const aiInstance: any = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
                              const model = aiInstance.getGenerativeModel({ model: 'gemini-1.5-flash' });
                              const result = await model.generateContent(`Generate a concise, professional 2-3 sentence bio for: Name: ${formData.name || ''}, Title: ${formData.title || ''}, Company: ${formData.company || ''}. Make it sound modern and impressive. Do not use quotes.`);
                              const response = await result.response;
                              const text = response.text();
                              if(text) {
                                setFormData({...formData, bio: text});
                              }
                            } catch(e) {
                              alert("Failed to generate bio.");
                            }
                            if(btn) btn.innerHTML = "✨ AI Magic Writer";
                          }}
                          id="ai-bio-btn"
                          style={{
                            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                            backgroundSize: '200% auto',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >✨ AI Magic Writer</button>
                      </div>
                      <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        <div className="flex justify-between items-center">
                          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Building / Office Address</label>
                          <button 
                            onClick={() => {
                              if (!navigator.geolocation) {
                                alert("Geolocation is not supported by your browser");
                                return;
                              }
                              const btn = document.getElementById("gps-btn");
                              if(btn) btn.innerHTML = "Fetching...";
                              navigator.geolocation.getCurrentPosition(async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                  // Simplified reverse geocoding mock or real if we had an API key
                                  // For now, let's at least set the coordinates if we can't get address string easily
                                  const address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                                  setFormData({
                                    ...formData, 
                                    address: address,
                                    mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                                  });
                                  if(btn) btn.innerHTML = "✅ Found!";
                                  setTimeout(() => { if(btn) btn.innerHTML = "📍 Use My GPS"; }, 2000);
                                } catch(e) {
                                  alert("Could not fetch address details.");
                                }
                              }, (err) => {
                                alert("GPS Error: " + err.message);
                                if(btn) btn.innerHTML = "📍 Use My GPS";
                              });
                            }}
                            id="gps-btn"
                            style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                          >📍 Use My GPS</button>
                        </div>
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
                  </div>
                )}

                {activeTab === 'products' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Products (Store)</h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>Add products for visitors to view and buy directly via WhatsApp.</p>
                        </div>
                        <button onClick={() => setFormData({...formData, products: [...(formData.products || []), { name: '', description: '', price: '', image: '', link: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Product</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.products || []).map((prod: any, index: number) => (
                           <div key={`prod-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                               <input type="text" placeholder="Product Name" value={prod.name || ''} onChange={e => { const p = [...formData.products]; p[index].name = e.target.value; setFormData({...formData, products: p}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="text" placeholder="Price (e.g. 50 AED)" value={prod.price || ''} onChange={e => { const p = [...formData.products]; p[index].price = e.target.value; setFormData({...formData, products: p}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             </div>
                             <textarea placeholder="Product Description" value={prod.description || ''} onChange={e => { const p = [...formData.products]; p[index].description = e.target.value; setFormData({...formData, products: p}); }} rows={2} style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                               <input type="url" placeholder="Image URL (e.g. https://domain.com/img.jpg)" value={prod.image || ''} onChange={e => { const p = [...formData.products]; p[index].image = e.target.value; setFormData({...formData, products: p}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="url" placeholder="External Buy Link (Optional)" value={prod.link || ''} onChange={e => { const p = [...formData.products]; p[index].link = e.target.value; setFormData({...formData, products: p}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                               <button onClick={() => { const p = [...formData.products]; p.splice(index, 1); setFormData({...formData, products: p}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove Product</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.products || formData.products.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No products added yet.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Client Testimonials</h3>
                        <button onClick={() => setFormData({...formData, testimonials: [...(formData.testimonials || []), { name: '', role: '', quote: '', rating: 5 }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Testimonial</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.testimonials || []).map((test: any, index: number) => (
                           <div key={`ts-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                               <input type="text" placeholder="Client Name" value={test.name || ''} onChange={e => { const t = [...formData.testimonials]; t[index].name = e.target.value; setFormData({...formData, testimonials: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <input type="text" placeholder="Company/Role" value={test.role || ''} onChange={e => { const t = [...formData.testimonials]; t[index].role = e.target.value; setFormData({...formData, testimonials: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <select value={test.rating || 5} onChange={e => { const t = [...formData.testimonials]; t[index].rating = Number(e.target.value); setFormData({...formData, testimonials: t}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }}>
                                 <option value={5}>5 Stars ★★★★★</option>
                                 <option value={4}>4 Stars ★★★★</option>
                                 <option value={3}>3 Stars ★★★</option>
                                 <option value={2}>2 Stars ★★</option>
                                 <option value={1}>1 Star ★</option>
                               </select>
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

                {activeTab === 'faq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Frequently Asked Questions</h3>
                        <button onClick={() => setFormData({...formData, faqs: [...(formData.faqs || []), { question: '', answer: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add FAQ</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(formData.faqs || []).map((faq: any, index: number) => (
                           <div key={`faq-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <input type="text" placeholder="Question" value={faq.question || ''} onChange={e => { const f = [...formData.faqs]; f[index].question = e.target.value; setFormData({...formData, faqs: f}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             <textarea placeholder="Answer" value={faq.answer || ''} onChange={e => { const f = [...formData.faqs]; f[index].answer = e.target.value; setFormData({...formData, faqs: f}); }} rows={3} style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                               <button onClick={() => { const f = [...formData.faqs]; f.splice(index, 1); setFormData({...formData, faqs: f}); }} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.faqs || formData.faqs.length === 0) && <div style={{ color: '#64748b', fontSize: 14 }}>No FAQs added.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'hours' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Business Hours</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                          const currentHours = (formData.hours || {})[day] || { open: '09:00', close: '18:00', closed: false };
                          return (
                            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                              <div style={{ width: 100, fontWeight: 600, color: '#475569' }}>{day}</div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                                <input type="checkbox" checked={currentHours.closed} onChange={e => {
                                  const h = { ...formData.hours };
                                  h[day] = { ...currentHours, closed: e.target.checked };
                                  setFormData({...formData, hours: h});
                                }} />
                                Closed
                              </label>
                              {!currentHours.closed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input type="time" value={currentHours.open} onChange={e => {
                                    const h = { ...formData.hours };
                                    h[day] = { ...currentHours, open: e.target.value };
                                    setFormData({...formData, hours: h});
                                  }} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                                  <span>to</span>
                                  <input type="time" value={currentHours.close} onChange={e => {
                                    const h = { ...formData.hours };
                                    h[day] = { ...currentHours, close: e.target.value };
                                    setFormData({...formData, hours: h});
                                  }} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                       <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
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
                    
                    <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <div>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Payment Links & QR</h3>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Add Stripe, PayPal, UPI, or PayTabs links for direct payment</p>
                         </div>
                         <button onClick={() => setFormData({...formData, paymentLinks: [...(formData.paymentLinks || []), { platform: 'Stripe', url: '', qrCodeUrl: '' }]})} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>+ Add Link</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(formData.paymentLinks || []).map((link: any, index: number) => (
                           <div key={`pl-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                             <div style={{ display: 'flex', gap: 12 }}>
                               <select value={link.platform} onChange={e => { const p = [...formData.paymentLinks]; p[index].platform = e.target.value; setFormData({...formData, paymentLinks: p}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', width: 140 }}>
                                 <option value="Stripe">Stripe</option>
                                 <option value="PayPal">PayPal</option>
                                 <option value="UPI">UPI</option>
                                 <option value="PayTabs">PayTabs</option>
                                 <option value="Custom">Custom Link</option>
                               </select>
                               <input type="url" placeholder="Direct Payment URL (e.g., https://buy.stripe.com/...)" value={link.url || ''} onChange={e => { const p = [...formData.paymentLinks]; p[index].url = e.target.value; setFormData({...formData, paymentLinks: p}); }} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                             </div>
                             <div style={{ display: 'flex', gap: 12 }}>
                               <input type="url" placeholder="Optional QR Code Image URL" value={link.qrCodeUrl || ''} onChange={e => { const p = [...formData.paymentLinks]; p[index].qrCodeUrl = e.target.value; setFormData({...formData, paymentLinks: p}); }} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                               <button onClick={() => { const p = [...formData.paymentLinks]; p.splice(index, 1); setFormData({...formData, paymentLinks: p}); }} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'theme' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Profile Theme</h3>
                      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Select a layout and style for your digital profile.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div onClick={() => setFormData({...formData, template: 'classic'})} style={{ position: 'relative', border: formData.template === 'classic' || !formData.template ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center', background: '#f8fafc', transition: 'all 0.2s' }}>
                          <div style={{ background: '#dbeafe', height: 120, borderRadius: 8, marginBottom: 16 }}></div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>Classic Modern</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'executive'})} style={{ position: 'relative', border: formData.template === 'executive' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center', background: '#0f172a', color: '#fff', transition: 'all 0.2s' }}>
                          <div style={{ position: 'absolute', top: -10, right: -10, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>PREMIUM</div>
                          <div style={{ background: '#1e293b', height: 120, borderRadius: 8, marginBottom: 16 }}></div>
                          <div style={{ fontWeight: 700 }}>Executive Dark</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'minimal'})} style={{ position: 'relative', border: formData.template === 'minimal' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'center', background: '#fff', transition: 'all 0.2s' }}>
                          <div style={{ position: 'absolute', top: -10, right: -10, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>PREMIUM</div>
                          <div style={{ border: '1px solid #e2e8f0', height: 120, borderRadius: 8, marginBottom: 16 }}></div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Minimal Clean</div>
                        </div>
                      </div>
                    </div>
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
                     <div style={{ marginTop: 32 }}>
                       <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Business Document / Portfolio</h3>
                       <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>Upload or link a PDF file like your Company Profile, Portfolio, or Resume.</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Document URL (PDF / Web Link)</label>
                           <input type="url" value={formData.documentUrl || ''} onChange={e => setFormData({...formData, documentUrl: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} placeholder="https://..." />
                         </div>
                         <div>
                           <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Custom Button Text</label>
                           <input type="text" value={formData.documentButtonText || ''} onChange={e => setFormData({...formData, documentButtonText: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} placeholder="e.g. Download Company Profile" />
                         </div>
                       </div>
                     </div>

                     <div style={{ marginTop: 32, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                         <div>
                           <h3 style={{ margin: 0, fontSize: 16 }}>Custom Action Buttons</h3>
                           <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Add extra buttons to link to apps, websites, or features.</p>
                         </div>
                         <button onClick={() => setFormData({...formData, customButtons: [...(formData.customButtons || []), { label: '', url: '', icon: 'Link', isPrimary: false }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>+ Add Button</button>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         {(formData.customButtons || []).map((btn: any, index: number) => (
                            <div key={`cbtn-${index}`} style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Button Label (e.g. Visit Website)" value={btn.label || ''} onChange={e => { const b = [...formData.customButtons]; b[index].label = e.target.value; setFormData({...formData, customButtons: b}); }} style={{ flex: 1, minWidth: '200px', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                                <input type="url" placeholder="URL Link" value={btn.url || ''} onChange={e => { const b = [...formData.customButtons]; b[index].url = e.target.value; setFormData({...formData, customButtons: b}); }} style={{ flex: 1, minWidth: '200px', padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                              </div>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <select value={btn.icon || 'Link'} onChange={e => { const b = [...formData.customButtons]; b[index].icon = e.target.value; setFormData({...formData, customButtons: b}); }} style={{ padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', minWidth: 120 }}>
                                  <option value="Link">Link Icon</option>
                                  <option value="Globe">Website</option>
                                  <option value="Calendar">Calendar</option>
                                  <option value="FileText">Document</option>
                                  <option value="Download">Download</option>
                                  <option value="MessageCircle">Chat</option>
                                </select>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                                  <input type="checkbox" checked={btn.isPrimary || false} onChange={e => { const b = [...formData.customButtons]; b[index].isPrimary = e.target.checked; setFormData({...formData, customButtons: b}); }} />
                                  Highlight as Primary action
                                </label>
                                <button onClick={() => { const b = [...formData.customButtons]; b.splice(index, 1); setFormData({...formData, customButtons: b}); }} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                              </div>
                            </div>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === 'analytics' && (
            <div style={{ padding: 24 }}>
               <h3 style={{ margin: '0 0 16px', fontSize: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>Profile Analytics</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                   <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Views</div>
                   <div className="text-4xl font-extrabold text-slate-900">{profile.views || 0}</div>
                   <div className="text-sm text-emerald-600 font-bold mt-2">↑ +12% this week</div>
                   <BarChart3 size={80} className="absolute -bottom-4 -right-4 text-slate-200 opacity-50" />
                 </div>
                 
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                   <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Unique Visitors</div>
                   <div className="text-4xl font-extrabold text-slate-900">{Math.floor((profile.views || 0) * 0.7)}</div>
                   <div className="text-sm text-emerald-600 font-bold mt-2">↑ +8% this week</div>
                   <Users size={80} className="absolute -bottom-4 -right-4 text-slate-200 opacity-50" />
                 </div>

                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                   <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Link Clicks</div>
                   <div className="text-4xl font-extrabold text-slate-900">{Math.floor((profile.views || 0) * 0.45)}</div>
                   <div className="text-sm text-emerald-600 font-bold mt-2">↑ +15% this week</div>
                   <LinkIcon size={80} className="absolute -bottom-4 -right-4 text-slate-200 opacity-50" />
                 </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-2xl p-6">
                 <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><MapPin size={20} className="text-blue-500"/> Audience Geometry</h4>
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                     <div className="w-8 font-bold text-slate-500">US</div>
                     <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                       <div className="bg-blue-500 h-full w-[65%] rounded-full"></div>
                     </div>
                     <div className="w-12 text-right font-bold text-slate-900">65%</div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-8 font-bold text-slate-500">IN</div>
                     <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                       <div className="bg-blue-400 h-full w-[20%] rounded-full"></div>
                     </div>
                     <div className="w-12 text-right font-bold text-slate-900">20%</div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-8 font-bold text-slate-500">UK</div>
                     <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                       <div className="bg-blue-300 h-full w-[10%] rounded-full"></div>
                     </div>
                     <div className="w-12 text-right font-bold text-slate-900">10%</div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-8 font-bold text-slate-500">AE</div>
                     <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                       <div className="bg-blue-200 h-full w-[5%] rounded-full"></div>
                     </div>
                     <div className="w-12 text-right font-bold text-slate-900">5%</div>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {sidebarTab === 'appointments' && (
            <div style={{ padding: 24 }}>
               <h3 style={{ margin: '0 0 16px', fontSize: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>My Appointments & Leads</h3>
               <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>Here you will see all appointment bookings and contact form leads sent by visitors.</p>
               {appointments.length === 0 ? (
                 <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 12, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Calendar size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
                    <p style={{ margin: '0 0 16px' }}>No appointments or leads yet.</p>
                    <button 
                      onClick={async () => {
                        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                        try {
                           await addDoc(collection(db, 'leads'), {
                              profileId: profile.id,
                              name: 'John Doe',
                              email: 'john@example.com',
                              phone: '+1 234 567 890',
                              company: 'Tech Corp',
                              message: 'Hi, I saw your profile and would love to connect about a potential partnership.',
                              source: 'Sample Data',
                              createdAt: serverTimestamp()
                           });
                           await addDoc(collection(db, 'appointments'), {
                              profileId: profile.id,
                              customerName: 'Alice Smith',
                              customerEmail: 'alice@example.com',
                              date: '2023-11-20',
                              time: '14:30',
                              source: 'Sample Booking',
                              createdAt: serverTimestamp()
                           });
                           // Force refresh (it should auto trigger due to useEffect deps? Actually we don't have a listener, we just fetch once).
                           // Let's just alert the user to click the tab again.
                           alert('Sample data created! Please reopen the tab (click My Profile then Appointments again).');
                        } catch(e) {
                          alert('Failed to add sample data.');
                        }
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors border-none cursor-pointer"
                    >
                      Load Sample Data
                    </button>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                   {appointments.map(apt => (
                     <div key={apt.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                       <div>
                         <div className="font-semibold text-slate-900 mb-1">{apt.name || apt.customerName}</div>
                         <div className="text-sm text-slate-500">{apt.email || apt.customerEmail}</div>
                         {apt.phone && <div className="text-sm text-slate-500 mt-1">{apt.phone}</div>}
                         {apt.company && <div className="text-sm text-slate-500 mt-1">Company: {apt.company}</div>}
                         {apt.message && <div className="text-sm text-slate-600 mt-2 italic bg-white p-2 border border-slate-100 rounded-md">"{apt.message}"</div>}
                       </div>
                       <div className="text-left sm:text-right">
                         {apt.date && <div className="font-semibold text-blue-600">{apt.date} {apt.time && <span className="text-sm text-slate-600 font-normal">at {apt.time}</span>}</div>}
                         <div className="text-xs text-slate-500 mt-2 uppercase font-bold px-2 py-1 bg-slate-200 rounded inline-block">{apt.source || 'Appointment'}</div>
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
    </div>
  );
}
