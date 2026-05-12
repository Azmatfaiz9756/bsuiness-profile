import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, Calendar, MessageSquare, Image as ImageIcon, Shield, Send, Menu, X, BarChart3, MapPin, Link as LinkIcon, Plus, Mail, Phone, Building, Brain, Sparkles, Megaphone, Gift, Download, Headset, Briefcase, ArrowLeft, UserPlus, Share2, Coins, MessageCircle, Globe, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ProxyGoogleGenAI } from '../../lib/gemini';

import LiveAgentPanel from './LiveAgentPanel';
import { CHAT_LANGUAGES } from '../../lib/languages';
import { PaymentModal } from '../../components/PaymentModal';
import { ImageUploadCrop } from '../../components/ImageUploadCrop';
import AnimatedLogo from '../../components/AnimatedLogo';


const Type = { STRING: 'STRING', OBJECT: 'OBJECT', ARRAY: 'ARRAY' };

function DashboardChatTester({ profile }: { profile: any }) {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [stockData, setStockData] = useState<string>('');
  const [formattedStock, setFormattedStock] = useState<string>('');

  useEffect(() => {
    if (stockData) {
      const lines = stockData.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1, 15).map(row => {
          const cells = row.split(',').map(c => c.trim());
          return headers.map((h, i) => `${h}: ${cells[i] || 'N/A'}`).join(', ');
        });
        setFormattedStock(dataRows.join('\n'));
      } else {
        setFormattedStock(stockData);
      }
    }
  }, [stockData]);

  const ai = new ProxyGoogleGenAI({ apiKey: profile?.aiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '' });

  const getGreeting = (langId: string) => {
    if (langId === 'hi') return `Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon?`;
    if (langId === 'en') return `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`;
    if (langId === 'ar') return `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`;
    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `Hello! I'm the AI assistant for ${profile?.name}. I can assist you in ${lang?.label || langId}. How can I help you today?`;
  };

  const getPrompt = (langId: string) => {
    let stockContext = "";
    if (profile?.stockSyncEnabled && formattedStock) {
      stockContext = `
IMPORTANT - LIVE INVENTORY (CHECK THIS LIST TO ANSWER PRODUCT QUESTIONS):
${formattedStock}

INVENTORY RULES:
1. CUSTOMER QUERY MATCH: If a customer asks for a product, check the list above for matching names.
2. STOCK STATUS: If it's in the list, confirm availability. If not, say you don't have that specific data but can take their details.
3. PRICING: ${profile?.showStockPrice ? "You ARE allowed to share prices found in the list." : "Do NOT share numerical prices."}
`;
    }

    const translationInfo = `
MASTER KNOWLEDGE BASE (FOLLOW THESE RULES FIRST):
${profile?.aiPrompt || 'No specific instructions provided.'}

TRANSLATION FEATURES:
- Language: Respond strictly in ${CHAT_LANGUAGES.find(l => l.id === langId)?.label || langId}.
- You are a polyglot AI assistant. You can understand and translate between any languages.
- PRICE POLICY: ${profile?.showStockPrice ? "You CAN share prices ONLY for items found in the STOCK/INVENTORY data provided." : "Do NOT provide specific prices or numerical cost estimates."}
- If the user sends a message in a different language, translate it internally, then respond in the target language.
`;

    const truncate = (str: string, len: number) => {
      if (!str) return 'N/A';
      return str.length > len ? str.substring(0, len) + '...' : str;
    };

    if (langId === 'hi') {
      return `Aap ${truncate(profile.name, 100)} ke Assistant hain. Aapko aam Hindustani language use karni hai.

${stockContext}
${translationInfo}

HIDAYAT (IMPORTANT):
1. MASTER KNOWLEDGE: Jo 'MASTER KNOWLEDGE BASE' mein instructions hain, unhe sabse pehle follow karein.
2. STOCK LOKUP: Agar user kisi product ke baare mein puche, toh upar de gaye 'LIVE INVENTORY' mein check karein.
3. PRICE POLICY: ${profile?.showStockPrice ? "Inventory wale prices bata sakte hain." : "Prices mat batana."}
4. NO FORMAL HINDI: 'janab', 'yogdaan' jaise words use na karein. Simple bhasha use karein.

Greeting: "Assalamualekum! Main ${profile?.name} ka digital assistant hoon. Main aapki kaise madad kar sakta hoon?"`;
    }

    if (langId === 'ar') {
      return `أنت مساعد ذكي محترف لـ ${truncate(profile?.name, 100)} (المسمى الوظيفي: ${truncate(profile?.title, 100)} في ${truncate(profile?.company, 100)}).
${translationInfo}
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة خليجية بيضاء أو فصحى مهذبة).

IMPORTANT: Keep your responses EXTREMELY concise (max 2-3 short sentences). Avoid fluff for maximum speed.

${stockContext}

السياق: ${truncate(profile?.bio, 1000)}. التواصل: البريد: ${profile?.email}, الهاتف: ${profile?.phone}.`;
    }
    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `You are a professional AI business assistant for ${truncate(profile?.name, 100)} (Title: ${truncate(profile?.title, 100)} at ${truncate(profile?.company, 100)}).
${translationInfo}
Your tone should be helpful, clear, and professional. 
You MUST communicate primarily in ${lang?.label || langId}.

IMPORTANT: Keep your responses EXTREMELY concise (max 2-3 short sentences). Avoid fluff for maximum speed.

${stockContext}

Context: ${truncate(profile?.bio, 1000)}. Contact: Email: ${profile?.email}, Phone: ${profile?.phone}, WhatsApp: ${profile?.whatsapp || profile?.phone}.`;
  };

  useEffect(() => {
    if (profile?.stockSyncEnabled) {
      const fetchStock = async () => {
        try {
          if (profile.stockSourceType === 'Manual' && profile.stockManualData) {
            setStockData(profile.stockManualData);
          } else if ((profile.stockSourceType === 'GoogleSheet' || profile.stockSourceType === 'CSV_URL') && profile.stockSourceUrl) {
            let url = profile.stockSourceUrl;
            if (profile.stockSourceType === 'GoogleSheet') {
              // Convert normal sheet links to CSV pub links if possible
              if (url.includes('docs.google.com/spreadsheets') && !url.includes('output=csv')) {
                if (url.includes('/edit')) {
                   const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                   if (idMatch) {
                     url = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
                   }
                } else if (!url.includes('pub?')) {
                   url = url.endsWith('/') ? url + 'pub?output=csv' : url + '/pub?output=csv';
                } else if (url.includes('pub?')) {
                   if (!url.includes('output=csv')) url += '&output=csv';
                }
              }
            }
            const resp = await fetch(url);
            if (resp.ok) {
              const text = await resp.text();
              setStockData(text);
            }
          } else if (profile.stockSourceType === 'CRM' && profile.crmProvider) {
            if (profile.crmProvider === 'Zoho' && profile.zohoToken && profile.zohoOrgId) {
              const resp = await fetch(`https://inventory.zoho.com/api/v1/items?organization_id=${profile.zohoOrgId}`, {
                headers: { 'Authorization': `Zoho-oauthtoken ${profile.zohoToken}` }
              });
              if (resp.ok) {
                const data = await resp.json();
                const items = data.items?.map((it: any) => `${it.name}: ${it.available_stock} in stock - ${it.rate}`).join('\n');
                setStockData(items || 'No items found in Zoho.');
              }
            } else if ((profile.crmProvider === 'Vyapar' || profile.crmProvider === 'Tally') && profile.crmEndpoint) {
              const resp = await fetch(profile.crmEndpoint, {
                headers: { 'Authorization': `Bearer ${profile.crmSecret || ''}` }
              });
              if (resp.ok) {
                const text = await resp.text();
                setStockData(text);
              }
            }
          }
        } catch (e) {
          console.error("Stock sync error in tester:", e);
        }
      };
      fetchStock();
    }
  }, [profile?.stockSyncEnabled, profile?.stockSourceType, profile?.stockSourceUrl, profile?.stockManualData, profile?.crmProvider, profile?.zohoToken, profile?.zohoOrgId, profile?.crmEndpoint, profile?.crmSecret]);

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

      const modelName = 'gemini-3-flash-preview';
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
  const [teamProfiles, setTeamProfiles] = useState<any[]>([]);
  const [editingSubProfileId, setEditingSubProfileId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'chat' | 'card'>('chat');
  const [isEditingTeamProfile, setIsEditingTeamProfile] = useState<any>(null);
  const [domainStatus, setDomainStatus] = useState<'Checking' | 'Connected' | 'Error' | 'Not Configured'>('Not Configured');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [emailError, setEmailError] = useState('');
  const [campaignData, setCampaignData] = useState({ subject: '', message: '', imageUrl: '', type: 'WhatsApp' });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [businessHours, setBusinessHours] = useState<any>({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: true },
    sunday: { open: '09:00', close: '18:00', closed: true }
  });
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
          // Verify with server
          const apiUrl = '';
          const verifyRes = await fetch(`${apiUrl}/api/verify-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          
          if (!verifyRes.ok) throw new Error('Verification failed.');
          const verifyData = await verifyRes.json();
          
          if (!verifyData.verified) {
             showToast('Payment not verified. Please contact support if you were charged.');
             setSearchParams({});
             return;
          }

          const { getDoc, updateDoc, increment, collection, query, where, getDocs } = await import('firebase/firestore');
          const userRef = doc(db, 'profiles', profile.id);
          const decodedPlanName = decodeURIComponent(planName);
          const updateData: any = {
            plan: decodedPlanName,
            updatedAt: new Date().toISOString()
          };
          const refCode = localStorage.getItem('dbc_referred_by');
          const profileRefId = localStorage.getItem('dbc_profile_visited');

          if (refCode) {
            updateData.referredBy = refCode;
            localStorage.removeItem('dbc_referred_by');
          }
          await updateDoc(userRef, updateData);

          // Calculate and distribute bonuses
          try {
             // 1. Find Plan Cost
             const currentPlanData = (siteSettings?.countryPlans?.[selectedCountry] || siteSettings?.countryPlans?.['Global'] || []).find((p: any) => p.name === decodedPlanName);
             const planCostRaw = currentPlanData?.price || '0';
             const planCost = parseFloat(planCostRaw.replace(/[^0-9.]/g, '')) || 0;

             if (planCost > 0) {
               // 2. Welcome Bonus (10% to buyer) except Enterprise
               if (decodedPlanName !== 'Enterprise' && decodedPlanName !== 'Enterprise Sub') {
                  const welcomeBonus = planCost * 0.10;
                  await updateDoc(doc(db, 'profiles', profile.id), { walletBalance: increment(welcomeBonus) });
               }

               // 3. Referral Bonuses
               if (refCode) {
                 const qObj = query(collection(db, 'profiles'), where('ownerId', '==', refCode));
                 const snap = await getDocs(qObj);
                 
                 let referrerRef: any = null;
                 let referrerData: any = null;
                 
                 if (!snap.empty) {
                    referrerRef = snap.docs[0].ref;
                    referrerData = snap.docs[0].data();
                 }

                 let isNormalUserSharing = false;
                 if (profileRefId && profileRefId !== refCode) {
                     isNormalUserSharing = true;
                 }

                 if (isNormalUserSharing) {
                     // Normal User sharing a profile (5% to Normal User, 5% to Profile Owner)
                     if (referrerRef) await updateDoc(referrerRef, { walletBalance: increment(planCost * 0.05) });
                     
                     if (profileRefId) {
                         const profileOwnerRef = doc(db, 'profiles', profileRefId);
                         const poDoc = await getDoc(profileOwnerRef);
                         if (poDoc.exists()) {
                            await updateDoc(profileOwnerRef, { walletBalance: increment(planCost * 0.05) });
                         }
                     }
                 } else {
                     // Direct Referral
                     if (referrerRef) {
                         const referrerPlan = referrerData?.plan || 'Basic';
                         const isPaid = !referrerPlan.toLowerCase().includes('free') && !referrerPlan.toLowerCase().includes('basic');
                         const bonus = isPaid ? (planCost * 0.10) : (planCost * 0.05);
                         await updateDoc(referrerRef, { walletBalance: increment(bonus) });
                     }
                 }
               }
             }
          } catch (err) {
             console.error("Error distributing bonuses:", err);
          }

          showToast(`Succesfully subscribed to ${decodedPlanName}!`);
          
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

  const saveBusinessHours = async () => {
    if (!profile?.id) return;
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'profiles', profile.id), {
        businessHours: businessHours,
        updatedAt: new Date().toISOString()
      });
      showToast('Business hours saved successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to save business hours');
    }
  };

  // Fetch team profiles for Enterprise users
  useEffect(() => {
    if (sidebarTab === 'team' && profile?.id && (profile?.plan === 'Enterprise' || profile?.plan === 'Enterprise Lifetime' || user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com')) {
      import('firebase/firestore').then(({ collection, query, where, getDocs }) => {
        const fetchTeam = async () => {
          try {
            const q = query(collection(db, 'profiles'), where('ownerId', '==', user.uid), where('isSubProfile', '==', true));
            const snap = await getDocs(q);
            setTeamProfiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch(e) {
            console.error("Team fetch error:", e);
          }
        };
        fetchTeam();
      });
    }
  }, [sidebarTab, profile]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleExportLeads = () => {
    if (appointments.length === 0) {
      showToast("No leads to export");
      return;
    }
    const headers = ["Date", "Name", "Type", "Email", "Phone", "Company", "Message"];
    const csvContent = [
      headers.join(","),
      ...appointments.map(l => {
        const date = l.createdAt?.seconds 
          ? new Date(l.createdAt.seconds * 1000).toLocaleDateString()
          : new Date().toLocaleDateString();
        return [
          date,
          `"${l.name || l.customerName || 'Anonymous'}"`,
          l.source || 'Lead',
          l.email || l.customerEmail || '',
          l.phone || '',
          `"${l.company || ''}"`,
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

  const handleExportVCF = () => {
    if (appointments.length === 0) {
      showToast("No leads to export");
      return;
    }
    
    let vcfContent = '';
    appointments.forEach(l => {
        vcfContent += `BEGIN:VCARD\nVERSION:3.0\n`;
        vcfContent += `FN:${l.name || l.customerName || 'Anonymous'}\n`;
        vcfContent += `EMAIL:${l.email || l.customerEmail || ''}\n`;
        vcfContent += `TEL:${l.phone || ''}\n`;
        vcfContent += `ORG:${l.company || ''}\n`;
        vcfContent += `NOTE:Lead from NFC Business Profile\n`;
        vcfContent += `END:VCARD\n`;
    });
    
    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leads_contacts_${new Date().toLocaleDateString()}.vcf`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Leads exported to VCF");
  };

  useEffect(() => {
    // Verify Firestore Connection on mount
    const testConn = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        await getDoc(doc(db, 'test', 'connection'));
        console.log('Firestore connection verified');
      } catch (e: any) {
        console.warn('Firestore connection test failed:', e.message);
      }
    };
    testConn();

    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
          const data = docSnap.data();
          const pWithId = { id: docSnap.id, ...data };
          setProfile(pWithId);
          setFormData(data);
          if (data.businessHours) {
            setBusinessHours(data.businessHours);
          }
          if (!data.name || !data.slug || !data.ownerId) {
            console.log("Partial profile detected, filling in defaults...");
            const mergeData = {
              id: user.uid,
              ownerId: user.uid,
              slug: data.slug || user.uid.substring(0, 8).toLowerCase(),
              name: data.name || user.displayName || user.email?.split('@')[0] || 'User',
              email: data.email || user.email,
              status: data.status || 'Active',
              plan: data.plan || 'Free',
              updatedAt: new Date().toISOString()
            };
            const completeData = { ...data, ...mergeData };
            await setDoc(doc(db, 'profiles', user.uid), completeData, { merge: true });
            setProfile(completeData);
            setFormData(completeData);
            return;
          }

          // Auto-upgrade admin email to Enterprise Lifetime if needed
          if (user.email?.toLowerCase() === 'azmatfaiz9756@gmail.com' && data.plan !== 'Enterprise' && data.plan !== 'Enterprise Lifetime') {
            const upgradedData = { ...data, plan: 'Enterprise Lifetime', updatedAt: new Date().toISOString() };
            await setDoc(doc(db, 'profiles', user.uid), upgradedData, { merge: true });
            setProfile(upgradedData);
            setFormData(upgradedData);
          } else {
            setProfile(data);
            setFormData(data);
          }
          return; // Exit if found
        } else if (user.email) {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const q = query(collection(db, 'profiles'), where('email', '==', user.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const pData = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setProfile(pData);
            setFormData(pData);
            return; // Exit if found by email
          }
        }
          // Initialize empty profile
          const emptyProfile = {
            id: user.uid,
            slug: user.uid.substring(0, 8).toLowerCase(),
            name: user.displayName || 'Jane Doe',
            title: 'Founding Partner',
            company: 'Acme Corp',
            bio: 'I help businesses scale their digital presence through strategic planning and innovative technology solutions. With over 10 years of experience, my goal is to deliver exceptional value.',
            email: user.email || 'hello@example.com',
            phone: '+971 50 123 4567',
            address: 'Dubai Internet City, Building 1, Dubai, UAE',
            ownerId: user.uid,
            plan: user.email?.toLowerCase() === 'azmatfaiz9756@gmail.com' ? 'Enterprise Lifetime' : 'Free',
            status: 'Active',
            views: 0,
            referralCount: 0,
            referralPending: 0,
            referralEarnings: 0,
            role: 'Admin',
            isVerified: true,
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
            socialLinks: [],
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
            ],
            quickPayAmount: 0,
            quickPayCurrency: 'AED'
          };
          setProfile(emptyProfile);
          setFormData(emptyProfile);
          // Auto create
          console.log("Preparing to create initial profile for:", user.uid);
          try {
            await setDoc(docRef, emptyProfile);
            console.log("Initial profile created successfully for:", user.uid);
          } catch (createErr) {
            console.error("Initial profile creation failed for:", user.uid, createErr);
            showToast("Failed to initialize your profile. Please check your connection.");
          }
          
          // Create Join Notification for Admin
          try {
            await addDoc(collection(db, 'join_notifications'), {
              userId: user.uid,
              userName: emptyProfile.name,
              userEmail: emptyProfile.email,
              plan: emptyProfile.plan,
              createdAt: serverTimestamp(),
              type: 'NEW_USER_JOIN'
            });
          } catch (notifErr) {
            console.error("Join notification failed:", notifErr);
          }
          
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
            const aptsQ = query(collection(db, 'appointments'), where('ownerId', '==', user.uid), where('profileId', '==', profile.id));
            const leadsQ = query(collection(db, 'leads'), where('ownerId', '==', user.uid), where('profileId', '==', profile.id));
            
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-black text-xs">DBC</div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <h3 className="text-slate-900 font-black text-lg m-0 animate-pulse uppercase tracking-tight">Syncing Dashboard</h3>
           <p className="text-slate-500 font-bold text-[10px] m-0 tracking-[0.2em] uppercase">Connecting to Cloud Data</p>
        </div>
      </div>
    );
  }
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
      // Extract sensitive CRM keys
      const { zohoToken, zohoOrgId, crmEndpoint, crmSecret, ...publicData } = formData;
      
      const targetId = editingSubProfileId || user.uid;
      
      // Save sensitive CRM keys via proxy server
      if (formData.crmProvider) {
        const apiUrl = '';
        await fetch(`${apiUrl}/api/crm/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: targetId,
            crmProvider: formData.crmProvider,
            zohoToken,
            zohoOrgId,
            crmEndpoint,
            crmSecret
          })
        });
      }

      const savePayload = {
        ...publicData,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'profiles', targetId), savePayload, { merge: true });
      } catch (firestoreErr: any) {
        const errInfo = {
          error: firestoreErr?.message || String(firestoreErr),
          code: firestoreErr?.code,
          operation: 'setDoc',
          path: `profiles/${targetId}`,
          authUid: auth.currentUser?.uid,
          authEmail: auth.currentUser?.email,
          payloadKeys: Object.keys(savePayload)
        };
        console.error('Firestore Permission Error Details:', JSON.stringify(errInfo, null, 2));
        throw firestoreErr;
      }
      
      showToast('Profile updated securely for optimal SEO ranking!');
      
      if (!editingSubProfileId) {
        setProfile(formData); // keep main profile in sync if editing main
      } else {
        // Refresh team profiles if editing sub
        const { query, collection, where, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, 'profiles'), where('ownerId', '==', user.uid), where('isSubProfile', '==', true));
        const snap = await getDocs(q);
        setTeamProfiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      
      showToast('Profile updated and published securely!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile');
    }
  };

  const isAdminEmail = user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com' || 
                       profile?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com' ||
                       formData?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com';
  const isFreePlan = (profile?.plan === 'Free' || !profile?.plan) && !isAdminEmail;
  const isSubUser = profile?.isSubProfile;
  const isEnterpriseOwner = (profile?.plan === 'Enterprise' || profile?.plan === 'Enterprise Lifetime' || isAdminEmail) && !isSubUser;
  const isPremiumOrUp = (profile?.plan === 'Premium' || profile?.plan === 'Enterprise' || profile?.plan === 'Enterprise Lifetime' || isAdminEmail) && !isSubUser;

  // Availability toggle handler
  const toggleAvailability = async () => {
    if (!profile?.id) return;
    const newStatus = profile.availabilityStatus === 'available' ? 'away' : 'available';
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'profiles', profile.id), {
        availabilityStatus: newStatus,
        lastStatusUpdate: new Date().toISOString()
      });
      setProfile({ ...profile, availabilityStatus: newStatus });
      showToast(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Feature permission checks
  const canSeeAnalytics = !isSubUser || profile?.allowAnalytics;
  const canSeeAiAgent = !isSubUser || profile?.allowAiChat;
  const canSeeLiveAgent = !isSubUser || profile?.allowLiveAgent;
  const canSeeStock = !isSubUser || profile?.allowStock;
  const canEditProfile = !isSubUser || profile?.allowProfileEdit;
  const canSeeLeads = !isSubUser || profile?.allowLeadsAccess;

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
          <AnimatedLogo size={6} />
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
              {canSeeAnalytics && (
                <button onClick={() => { setSidebarTab('marketing'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'marketing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <Megaphone size={20} /> <span className="flex-1 text-left">Broadcast Marketing</span>
                </button>
              )}
              {canSeeLiveAgent && (
                <button onClick={() => { setSidebarTab('agent'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'agent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <Users size={20} /> <span className="flex-1 text-left">Live Agent Panel</span>
                </button>
              )}
              {!isSubUser && (
                <button onClick={() => { setSidebarTab('applications'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'applications' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <Users size={20} /> <span className="flex-1 text-left">Job Applications</span>
                </button>
              )}
              <button onClick={() => { setSidebarTab('hours'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'hours' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Clock size={20} /> <span className="flex-1 text-left">Business Hours</span>
              </button>
              {canSeeAiAgent && (
                <button onClick={() => { setSidebarTab('chatbot'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'chatbot' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <MessageSquare size={20} /> <span className="flex-1 text-left">Smart AI Chatbot</span>
                </button>
              )}
              {canSeeStock && (
                <button onClick={() => { setSidebarTab('stock'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'stock' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <Briefcase size={20} /> <span className="flex-1 text-left">Stock & Inventory</span>
                </button>
              )}
              <button onClick={() => { setSidebarTab('plan'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'plan' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Shield size={20} /> <span className="flex-1 text-left">Plan & Billing</span>
              </button>
              {!isSubUser && !isEnterpriseOwner && (
                <button onClick={() => { setSidebarTab('referrals'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'referrals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  <Gift size={20} /> <span className="flex-1 text-left">Referral Program</span>
                </button>
              )}
              <button onClick={() => { setSidebarTab('account'); setIsMobileMenuOpen(false); }} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'account' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                <Settings size={20} /> <span className="flex-1 text-left">Account & Security</span>
              </button>
            </div>
          </div>
        )}

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 pb-1 shadow-2xl flex justify-around px-2 py-1.5 overflow-hidden items-center h-14">
           <button onClick={() => { setSidebarTab('profile'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${sidebarTab === 'profile' && !isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
             <LayoutDashboard size={18} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Profile</span>
           </button>
           {canSeeAnalytics && (
             <button onClick={() => { setSidebarTab('analytics'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${sidebarTab === 'analytics' && !isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
               <BarChart3 size={18} />
               <span className="text-[8px] font-black uppercase tracking-tighter">Stats</span>
             </button>
           )}
           {canSeeLeads && (
             <button onClick={() => { setSidebarTab('appointments'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${sidebarTab === 'appointments' && !isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
               <Calendar size={18} />
               <span className="text-[8px] font-black uppercase tracking-tighter">Leads</span>
             </button>
           )}
           {canSeeStock && (
             <button onClick={() => { setSidebarTab('stock'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${sidebarTab === 'stock' && !isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
               <Briefcase size={18} />
               <span className="text-[8px] font-black uppercase tracking-tighter">Stock</span>
             </button>
           )}
           {isEnterpriseOwner && (
              <button onClick={() => { setSidebarTab('team'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${sidebarTab === 'team' && !isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
                <Users size={18} className="text-amber-400" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Team</span>
              </button>
           )}
           <button onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${isMobileMenuOpen ? 'text-blue-500 scale-105' : 'text-slate-500'}`}>
             <Menu size={18} />
             <span className="text-[8px] font-black uppercase tracking-tighter">More</span>
           </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:relative z-50 flex-col w-[280px] h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out">
          <div className="flex flex-col px-6 py-8 border-b border-slate-800">
            <h2 className="m-0 text-xl font-black text-white tracking-tight">VIBE Digital Connect</h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">HAADI GLOBAL VENTURES FZE LLC</span>
          </div>

          <div className="flex flex-col flex-1 py-6 overflow-y-auto px-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-50">Core Tools</span>
              <button onClick={() => setSidebarTab('profile')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <LayoutDashboard size={18} /> <span className="flex-1 text-left tracking-tight">Profile Dashboard</span>
              </button>
              {canSeeAnalytics && (
                <button onClick={() => setSidebarTab('analytics')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <BarChart3 size={18} /> <span className="flex-1 text-left tracking-tight">Analytics & Stats</span>
                </button>
              )}
              {canSeeLeads && (
                <button onClick={() => setSidebarTab('appointments')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'appointments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Calendar size={18} /> <span className="flex-1 text-left tracking-tight">Leads & Bookings</span>
                </button>
              )}
              <button onClick={() => setSidebarTab('hours')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'hours' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Clock size={18} /> <span className="flex-1 text-left tracking-tight">Business Hours</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-50">Sales Automation</span>
              {canSeeAiAgent && (
                <button onClick={() => setSidebarTab('chatbot')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'chatbot' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <MessageSquare size={18} /> <span className="flex-1 text-left tracking-tight">Smart AI Bot</span>
                </button>
              )}
              {canSeeLiveAgent && (
                <button onClick={() => setSidebarTab('agent')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'agent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Users size={18} /> <span className="flex-1 text-left tracking-tight">Live Support</span>
                </button>
              )}
               {canSeeAnalytics && (
                <button onClick={() => setSidebarTab('marketing')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'marketing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Megaphone size={18} /> <span className="flex-1 text-left tracking-tight">WhatsApp Marketing</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-50">Operations</span>
               {isEnterpriseOwner && (
                <button onClick={() => setSidebarTab('team')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'team' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Users size={18} /> <span className="flex-1 text-left tracking-tight">Team Management</span>
                </button>
              )}
              {canSeeStock && (
                <button onClick={() => setSidebarTab('stock')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'stock' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Briefcase size={18} /> <span className="flex-1 text-left tracking-tight">Stock Sync</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-slate-800">
               <button onClick={() => setSidebarTab('plan')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'plan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Shield size={18} /> <span className="flex-1 text-left tracking-tight">Plan & Billing</span>
              </button>
              <button onClick={() => setSidebarTab('referrals')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'referrals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Gift size={18} /> <span className="flex-1 text-left tracking-tight">Referrals</span>
              </button>
              <button onClick={() => setSidebarTab('account')} className={`px-4 py-3 flex items-center gap-3 text-sm font-semibold rounded-xl transition-all ${sidebarTab === 'account' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Settings size={18} /> <span className="flex-1 text-left tracking-tight">Account & Security</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-800 shrink-0 flex flex-col gap-3">
            <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider">
               Back to Home
            </Link>
            <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-900/40 hover:bg-red-800/60 text-red-200 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider border border-red-800/50">
               Log Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden text-slate-900">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
              <div className="flex flex-col">
                <h1 className="m-0 text-xl md:text-2xl font-extrabold text-slate-900">
                  {editingSubProfileId ? `Editing Profile: ${formData.name || 'Staff'}` : 'Manage Your Digital Card'}
                </h1>
                {editingSubProfileId && (
                  <button 
                    onClick={() => {
                      setEditingSubProfileId(null);
                      setFormData(profile); // Reset to main profile
                    }}
                    className="mt-1 text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-blue-700"
                  >
                    <ArrowLeft size={12} /> Switch Back to My Main Profile
                  </button>
                )}
                {isSubUser && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={toggleAvailability}
                      className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border w-fit ${
                        profile?.availabilityStatus === 'available' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${profile?.availabilityStatus === 'available' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`} />
                      {profile?.availabilityStatus === 'available' ? 'Status: Available' : 'Status: Out of Service'}
                    </button>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${canEditProfile ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {canEditProfile ? 'Full Editor Access' : 'Read-only Profile'}
                      </div>
                      {!canEditProfile && (
                        <span className="text-[10px] text-slate-400 font-medium italic">Contact admin to change permissions</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                <Link 
                  to={formData.slug ? `/${formData.slug}` : `/profile/${formData.id || user.uid}`}
                  target="_blank"
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 font-black rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10"
                >
                  <Globe size={14} /> View Live Profile
                </Link>
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
                <button 
                  onClick={canEditProfile ? handleSave : () => alert('You do not have permission to edit this profile.')} 
                  disabled={!canEditProfile}
                  className={`w-full md:w-auto px-4 py-2 border-none rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0 text-center ${
                    canEditProfile 
                    ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canEditProfile ? 'Save Changes' : 'Editing Disabled'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
          {sidebarTab === 'profile' && (
            <div className="flex flex-col h-full bg-slate-50">
              {/* Onboarding Checklist */}
              <div className="px-4 py-6 md:px-8 shrink-0">
                 <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 -mr-16 -mt-16 rounded-full" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="m-0 text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            👋 Welcome, {formData.name?.split(' ')[0] || 'Member'}
                          </h3>
                          <p className="text-sm text-slate-500 m-0 mt-1">Complete your setup to go live</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="text-2xl font-black text-blue-600">
                             {Math.round([formData.photoURL, (formData.socials?.whatsapp || formData.whatsapp), formData.quickPayAmount, formData.bio].filter(Boolean).length / 4 * 100)}%
                           </div>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[
                           { label: 'Profile Photo', done: !!formData.photoURL, icon: ImageIcon },
                           { label: 'WhatsApp link', done: !!(formData.socials?.whatsapp || formData.whatsapp), icon: Share2 },
                           { label: 'Quick Pay Set', done: !!formData.quickPayAmount, icon: Coins },
                           { label: 'Business Bio', done: !!formData.bio, icon: LayoutDashboard }
                         ].map((step, i) => (
                           <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${step.done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}>
                               {step.done ? '✓' : <step.icon size={14} />}
                             </div>
                             <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight ${step.done ? 'text-emerald-700' : 'text-slate-600'}`}>{step.label}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="flex border-b border-slate-200 bg-white sticky top-0 md:top-0 z-30 px-2 md:px-8 overflow-x-auto no-scrollbar shrink-0 shadow-sm">
                <button onClick={() => setActiveTab('basic')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>👤 Info</button>
                <button onClick={() => setActiveTab('contact')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'contact' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>📍 Contact & Address</button>
                <button onClick={() => setActiveTab('social')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'social' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>🌐 Social</button>
                <button onClick={() => setActiveTab('commerce')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'commerce' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>💳 Payments & Bank</button>
                <button onClick={() => setActiveTab('storefront')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'storefront' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>🛍️ Storefront</button>
                <button onClick={() => setActiveTab('design')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'design' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>🎨 Theme</button>
                <button onClick={() => setActiveTab('widgets')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'widgets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>📅 Booking</button>
                <button onClick={() => setActiveTab('domain')} className={`px-5 py-4 text-[11px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === 'domain' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>🔗 Domain</button>
              </div>
              <div className="p-4 md:p-6 lg:p-8 overflow-y-auto relative">
                {isFreePlan && !['basic', 'contact', 'domain', 'commerce'].includes(activeTab) && (
                  <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center pt-24">
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
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Profile Slug (URL ID)</label>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-400 text-sm font-mono">{window.location.origin}/</span>
                           <input 
                             type="text" 
                             value={formData.slug || ''} 
                             onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} 
                             className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm" 
                             placeholder="your-unique-slug"
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">This is your unique URL identifier used for sharing. Changing it will break existing links.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                      <select value={formData.country || 'Global'} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                        <option value="Global">Global</option>
                        <option value="UAE">UAE</option>
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <ImageUploadCrop 
                        value={formData.photoUrl || ''} 
                        onChange={(url) => setFormData({...formData, photoUrl: url})}
                        id={formData.id || user.uid}
                        circular={true}
                        disabled={isFreePlan}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Image {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                      <ImageUploadCrop 
                        value={formData.bannerUrl || ''} 
                        onChange={(url) => setFormData({...formData, bannerUrl: url})}
                        id={`banner-${formData.id || user.uid}`}
                        folder="banners"
                        aspectRatio={16/9}
                        circular={false}
                        disabled={isFreePlan}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">YouTube Banner Video {isFreePlan && <span title="Locked on Free Plan">🔒</span>}</label>
                        <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded">NEW</span>
                      </div>
                      <input type="text" disabled={isFreePlan} placeholder="https://youtube.com/watch?v=..." value={formData.bannerVideoUrl || ''} onChange={e => setFormData({...formData, bannerVideoUrl: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:opacity-60" />
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                      <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+971 50 123 4567" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                      <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+971 50 123 4567" />
                    </div>

                    {/* Second Owner Section */}
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-4 text-blue-600">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Second Owner / Partner (Optional)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Name</label>
                          <input type="text" value={formData.name2 || ''} onChange={e => setFormData({...formData, name2: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Second Owner Name" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Phone</label>
                          <input type="text" value={formData.phone2 || ''} onChange={e => setFormData({...formData, phone2: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+971..." />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner WhatsApp</label>
                          <input type="text" value={formData.whatsapp2 || ''} onChange={e => setFormData({...formData, whatsapp2: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+971..." />
                        </div>
                      </div>
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
                                model: 'gemini-3-flash-preview',
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

                    <div className="flex flex-col gap-1.5 md:col-span-2 mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className="text-blue-600" />
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Directory Privacy Settings</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Public Directory Visibility</label>
                          <div className="flex flex-col gap-2">
                            {[
                              { id: 'full', label: 'Full Visibility', desc: 'Show all allowed info' },
                              { id: 'partial', label: 'Partial Visibility', desc: 'Hide selected fields' },
                              { id: 'hidden', label: 'Hidden From Search', desc: 'Do not list in directory' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setFormData({...formData, directoryVisibility: opt.id})}
                                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${formData.directoryVisibility === opt.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                              >
                                <span className={`font-black text-xs uppercase tracking-wider ${formData.directoryVisibility === opt.id ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{opt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {(formData.directoryVisibility === 'partial' || !formData.directoryVisibility) && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Fields to HIDE in Directory</label>
                            <div className="space-y-2">
                              {[
                                { id: 'phone', label: 'Personal Mobile Number' },
                                { id: 'email', label: 'Professional Email' },
                                { id: 'company', label: 'Company Name' },
                                { id: 'location', label: 'City / Location' }
                              ].map(field => {
                                const isHidden = formData.directoryHiddenFields?.includes(field.id);
                                return (
                                  <label key={field.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input 
                                      type="checkbox" 
                                      checked={isHidden || false}
                                      onChange={(e) => {
                                        const current = formData.directoryHiddenFields || [];
                                        const next = e.target.checked ? [...current, field.id] : current.filter(f => f !== field.id);
                                        setFormData({...formData, directoryHiddenFields: next});
                                      }}
                                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                    />
                                    <span className="text-xs font-bold text-slate-700">{field.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <p className="mt-4 text-[10px] text-slate-400 italic">Note: These choices only affect your appearance in public discovery/leaderboards. Direct profile views will remain full unless Restricted Mode is enabled.</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    {user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com' && (
                      <div className="flex flex-col gap-1.5 mt-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div>
                            <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Verification Status (Admin Only)</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">Show blue checkmark on profile</p>
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, isVerified: !formData.isVerified})}
                            className={`w-12 h-6 rounded-full relative transition-all ${formData.isVerified ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isVerified ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    )}
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                        <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Include country code without +" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal/Business Website</label>
                        <input type="url" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://..." />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Building / Office Address</label>
                          <button 
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
                                      const addr = data.address || {};
                                      setFormData({
                                        ...formData,
                                        address: address,
                                        address_street: addr.road || addr.suburb || '',
                                        address_city: addr.city || addr.town || addr.village || '',
                                        address_state: addr.state || '',
                                        address_zip: addr.postcode || '',
                                        address_country: addr.country || '',
                                        mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                                      });
                                    } else {
                                      setFormData({
                                        ...formData, 
                                        address: address,
                                        mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                                      });
                                    }
                                  } catch (e) {
                                    console.error("Reverse geocoding failed", e);
                                    setFormData({
                                      ...formData, 
                                      address: address,
                                      mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                                    });
                                  }
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
                        <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-4" placeholder="Full address" />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Street</label>
                            <input type="text" value={formData.address_street || ''} onChange={e => setFormData({...formData, address_street: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 123 Business St" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                            <input type="text" value={formData.address_city || ''} onChange={e => setFormData({...formData, address_city: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Dubai" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">State / Province</label>
                            <input type="text" value={formData.address_state || ''} onChange={e => setFormData({...formData, address_state: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Dubai" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Zip / Postcode</label>
                            <input type="text" value={formData.address_zip || ''} onChange={e => setFormData({...formData, address_zip: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 00000" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Maps Link (Get Directions)</label>
                        <input type="url" value={formData.mapLink || ''} onChange={e => setFormData({...formData, mapLink: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://maps.google.com/..." />
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

                     <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <h4 className="text-sm font-black text-slate-800 m-0">Custom Social Links</h4>
                              <p className="text-[10px] text-slate-500 m-0 mt-1 uppercase tracking-wider font-bold">Add additional links (Portfolio, etc.)</p>
                           </div>
                           <button 
                             onClick={() => {
                               const links = formData.socialLinks || [];
                               setFormData({...formData, socialLinks: [...links, { label: '', url: '' }]});
                             }}
                             className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all"
                           >
                              <Plus size={18} />
                           </button>
                        </div>
                        <div className="space-y-3">
                           {(formData.socialLinks || []).map((link: any, idx: number) => (
                             <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                               <input 
                                 value={link.label} 
                                 onChange={e => {
                                   const next = [...formData.socialLinks];
                                   next[idx] = { ...next[idx], label: e.target.value };
                                   setFormData({...formData, socialLinks: next});
                                 }}
                                 placeholder="Label" 
                                 className="w-1/3 text-xs font-bold p-2 bg-slate-50 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                               />
                               <input 
                                 value={link.url} 
                                 onChange={e => {
                                   const next = [...formData.socialLinks];
                                   next[idx] = { ...next[idx], url: e.target.value };
                                   setFormData({...formData, socialLinks: next});
                                 }}
                                 placeholder="URL" 
                                 className="flex-1 text-xs p-2 bg-slate-50 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                               />
                               <button 
                                 onClick={() => {
                                   const next = formData.socialLinks.filter((_: any, i: number) => i !== idx);
                                   setFormData({...formData, socialLinks: next});
                                 }}
                                 className="text-red-400 hover:text-red-600 p-1 transition-colors"
                               >
                                 <X size={14} />
                               </button>
                             </div>
                           ))}
                           {(formData.socialLinks || []).length === 0 && (
                             <p className="text-[10px] text-slate-400 italic text-center py-2">No custom links added yet.</p>
                           )}
                        </div>
                     </div>

                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <h4 className="text-sm font-black text-slate-800 m-0">Staff Access Instructions</h4>
                              <p className="text-[10px] text-slate-500 m-0 mt-1 uppercase tracking-wider font-bold">How staff members login</p>
                           </div>
                           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <Brain size={16} />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-md shadow-blue-500/20">1</div>
                              <div>
                                <p className="text-xs font-black text-slate-800 m-0">Assign Staff Gmail</p>
                                <p className="text-[11px] text-slate-500 m-0 leading-relaxed">Enter their personal/work <strong>Gmail address</strong> in the slot card above. This is their unique key to login.</p>
                              </div>
                           </div>
                           <div className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-md shadow-blue-500/20">2</div>
                              <div>
                                <p className="text-xs font-black text-slate-800 m-0">Share Dashboard Link</p>
                                <p className="text-[11px] text-slate-500 m-0 leading-relaxed">Provide them with their specific <strong>Dashboard Link</strong> (copied from their card). They should visit this link to access their portal.</p>
                              </div>
                           </div>
                           <div className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-md shadow-blue-500/20">3</div>
                              <div>
                                <p className="text-xs font-black text-slate-800 m-0">Google Login & Permissions</p>
                                <p className="text-[11px] text-slate-500 m-0 leading-relaxed">When they <strong>Login with Google</strong> using that exact email, they will automatically see their profile. Their level of access (Editing, Leads, etc.) is controlled by YOUR settings in their card.</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-sm font-black text-slate-800 m-0">Refer & Earn Program Visibility</h4>
                              <p className="text-xs text-slate-500 m-0 mt-1">By default, the referral button is visible to all users. Toggle this off to hide it.</p>
                           </div>
                           <button 
                             onClick={() => setFormData({...formData, hideReferral: !formData.hideReferral})}
                             className={`w-12 h-6 rounded-full relative transition-all ${!formData.hideReferral ? 'bg-blue-600' : 'bg-slate-300'}`}
                           >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!formData.hideReferral ? 'left-7' : 'left-1'}`} />
                           </button>
                        </div>
                     </div>

                     <div className="mt-4 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div>
                           <h4 className="text-sm font-black text-blue-800 m-0">Bulk Export Leads</h4>
                           <p className="text-xs text-blue-600 m-0 mt-1">Download all your leads as a VCF file to import into your phone contacts.</p>
                        </div>
                        <button 
                          onClick={handleExportVCF}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                        >
                          <UserPlus size={16} /> Export VCF
                        </button>
                     </div>
                  </div>
                )}

                {activeTab === 'commerce' && (
                  <div className="flex flex-col gap-10">
                     {/* Quick Pay Featured Section */}
                     <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                               <Coins size={24} className="text-white" />
                             </div>
                             <div>
                               <h3 className="m-0 text-xl font-black tracking-tight uppercase">Quick Pay Setup</h3>
                               <p className="text-blue-200 text-[10px] font-bold m-0 uppercase tracking-widest opacity-80">Instant Payment via QR & NFC</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                             <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Amount to Collect</label>
                                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1">
                                   <select 
                                      value={formData.quickPayCurrency || 'AED'} 
                                      onChange={e => setFormData({...formData, quickPayCurrency: e.target.value})}
                                      className="bg-transparent text-white font-black px-4 py-3 outline-none border-r border-white/10"
                                   >
                                      <option value="AED" className="bg-slate-900">AED</option>
                                      <option value="USD" className="bg-slate-900">USD</option>
                                      <option value="INR" className="bg-slate-900">INR</option>
                                   </select>
                                   <input 
                                      type="number" 
                                      value={formData.quickPayAmount || ''} 
                                      onChange={e => setFormData({...formData, quickPayAmount: parseFloat(e.target.value) || 0})}
                                      placeholder="0.00"
                                      className="flex-1 bg-transparent px-4 py-3 text-white font-black placeholder:text-blue-200/30 outline-none text-xl" 
                                   />
                                </div>
                             </div>
                             
                             <div className="flex flex-col gap-3">
                                <button 
                                  onClick={handleSave}
                                  className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5 uppercase text-xs tracking-widest"
                                >
                                  Update Payment
                                </button>
                                <p className="text-[9px] text-blue-300/40 font-bold m-0 text-center leading-relaxed italic uppercase">
                                  Amount auto-updates on your QR and NFC Card instantly
                                </p>
                             </div>
                          </div>
                        </div>
                     </div>

                      {/* Bank Details Section */}
                      <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                              <Building size={24} className="text-slate-600" />
                            </div>
                            <div>
                              <h3 className="m-0 text-xl font-black tracking-tight uppercase text-slate-900">Bank Account Details</h3>
                              <p className="text-slate-500 text-[10px] font-bold m-0 uppercase tracking-widest opacity-80">Manual Transfer Information (Max 3)</p>
                            </div>
                          </div>
                          {(formData.bankAccounts || []).length < 3 && (
                            <button 
                              onClick={() => {
                                const accs = formData.bankAccounts || [];
                                setFormData({
                                  ...formData, 
                                  bankAccounts: [...accs, { bankName: '', accountName: '', accountNumber: '', iban: '', swiftCode: '', ifscCode: '' }]
                                });
                              }}
                              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                              + Add Another Bank
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-8">
                           {(formData.bankAccounts || []).length === 0 && (
                             <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
                               <p className="text-slate-400 text-xs font-bold uppercase">No bank accounts added</p>
                               <button 
                                 onClick={() => setFormData({...formData, bankAccounts: [{ bankName: '', accountName: '', accountNumber: '', iban: '', swiftCode: '', ifscCode: '' }]})}
                                 className="mt-2 text-blue-600 font-bold text-xs uppercase"
                               >
                                 Add your first bank account
                               </button>
                             </div>
                           )}

                           {(formData.bankAccounts || []).map((acc: any, idx: number) => (
                             <div key={idx} className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100">
                               <div className="flex justify-between items-center mb-4">
                                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Bank Account #{idx + 1}</span>
                                 <button 
                                   onClick={() => {
                                     const next = formData.bankAccounts.filter((_: any, i: number) => i !== idx);
                                     setFormData({...formData, bankAccounts: next});
                                   }}
                                   className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                 >
                                   <X size={16} />
                                 </button>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
                                   <input 
                                     type="text" 
                                     value={acc.bankName || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], bankName: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. Emirates NBD" 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Holder Name</label>
                                   <input 
                                     type="text" 
                                     value={acc.accountName || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], accountName: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. John Doe" 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
                                   <input 
                                     type="text" 
                                     value={acc.accountNumber || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], accountNumber: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. 123456789" 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IBAN</label>
                                   <input 
                                     type="text" 
                                     value={acc.iban || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], iban: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. AE123456..." 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Swift Code / BIC</label>
                                   <input 
                                     type="text" 
                                     value={acc.swiftCode || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], swiftCode: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. EBIZAEAXXX" 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code / Routing</label>
                                   <input 
                                     type="text" 
                                     value={acc.ifscCode || ''} 
                                     onChange={e => {
                                       const next = [...formData.bankAccounts];
                                       next[idx] = { ...next[idx], ifscCode: e.target.value };
                                       setFormData({...formData, bankAccounts: next});
                                     }} 
                                     className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" 
                                     placeholder="e.g. HDFC0001234" 
                                   />
                                 </div>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Services Section */}
                     <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="m-0 text-lg font-black text-slate-900">Services & Products</h3>
                            <p className="text-xs text-slate-500 m-0 mt-1 font-medium">List your offerings with price tags</p>
                          </div>
                          <button onClick={() => setFormData({...formData, services: [...(formData.services || []), { name: '', desc: '', price: '', priceType: 'Fixed' }]})} className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition uppercase tracking-widest shadow-lg shadow-blue-600/20">
                            + Add Item
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {(formData.services || []).map((service: any, index: number) => (
                            <div key={`srv-${index}`} className="group bg-white border border-slate-200 p-6 rounded-[2rem] relative transition-all hover:border-blue-200 hover:shadow-xl">
                               <button 
                                 onClick={() => { const s = [...formData.services]; s.splice(index, 1); setFormData({...formData, services: s}); }}
                                 className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                               >
                                 <X size={14} />
                               </button>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                                   <input type="text" value={service.name} onChange={e => { const s = [...formData.services]; s[index].name = e.target.value; setFormData({...formData, services: s}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Design Strategy" />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</label>
                                   <div className="flex gap-2">
                                     <input type="text" value={service.price} onChange={e => { const s = [...formData.services]; s[index].price = e.target.value; setFormData({...formData, services: s}); }} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500" placeholder="AED 500" />
                                     <select value={service.priceType} onChange={e => { const s = [...formData.services]; s[index].priceType = e.target.value; setFormData({...formData, services: s}); }} className="w-24 p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs uppercase">
                                       <option>Fixed</option>
                                       <option>Hourly</option>
                                       <option>From</option>
                                     </select>
                                   </div>
                                 </div>
                                 <div className="md:col-span-2 flex flex-col gap-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                   <textarea value={service.desc} onChange={e => { const s = [...formData.services]; s[index].desc = e.target.value; setFormData({...formData, services: s}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Briefly explain what's included..." />
                                 </div>
                               </div>
                            </div>
                          ))}
                          {(!formData.services || formData.services.length === 0) && (
                            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
                               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No services listed yet</p>
                            </div>
                          )}
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
                              <div className="flex items-center gap-6 flex-wrap">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                                  <input type="checkbox" checked={currentHours.closed} onChange={e => {
                                    const h = { ...formData.hours };
                                    h[day] = { ...currentHours, closed: e.target.checked };
                                    setFormData({...formData, hours: h});
                                  }} className="accent-blue-600" />
                                  Closed
                                </label>
                                {!currentHours.closed && (
                                  <div className="flex flex-col gap-2">
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
                                      <button onClick={() => {
                                        const h = { ...formData.hours };
                                        h[day] = { ...currentHours, split: !currentHours.split, open2: currentHours.open2 || '16:00', close2: currentHours.close2 || '21:00' };
                                        setFormData({...formData, hours: h});
                                      }} className="ml-2 text-[10px] px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold hover:bg-slate-200">
                                        {currentHours.split ? '- Remove Shift' : '+ Add Shift'}
                                      </button>
                                    </div>
                                    {currentHours.split && (
                                      <div className="flex items-center gap-2">
                                        <input type="time" value={currentHours.open2} onChange={e => {
                                          const h = { ...formData.hours };
                                          h[day] = { ...currentHours, open2: e.target.value };
                                          setFormData({...formData, hours: h});
                                        }} className="p-1.5 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                        <span className="text-[10px] font-bold text-slate-400">TO</span>
                                        <input type="time" value={currentHours.close2} onChange={e => {
                                          const h = { ...formData.hours };
                                          h[day] = { ...currentHours, close2: e.target.value };
                                          setFormData({...formData, hours: h});
                                        }} className="p-1.5 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                      </div>
                                    )}
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



                {activeTab === 'storefront' && (
                  <div className="flex flex-col gap-8 relative">
                    {!isPremiumOrUp && (
                      <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center pt-24">
                        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Feature Locked</h3>
                          <p className="text-slate-500 text-sm mb-6">Upgrade to Premium or Enterprise to build your own dedicated storefront with up to 20 showcase products.</p>
                          <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="m-0 text-lg font-black text-slate-900">Storefront Details</h3>
                        <p className="text-xs text-slate-500 m-0 font-medium border-b border-slate-100 pb-4">Customize your standalone shop appearance.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company/Store Name</label>
                          <input type="text" value={formData.storeCompanyName || ''} onChange={e => setFormData({...formData, storeCompanyName: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Acme SuperStore" />
                        </div>

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Marquee (Running Text)</label>
                          <input type="text" value={formData.storeMarquee || ''} onChange={e => setFormData({...formData, storeMarquee: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Free shipping on all orders!" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Logo</label>
                          <ImageUploadCrop 
                            value={formData.storeCompanyLogo || ''} 
                            onChange={(url) => setFormData({...formData, storeCompanyLogo: url})}
                            id={`storelogo-${formData.id || user.uid}`}
                            circular={false}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Banner Offer</label>
                          <ImageUploadCrop 
                            value={formData.storeBannerUrl || ''} 
                            onChange={(url) => setFormData({...formData, storeBannerUrl: url})}
                            id={`storebanner-${formData.id || user.uid}`}
                            folder="banners"
                            aspectRatio={3}
                            circular={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 mt-8">
                       <div className="flex items-center justify-between">
                         <div>
                           <h3 className="m-0 text-lg font-black text-slate-900">Showcase Products</h3>
                           <p className="text-xs text-slate-500 m-0 mt-1 font-medium">Add up to 20 products with direct Stripe payment links.</p>
                         </div>
                         <button 
                           onClick={() => {
                             if ((formData.products || []).length >= 20) {
                               alert('Maximum of 20 products allowed in the storefront.');
                               return;
                             }
                             setFormData({...formData, products: [...(formData.products || []), { name: '', description: '', price: '', image: '', link: '' }]});
                           }} 
                           className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition uppercase tracking-widest shadow-lg shadow-blue-600/20"
                         >
                           + Add Product
                         </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {(formData.products || []).map((product: any, index: number) => (
                           <div key={`prod-${index}`} className="group bg-white border border-slate-200 p-6 rounded-3xl relative transition-all hover:border-blue-200 hover:shadow-xl">
                              <button 
                                onClick={() => { const p = [...formData.products]; p.splice(index, 1); setFormData({...formData, products: p}); }}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              >
                                <X size={14} />
                              </button>
                              <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                  <div className="w-24 shrink-0 flex flex-col gap-2">
                                    {index < 4 ? (
                                      <>
                                        <ImageUploadCrop 
                                          value={product.image || ''} 
                                          onChange={(url) => {
                                            const p = [...formData.products];
                                            p[index].image = url;
                                            setFormData({...formData, products: p});
                                          }}
                                          id={`product-${index}-${formData.id || user.uid}`}
                                          circular={false}
                                          folder="products"
                                        />
                                        <div className="text-[9px] font-bold text-center text-slate-400 capitalize">Direct Upload</div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col gap-2 h-full">
                                        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden">
                                          {product.image ? (
                                            <img src={product.image} className="w-full h-full object-cover" alt="Product" />
                                          ) : (
                                            <span className="text-xl opacity-20">🔗</span>
                                          )}
                                        </div>
                                        <input 
                                          type="url" 
                                          value={product.image || ''} 
                                          onChange={e => {
                                            const p = [...formData.products];
                                            p[index].image = e.target.value;
                                            setFormData({...formData, products: p});
                                          }}
                                          placeholder="Image URL"
                                          className="w-full p-2 text-[10px] border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-3 flex-1">
                                    <input type="text" value={product.name} onChange={e => { const p = [...formData.products]; p[index].name = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product Name" />
                                    <input type="text" value={product.price} onChange={e => { const p = [...formData.products]; p[index].price = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. AED 199" />
                                  </div>
                                </div>
                                <input type="text" value={product.link} onChange={e => { const p = [...formData.products]; p[index].link = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="Stripe Payment Link (https://buy.stripe.com/...)" />
                                <textarea value={product.description} onChange={e => { const p = [...formData.products]; p[index].description = e.target.value; setFormData({...formData, products: p}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none" placeholder="Product description..." />
                              </div>
                           </div>
                         ))}
                         {(!formData.products || formData.products.length === 0) && (
                           <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No products in storefront</p>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <h3 className="m-0 text-base font-bold text-slate-800 mb-2">Profile Layout & Theme</h3>
                      <p className="m-0 text-sm text-slate-500 mb-6 underline decoration-blue-500/30">Select a layout and style for your digital profile.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div onClick={() => setFormData({...formData, template: 'classic'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'classic' || !formData.template ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="bg-slate-200 aspect-[4/3] rounded-xl mb-4 shadow-inner overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80" alt="Classic Modern" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                          </div>
                          <div className="font-bold text-slate-900">Classic Modern</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'executive'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'executive' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-slate-900 hover:bg-slate-800'}`}>
                          <div className="absolute -top-3 -right-2 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">PREMIUM</div>
                          <div className="bg-slate-800 aspect-[4/3] rounded-xl mb-4 shadow-inner overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80" alt="Executive Dark" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                          </div>
                          <div className={`font-bold ${formData.template === 'executive' ? 'text-blue-700' : 'text-white'}`}>Executive Dark</div>
                        </div>
                        <div onClick={() => setFormData({...formData, template: 'minimal'})} className={`relative border-2 rounded-2xl p-4 cursor-pointer text-center transition-all ${formData.template === 'minimal' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="absolute -top-3 -right-2 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">PREMIUM</div>
                          <div className="border border-slate-100 aspect-[4/3] rounded-xl mb-4 shadow-inner overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1451187530220-4c23ba3e0c60?w=400&q=80" alt="Minimal Clean" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                          </div>
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
                    {/* Testimonials */}
                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-lg font-black text-slate-800">Testimonials</h3>
                        <button onClick={() => setFormData({...formData, testimonials: [...(formData.testimonials || []), { name: '', role: '', quote: '', rating: 5 }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition uppercase tracking-widest text-[10px]">
                          + Add New
                        </button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.testimonials || []).map((test: any, index: number) => (
                           <div key={`ts-${index}`} className="border border-slate-100 p-6 rounded-2xl bg-slate-50 relative group">
                             <button onClick={() => { const t = [...formData.testimonials]; t.splice(index, 1); setFormData({...formData, testimonials: t}); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                               <X size={12} />
                             </button>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                               <input type="text" placeholder="Name" value={test.name || ''} onChange={e => { const t = [...formData.testimonials]; t[index].name = e.target.value; setFormData({...formData, testimonials: t}); }} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                               <select value={test.rating || 5} onChange={e => { const t = [...formData.testimonials]; t[index].rating = Number(e.target.value); setFormData({...formData, testimonials: t}); }} className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs">
                                 <option value={5}>5 Stars ★★★★★</option>
                                 <option value={4}>4 Stars ★★★★</option>
                                 <option value={3}>3 Stars ★★★</option>
                               </select>
                             </div>
                             <textarea placeholder="Client Review..." value={test.quote || ''} onChange={e => { const t = [...formData.testimonials]; t[index].quote = e.target.value; setFormData({...formData, testimonials: t}); }} rows={2} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[60px]" />
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h3 className="m-0 text-lg font-black text-slate-800">FAQs</h3>
                        <button onClick={() => setFormData({...formData, faqs: [...(formData.faqs || []), { question: '', answer: '' }]})} className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition uppercase tracking-widest text-[10px]">
                          + Add FAQ
                        </button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {(formData.faqs || []).map((faq: any, index: number) => (
                           <div key={`faq-${index}`} className="border border-slate-100 p-6 rounded-2xl bg-slate-50 relative group">
                             <button onClick={() => { const f = [...formData.faqs]; f.splice(index, 1); setFormData({...formData, faqs: f}); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                               <X size={12} />
                             </button>
                             <input type="text" placeholder="Question" value={faq.question || ''} onChange={e => { const f = [...formData.faqs]; f[index].question = e.target.value; setFormData({...formData, faqs: f}); }} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-2 font-bold" />
                             <textarea placeholder="Answer" value={faq.answer || ''} onChange={e => { const f = [...formData.faqs]; f[index].answer = e.target.value; setFormData({...formData, faqs: f}); }} rows={2} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Gallery & Media */}
                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem]">
                      <h3 className="m-0 text-lg font-black text-slate-800 mb-6">Gallery & Videos</h3>
                      <div className="flex flex-col gap-8">
                         <div>
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Images (URLs)</label>
                              <button onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">+ Add Image URL</button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                               {(formData.gallery || []).map((url: string, i: number) => (
                                 <div key={i} className="flex gap-2">
                                   <input type="text" value={url} onChange={e => { const g = [...formData.gallery]; g[i] = e.target.value; setFormData({...formData, gallery: g}); }} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs" placeholder="https://..." />
                                   <button onClick={() => { const g = [...formData.gallery]; g.splice(i, 1); setFormData({...formData, gallery: g}); }} className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0"><X size={16}/></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between items-center mb-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube Embeds</label>
                              <button onClick={() => setFormData({...formData, videos: [...(formData.videos || []), '']})} className="text-red-600 text-[10px] font-black uppercase tracking-widest hover:underline">+ Add Video URL</button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                               {(formData.videos || []).map((url: string, i: number) => (
                                 <div key={i} className="flex gap-2">
                                   <input type="text" value={url} onChange={e => { const v = [...formData.videos]; v[i] = e.target.value; setFormData({...formData, videos: v}); }} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs" placeholder="https://youtube.com/embed/..." />
                                   <button onClick={() => { const v = [...formData.videos]; v.splice(i, 1); setFormData({...formData, videos: v}); }} className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0"><X size={16}/></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'domain' && (
                  <div className="flex flex-col gap-8 max-w-4xl">
                    <div className="p-6 md:p-8 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                      <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Connect Custom Domain</h3>
                      <p className="text-blue-100 text-sm font-medium mb-6">Boost your brand by using a professional domain like <strong>www.yourcompany.com</strong> instead of our default link.</p>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <label className="block text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2">Primary Domain</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input 
                             type="text" 
                             value={formData.customDomain || ''} 
                             onChange={(e) => setFormData({...formData, customDomain: e.target.value.toLowerCase().trim()})}
                             placeholder="e.g. digitalcard.com"
                             className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/40 font-bold"
                          />
                          <button 
                            onClick={async () => {
                              if (!formData.customDomain) {
                                showToast("Please enter a domain name first");
                                return;
                              }
                              setDomainStatus('Checking');
                              try {
                                // Simple validation: check if domain has a dot and no spaces
                                const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                                if (!domainRegex.test(formData.customDomain)) {
                                  throw new Error("Invalid domain format (e.g. example.com)");
                                }

                                // Mimic a real check
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                
                                setDomainStatus('Connected');
                                showToast("Domain format verified! Note: DNS propagation can take 24-48 hours.");
                              } catch (err: any) {
                                setDomainStatus('Not Configured');
                                showToast(err.message || "Could not verify domain connection");
                              }
                            }}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all"
                          >
                            Verify Connection
                          </button>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${domainStatus === 'Connected' ? 'bg-emerald-400 animate-pulse' : domainStatus === 'Checking' ? 'bg-amber-400 animate-spin' : 'bg-slate-400'}`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Status: {domainStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
                      <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Settings size={20} className="text-slate-400" /> DNS Configuration
                      </h4>
                      <div className="space-y-6">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-blue-600">Step 1: Point DNS Record</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Required</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-3 font-medium text-pretty">Log in to your domain provider (GoDaddy, Namecheap, etc.) and add a **CNAME** or **A** record to link 100%:</p>
                          <div className="flex flex-col gap-3">
                             <div className="bg-white border border-slate-200 p-4 rounded-xl">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option 1: CNAME Record (Recommended)</span>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-slate-50 p-2 rounded-lg text-center">
                                   <div className="text-[8px] font-bold text-slate-400 uppercase">Host</div>
                                   <div className="text-xs font-black">@ / www</div>
                                 </div>
                                 <div className="bg-slate-50 p-2 rounded-lg text-center overflow-hidden">
                                   <div className="text-[8px] font-bold text-slate-400 uppercase">Points To</div>
                                   <div className="text-xs font-black break-all">vibecard.ae</div>
                                 </div>
                               </div>
                             </div>

                             <div className="bg-white border border-slate-200 p-4 rounded-xl">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option 2: A Record (Static IP)</span>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-slate-50 p-2 rounded-lg text-center">
                                   <div className="text-[8px] font-bold text-slate-400 uppercase">Host</div>
                                   <div className="text-xs font-black">@</div>
                                 </div>
                                 <div className="bg-slate-50 p-2 rounded-lg text-center overflow-hidden">
                                   <div className="text-[8px] font-bold text-slate-400 uppercase">Value / IP</div>
                                   <div className="text-xs font-black break-all">76.76.21.21</div>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="mt-2 p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="text-xs font-black text-emerald-900 uppercase tracking-tight">🔒 Security & Privacy</span>
                               </div>
                               
                               <div className="space-y-3">
                                 <div>
                                   <div className="text-[9px] font-black text-emerald-700/50 uppercase mb-0.5">English</div>
                                   <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                                     When someone opens your Custom Domain, only your **Business Profile** will load. Referral links and Shop pages will only work on the main website.
                                   </p>
                                 </div>

                                 <div className="pt-2 border-t border-emerald-100">
                                   <div className="text-[9px] font-black text-emerald-700/50 uppercase mb-0.5">Hindi / हिंदी</div>
                                   <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                                     जब कोई आपका कस्टम डोमेन खोलेगा, तो केवल आपका **बिजनेस प्रोफाइल** लोड होगा। रेफरल लिंक और शॉप पेज केवल मुख्य वेबसाइट पर ही काम करेंगे।
                                   </p>
                                 </div>

                                 <div className="pt-2 border-t border-emerald-100 text-right" dir="rtl">
                                   <div className="text-[9px] font-black text-emerald-700/50 uppercase mb-0.5">Arabic / العربية</div>
                                   <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                                     عندما يفتح شخص ما نطاقك المخصص، سيتم تحميل **ملف تعريف عملك** فقط. ستعمل روابط الإحالة وصفحات المتجر فقط على الموقع الرئيسي.
                                   </p>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-blue-600">Step 2: Backup CNAME</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-3 font-medium text-pretty">Agar aap domain ke saath 'www' lagana chahte hain:</p>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
                               <div className="text-[8px] font-bold text-slate-400 uppercase">Type</div>
                               <div className="text-xs font-black">CNAME</div>
                             </div>
                             <div className="bg-white border border-slate-200 p-3 rounded-xl text-center">
                               <div className="text-[8px] font-bold text-slate-400 uppercase">Host</div>
                               <div className="text-xs font-black">www</div>
                             </div>
                             <div className="bg-white border border-slate-200 p-3 rounded-xl text-center overflow-hidden">
                               <div className="text-[8px] font-bold text-slate-400 uppercase">Value / Point To</div>
                               <div className="text-xs font-black break-all leading-tight">vibecard.ae</div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                               {apt.phone && (
                                 <a 
                                   href={`https://wa.me/${apt.phone.replace(/\D/g, '')}`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm shadow-emerald-600/5 flex items-center justify-center group/wa"
                                   title="Chat on WhatsApp"
                                 >
                                   <MessageCircle size={18} className="group-hover/wa:scale-110 transition-transform" />
                                 </a>
                               )}
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

          {sidebarTab === 'hours' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Business Hours & Timetable</h2>
                  <p className="text-slate-500 text-sm">Set your weekly operating schedule and shifts.</p>
                </div>
                <button 
                  onClick={saveBusinessHours}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
                >
                  Save Schedule
                </button>
              </div>

              <div className="grid gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center gap-6 shadow-sm">
                    <div className="w-32">
                      <span className="text-lg font-bold text-slate-900 capitalize">{day}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!businessHours[day]?.closed}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...businessHours[day], closed: !e.target.checked }
                          })}
                          className="w-5 h-5 rounded border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{businessHours[day]?.closed ? 'Closed' : 'Open'}</span>
                      </label>
                    </div>

                    {!businessHours[day]?.closed && (
                      <div className="flex flex-col gap-2 ml-auto sm:ml-0">
                        <div className="flex items-center gap-3 w-full">
                          <input 
                            type="time" 
                            value={businessHours[day]?.open || '09:00'}
                            onChange={(e) => setBusinessHours({
                              ...businessHours,
                              [day]: { ...businessHours[day], open: e.target.value }
                            })}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition-all"
                          />
                          <span className="text-slate-400 font-bold">to</span>
                          <input 
                            type="time" 
                            value={businessHours[day]?.close || '18:00'}
                            onChange={(e) => setBusinessHours({
                              ...businessHours,
                              [day]: { ...businessHours[day], close: e.target.value }
                            })}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition-all"
                          />
                          {businessHours[day]?.split ? (
                            <div className="w-[30px]"></div>
                          ) : (
                            <button
                              onClick={() => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], split: true, open2: '16:00', close2: '22:00' }
                              })}
                              className="text-xs text-blue-600 font-bold hover:underline py-1 px-2 rounded bg-blue-50 ml-2"
                            >
                              + Shift 2
                            </button>
                          )}
                        </div>
                        {businessHours[day]?.split && (
                          <div className="flex items-center gap-3">
                            <input 
                              type="time" 
                              value={businessHours[day]?.open2 || '16:00'}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], open2: e.target.value }
                              })}
                              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition-all"
                            />
                            <span className="text-slate-400 font-bold">to</span>
                            <input 
                              type="time" 
                              value={businessHours[day]?.close2 || '22:00'}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], close2: e.target.value }
                              })}
                              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 transition-all"
                            />
                            <button
                              onClick={() => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], split: false }
                              })}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                              title="Remove shift"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === 'stock' && (
            <div className="p-4 md:p-8 relative">
               {!isEnterpriseOwner && !isSubUser && (
                 <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center pt-24">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise Feature Locked</h3>
                      <p className="text-slate-500 text-sm mb-6">Upgrade to an Enterprise plan to unlock advanced Stock & Inventory management.</p>
                      <button onClick={() => setSidebarTab('plan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">View Plans</button>
                    </div>
                  </div>
               )}
               <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 m-0">Stock & Inventory</h2>
                   <p className="text-slate-500 m-0 mt-1 text-sm">Real-time product availability and pricing management</p>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setSidebarTab('chatbot')} className="px-5 py-2.5 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2">
                       <Settings size={14} /> AI Sync Settings
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                       <div className="flex items-center justify-between mb-8">
                          <h4 className="text-lg font-black text-slate-900 m-0">Inventory Items</h4>
                          <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">SYNCED WITH AI</span>
                       </div>

                       <div className="space-y-4">
                          {(() => {
                            const items = formData.stockManualData ? formData.stockManualData.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => {
                               const parts = line.split('-').map(s => s.trim());
                               return {
                                 name: parts[0] || 'Unknown Item',
                                 sku: `ITEM-${i+1}`,
                                 stock: parts[1] || 'Unknown',
                                 price: parts[2] || 'N/A',
                                 status: (parts[1] || '').toLowerCase().includes('out') ? 'Out of Stock' : 'In Stock'
                               };
                            }) : [
                              { name: 'iPhone 15 Pro Max', sku: 'IPH15PM-256', stock: '12 Units', price: 'AED 4,500', status: 'In Stock' },
                              { name: 'MacBook Air M3', sku: 'MBA-M3-13', stock: '5 Units', price: 'AED 5,200', status: 'Low Stock' },
                              { name: 'AirPods Pro 2', sku: 'APP2-GEN', stock: '25 Units', price: 'AED 899', status: 'In Stock' },
                              { name: 'Apple Watch Ultra 2', sku: 'AWU2-ORG', stock: '0 Units', price: 'AED 3,200', status: 'Out of Stock' }
                            ];

                            return items.map((item: any) => (
                              <div key={item.sku} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${item.status === 'Out of Stock' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {item.name.charAt(0)}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                       <h5 className="font-black text-slate-800 text-sm truncate m-0">{item.name}</h5>
                                       <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded uppercase tracking-tighter">{item.sku}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.price}</div>
                                 </div>
                                 <div className="text-right">
                                    <div className={`text-xs font-black mb-0.5 ${(item.stock+'').includes('0') || (item.stock+'').includes('Out') ? 'text-red-600' : 'text-slate-900'}`}>{item.stock}</div>
                                    <div className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'Out of Stock' ? 'text-red-400' : item.status === 'Low Stock' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                       {item.status}
                                    </div>
                                 </div>
                              </div>
                            ));
                          })()}
                       </div>
                       
                       <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-black hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all">
                          + Add New SKU to Inventory
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
                       <div className="relative z-10">
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">CRM Status</div>
                          <h4 className="text-lg font-black mb-2">Connected to {formData.crmProvider || 'Manual Source'}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed m-0">Your AI Agent is currently using this data to answer price and stock availability questions 24/7.</p>
                          <div className="mt-6 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync Active</span>
                          </div>
                       </div>
                       <Briefcase size={120} className="absolute -bottom-8 -right-8 text-white opacity-[0.03]" />
                    </div>

                     <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wider">Quick Stats</h4>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500">Out of Stock</span>
                              <span className="text-xs font-black text-red-500">12</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500">Inventory Value</span>
                              <span className="text-xs font-black text-slate-900">AED 240,500</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {sidebarTab === 'chatbot' && (
             <div className="p-4 md:p-8 relative">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900 m-0">AI Chatbot Agent</h2>
                  <p className="text-slate-500 m-0 mt-1 text-sm">Configure your automated 24/7 client assistant</p>
                </div>

                {isFreePlan ? (
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
                         
                         {/* Inventory & CRM Sync Section */}
                         <div className="mt-8 pt-8 border-t border-slate-100">
                           <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                 <Briefcase size={20} />
                               </div>
                               <div>
                                 <h4 className="text-base font-black text-slate-900 m-0">Inventory & Stock Sync</h4>
                                 <p className="text-xs text-slate-500 m-0">Connect your CRM, Spreadsheet or Stock data</p>
                               </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" checked={formData.stockSyncEnabled || false} onChange={e => setFormData({...formData, stockSyncEnabled: e.target.checked})} className="sr-only peer" />
                               <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                           </div>

                           {formData.stockSyncEnabled && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sync Source</label>
                                   <select 
                                     value={formData.stockSourceType || 'Manual'} 
                                     onChange={e => setFormData({...formData, stockSourceType: e.target.value})}
                                     className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                   >
                                     <option value="Manual">Manual Entry (JSON/Text)</option>
                                     <option value="GoogleSheet">Google Sheets (Public CSV Link)</option>
                                     <option value="CSV_URL">Direct CSV URL</option>
                                     <option value="CRM">CRM API (Zoho/Tally - Beta)</option>
                                   </select>
                                 </div>
                                 <div className="flex items-center gap-4 pt-6">
                                   <label className="flex items-center gap-2 cursor-pointer">
                                     <input type="checkbox" checked={formData.showStockPrice || false} onChange={e => setFormData({...formData, showStockPrice: e.target.checked})} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                                     <span className="text-sm font-bold text-slate-700">Tell customer the Price?</span>
                                   </label>
                                 </div>
                               </div>

                               {(formData.stockSourceType === 'GoogleSheet' || formData.stockSourceType === 'CSV_URL') && (
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source URL</label>
                                   <input 
                                     type="url" 
                                     placeholder={formData.stockSourceType === 'GoogleSheet' ? "Enter Google Sheet 'Publish to Web' CSV URL" : "Enter public CSV link"}
                                     value={formData.stockSourceUrl || ''} 
                                     onChange={e => setFormData({...formData, stockSourceUrl: e.target.value})} 
                                     className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                                   />
                                   <p className="text-[10px] text-slate-400">Ensure the CSV has columns like: Product, Stock, Price, Status.</p>
                                 </div>
                               )}

                               {formData.stockSourceType === 'Manual' && (
                                 <div className="flex flex-col gap-1.5">
                                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Data (One per line or JSON)</label>
                                   <textarea 
                                     placeholder="Example:&#10;iPhone 15 Pro - 5 in stock - AED 4500&#10;Galaxy S24 - Out of stock&#10;Airpods - 12 in stock - AED 899"
                                     value={formData.stockManualData || ''} 
                                     onChange={e => setFormData({...formData, stockManualData: e.target.value})} 
                                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[150px] outline-none text-sm font-medium"
                                   />
                                 </div>
                               )}

                               {formData.stockSourceType === 'CRM' && (
                                 <div className="space-y-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                   <div className="flex flex-col gap-1.5">
                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select CRM Provider</label>
                                     <div className="grid grid-cols-3 gap-2">
                                       {['Zoho', 'Vyapar', 'Tally'].map(crm => (
                                         <button 
                                           key={crm}
                                           type="button"
                                           onClick={() => setFormData({...formData, crmProvider: crm})}
                                           className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.crmProvider === crm ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                                         >
                                           {crm}
                                         </button>
                                       ))}
                                     </div>
                                   </div>

                                   {formData.crmProvider === 'Zoho' && (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zoho API Key/Token</label>
                                         <input type="password" value={formData.zohoToken || ''} onChange={e => setFormData({...formData, zohoToken: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Authtoken..." />
                                       </div>
                                       <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization ID</label>
                                         <input type="text" value={formData.zohoOrgId || ''} onChange={e => setFormData({...formData, zohoOrgId: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Org ID..." />
                                       </div>
                                     </div>
                                   )}

                                   {(formData.crmProvider === 'Vyapar' || formData.crmProvider === 'Tally') && (
                                     <div className="space-y-4">
                                       <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{formData.crmProvider} Gateway URL / API Endpoint</label>
                                         <input type="url" value={formData.crmEndpoint || ''} onChange={e => setFormData({...formData, crmEndpoint: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="https://your-local-ip:port/api..." />
                                         <p className="text-[10px] text-slate-400">Note: Tally/Vyapar often need a public IP or tunnel (like Ngrok) to connect from the cloud.</p>
                                       </div>
                                       <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secret API Key</label>
                                         <input type="password" value={formData.crmSecret || ''} onChange={e => setFormData({...formData, crmSecret: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Token..." />
                                       </div>
                                     </div>
                                   )}
                                   
                                   <div className="p-3 bg-white/50 rounded-xl border border-blue-100">
                                     <p className="text-[10px] text-blue-700 font-medium m-0">💡 AI will automatically map your CRM data to items, quantity, and prices to answer customer questions.</p>
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
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
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setPreviewMode('chat')}
                              className={`flex items-center gap-2 transition-all ${previewMode === 'chat' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${previewMode === 'chat' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                              <span className="text-white font-black text-sm tracking-tight">AI PREVIEW</span>
                            </button>
                            <button 
                              onClick={() => setPreviewMode('card')}
                              className={`flex items-center gap-2 transition-all ${previewMode === 'card' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${previewMode === 'card' ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`} />
                              <span className="text-white font-black text-sm tracking-tight">LIVE CARD</span>
                            </button>
                          </div>
                          {previewMode === 'chat' ? (
                            <button onClick={() => { localStorage.removeItem(`chat_history_${profile.id}`); window.location.reload(); }} className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-md bg-slate-800/50">Reset Chat</button>
                          ) : (
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Preview</span>
                            </div>
                          )}
                       </div>
                       <div className="flex-1 overflow-hidden relative">
                         {previewMode === 'chat' ? (
                           <DashboardChatTester profile={profile} />
                         ) : (
                           <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4">
                              <div className="w-full h-full max-w-[375px] max-h-[812px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative">
                                 {/* Phone notch */}
                                 <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                                   <div className="w-24 h-5 bg-slate-800 rounded-b-xl" />
                                 </div>
                                 <iframe 
                                   src={`${window.location.origin}/profile/${formData.slug || profile.slug}`} 
                                   className="w-full h-full border-none"
                                   title="Live Card Preview"
                                   key={formData.slug} // Force reload when slug changes
                                 />
                              </div>
                           </div>
                         )}
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
                       <h3 className="text-5xl font-black m-0">{(user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com') ? 'Enterprise Lifetime' : (profile.plan || 'Free')}</h3>
                       <Sparkles size={32} className="text-amber-400" />
                    </div>
                    <p className="text-slate-400 m-0 text-sm max-w-sm leading-relaxed">You are enjoying all features associated with the {(user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com') ? 'Enterprise Lifetime' : (profile.plan || 'Free')} plan. Upgrade anytime for advanced enterprise tools.</p>
                  </div>
                  <div className="relative z-10 text-center md:text-right bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl min-w-[200px]">
                     <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">MEMBERSHIP COST</div>
                     <div className="text-4xl font-black tabular-nums">
                        {(() => {
                           if (user?.email?.toLowerCase() === 'azmatfaiz9756@gmail.com') return 'FREE ($0)';
                           const currentPlanData = (siteSettings?.countryPlans?.[selectedCountry] || siteSettings?.countryPlans?.['Global'] || []).find((p: any) => p.name === (profile.plan || 'Basic'));
                           return currentPlanData ? currentPlanData.price : 'Free';
                        })()}
                        {(profile.plan !== 'Basic' && profile.plan !== 'Free' && user?.email?.toLowerCase() !== 'azmatfaiz9756@gmail.com') && <span className="text-sm font-bold text-slate-500 ml-1">/yr</span>}
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
                         {plan.price !== 'Free' && <span className="text-xs font-bold text-slate-500 tracking-tight">/yr</span>}
                       </div>
                       
                       {plan.price !== 'Free' && (
                         <div className="mb-6 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-700 uppercase tracking-widest text-center shadow-sm">
                           Yearly Renewal 50% Less
                         </div>
                       )}
                       
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
                             const isTrialAvailable = siteSettings?.trialEnabled && 
                                                     siteSettings?.trialPlans?.includes(plan.name) && 
                                                     !profile?.hasUsedTrial;

                             if(plan.price === 'Free') {
                               setFormData({...formData, plan: plan.name}); 
                               setTimeout(handleSave, 100); 
                             } else if (isTrialAvailable) {
                               if (window.confirm(`Activate ${siteSettings.trialMonths || 1} month free trial for ${plan.name}?`)) {
                                 const trialEndDate = new Date();
                                 trialEndDate.setMonth(trialEndDate.getMonth() + (siteSettings.trialMonths || 1));
                                 
                                 const updatedProfile = {
                                   ...formData,
                                   plan: plan.name,
                                   hasUsedTrial: true,
                                   trialActive: true,
                                   trialEndsAt: trialEndDate.toISOString(),
                                   updatedAt: new Date().toISOString()
                                 };
                                 
                                 setFormData(updatedProfile);
                                 import('firebase/firestore').then(({ doc, setDoc }) => {
                                   setDoc(doc(db, 'profiles', editingSubProfileId || user.uid), updatedProfile, { merge: true })
                                     .then(() => {
                                       setProfile(updatedProfile);
                                       alert(`${plan.name} Trial Activated!`);
                                     })
                                     .catch(err => {
                                       console.error("Trial activation failed:", err);
                                       alert("Trial activation failed. Please try again or contact support.");
                                     });
                                 });
                               }
                             } else {
                               setSelectedPlanForPayment(plan);
                               setIsPaymentModalOpen(true);
                             }
                           }} 
                           className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
                         >
                           {siteSettings?.trialEnabled && siteSettings?.trialPlans?.includes(plan.name) && !profile?.hasUsedTrial ? `Start Free Trial` : `Choose ${plan.name}`}
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
               {profile?.plan !== 'Enterprise' && profile?.plan !== 'Enterprise Lifetime' && user?.email?.toLowerCase() !== 'azmatfaiz9756@gmail.com' ? (
                 <div className="max-w-2xl mx-auto py-20 text-center">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Users size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Enterprise Team Management</h2>
                    <p className="text-slate-600 font-medium mb-8">This feature allows you to create and manage up to 10 unique digital profiles for your staff or business branches under ONE master account.</p>
                    <Link to="/plans" className="inline-block bg-blue-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">
                      Upgrade to Enterprise Plan
                    </Link>
                 </div>
               ) : (
                 <>
                   <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                     <div>
                       <h2 className="text-2xl font-black text-slate-900 m-0">Enterprise Management</h2>
                       <p className="text-slate-500 m-0 mt-1 text-sm">Manage 10 digital profiles ({teamProfiles.length}/10 used)</p>
                     </div>
                   </div>

                   {isEditingTeamProfile ? (
                     <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                       <h3 className="text-lg font-black mb-6">Create New Staff Profile</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                            <input 
                              type="text" 
                              value={isEditingTeamProfile.name || ''} 
                              onChange={(e) => setIsEditingTeamProfile({...isEditingTeamProfile, name: e.target.value})}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
                              placeholder="Name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</label>
                            <input 
                              type="text" 
                              value={isEditingTeamProfile.title || ''} 
                              onChange={(e) => setIsEditingTeamProfile({...isEditingTeamProfile, title: e.target.value})}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
                              placeholder="Role"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff Gmail</label>
                            <input 
                              type="email" 
                              value={isEditingTeamProfile.email || ''} 
                              onChange={(e) => setIsEditingTeamProfile({...isEditingTeamProfile, email: e.target.value})}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
                              placeholder="staff@gmail.com"
                            />
                          </div>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
                          <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield size={14} /> Initial Access Permissions
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {[
                                { id: 'allowProfileEdit', label: 'Edit Profile Information' },
                                { id: 'allowLeadsAccess', label: 'View Leads / Contacts' },
                                { id: 'allowAnalytics', label: 'View Analytics' },
                                { id: 'allowAiChat', label: 'Manage AI Chatbot' },
                                { id: 'allowLiveAgent', label: 'Live Agent Chat' },
                                { id: 'allowStock', label: 'Stock / CRM Management' }
                             ].map(feat => (
                                <label key={feat.id} className="flex items-center gap-3 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={isEditingTeamProfile[feat.id] || false}
                                    onChange={e => setIsEditingTeamProfile({...isEditingTeamProfile, [feat.id]: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-xs font-bold text-slate-600">{feat.label}</span>
                                </label>
                             ))}
                          </div>
                        </div>
                       <div className="flex gap-4">
                         <button 
                           onClick={async () => {
                             if(!isEditingTeamProfile.name) return;
                             try {
                               const { doc, setDoc } = await import('firebase/firestore');
                               const pId = `TEAM-${Date.now()}`;
                               const newProfile = {
                                 ...isEditingTeamProfile,
                                 id: pId,
                                 ownerId: user.uid,
                                 isSubProfile: true,
                                 plan: 'Enterprise Sub'
                               };
                               await setDoc(doc(db, 'profiles', pId), newProfile);
                               setEditingSubProfileId(pId);
                               setFormData(newProfile);
                               setSidebarTab('profile');
                               setIsEditingTeamProfile(null);
                             } catch(e) { /* ignore */ }
                           }}
                           className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl"
                         >
                           Prepare & Open Full Editor
                         </button>
                         <button onClick={() => setIsEditingTeamProfile(null)} className="px-6 py-3 bg-slate-100 rounded-xl">Cancel</button>
                       </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 10 }).map((_, idx) => {
                          const profileAtSlot = teamProfiles[idx];
                          return (
                            <div key={idx} className={`bg-white border rounded-3xl p-6 flex flex-col justify-between min-h-[200px] ${profileAtSlot ? 'border-slate-200 shadow-sm' : 'border-dashed border-slate-300 bg-slate-50/50'}`}>
                              {profileAtSlot ? (
                                <>
                                  <div className="mb-4">
                                    <h3 className="font-black text-slate-900 m-0">{profileAtSlot.name}</h3>
                                    <p className="text-xs text-slate-500 m-0 font-bold">{profileAtSlot.title}</p>
                                    <div className="flex justify-between items-center mt-2 font-bold text-[10px]">
                                      <div className="text-blue-600 break-all">{profileAtSlot.slug}</div>
                                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${profileAtSlot.email ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {profileAtSlot.email ? 'Connected' : 'Missing Gmail'}
                                      </div>
                                    </div>
                                    <div className="mt-1 text-slate-400 text-[9px] font-medium break-all">{profileAtSlot.email || 'No email set'}</div>
                                    
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Permissions</div>
                                       {[
                                         { id: 'allowProfileEdit', label: 'Edit Profile' },
                                         { id: 'allowLeadsAccess', label: 'Leads Access' },
                                         { id: 'allowAnalytics', label: 'Analytics' },
                                         { id: 'allowAiChat', label: 'AI Chatbot' },
                                         { id: 'allowLiveAgent', label: 'Live Agent' },
                                         { id: 'allowStock', label: 'Stock / CRM' }
                                       ].map(feat => (
                                         <label key={feat.id} className="flex items-center justify-between cursor-pointer group">
                                           <span className="text-[10px] font-black text-slate-600 uppercase group-hover:text-blue-600 transition-colors">{feat.label}</span>
                                           <input 
                                             type="checkbox" 
                                             checked={profileAtSlot[feat.id] || false}
                                             onChange={async (e) => {
                                                const checked = e.target.checked;
                                                const { doc, updateDoc } = await import('firebase/firestore');
                                                await updateDoc(doc(db, 'profiles', profileAtSlot.id), { [feat.id]: checked });
                                                setTeamProfiles(prev => prev.map(p => p.id === profileAtSlot.id ? { ...p, [feat.id]: checked } : p));
                                                showToast(`${feat.label} ${checked ? 'enabled' : 'disabled'} for ${profileAtSlot.name}`);
                                             }}
                                             className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                           />
                                         </label>
                                       ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <button 
                                        onClick={() => {
                                          const url = `${window.location.origin}/profile/${profileAtSlot.slug || profileAtSlot.id}`;
                                          navigator.clipboard.writeText(url);
                                          showToast("Profile link copied!");
                                        }}
                                        className="py-2.5 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5"
                                      >
                                        <LinkIcon size={12} /> Profile Link
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const url = `${window.location.origin}/dashboard`;
                                          navigator.clipboard.writeText(url);
                                          showToast("Dashboard link copied!");
                                        }}
                                        className="py-2.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5"
                                      >
                                        <LayoutDashboard size={12} /> Dash Link
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setEditingSubProfileId(profileAtSlot.id);
                                        setFormData(profileAtSlot);
                                        setSidebarTab('profile');
                                      }}
                                      className="w-full py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase rounded-xl"
                                    >
                                      Full Editor
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Link 
                                        to={`/profile/${profileAtSlot.slug || profileAtSlot.id}`} 
                                        target="_blank"
                                        className="py-2.5 bg-slate-900 text-white font-black text-[10px] uppercase rounded-xl text-center flex items-center justify-center gap-1.5"
                                      >
                                        <Share2 size={12} /> Preview
                                      </Link>
                                      <button 
                                        onClick={async () => {
                                          if(window.confirm('Delete?')) {
                                            const { doc, deleteDoc } = await import('firebase/firestore');
                                            await deleteDoc(doc(db, 'profiles', profileAtSlot.id));
                                            setTeamProfiles(teamProfiles.filter(tp => tp.id !== profileAtSlot.id));
                                          }
                                        }}
                                        className="py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                  <button 
                                    onClick={() => setIsEditingTeamProfile({ name: '', title: '', email: '', slug: `staff-${idx+1}-${Date.now().toString().slice(-4)}`, isSubProfile: true })}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] uppercase rounded-lg hover:border-blue-400 transition-all"
                                  >
                                    Add Profile
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                     </div>
                   )}
                 </>
               )}
             </div>
          )}

          {sidebarTab === 'account' && (
            <div className="p-4 md:p-8 max-w-4xl animate-fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 m-0">Account & Security</h2>
                <p className="text-slate-500 m-0 mt-1 text-sm">Manage your login methods and profile email</p>
              </div>

              <div className="space-y-6">
                {/* Email Binding Section */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 m-0">Login Email (Gmail)</h3>
                      <p className="text-xs text-slate-500 m-0">Connected Google Account for authentication</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Account</span>
                      <span className="text-sm font-bold text-slate-700">{user?.email || 'No email bound'}</span>
                    </div>
                    <button 
                      onClick={async () => {
                        const { GoogleAuthProvider, linkWithPopup } = await import('firebase/auth');
                        const provider = new GoogleAuthProvider();
                        try {
                          if (!user) return;
                          await linkWithPopup(user, provider);
                          showToast('New Gmail bound successfully!');
                        } catch (err: any) {
                          if (err.code === 'auth/credential-already-in-use') {
                            showToast('This Gmail is already linked to another account.');
                          } else if (err.code === 'auth/provider-already-linked') {
                            showToast('You already have a Google account linked. To change it, please contact support.');
                          } else {
                            showToast(err.message || 'Action failed.');
                          }
                        }
                      }}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                      Bind New Gmail
                    </button>
                  </div>
                  
                  <p className="mt-4 text-[10px] text-slate-400 font-medium italic">Note: Binding a new Gmail allows you to log in using that account while keeping all your existing profile data and settings without breaking any functionality.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 m-0">Language & Layout</h3>
                      <p className="text-xs text-slate-500 m-0">Support for Right-to-Left (Arabic) displays</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-700">Arabic / RTL Support</span>
                      <p className="text-[10px] text-slate-500">Enable this if your profile content is in Arabic</p>
                    </div>
                    <button 
                      onClick={() => {
                        const nextVal = !formData.isRtl;
                        setFormData({...formData, isRtl: nextVal});
                        // Save immediately for this specific setting
                        if (profile?.id) {
                          import('firebase/firestore').then(({ updateDoc, doc }) => {
                            updateDoc(doc(db, 'profiles', profile.id), { isRtl: nextVal });
                          });
                        }
                      }}
                      className={`w-12 h-6 rounded-full relative transition-all ${formData.isRtl ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isRtl ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Payment & Trust Section */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 m-0">Payment & Compliance</h3>
                      <p className="text-xs text-slate-500 m-0">Networking safely in the UAE</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <h4 className="text-sm font-black text-blue-800 mb-1">UAE Compliance Note</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">Direct payment gateways often require local licensing in UAE. We recommend using <strong>WhatsApp Pay</strong>, <strong>Tabby/Tamara</strong> links, or <strong>Direct Bank Transfer</strong> mentions in your profile for higher trust and lower friction.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="text-sm font-black text-slate-800 mb-1">Verified Badge</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">Accounts with the Verified Badge see a 40% increase in trust. You can enable your verified status if you have a valid Emirates ID or Trade License verified by support.</p>
                      <button 
                        onClick={() => {
                          const nextVal = !formData.isVerified;
                          setFormData({...formData, isVerified: nextVal});
                          if (profile?.id) {
                            import('firebase/firestore').then(({ updateDoc, doc }) => {
                              updateDoc(doc(db, 'profiles', profile.id), { isVerified: nextVal });
                            });
                          }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.isVerified ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                      >
                        <ShieldCheck size={14} />
                        {formData.isVerified ? 'VERIFIED ACTIVE' : 'REQUEST VERIFICATION'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                      <Download size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 m-0">Offline Access (PWA)</h3>
                      <p className="text-xs text-slate-500 m-0">Enable "Save to Home Screen" for your users</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                    <p className="text-xs text-slate-500 leading-relaxed">Your profile is now a <strong>Progressive Web App (PWA)</strong>. When users open your link on Chrome (Android) or Safari (iPhone), they can click "Add to Home Screen". This acts as a digital wallet save, making your card available even without internet.</p>
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
                  <div className="flex-1 w-full">
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Unified Referral Link</h3>
                     <p className="text-slate-500 mb-6">Share your profile link. If you refer a business directly and they subscribe to a paid plan, you earn a <strong className="text-emerald-600">10% direct commission</strong> of their plan cost!</p>
                     
                     <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center overflow-hidden">
                          <span className="text-sm font-medium text-slate-700 break-all leading-tight">
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
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shrink-0"
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
