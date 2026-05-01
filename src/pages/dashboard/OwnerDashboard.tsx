import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, Calendar, MessageSquare, Image as ImageIcon, Shield, Send, Menu, X, BarChart3, MapPin, Link as LinkIcon, Plus, Mail, Phone, Building, Brain, Sparkles, Megaphone, Gift, Download, Headset } from 'lucide-react';
import { motion } from 'motion/react';

import LiveAgentPanel from './LiveAgentPanel';
import { CHAT_LANGUAGES } from '../../lib/languages';
import { PaymentModal } from '../../components/PaymentModal';

const Type = { STRING: 'STRING', OBJECT: 'OBJECT', ARRAY: 'ARRAY' };

class ProxyGoogleGenAI {
  apiKey: string;
  constructor(options: { apiKey?: string } = {}) {
    this.apiKey = options.apiKey || '';
  }
  models = {
    generateContent: async (args: any) => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const resp = await fetch(`${apiUrl}/api/gemini/generateContent`, {
        method: 'POST',
        headers,
        body: JSON.stringify(args)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'AI generation failed');
      return data;
    }
  };
}

function DashboardChatTester({ profile }: { profile: any }) {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const ai = new ProxyGoogleGenAI({ apiKey: profile?.aiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '' });

  const getGreeting = (langId: string) => {
    if (langId === 'hi') return `Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon?`;
    if (langId === 'en') return `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`;
    if (langId === 'ar') return `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`;
    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `Hello! I'm the AI assistant for ${profile?.name}. I can assist you in ${lang?.label || langId}. How can I help you today?`;
  };

  const getPrompt = (langId: string) => {
    if (langId === 'hi') {
      return `Aap ${profile.name} ke AI assistant hain. Aapko ekdum aam Hindustani (Hindi-Urdu mix) mein baat karni hai jo hum roz-mara ki zindagi mein bolte hain. 

SANSKRIT AUR MUSHIKL URDU BILKUL USE NA KAREIN:
- No formal Urdu: 'janab', 'khidmat', 'nawazish', 'bayan', 'ittefaq', 'naye daur', 'maharat', 'guftagu', 'faraham', 'jadid', 'mutabiq', 'silsile', 'lehja' - Yeh sab bilkul use na karein.
- No formal Hindi/Sanskrit: 'vistar', 'mukhya', 'adhik', 'yogdaan', 'parinaam' - Yeh sab bhi delete na karein.

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
Bio: ${profile.bio}. Contact email: ${profile.email}. Phone: ${profile.phone}.`;
    }

    if (langId === 'ar') {
      return `أنت مساعد ذكي محترف لـ ${profile?.name} (المسمى الوظيفي: ${profile?.title} في ${profile?.company}).
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة خليجية بيضاء أو فصحى مهذبة).
السياق: ${profile?.bio}. التواصل: البريد: ${profile?.email}, الهاتف: ${profile?.phone}.`;
    }
    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `You are a professional AI business assistant for ${profile?.name} (Title: ${profile?.title} at ${profile?.company}).
Your tone should be helpful, clear, and professional. 
You MUST communicate primarily in ${lang?.label || langId}.
Context: ${profile?.bio}. Contact: Email: ${profile?.email}, Phone: ${profile?.phone}.`;
  };

  useEffect(() => {
    if (selectedLang) {
      setMessages([{ role: 'model', content: getGreeting(selectedLang) }]);
    }
  }, [selectedLang]);

  const sendMessage = async (customMessage?: string | any) => {
    const textToSend = typeof customMessage === 'string' ? customMessage : input.trim();
    if (!textToSend || loading || !selectedLang) return;
    
    if (typeof customMessage !== 'string') setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }]
      }));

      const modelName = 'gemini-2.5-flash';
      const systemInstruction = profile.aiPrompt || getPrompt(selectedLang);

      const chatContents = [
        ...history,
        { role: 'user', parts: [{ text: textToSend }] }
      ];

      const response = await ai.models.generateContent({
        model: modelName,
        contents: chatContents as any,
        config: {
          systemInstruction: systemInstruction as any,
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

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const results = [];
        for (const fc of functionCalls) {
          if (!fc) continue;
          const col = fc.name === 'book_appointment' ? 'appointments' : 'leads';
          try {
            await addDoc(collection(db, col), {
              ...fc.args,
              profileId: profile.id,
              ownerId: profile.ownerId || user.uid,
              createdAt: serverTimestamp(),
              status: fc.name === 'book_appointment' ? 'Pending' : 'New',
              source: 'Dashboard Tester'
            });
            results.push({ name: fc.name, response: { success: true } });
          } catch (e) {
            console.error("DB Write Error:", e);
            results.push({ name: fc.name, response: { success: false, error: "DB Error" } });
            import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
              handleFirestoreError(e, OperationType.WRITE, col);
            }).catch(err => console.error(err));
          }
        }

        const finalContents = [
          ...chatContents,
          response.candidates?.[0]?.content as any,
          { role: 'user', parts: results.map(r => ({ functionResponse: r as any })) }
        ];

        const finalResponse = await ai.models.generateContent({
          model: modelName,
          contents: finalContents,
          config: { systemInstruction }
        });

        const finalText = finalResponse.text;
        if (finalText) {
          setMessages(prev => [...prev, { role: 'model', content: finalText }]);
        }
      } else {
        const text = response.text;
        if (text) {
          setMessages(prev => [...prev, { role: 'model', content: text }]);
        }
      }
    } catch (err: any) {
      console.error("Gemini Error:", err);
      // Detailed error for dashboard testing
      let errorMsg = "Unknown error";
      try {
        errorMsg = err?.message || (err && typeof err === 'object' ? JSON.stringify(err) : String(err));
      } catch(e) {
        errorMsg = "Unparseable error object.";
      }
      let displayError = errorMsg;
      if (errorMsg.includes('API key not valid')) {
         displayError = 'Your Gemini API key is missing or invalid. Please check the GEMINI_API_KEY value in your .env file on the server and ensure it is a valid Google GenAI API key.';
      } else if (errorMsg.includes('is not found')) {
         displayError = 'The selected AI model is not supported or available. Please contact support to correct the model name in code.';
      }
      setMessages(prev => [...prev, { role: 'model', content: `AI Error: ${displayError}` }]);
    }
    setLoading(false);

  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!selectedLang ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', justifyContent: 'center', alignItems: 'center', overflowY: 'auto' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>Select test language:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, width: '100%', padding: '10px' }}>
               {CHAT_LANGUAGES.map(lang => (
                 <button 
                   key={lang.id}
                   onClick={() => setSelectedLang(lang.id)} 
                   style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                 >
                   <span>{lang.flag}</span>
                   <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang.label}</span>
                 </button>
               ))}
              </div>
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
          <button onClick={() => sendMessage()} style={{ background: '#2563eb', color: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
        </div>
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  const { user, authLoading, siteSettings, profiles, selectedCountry } = useAppContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [sidebarTab, setSidebarTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [emailError, setEmailError] = useState('');
  const [campaignData, setCampaignData] = useState({ subject: '', message: '', imageUrl: '', type: 'WhatsApp' });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationRole, setInvitationRole] = useState('Member (Customizable Profile)');

  const [toastMessage, setToastMessage] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);

  // Handle Stripe Success Callback
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const sessionId = searchParams.get('session_id');
    const planName = searchParams.get('plan');

    if (paymentSuccess === 'true' && sessionId && planName && profile?.id) {
      console.log('Payment success detected');
      const completePayment = async () => {
        try {
          const { updateDoc } = await import('firebase/firestore');
          const userRef = doc(db, 'profiles', profile.id);
          const updateData: any = {
            plan: decodeURIComponent(planName),
            updatedAt: new Date().toISOString()
          };
          const refCode = localStorage.getItem('dbc_referred_by');
          if (refCode) {
            updateData.referredBy = refCode;
            localStorage.removeItem('dbc_referred_by');
          }
          await updateDoc(userRef, updateData);
          showToast(`Succesfully subscribed to ${decodeURIComponent(planName)}!`);
          
          // Clear URL params
          setSearchParams({});
        } catch (error) {
          console.error("Failed to update profile after payment:", error);
        }
      };
      completePayment();
    }
  }, [searchParams, profile, setSearchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleExportLeads = () => {
    if (appointments.length === 0) {
      showToast("No leads to export");
      return;
    }
    const headers = ["Date", "Name", "Type", "Email", "Phone", "Message"];
    const csvContent = [
      headers.join(","),
      ...appointments.map(l => {
        const date = l.createdAt?.seconds 
          ? new Date(l.createdAt.seconds * 1000).toLocaleDateString()
          : new Date().toLocaleDateString();
        return [
          date,
          `"${l.name || 'Anonymous'}"`,
          l.source || 'Lead',
          l.email || '',
          l.phone || '',
          `"${(l.message || '').replace(/"/g, '""')}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dbc_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Leads exported to CSV");
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
            plan: 'Free',
            status: 'Active',
            views: 0,
            referralCount: 0,
            referralPending: 0,
            referralEarnings: 0,
            role: 'Admin',
            companyId: user.uid,
            teamMembers: [],
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
            import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
              handleFirestoreError(err, OperationType.LIST, 'appointments/leads');
            });
          }
        };
        fetchAll();
      });
    }
  }, [sidebarTab, profile]);

  // Fetch followers count and campaigns
  useEffect(() => {
    if (sidebarTab === 'marketing' && profile?.id) {
       import('firebase/firestore').then(({ collection, query, where, getDocs, getCountFromServer }) => {
         const fetchMarketingData = async () => {
           try {
              const fColl = collection(db, 'followers');
              const q = query(fColl, where('profileId', '==', profile.id));
              const snapshot = await getCountFromServer(q);
              setFollowersCount(snapshot.data().count);
           } catch(e) { console.error(e); }
         };
         fetchMarketingData();
       });
    }
  }, [sidebarTab, profile]);

  if (authLoading || loading) return <div className="p-10 flex items-center justify-center min-h-screen font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Dashboard...</div>;
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

  const isFreePlan = profile?.plan === 'Free';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 w-full overflow-x-hidden relative">
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        plan={selectedPlanForPayment} 
      />
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999, fontWeight: 600 }}>
          {toastMessage}
        </div>
      )}
      {/* Mobile Top Header */}
      <div className="md:hidden flex h-14 items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-[40]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-[10px] uppercase">DBC</div>
          <span className="font-bold text-white text-sm">Business Portal</span>
        </div>
        <Link to="/" className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">Exit</Link>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile More Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-slate-900 w-full rounded-t-3xl border-t border-slate-800 p-6 flex flex-col gap-2 pb-24" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-bold mb-4 px-2">More Options</h3>
              <button onClick={() => { setSidebarTab('marketing'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'marketing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Megaphone size={20} /> <span className="flex-1 text-left">Broadcast Marketing</span>
              </button>
              <button onClick={() => { setSidebarTab('agent'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Users size={20} /> <span className="flex-1 text-left">Live Agent Panel</span>
              </button>
              <button onClick={() => { setSidebarTab('applications'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'applications' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Users size={20} /> <span className="flex-1 text-left">Job Applications</span>
              </button>
              <button onClick={() => { setSidebarTab('plan'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'plan' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Shield size={20} /> <span className="flex-1 text-left">Plan & Billing</span>
              </button>
              <button onClick={() => { setSidebarTab('referrals'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'referrals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Gift size={20} /> <span className="flex-1 text-left">Referral Program</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Native Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-slate-900 border-t border-slate-800 pb-4 shadow-2xl flex justify-around px-2 py-2">
           <button onClick={() => { setSidebarTab('profile'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${sidebarTab === 'profile' && !isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <LayoutDashboard size={20} />
             <span className="text-[9px] font-bold">Profile</span>
           </button>
           <button onClick={() => { setSidebarTab('analytics'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${sidebarTab === 'analytics' && !isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <BarChart3 size={20} />
             <span className="text-[9px] font-bold">Stats</span>
           </button>
           <button onClick={() => { setSidebarTab('appointments'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${sidebarTab === 'appointments' && !isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <Calendar size={20} />
             <span className="text-[9px] font-bold">Leads</span>
           </button>
           <button onClick={() => { setSidebarTab('agent'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${sidebarTab === 'agent' && !isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <Headset size={20} />
             <span className="text-[9px] font-bold">Agent</span>
           </button>
           <button onClick={() => { setSidebarTab('chatbot'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${sidebarTab === 'chatbot' && !isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <MessageSquare size={20} />
             <span className="text-[9px] font-bold">AI Chat</span>
           </button>
           <button onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center gap-1 w-16 py-1 transition-all ${isMobileMenuOpen ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
             <Menu size={20} />
             <span className="text-[9px] font-bold">More</span>
           </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:relative z-50 flex-col w-[280px] h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out">
          <div className="flex flex-col px-6 py-8 border-b border-slate-800">
            <h2 className="m-0 text-xl font-black text-white tracking-tight">Digital Connect</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">HAADI GLOBAL VENTURES FZE LLC</span>
          </div>

          <div className="flex flex-col flex-1 py-6 overflow-y-auto px-3 gap-1">
            <button onClick={() => setSidebarTab('profile')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={20} /> <span className="flex-1 text-left">My Digital Profile</span>
            </button>
            <button onClick={() => setSidebarTab('analytics')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <BarChart3 size={20} /> <span className="flex-1 text-left">Analytics & Stats</span>
            </button>
            <button onClick={() => setSidebarTab('appointments')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'appointments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Calendar size={20} /> <span className="flex-1 text-left">Appointments & Leads</span>
            </button>
            <button onClick={() => setSidebarTab('marketing')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'marketing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Megaphone size={20} /> <span className="flex-1 text-left">Broadcast Marketing</span>
            </button>
            <button onClick={() => setSidebarTab('agent')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'agent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Users size={20} /> <span className="flex-1 text-left">Live Agent Panel</span>
            </button>
            <button onClick={() => setSidebarTab('applications')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'applications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Users size={20} /> <span className="flex-1 text-left">Job Applications</span>
            </button>
            <button onClick={() => setSidebarTab('chatbot')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'chatbot' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <MessageSquare size={20} /> <span className="flex-1 text-left">Smart AI Chatbot</span>
            </button>
            <button onClick={() => setSidebarTab('plan')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'plan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Shield size={20} /> <span className="flex-1 text-left">Plan & Billing</span>
            </button>
            <button onClick={() => setSidebarTab('referrals')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'referrals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <Gift size={20} /> <span className="flex-1 text-left">Referral Program</span>
            </button>
            {profile?.plan === 'Enterprise' && (
              <button onClick={() => setSidebarTab('team')} className={`px-4 py-3.5 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'team' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Users size={20} /> <span className="flex-1 text-left">Team Management</span>
              </button>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-800 shrink-0">
            <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider">
               Back to Home
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden text-slate-900">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
              <h1 className="m-0 text-xl md:text-2xl font-extrabold text-slate-900">Manage Your Digital Card</h1>
              <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
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
                }} className="flex-1 md:flex-none px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold hover:bg-slate-200 transition-colors shrink-0 text-center">Load Demo Content</button>
                <Link to={`/profile/${profile?.slug || profile?.id}`} className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors shrink-0 text-center">Preview Live</Link>
                <button onClick={handleSave} className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm shrink-0 text-center">Save Changes</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
          {sidebarTab === 'profile' && (
            <>
              <div className="flex bg-slate-100/80 p-1.5 overflow-x-auto scrollbar-hide whitespace-nowrap gap-1.5 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                 <button onClick={() => setActiveTab('basic')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'basic' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Basic Info</button>
                 <button onClick={() => setActiveTab('contact')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'contact' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Contact & Map</button>
                 <button onClick={() => setActiveTab('social')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Social Links</button>
                 <button onClick={() => setActiveTab('jobs')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'jobs' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Hiring</button>
                 <button onClick={() => setActiveTab('theme')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'theme' ? 'bg-white shadow-md text-blue-700 scale-[1.02] border border-blue-100' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>💎 Layouts</button>
                 <button onClick={() => setActiveTab('business')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'business' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Services</button>
                 <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Shop</button>
                 <button onClick={() => setActiveTab('testimonials')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'testimonials' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Reviews</button>
                 <button onClick={() => setActiveTab('faq')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'faq' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>FAQs</button>
                 <button onClick={() => setActiveTab('hours')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'hours' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Timing</button>
                 <button onClick={() => setActiveTab('media')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'media' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Gallery</button>
                 <button onClick={() => setActiveTab('bank')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'bank' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Payments</button>
                 <button onClick={() => setActiveTab('widgets')} className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'widgets' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-200/50'}`}>Custom</button>
              </div>
              <div className="p-4 md:p-6 lg:p-8 overflow-y-auto relative">
                {isFreePlan && !['basic', 'contact'].includes(activeTab) && (
                  <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to unlock this section and enhance your digital business card.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
                )}
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo URL {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <div className="flex gap-3">
                        <input type="text" disabled={isFreePlan} placeholder="https://..." value={formData.photoUrl || ''} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" />
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                           {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <div className="text-[10px] text-slate-400">No Img</div>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Image URL {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <input type="text" disabled={isFreePlan} placeholder="https://..." value={formData.bannerUrl || ''} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <input type="text" disabled={isFreePlan} value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Category {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <select 
                        disabled={isFreePlan}
                        value={formData.category || 'Technology'} 
                        onChange={e => setFormData({...formData, category: e.target.value})} 
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                      >
                        {['Technology', 'Real Estate', 'Finance', 'Consulting', 'Design', 'Medical', 'Retail', 'Education'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City (UAE) {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <select 
                        disabled={isFreePlan}
                        value={formData.city || 'Dubai'} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                      >
                        {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</label>
                      <input type="text" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-normal break-words">Promotional Banner / Announcement {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <input type="text" disabled={isFreePlan} value={formData.announcement || ''} placeholder="e.g. 50% Off Winter Sale!" onChange={e => setFormData({...formData, announcement: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                      <input 
                        type="email" 
                        value={formData.email || ''} 
                        onChange={e => {
                          setFormData({...formData, email: e.target.value});
                          if (emailError) setEmailError('');
                        }} 
                        className={`w-full p-3 border rounded-lg outline-none transition-all ${emailError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} 
                      />
                      {emailError && <span className="text-[10px] text-red-500 font-bold mt-1 uppercase">{emailError}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                        <button 
                          disabled={isFreePlan}
                          onClick={async () => {
                            if (!formData.name && !formData.title) {
                              alert("Please enter Name and Job Title first.");
                              return;
                            }
                            const btn = document.getElementById("ai-bio-btn");
                            if(btn) btn.innerHTML = "Generating...";
                            try {
                              const aiInstance = new ProxyGoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
                              const res = await aiInstance.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: [{ role: 'user', parts: [{ text: `Generate a concise, professional 2-3 sentence bio for: Name: ${formData.name || ''}, Title: ${formData.title || ''}, Company: ${formData.company || ''}. Make it sound modern and impressive. Do not use quotes.` }] }]
                              });
                              const text = res.text;
                              if(text) {
                                setFormData({...formData, bio: text.trim()});
                              }
                            } catch(e) {
                              console.error("AI Magic Writer Error:", e);
                              alert("Failed to generate bio.");
                            }
                            if(btn) btn.innerHTML = "✨ AI Magic Writer";
                          }}
                          id="ai-bio-btn"
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >✨ AI Magic Writer</button>
                      </div>
                      <textarea disabled={isFreePlan} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none disabled:bg-slate-100 disabled:opacity-60" />
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+971 50 123 4567" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                        <input type="text" disabled={isFreePlan} value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" placeholder="Include country code without +" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal/Business Website {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                        <input type="url" disabled={isFreePlan} value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" placeholder="https://..." />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Building / Office Address {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                          <button 
                            disabled={isFreePlan}
                            onClick={async () => {
                              if (!navigator.geolocation) {
                                alert("Geolocation is not supported by your browser");
                                return;
                              }
                              const btn = document.getElementById("gps-btn");
                              if(btn) btn.innerHTML = "Fetching...";
                              navigator.geolocation.getCurrentPosition(async (position) => {
                                const { latitude, longitude } = position.coords;
                                try {
                                  let address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                                  try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                    const data = await res.json();
                                    if (data && data.display_name) {
                                      address = data.display_name;
                                    }
                                  } catch (e) {
                                    console.error("Reverse geocoding failed", e);
                                  }
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
                                const btn = document.getElementById("gps-btn");
                                if(btn) btn.innerHTML = "📍 Use My GPS";
                              });
                            }}
                            id="gps-btn"
                            className="text-[10px] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                          >📍 Use My GPS</button>
                        </div>
                        <input type="text" disabled={isFreePlan} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" placeholder="Office 123, Tower..." />
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Maps Link (Get Directions) {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                        <input type="url" disabled={isFreePlan} value={formData.mapLink || ''} onChange={e => setFormData({...formData, mapLink: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="flex flex-col gap-4 max-w-2xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'github'].map(network => (
                            <div key={network} className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider capitalize">{network}</label>
                              <input type="text" value={formData.socials?.[network] || ''} onChange={e => setFormData({...formData, socials: {...(formData.socials || {}), [network]: e.target.value}})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder={`${network} username/link...`} />
                            </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Services & Products</h3>
                        <button onClick={() => setFormData({...formData, services: [...(formData.services || []), { name: '', desc: '', price: '', priceType: 'Fixed' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add Service</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.services || []).map((svc: any, index: number) => (
                           <div key={`svc-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                               <div className="md:col-span-6">
                                 <input type="text" placeholder="Service Name" value={svc.name || ''} onChange={e => { const s = [...formData.services]; s[index].name = e.target.value; setFormData({...formData, services: s}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                               <div className="md:col-span-3">
                                 <select value={svc.priceType || 'Fixed'} onChange={e => { const s = [...formData.services]; s[index].priceType = e.target.value; setFormData({...formData, services: s}); }} className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium font-sans">
                                   <option value="Fixed">Fixed Price</option>
                                   <option value="Hourly">Hourly Rate</option>
                                   <option value="Call for Price">Call for Price</option>
                                   <option value="Custom">Custom</option>
                                 </select>
                               </div>
                               <div className="md:col-span-3">
                                 {(!svc.priceType || svc.priceType === 'Fixed' || svc.priceType === 'Hourly') && (
                                   <input type="text" placeholder={svc.priceType === 'Hourly' ? "Rate (e.g. AED 150)" : "Price (e.g. AED 500)"} value={svc.price || ''} onChange={e => { const s = [...formData.services]; s[index].price = e.target.value; setFormData({...formData, services: s}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                 )}
                               </div>
                             </div>
                             <textarea placeholder="Service Description..." value={svc.desc || ''} onChange={e => { const s = [...formData.services]; s[index].desc = e.target.value; setFormData({...formData, services: s}); }} rows={2} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans" />
                             <div className="flex justify-end">
                               <button onClick={() => { const s = [...formData.services]; s.splice(index, 1); setFormData({...formData, services: s}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.services || formData.services.length === 0) && <div className="text-slate-500 text-sm italic">No services added yet.</div>}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Team Members</h3>
                        <button onClick={() => setFormData({...formData, team: [...(formData.team || []), { name: '', role: '', image: '', desc: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add Team Member</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.team || []).map((member: any, index: number) => (
                           <div key={`tm-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <input type="text" placeholder="Name" value={member.name || ''} onChange={e => { const t = [...formData.team]; t[index].name = e.target.value; setFormData({...formData, team: t}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <input type="text" placeholder="Role/Title" value={member.role || ''} onChange={e => { const t = [...formData.team]; t[index].role = e.target.value; setFormData({...formData, team: t}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <div className="sm:col-span-2">
                                <input type="text" placeholder="Photo URL" value={member.image || ''} onChange={e => { const t = [...formData.team]; t[index].image = e.target.value; setFormData({...formData, team: t}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                             </div>
                             <textarea placeholder="Short Bio (Optional)" value={member.desc || ''} onChange={e => { const t = [...formData.team]; t[index].desc = e.target.value; setFormData({...formData, team: t}); }} rows={2} className="w-full p-3 border border-slate-300 rounded-lg font-sans outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                             <div className="flex justify-end">
                               <button onClick={() => { const t = [...formData.team]; t.splice(index, 1); setFormData({...formData, team: t}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.team || formData.team.length === 0) && <div className="text-slate-500 text-sm italic">No team members added.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <div>
                          <h3 className="m-0 text-base font-bold text-slate-800">Products (Store)</h3>
                          <p className="m-1 text-xs text-slate-500">Add products for visitors to view and buy directly via WhatsApp.</p>
                        </div>
                        <button onClick={() => setFormData({...formData, products: [...(formData.products || []), { name: '', description: '', price: '', image: '', link: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors shrink-0">+ Add Product</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.products || []).map((prod: any, index: number) => (
                           <div key={`prod-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <input type="text" placeholder="Product Name" value={prod.name || ''} onChange={e => { const p = [...formData.products]; p[index].name = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <input type="text" placeholder="Price (e.g. 50 AED)" value={prod.price || ''} onChange={e => { const p = [...formData.products]; p[index].price = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <textarea placeholder="Product Description" value={prod.description || ''} onChange={e => { const p = [...formData.products]; p[index].description = e.target.value; setFormData({...formData, products: p}); }} rows={2} className="w-full p-3 border border-slate-300 rounded-lg font-sans outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                             <div className="grid grid-cols-1 gap-3">
                               <input type="url" placeholder="Image URL (e.g. https://domain.com/img.jpg)" value={prod.image || ''} onChange={e => { const p = [...formData.products]; p[index].image = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <input type="url" placeholder="External Buy Link (Optional)" value={prod.link || ''} onChange={e => { const p = [...formData.products]; p[index].link = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="flex justify-end mt-2">
                               <button onClick={() => { const p = [...formData.products]; p.splice(index, 1); setFormData({...formData, products: p}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove Product</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.products || formData.products.length === 0) && <div className="text-slate-500 text-sm italic">No products added yet.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <div>
                          <h3 className="m-0 text-base font-bold text-slate-800">Job Openings</h3>
                          <p className="m-1 text-xs text-slate-500">Post jobs and hire candidates directly from your digital profile.</p>
                        </div>
                        <button onClick={() => setFormData({...formData, jobOpenings: [...(formData.jobOpenings || []), { title: '', type: 'Full-time', location: '', salary: '', description: '', link: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors shrink-0">+ Add Job</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.jobOpenings || []).map((job: any, index: number) => (
                           <div key={`job-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <input type="text" placeholder="Job Title (e.g. Sales Manager)" value={job.title || ''} onChange={e => { const j = [...formData.jobOpenings]; j[index].title = e.target.value; setFormData({...formData, jobOpenings: j}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <select value={job.type || 'Full-time'} onChange={e => { const j = [...formData.jobOpenings]; j[index].type = e.target.value; setFormData({...formData, jobOpenings: j}); }} className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium font-sans">
                                 <option value="Full-time">Full-time</option>
                                 <option value="Part-time">Part-time</option>
                                 <option value="Contract">Contract</option>
                                 <option value="Freelance">Freelance</option>
                               </select>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <input type="text" placeholder="Location (e.g. Dubai, UAE / Remote)" value={job.location || ''} onChange={e => { const j = [...formData.jobOpenings]; j[index].location = e.target.value; setFormData({...formData, jobOpenings: j}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <input type="text" placeholder="Salary Range (Optional)" value={job.salary || ''} onChange={e => { const j = [...formData.jobOpenings]; j[index].salary = e.target.value; setFormData({...formData, jobOpenings: j}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <textarea placeholder="Job Description & Requirements" value={job.description || ''} onChange={e => { const j = [...formData.jobOpenings]; j[index].description = e.target.value; setFormData({...formData, jobOpenings: j}); }} rows={3} className="w-full p-3 border border-slate-300 rounded-lg font-sans outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                             <div className="grid grid-cols-1 gap-3">
                               <input type="url" placeholder="Application Link (e.g. Google Form or external site - Optional)" value={job.link || ''} onChange={e => { const j = [...formData.jobOpenings]; j[index].link = e.target.value; setFormData({...formData, jobOpenings: j}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="flex justify-end mt-2">
                               <button onClick={() => { const j = [...formData.jobOpenings]; j.splice(index, 1); setFormData({...formData, jobOpenings: j}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove Job</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.jobOpenings || formData.jobOpenings.length === 0) && <div className="text-slate-500 text-sm italic">No job openings posted.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Client Testimonials</h3>
                        <button onClick={() => setFormData({...formData, testimonials: [...(formData.testimonials || []), { name: '', role: '', quote: '', rating: 5 }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add Testimonial</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.testimonials || []).map((test: any, index: number) => (
                           <div key={`ts-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                               <input type="text" placeholder="Client Name" value={test.name || ''} onChange={e => { const t = [...formData.testimonials]; t[index].name = e.target.value; setFormData({...formData, testimonials: t}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <input type="text" placeholder="Company/Role" value={test.role || ''} onChange={e => { const t = [...formData.testimonials]; t[index].role = e.target.value; setFormData({...formData, testimonials: t}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               <select value={test.rating || 5} onChange={e => { const t = [...formData.testimonials]; t[index].rating = Number(e.target.value); setFormData({...formData, testimonials: t}); }} className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium font-sans">
                                 <option value={5}>5 Stars ★★★★★</option>
                                 <option value={4}>4 Stars ★★★★</option>
                                 <option value={3}>3 Stars ★★★</option>
                                 <option value={2}>2 Stars ★★</option>
                                 <option value={1}>1 Star ★</option>
                               </select>
                             </div>
                             <textarea placeholder="Client Quote" value={test.quote || ''} onChange={e => { const t = [...formData.testimonials]; t[index].quote = e.target.value; setFormData({...formData, testimonials: t}); }} rows={3} className="w-full p-3 border border-slate-300 rounded-lg font-sans outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                             <div className="flex justify-end">
                               <button onClick={() => { const t = [...formData.testimonials]; t.splice(index, 1); setFormData({...formData, testimonials: t}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.testimonials || formData.testimonials.length === 0) && <div className="text-slate-500 text-sm italic">No testimonials added.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Frequently Asked Questions</h3>
                        <button onClick={() => setFormData({...formData, faqs: [...(formData.faqs || []), { question: '', answer: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add FAQ</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.faqs || []).map((faq: any, index: number) => (
                           <div key={`faq-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <input type="text" placeholder="Question" value={faq.question || ''} onChange={e => { const f = [...formData.faqs]; f[index].question = e.target.value; setFormData({...formData, faqs: f}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold" />
                             <textarea placeholder="Answer" value={faq.answer || ''} onChange={e => { const f = [...formData.faqs]; f[index].answer = e.target.value; setFormData({...formData, faqs: f}); }} rows={3} className="w-full p-3 border border-slate-300 rounded-lg font-sans outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                             <div className="flex justify-end">
                               <button onClick={() => { const f = [...formData.faqs]; f.splice(index, 1); setFormData({...formData, faqs: f}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.faqs || formData.faqs.length === 0) && <div className="text-slate-500 text-sm italic">No FAQs added.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'hours' && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Business Hours</h3>
                      </div>
                      <div className="flex flex-col gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                          const currentHours = (formData.hours || {})[day] || { open: '09:00', close: '18:00', closed: false };
                          return (
                            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                              <div className="w-24 font-bold text-slate-600 text-sm">{day}</div>
                              <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                                  <input type="checkbox" checked={currentHours.closed} onChange={e => {
                                    const h = { ...formData.hours };
                                    h[day] = { ...currentHours, closed: e.target.checked };
                                    setFormData({...formData, hours: h});
                                  }} className="accent-blue-600" />
                                  Closed
                                </label>
                                {!currentHours.closed && (
                                  <div className="flex items-center gap-2">
                                    <input type="time" value={currentHours.open} onChange={e => {
                                      const h = { ...formData.hours };
                                      h[day] = { ...currentHours, open: e.target.value };
                                      setFormData({...formData, hours: h});
                                    }} className="p-1.5 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-400">TO</span>
                                    <input type="time" value={currentHours.close} onChange={e => {
                                      const h = { ...formData.hours };
                                      h[day] = { ...currentHours, close: e.target.value };
                                      setFormData({...formData, hours: h});
                                    }} className="p-1.5 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">Gallery / Portfolio</h3>
                        <button onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add Image</button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(formData.gallery || []).map((imgUrl: string, index: number) => (
                           <div key={index} className="flex items-center gap-2 group">
                             <div className="flex-1">
                               <input type="url" placeholder="Image URL (e.g. https://domain.com/img.jpg)" value={imgUrl} onChange={e => { const g = [...formData.gallery]; g[index] = e.target.value; setFormData({...formData, gallery: g}); }} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                             </div>
                             <button onClick={() => { const g = [...formData.gallery]; g.splice(index, 1); setFormData({...formData, gallery: g}); }} className="p-2.5 bg-red-50 text-red-600 border-none rounded-lg cursor-pointer hover:bg-red-100 transition-colors shrink-0 flex items-center justify-center">
                               <X size={18} />
                             </button>
                           </div>
                        ))}
                        {(!formData.gallery || formData.gallery.length === 0) && <div className="text-slate-500 text-sm italic">Add images to showcase your work.</div>}
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-base font-bold text-slate-800">YouTube Videos</h3>
                        <button onClick={() => setFormData({...formData, videos: [...(formData.videos || []), '']})} className="bg-red-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-red-700 transition-colors">+ Add Video</button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(formData.videos || []).map((vidUrl: string, index: number) => (
                           <div key={index} className="flex items-center gap-2">
                             <div className="flex-1">
                               <input type="url" placeholder="YouTube Embed URL (https://youtube.com/embed/...)" value={vidUrl} onChange={e => { const v = [...formData.videos]; v[index] = e.target.value; setFormData({...formData, videos: v}); }} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                             </div>
                             <button onClick={() => { const v = [...formData.videos]; v.splice(index, 1); setFormData({...formData, videos: v}); }} className="p-2.5 bg-red-50 text-red-600 border-none rounded-lg cursor-pointer hover:bg-red-100 transition-colors shrink-0 flex items-center justify-center">
                               <X size={18} />
                             </button>
                           </div>
                        ))}
                        {(!formData.videos || formData.videos.length === 0) && <div className="text-slate-500 text-sm italic">Embed videos using the YouTube 'Embed' link.</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bank' && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                         <h3 className="m-0 text-base font-bold text-slate-800">Bank Accounts</h3>
                         <button onClick={() => setFormData({...formData, bankAccounts: [...(formData.bankAccounts || []), { country: 'UAE', bankName: '', accountName: '', accountNumber: '', iban: '', swift: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">+ Add Account</button>
                      </div>
                      <div className="flex flex-col gap-6">
                        {(formData.bankAccounts || []).map((acc: any, index: number) => (
                           <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
                             <div className="flex flex-col gap-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                               <input type="text" value={acc.bankName || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].bankName = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                               <input type="text" value={acc.country || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].country = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="flex flex-col gap-1.5 md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Holder Name</label>
                               <input type="text" value={acc.accountName || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].accountName = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                               <input type="text" value={acc.accountNumber || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].accountNumber = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IBAN</label>
                               <input type="text" value={acc.iban || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].iban = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SWIFT Code</label>
                               <input type="text" value={acc.swift || ''} onChange={e => { const b = [...formData.bankAccounts]; b[index].swift = e.target.value; setFormData({...formData, bankAccounts: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                             </div>
                             <div className="md:col-span-2 flex justify-end mt-2">
                               <button onClick={() => { const b = [...formData.bankAccounts]; b.splice(index, 1); setFormData({...formData, bankAccounts: b}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">Remove Account</button>
                             </div>
                           </div>
                        ))}
                        {(!formData.bankAccounts || formData.bankAccounts.length === 0) && <div className="text-slate-500 text-sm italic">No bank details provided.</div>}
                      </div>
                    </div>
                    
                    <div className="mt-8 border-t border-slate-200 pt-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                         <div>
                            <h3 className="m-0 text-base font-bold text-slate-800">Payment Links & QR</h3>
                            <p className="m-1 text-xs text-slate-500">Add Stripe, PayPal, UPI, or PayTabs links for direct payment</p>
                         </div>
                         <button onClick={() => setFormData({...formData, paymentLinks: [...(formData.paymentLinks || []), { platform: 'Stripe', url: '', qrCodeUrl: '' }]})} className="bg-emerald-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">+ Add Payment Link</button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.paymentLinks || []).map((link: any, index: number) => (
                           <div key={`pl-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                             <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                               <div className="sm:col-span-4">
                                 <select value={link.platform} onChange={e => { const p = [...formData.paymentLinks]; p[index].platform = e.target.value; setFormData({...formData, paymentLinks: p}); }} className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                                   <option value="Stripe">Stripe</option>
                                   <option value="PayPal">PayPal</option>
                                   <option value="UPI">UPI</option>
                                   <option value="PayTabs">PayTabs</option>
                                   <option value="Custom">Custom Link</option>
                                 </select>
                               </div>
                               <div className="sm:col-span-8">
                                 <input type="url" placeholder="Direct Payment URL (e.g., https://buy.stripe.com/...)" value={link.url || ''} onChange={e => { const p = [...formData.paymentLinks]; p[index].url = e.target.value; setFormData({...formData, paymentLinks: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="flex-1">
                                 <input type="url" placeholder="Optional QR Code Image URL" value={link.qrCodeUrl || ''} onChange={e => { const p = [...formData.paymentLinks]; p[index].qrCodeUrl = e.target.value; setFormData({...formData, paymentLinks: p}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                               <button onClick={() => { const p = [...formData.paymentLinks]; p.splice(index, 1); setFormData({...formData, paymentLinks: p}); }} className="p-3 bg-red-50 text-red-600 border-none rounded-lg cursor-pointer hover:bg-red-100 transition-colors shrink-0">
                                 <X size={20} />
                               </button>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'theme' && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <h3 className="m-0 text-base font-bold text-slate-800 mb-2">Profile Layout & Theme</h3>
                      <p className="m-0 text-sm text-slate-500 mb-6 underline decoration-blue-500/30">Select a layout and style for your digital profile.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div onClick={() => setFormData({...formData, template: 'classic'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'classic' || !formData.template ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="bg-slate-200 aspect-[4/3] rounded-xl mb-4 shadow-inner"></div>
                          <div className="font-bold text-slate-900">Classic Modern</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'executive'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'executive' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-slate-900 hover:bg-slate-800'}`}>
                          <div className="absolute -top-3 -right-2 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">PREMIUM</div>
                          <div className="bg-slate-800 aspect-[4/3] rounded-xl mb-4 shadow-inner"></div>
                          <div className={`font-bold ${formData.template === 'executive' ? 'text-blue-700' : 'text-white'}`}>Executive Dark</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'minimal'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'minimal' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="absolute -top-3 -right-2 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">PREMIUM</div>
                          <div className="border border-slate-100 aspect-[4/3] rounded-xl mb-4 shadow-inner"></div>
                          <div className="font-bold text-slate-900">Minimal Clean</div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200">
                        <h3 className="m-0 text-base font-bold text-slate-800 mb-2">Profession / Skill Theme</h3>
                        <p className="m-0 text-sm text-slate-500 mb-6">Select automated thematic design settings based on your profession.</p>
                        <select 
                          value={formData.profession || ''} 
                          onChange={e => setFormData({...formData, profession: e.target.value})} 
                          className="w-full max-w-sm p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium font-sans"
                        >
                           <option value="">Standard (Corporate)</option>
                           <option value="Welder">Welder</option>
                           <option value="Doctor">Doctor / Medical</option>
                           <option value="Carpenter">Carpenter</option>
                           <option value="AC Technician">AC Technician</option>
                           <option value="Electrician">Electrician</option>
                           <option value="Plumber">Plumber</option>
                           <option value="Mechanic">Auto Mechanic</option>
                           <option value="Engineer">Engineer</option>
                           <option value="Lawyer">Lawyer / Legal</option>
                           <option value="Chef">Chef / Culinary</option>
                           <option value="Real Estate Agent">Real Estate Agent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'widgets' && (
                  <div className="flex flex-col gap-10">
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                       <h3 className="m-0 text-base font-bold text-slate-800 mb-2">Booking Appointments Button</h3>
                       {profile.plan === 'Basic' || profile.plan === 'Pro' ? (
                         <div className="mt-4 bg-amber-50 border border-amber-200 p-5 rounded-xl">
                           <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                             <Shield size={18} /> Premium Feature Required
                           </div>
                           <p className="m-0 text-xs text-amber-700 leading-relaxed">External Appointment Booking Link is not available on your current plan. Note: Our built-in booking feature is available for all plans.</p>
                           <button onClick={() => setSidebarTab('plan')} className="mt-4 bg-amber-600 text-white border-none py-2 px-6 rounded-lg text-xs font-bold cursor-pointer hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">Upgrade Plan</button>
                         </div>
                       ) : (
                         <div className="mt-4 space-y-4">
                           <div className="flex flex-col gap-1.5">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calendly / External Booking Link</label>
                             <input type="text" value={formData.meetingUrl || ''} onChange={e => setFormData({...formData, meetingUrl: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://calendly.com/yourname" />
                             <p className="text-[10px] font-medium text-slate-500 mt-1">If provided, a custom "Book Meeting" button will redirect visitors to this link instead of using the built-in system.</p>
                           </div>
                         </div>
                       )}
                     </div>

                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                       <h3 className="m-0 text-base font-bold text-slate-800 mb-2">Business Document / Portfolio</h3>
                       <p className="m-0 text-xs text-slate-500 mb-6">Upload or link a PDF file like your Company Profile, Portfolio, or Resume.</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document URL (PDF / Web Link)</label>
                           <input type="url" value={formData.documentUrl || ''} onChange={e => setFormData({...formData, documentUrl: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                         </div>
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Button Text</label>
                           <input type="text" value={formData.documentButtonText || ''} onChange={e => setFormData({...formData, documentButtonText: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Download Company Profile" />
                         </div>
                       </div>
                     </div>

                     <div className="mt-4 pt-10 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                          <div>
                            <h3 className="m-0 text-base font-bold text-slate-800">Custom Action Buttons</h3>
                            <p className="m-1 text-xs text-slate-500">Add extra buttons to link to apps, websites, or features.</p>
                          </div>
                          <button onClick={() => setFormData({...formData, customButtons: [...(formData.customButtons || []), { label: '', url: '', icon: 'Link', isPrimary: false }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">+ Add Button</button>
                        </div>
                        <div className="flex flex-col gap-4">
                          {(formData.customButtons || []).map((btn: any, index: number) => (
                             <div key={`cbtn-${index}`} className="border border-slate-200 p-4 md:p-6 rounded-xl bg-slate-50 flex flex-col gap-4 shadow-sm">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <input type="text" placeholder="Button Label (e.g. Visit Website)" value={btn.label || ''} onChange={e => { const b = [...formData.customButtons]; b[index].label = e.target.value; setFormData({...formData, customButtons: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                 <input type="url" placeholder="URL Link" value={btn.url || ''} onChange={e => { const b = [...formData.customButtons]; b[index].url = e.target.value; setFormData({...formData, customButtons: b}); }} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                               <div className="flex flex-wrap items-center justify-between gap-4">
                                 <select value={btn.icon || 'Link'} onChange={e => { const b = [...formData.customButtons]; b[index].icon = e.target.value; setFormData({...formData, customButtons: b}); }} className="flex-1 min-w-[140px] p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium font-sans">
                                   <option value="Link">🔗 Standard Link</option>
                                   <option value="Globe">🌐 Website</option>
                                   <option value="Calendar">📅 Calendar</option>
                                   <option value="FileText">📄 Document</option>
                                   <option value="Download">📥 Download</option>
                                   <option value="MessageCircle">💬 Chat</option>
                                 </select>
                                 <div className="flex items-center gap-4">
                                   <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                                     <input type="checkbox" checked={btn.isPrimary || false} onChange={e => { const b = [...formData.customButtons]; b[index] = { ...b[index], isPrimary: e.target.checked }; setFormData({...formData, customButtons: b}); }} className="accent-blue-600" />
                                     Primary Style
                                   </label>
                                   <button onClick={() => { const b = [...formData.customButtons]; b.splice(index, 1); setFormData({...formData, customButtons: b}); }} className="bg-red-50 text-red-600 border-none py-1.5 px-4 rounded-lg font-bold text-xs cursor-pointer hover:bg-red-100 transition-colors">
                                     Remove
                                   </button>
                                 </div>
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
            <div className="p-4 md:p-8 relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to view analytics and stats.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 m-0">Profile Performance</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Real-time engagement insights for your profile</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                   <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Profile Views</div>
                   <div className="text-4xl font-black text-slate-900 tabular-nums leading-none mb-4">{profile.views || 0}</div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                     <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">↑</span>
                     <span>+12.4% vs last month</span>
                   </div>
                   <BarChart3 size={100} className="absolute -bottom-6 -right-6 text-slate-50 opacity-[0.05]" />
                 </div>
                 
                 <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                   <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Unique Visitors</div>
                   <div className="text-4xl font-black text-slate-900 tabular-nums leading-none mb-4">{Math.floor((profile.views || 0) * 0.7)}</div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                     <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">↑</span>
                     <span>+8.2% vs last month</span>
                   </div>
                   <Users size={100} className="absolute -bottom-6 -right-6 text-slate-50 opacity-[0.05]" />
                 </div>

                 <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                   <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">CTA Interactions</div>
                   <div className="text-4xl font-black text-slate-900 tabular-nums leading-none mb-4">{Math.floor((profile.views || 0) * 0.45)}</div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                     <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">↑</span>
                     <span>+15.7% vs last month</span>
                   </div>
                   <LinkIcon size={100} className="absolute -bottom-6 -right-6 text-slate-50 opacity-[0.05]" />
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                     <div>
                       <h4 className="text-lg font-black text-slate-900 m-0">Global Reach</h4>
                       <p className="text-xs text-slate-500 m-0">Visitor distribution by country</p>
                     </div>
                     <MapPin className="text-blue-500" size={24} />
                   </div>
                   <div className="space-y-6">
                     {[
                       { code: 'UAE', name: 'United Arab Emirates', views: 65, color: 'bg-blue-600' },
                       { code: 'IND', name: 'India', views: 20, color: 'bg-emerald-500' },
                       { code: 'GBR', name: 'United Kingdom', views: 10, color: 'bg-purple-500' },
                       { code: 'USA', name: 'United States', views: 5, color: 'bg-slate-500' }
                     ].map((item) => (
                       <div key={item.code} className="group">
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{item.code}</span>
                             <span className="text-sm font-bold text-slate-700">{item.name}</span>
                           </div>
                           <span className="text-sm font-black text-slate-900 tabular-nums">{item.views}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${item.views}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full ${item.color} rounded-full`} />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                      <LayoutDashboard size={32} />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 m-0">Advanced Insights</h4>
                    <p className="text-sm text-slate-500 mt-2 mb-6 max-w-[240px]">More detailed interaction data, device breakdown and referral sources coming soon.</p>
                    <button className="px-6 py-2.5 bg-slate-100 text-slate-600 text-xs font-black rounded-xl cursor-not-allowed">Waitlist Active</button>
                 </div>
               </div>
            </div>
          )}

          {sidebarTab === 'agent' && (
             <div className="p-4 md:p-8 h-full flex flex-col relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to use the Live Agent Panel.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-6 shrink-0">
                 <h2 className="text-2xl font-black text-slate-900 m-0">Live Agent Panel</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Support your customers in real-time. Handed over from AI assistant.</p>
               </div>
               <div className="flex-1 min-h-0">
                 <LiveAgentPanel profileId={profile.id} />
               </div>
             </div>
          )}

          {sidebarTab === 'appointments' && (
            <div className="p-4 md:p-8 relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to manage Appointments & Leads.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 m-0">Appointments & Leads</h2>
                   <p className="text-slate-500 m-0 mt-1 text-sm">Real-time management for all incoming customer queries</p>
                 </div>
                 <div className="flex flex-wrap gap-3">
                   <button 
                     onClick={handleExportLeads}
                     className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                   >
                     <Download size={14} /> Export CSV
                   </button>
                   <button 
                    onClick={async () => {
                      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                      try {
                         await addDoc(collection(db, 'leads'), {
                            profileId: profile.id,
                            name: 'Rohan Sharma',
                            email: 'rohan.s@example.com',
                            phone: '+971 50 123 4567',
                            company: 'Dubai Tech Ventures',
                            message: 'I am interested in your services for my new startup in Dubai Silicon Oasis. Please call.',
                            source: 'Contact Form',
                            createdAt: serverTimestamp()
                         });
                         await addDoc(collection(db, 'appointments'), {
                            profileId: profile.id,
                            customerName: 'Sarah Jenkins',
                            customerEmail: 'sarah.j@example.com',
                            date: '2024-05-15',
                            time: '11:00',
                            source: 'Profile Booking',
                            createdAt: serverTimestamp()
                         });
                         showToast('Dubai Demo samples created!');
                      } catch(e) {
                        showToast('Failed to add sample data.');
                      }
                    }}
                    className="px-5 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2"
                  >
                    <Plus size={14} /> Load Dubai Leads Demo
                  </button>
                 </div>
               </div>

               {appointments.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                      <Calendar size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 m-0">Inbox is empty</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-0 max-w-sm">When visitors book appointments or send leads from your profile, they will appear here instantly.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                   {appointments.slice().sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).map(apt => (
                     <div key={apt.id} className="group bg-white border border-slate-200 rounded-2xl p-5 md:p-6 transition-all hover:shadow-xl hover:border-blue-200 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="flex-1 flex gap-4">
                           <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-black text-lg">
                             {(apt.name || apt.customerName || '?').charAt(0)}
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="font-black text-slate-900">{apt.name || apt.customerName}</span>
                               <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${apt.source === 'Contact Form' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                 {apt.source === 'Contact Form' ? 'NEW LEAD' : 'BOOKING'}
                               </span>
                             </div>
                             <div className="flex flex-wrap gap-y-1 gap-x-4">
                               <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                 <Mail size={12} /> {apt.email || apt.customerEmail}
                               </div>
                               {apt.phone && (
                                 <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                   <Phone size={12} /> {apt.phone}
                                 </div>
                               )}
                               {apt.company && (
                                 <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                   <Building size={12} /> {apt.company}
                                 </div>
                               )}
                             </div>
                             {apt.message && (
                               <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                                 "{apt.message}"
                               </div>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t border-slate-100 pt-4 md:pt-0 md:border-none">
                            {apt.date ? (
                              <div className="flex flex-col md:items-end text-sm">
                                <span className="font-black text-slate-900">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="font-bold text-blue-600">{apt.time || '--:--'}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-black text-slate-400 capitalize">Received {apt.createdAt?.toDate ? new Date(apt.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
                            )}
                            <div className="flex gap-2">
                               <button className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm shadow-blue-600/5">
                                 <Mail size={18} />
                               </button>
                               <button className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm shadow-emerald-600/5">
                                 <Phone size={18} />
                               </button>
                            </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {sidebarTab === 'marketing' && (
            <div className="p-4 md:p-8 relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to unlock Broadcast Marketing.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 m-0">Bulk Broadcast Marketing</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Send updates and offers to all your followers at once</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                       <h4 className="text-lg font-black text-slate-900 m-0 mb-6 flex items-center gap-2">
                         <Plus size={20} className="text-blue-600" /> New Campaign
                       </h4>
                       
                       <div className="space-y-6">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Broadcast Channel</label>
                            <div className="grid grid-cols-3 gap-3">
                               {['WhatsApp', 'Push', 'Email'].map(t => (
                                 <button 
                                  key={t}
                                  onClick={() => setCampaignData({...campaignData, type: t})}
                                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${campaignData.type === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                 >
                                   {t}
                                 </button>
                               ))}
                            </div>
                            {campaignData.type === 'WhatsApp' && (
                              <div className="mt-2 text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                                ⚠️ WhatsApp API charges (AED 0.15 - 0.30 per conversation) apply for bulk sending.
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                            <textarea 
                              placeholder="Type your broadcast message here..." 
                              value={campaignData.message}
                              onChange={e => setCampaignData({...campaignData, message: e.target.value})}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[150px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attachment URL (Optional Image)</label>
                            <input 
                              type="url" 
                              placeholder="https://..." 
                              value={campaignData.imageUrl}
                              onChange={e => setCampaignData({...campaignData, imageUrl: e.target.value})}
                              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <button 
                            disabled={campaignLoading || !campaignData.message}
                            onClick={async () => {
                               if (followersCount === 0) {
                                  alert("You don't have any followers yet to send messages to.");
                                  return;
                               }
                               setCampaignLoading(true);
                               try {
                                  await addDoc(collection(db, 'campaigns'), {
                                    profileId: profile.id,
                                    ...campaignData,
                                    sentAt: serverTimestamp(),
                                    recipientCount: followersCount,
                                    status: 'Sent'
                                  });
                                  alert(`Successfully broadcasted to ${followersCount} followers via ${campaignData.type}!`);
                                  setCampaignData({ subject: '', message: '', imageUrl: '', type: 'WhatsApp' });
                               } catch(e) {
                                  alert("Failed to send campaign.");
                               } finally {
                                  setCampaignLoading(false);
                               }
                            }}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${campaignLoading || !campaignData.message ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'}`}
                          >
                            {campaignLoading ? 'Processing...' : `Broadcast to ${followersCount} Followers`} <Send size={18} />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Audience</div>
                       <div className="text-4xl font-black text-slate-900 mb-2">{followersCount + (profile?.fakeFollowers || 0)}</div>
                       <p className="text-xs text-slate-500 m-0">Users who are following your business profile updates.</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 text-white shadow-lg">
                       <h5 className="text-sm font-black m-0 mb-4 flex items-center gap-2">
                         <Sparkles size={16} className="text-amber-400" /> WhatsApp Pro Tips
                       </h5>
                       <ul className="space-y-3 m-0 p-0 list-none text-xs text-slate-400 font-medium">
                          <li className="flex gap-2">
                            <span className="text-blue-500">•</span> Use images to increase click rate by 40%.
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500">•</span> Keep messages under 200 characters for mobile readability.
                          </li>
                          <li className="flex gap-2">
                            <span className="text-blue-500">•</span> Add a clear Call to Action (CTA).
                          </li>
                       </ul>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {sidebarTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 md:p-8 relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to manage Job Applications.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                 <div>
                   <h2 className="m-0 text-xl font-bold text-slate-800">Job Applications</h2>
                   <p className="m-1 text-sm text-slate-500">View and manage candidates who have applied to your job postings.</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div className="bg-slate-50 border border-slate-200 p-8 text-center rounded-xl">
                   <p className="text-slate-500 font-medium">No job applications have been strictly received directly yet. Once a candidate submits their resume from your profile, it will appear here.</p>
                 </div>
              </div>
            </div>
          )}

          {sidebarTab === 'chatbot' && (
            <div className="p-4 md:p-8 relative">
               {isFreePlan && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to a premium plan to unlock the AI Chatbot Agent.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 m-0">AI Chatbot Agent</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Configure your automated 24/7 client assistant</p>
               </div>

               {profile.plan === 'Basic' ? (
                 <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-emerald-50 border-2 border-emerald-100 rounded-3xl text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-pulse">
                      <MessageSquare size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 m-0">Unlock AI Assistant</h3>
                    <p className="text-sm text-emerald-700 mt-3 mb-8 max-w-sm mx-auto leading-relaxed">
                      Upgrade to <span className="font-black">Pro Plan</span> to let our trained AI handle your leads, booking questions, and customer queries automatically 24/7.
                    </p>
                    <button onClick={() => setSidebarTab('plan')} className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">Upgrade & Unlock AI</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                     <div className="flex flex-col gap-6">
                       <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                              <Shield size={20} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-slate-900 m-0">Custom AI Key</h4>
                              <p className="text-xs text-slate-500 m-0">Use your own AI provider account key</p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-1.5">
                            <input 
                              type="password" 
                              placeholder="Enter your Gemini/OpenAI API Key (AIzaSy...)" 
                              value={formData.aiApiKey || ''} 
                              onChange={e => setFormData({...formData, aiApiKey: e.target.value})} 
                              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium" 
                            />
                            <p className="text-[10px] text-slate-500 mt-1">If blank, the platform's default API quota will be used.</p>
                         </div>
                       </div>
                       
                       <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                             <Brain size={20} />
                           </div>
                           <div>
                             <h4 className="text-base font-black text-slate-900 m-0">Knowledge Base</h4>
                             <p className="text-xs text-slate-500 m-0">Instructions & facts for the AI</p>
                           </div>
                        </div>

                         <div className="relative group">
                            <textarea 
                              placeholder="Describe your business, services, pricing, and specific ways the AI should respond to clients..." 
                              value={formData.aiPrompt || ''} 
                              onChange={e => setFormData({...formData, aiPrompt: e.target.value})} 
                              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl min-h-[350px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium leading-relaxed resize-none"
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur border border-slate-200 text-[10px] font-black text-slate-400 group-focus-within:text-blue-500 transition-colors">
                               <Sparkles size={10} /> AUTO-SAVING ACTIVE
                            </div>
                         </div>
                         <div className="mt-6">
                           <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                             Update Knowledge Base
                           </button>
                         </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px] lg:h-auto">
                       <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-white font-black text-sm tracking-tight">AI PREVIEW</span>
                          </div>
                          <button onClick={() => { localStorage.removeItem(`chat_history_${profile.id}`); window.location.reload(); }} className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-md bg-slate-800/50">Reset Chat</button>
                       </div>
                       <div className="flex-1 overflow-hidden relative">
                         <DashboardChatTester profile={profile} />
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {sidebarTab === 'plan' && (
            <div className="p-4 md:p-8">
              <div className="mb-10">
                 <h2 className="text-2xl font-black text-slate-900 m-0">Subscription & Billing</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Manage features and plan limits for your digital presence</p>
              </div>

               <div className="flex flex-col gap-10">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl shadow-slate-900/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                  <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">CURRENT ACTIVE PLAN</div>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-5xl font-black m-0">{profile.plan || 'Free'}</h3>
                      <Sparkles size={32} className="text-amber-400" />
                    </div>
                    <p className="text-slate-400 m-0 text-sm max-w-sm leading-relaxed">You are enjoying all features associated with the {profile.plan || 'Free'} plan. Upgrade anytime for advanced enterprise tools.</p>
                  </div>
                  <div className="relative z-10 text-center md:text-right bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl min-w-[200px]">
                     <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">MEMBERSHIP COST</div>
                     <div className="text-4xl font-black tabular-nums">
                        {(() => {
                           const currentPlanData = (siteSettings?.countryPlans?.[selectedCountry] || siteSettings?.countryPlans?.['Global'] || []).find((p: any) => p.name === (profile.plan || 'Basic'));
                           return currentPlanData ? currentPlanData.price : 'Free';
                        })()}
                        {(profile.plan !== 'Basic' && profile.plan !== 'Free') && <span className="text-sm font-bold text-slate-500 ml-1">/mo</span>}
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {(siteSettings?.countryPlans?.[selectedCountry] || siteSettings?.countryPlans?.['Global'] || []).map((plan: any) => (
                     <div key={plan.name} className={`relative p-8 rounded-[2rem] border-2 transition-all group ${profile.plan === plan.name ? 'border-blue-600 bg-blue-50/20 ring-4 ring-blue-500/5' : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm hover:shadow-xl'}`}>
                       {plan.popular && (
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30">MOST POPULAR</div>
                       )}
                       
                       <h4 className="text-lg font-black text-slate-900 m-0 mb-2">{plan.name}</h4>
                       <div className="flex items-baseline gap-1 mb-8">
                         <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                         {plan.price !== 'Free' && <span className="text-xs font-bold text-slate-500 tracking-tight">/month</span>}
                       </div>
                       
                       <div className="space-y-4 mb-10">
                         {plan.features.map(f => (
                           <div key={f} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                             <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">✓</div>
                             {f}
                           </div>
                         ))}
                       </div>
                       
                       {profile.plan === plan.name ? (
                         <button disabled className="w-full py-4 rounded-2xl bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2">
                           <Shield size={14} /> Active Plan
                         </button>
                       ) : (
                         <button 
                           onClick={() => { 
                             if(plan.price === 'Free') {
                               setFormData({...formData, plan: plan.name}); 
                               setTimeout(handleSave, 100); 
                             } else {
                               setSelectedPlanForPayment(plan);
                               setIsPaymentModalOpen(true);
                             }
                           }} 
                           className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
                         >
                           Choose {plan.name}
                         </button>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'team' && (
             <div className="p-4 md:p-8">
               <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 m-0">Team Management</h2>
                 <p className="text-slate-500 m-0 mt-1 text-sm">Control digital profiles for your entire organization</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                       <h4 className="text-lg font-black text-slate-900 m-0 mb-6 flex items-center gap-2">
                         <Users size={20} className="text-blue-600" /> Organization Members
                       </h4>
                       
                       {(profile.teamMembers || []).length === 0 ? (
                         <div className="py-12 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                              <Users size={30} />
                            </div>
                            <h5 className="font-black text-slate-700 m-0">No team members yet</h5>
                            <p className="text-xs text-slate-500 mt-2">Invite your employees or partners to create their DBC profiles.</p>
                         </div>
                       ) : (
                         <div className="space-y-4">
                            {profile.teamMembers.map((m: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{m.name?.charAt(0)}</div>
                                  <div>
                                    <div className="font-bold text-sm text-slate-900">{m.name}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{m.email} • {m.role}</div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">Manage</button>
                                  <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">Remove</button>
                                </div>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                       <h4 className="text-sm font-black text-slate-900 m-0 mb-4">Invite Member</h4>
                       <div className="space-y-4">
                          <input 
                            type="email" 
                            placeholder="Employee Email..." 
                            value={invitationEmail}
                            onChange={(e) => setInvitationEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold" 
                          />
                          <select 
                            value={invitationRole}
                            onChange={(e) => setInvitationRole(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                          >
                             <option>Member (Customizable Profile)</option>
                             <option>View-Only (Admin Managed)</option>
                          </select>
                          <button 
                            onClick={async () => {
                              if (!invitationEmail) {
                                showToast("Please enter an email");
                                return;
                              }
                              const currentMembers = profile.teamMembers || [];
                              if (currentMembers.length >= 10) {
                                showToast("Team limit reached. Upgrade for more seats.");
                                return;
                              }
                              const newMember = {
                                name: invitationEmail.split('@')[0],
                                email: invitationEmail,
                                role: invitationRole,
                                status: 'Pending'
                              };
                              const updatedMembers = [...currentMembers, newMember];
                              try {
                                await setDoc(doc(db, 'profiles', user.uid), { teamMembers: updatedMembers }, { merge: true });
                                setProfile({ ...profile, teamMembers: updatedMembers });
                                setInvitationEmail('');
                                showToast(`Invitation sent to ${invitationEmail}`);
                              } catch(e) {
                                showToast("Failed to send invitation");
                              }
                            }}
                            className="w-full py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                          >
                            Send Invitation
                          </button>
                       </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800">
                       <div className="flex items-center justify-between mb-4">
                          <h5 className="text-xs font-black uppercase tracking-widest m-0">Seat Utilization</h5>
                          <span className="text-[10px] font-bold text-emerald-400">{(profile.teamMembers?.length || 0)} / 10 used</span>
                       </div>
                       <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((profile.teamMembers?.length || 0) / 10) * 100}%` }} />
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          )}

          {sidebarTab === 'referrals' && (
            <div className="max-w-6xl mx-auto flex flex-col gap-10 lg:pl-10 animate-fade-in pb-20">
              <div className="mb-0">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Referral Earnings</h1>
                <p className="text-slate-500 mt-2 text-lg">Share your referral link with other businesses and earn commissions on their premium plans.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Referrals</div>
                  <div className="text-4xl font-black text-slate-900 mb-2">{profile.referralCount || 0}</div>
                  <p className="text-xs text-slate-500 m-0">Businesses completely referred.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Pending</div>
                  <div className="text-4xl font-black text-slate-900 mb-2">{profile.referralPending || 0}</div>
                  <p className="text-xs text-slate-500 m-0">Awaiting purchase confirmation.</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 border border-green-400 rounded-3xl p-6 shadow-sm">
                  <div className="text-[10px] font-black text-green-100 uppercase tracking-widest mb-1">Total Earnings</div>
                  <div className="text-4xl font-black text-white mb-2">AED {profile.referralEarnings || 0}</div>
                  <p className="text-xs text-green-100 m-0">Available for withdrawal.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Unified Referral Link</h3>
                     <p className="text-slate-500 mb-6">Share your profile link. If you refer a business directly and they subscribe to a paid plan, you earn a <strong className="text-emerald-600">{siteSettings?.referralDirectCommission || 20} {siteSettings?.currency || 'AED'} direct commission</strong>!</p>
                     
                     <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center overflow-x-auto">
                          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                            {(() => {
                              const userProfile = profiles?.find((p: any) => p.ownerId === user?.uid || p.email === user?.email);
                              const referralCode = userProfile?.id || (user ? `DBC-${user.uid.substring(0, 8).toUpperCase()}` : profile.id);
                              return `${window.location.origin}/plans?ref=${referralCode}`;
                            })()}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            const userProfile = profiles?.find((p: any) => p.ownerId === user?.uid || p.email === user?.email);
                            const referralCode = userProfile?.id || (user ? `DBC-${user.uid.substring(0, 8).toUpperCase()}` : profile.id);
                            navigator.clipboard.writeText(`${window.location.origin}/plans?ref=${referralCode}`);
                            showToast("Link copied to clipboard!");
                          }}
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                        >
                          Copy Link
                        </button>
                     </div>
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
