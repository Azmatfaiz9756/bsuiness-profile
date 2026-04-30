import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Briefcase, Languages, Trash2, CalendarCheck, UserPlus, Headset } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { CHAT_LANGUAGES } from "../../../lib/languages";
import { useAppContext } from "../../../context/AppContext";

// Types corresponding to GoogleGenAI
const Type = { STRING: 'STRING', OBJECT: 'OBJECT', ARRAY: 'ARRAY' };
const ThinkingLevel = { LOW: 'LOW', HIGH: 'HIGH' };

class ProxyGoogleGenAI {
  models = {
    generateContent: async (args: any) => {
      const resp = await fetch('/api/gemini/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'AI generation failed');
      return data;
    }
  };
}

export default function ProfileChatbot({ profile }: { profile: any }) {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [liveChatSessionId, setLiveChatSessionId] = useState<string | null>(null);
  const [isLiveAgentRequesting, setIsLiveAgentRequesting] = useState(false);

  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityForm, setIdentityForm] = useState({ name: '', phone: '' });
  const [visitorDetails, setVisitorDetails] = useState<{name: string, phone: string, id: string} | null>(null);

  const lsPrefix = `chat_${profile?.id}_${user?.uid || 'guest'}`;
  const lsKeyLang = `${lsPrefix}_lang`;
  const lsKeyHistory = `${lsPrefix}_history`;
  const lsKeySession = `${lsPrefix}_session`;
  const lsKeyVisitor = `${lsPrefix}_visitor`;

  const ai = new ProxyGoogleGenAI();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getGreeting = (langId: string) => {
    if (langId === 'hi') return `Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon?`;
    if (langId === 'en') return `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`;
    if (langId === 'ar') return `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`;
    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `Hello! I'm the AI assistant for ${profile?.name}. I can assist you in ${lang?.label || langId}. How can I help you today?`;
  };

  const getPrompt = (langId: string) => {
    if (langId === 'hi') {
      return `Aap ${profile?.name} ke AI assistant hain. Aapko ekdum aam Hindustani (Hindi-Urdu mix) mein baat karni hai jo hum roz-mara ki zindagi mein bolte hain. 

SANSKRIT AUR MUSHIKL URDU BILKUL USE NA KAREIN:
- No formal Urdu: 'janab', 'khidmat', 'nawazish', 'bayan', 'ittefaq', 'naye daur', 'maharat', 'guftagu', 'faraham', 'jadid', 'mutabiq', 'silsile', 'lehja' - Yeh sab bilkul use na karein.
- No formal Hindi/Sanskrit: 'vistar', 'mukhya', 'adhik', 'yogdaan', 'parinaam' - Yeh sab bhi use na karein.

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
"Assalamualekum! Bataiye sir, main aapki kis tarah se madad kar sakta hoon? Kya aap ${profile?.name} sir se kisi khass topic pe baat-cheet karna chahte hain, ya humari company ${profile?.company} ki services ke baare mein kuch jaanna chahte hain?"

Business Details:
- Name: ${profile?.name}
- Work: ${profile?.title}
- Company: ${profile?.company}
- Bio: ${profile?.bio}
- Services: ${profile?.services?.map((s: any) => `${s.title}: ${s.description}`).join('; ') || 'N/A'}
- Contact: Email ${profile?.email}, Phone ${profile?.phone}`;
    }
    
    if (langId === 'ar') {
      return `أنت مساعد ذكي محترف لـ ${profile?.name}.
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة بيضاء مهذبة).

معلومات العمل:
- الاسم: ${profile?.name}
- المسمى الوظيفي: ${profile?.title}
- الشركة: ${profile?.company}
- الخبرات: ${profile?.experience}
- الخدمات: ${profile?.services?.map((s: any) => `${s.title}`).join('، ') || 'N/A'}
- التواصل: ${profile?.email}, ${profile?.phone}

ساعد الزوار في التعرف على الخدمات والتواصل.`;
    }

    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `You are a professional AI business assistant for ${profile?.name}.
Your tone should be helpful, clear, and professional.
You MUST communicate primarily in ${lang?.label || langId}.

Full Profile Context:
- Name: ${profile?.name}
- Title: ${profile?.title}
- Company: ${profile?.company}
- Bio: ${profile?.bio}
- Skills: ${profile?.skills?.join(', ') || 'N/A'}
- Experience: ${profile?.experience}
- Address: ${profile?.address}
- Services: ${profile?.services?.map((s: any) => `${s.title}: ${s.description}`).join('; ') || 'N/A'}
- Contact: Email: ${profile?.email}, Phone: ${profile?.phone}
- Socials: ${JSON.stringify(profile?.socials || {})}

Assist visitors with inquiries about the business, services, and contact information in ${lang?.label || langId}.`;
  };

  // Persist language, history and session ID
  useEffect(() => {
    const savedTimestamp = localStorage.getItem(`${lsKeyHistory}_time`);
    const now = new Date().getTime();

    if (savedTimestamp && now - parseInt(savedTimestamp) > 15 * 60 * 1000) {
      // Clear history if more than 15 minutes have passed since last activity
      localStorage.removeItem(lsKeyHistory);
      localStorage.removeItem(lsKeyLang);
      localStorage.removeItem(lsKeySession);
      localStorage.removeItem(`${lsKeyHistory}_time`);
      localStorage.removeItem(lsKeyVisitor);
    } else {
      const savedLang = localStorage.getItem(lsKeyLang);
      if (savedLang) setSelectedLang(savedLang as any);

      const savedHistory = localStorage.getItem(lsKeyHistory);
      if (savedHistory) {
        try { setMessages(JSON.parse(savedHistory)); } catch (e) {}
      }
      
      const savedSessionId = localStorage.getItem(lsKeySession);
      if (savedSessionId) setLiveChatSessionId(savedSessionId);

      const savedVisitor = localStorage.getItem(lsKeyVisitor);
      if (savedVisitor) {
        try { setVisitorDetails(JSON.parse(savedVisitor)); } catch (e) {}
      } else if (user) {
        setVisitorDetails({ name: user.displayName || 'User', phone: '', id: user.uid });
      }
    }

    // Set interval to clear if open window becomes inactive
    const interval = setInterval(() => {
      const stamp = localStorage.getItem(`${lsKeyHistory}_time`);
      if (stamp && new Date().getTime() - parseInt(stamp) > 15 * 60 * 1000) {
        localStorage.removeItem(lsKeyHistory);
        localStorage.removeItem(lsKeyLang);
        localStorage.removeItem(lsKeySession);
        localStorage.removeItem(`${lsKeyHistory}_time`);
        localStorage.removeItem(lsKeyVisitor);
        setSelectedLang(null);
        setMessages([]);
        setVisitorDetails(null);
        setLiveChatSessionId(null);
        if (isOpen) setIsOpen(false);
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [lsKeyLang, lsKeyHistory, lsKeySession, lsKeyVisitor, user, isOpen]);

  useEffect(() => {
    if (selectedLang) {
       localStorage.setItem(lsKeyLang, selectedLang);
       if (messages.length === 0) {
         setMessages([{ role: 'model', content: getGreeting(selectedLang) }]);
       }
    }
  }, [selectedLang, lsKeyLang]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(lsKeyHistory, JSON.stringify(messages));
      localStorage.setItem(`${lsKeyHistory}_time`, new Date().getTime().toString());
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, lsKeyHistory]);

  useEffect(() => {
    if (liveChatSessionId) {
      localStorage.setItem(lsKeySession, liveChatSessionId);
    } else {
      localStorage.removeItem(lsKeySession);
    }
  }, [liveChatSessionId, lsKeySession]);

  // Real-time listener for live agent messages
  useEffect(() => {
    if (!liveChatSessionId) return;

    const q = query(
      collection(db, `chat_sessions/${liveChatSessionId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.senderType === 'Agent') {
            setMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(m => m.content === data.text && m.role === 'model');
              if (exists) return prev;
              return [...prev, { role: 'model', content: data.text }];
            });
          }
        }
      });
    }, (error) => {
      import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.GET, `chat_sessions/${liveChatSessionId}/messages`);
      });
    });

    return () => unsubscribe();
  }, [liveChatSessionId]);

  const startLiveChat = async (customerName: string, customerEmail?: string) => {
    setIsLiveAgentRequesting(true);
    try {
      const sessDoc = await addDoc(collection(db, 'chat_sessions'), {
        profileId: profile.id,
        ownerId: profile.ownerId || (profile.id === 'platform' ? 'platform' : profile.id),
        customerName: visitorDetails?.name || customerName || 'Visitor',
        customerPhone: visitorDetails?.phone || '',
        customerEmail: customerEmail || '',
        customerLang: selectedLang || 'en',
        status: 'Queued',
        lastMessage: 'Requested human agent',
        updatedAt: serverTimestamp()
      });
      
      setLiveChatSessionId(sessDoc.id);
      
      // Add initial message
      await addDoc(collection(db, `chat_sessions/${sessDoc.id}/messages`), {
        senderType: 'Customer',
        text: 'I want to talk to a human agent.',
        timestamp: serverTimestamp()
      });

      setMessages(prev => [...prev, { role: 'model', content: selectedLang === 'hi' ? "Zaroor! Main ek live agent ko connect kar raha hoon. Please line pe bane rahein..." : "Sure! Connecting you to a live agent. Please stay online..." }]);
    } catch (e) {
      console.error(e);
      import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.WRITE, 'chat_sessions');
      });
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, live support is currently unavailable." }]);
    }
    setIsLiveAgentRequesting(false);
  };

  const clearChat = () => {
    if (window.confirm('Delete chat history?')) {
      const initialMsg = getGreeting(selectedLang || 'en');
      setMessages([{ role: 'model', content: initialMsg }]);
      localStorage.setItem(lsKeyHistory, JSON.stringify([{ role: 'model', content: initialMsg }]));
    }
  };

  const changeLanguage = () => {
    setSelectedLang(null);
    setMessages([]);
    localStorage.removeItem(lsKeyHistory);
    localStorage.removeItem(lsKeyLang);
  };

  const handleSelectLang = (langId: any) => {
    if (!visitorDetails && !user) {
      setSelectedLang(langId);
      setShowIdentityForm(true);
    } else {
      setSelectedLang(langId);
    }
  };

  const submitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityForm.name || !identityForm.phone) return;
    const newVisitor = { 
      name: identityForm.name.trim(), 
      phone: identityForm.phone.trim(), 
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2,9)}`
    };
    setVisitorDetails(newVisitor);
    localStorage.setItem(lsKeyVisitor, JSON.stringify(newVisitor));
    setShowIdentityForm(false);
  };

  const sendMessage = async (customMessage?: string | any) => {
    const textToSend = typeof customMessage === 'string' ? customMessage : input.trim();
    if (!textToSend || loading || !selectedLang || isLiveAgentRequesting) return;
    
    if (typeof customMessage !== 'string') setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);

    // IF LIVE CHAT IS ACTIVE, SEND TO FIRESTORE
    if (liveChatSessionId) {
      try {
        await addDoc(collection(db, `chat_sessions/${liveChatSessionId}/messages`), {
          senderType: 'Customer',
          text: textToSend,
          timestamp: serverTimestamp()
        });
        await updateDoc(doc(db, 'chat_sessions', liveChatSessionId), {
          lastMessage: textToSend,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("LiveChat Error:", e);
        import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
          handleFirestoreError(e, OperationType.WRITE, `chat_sessions/${liveChatSessionId}`);
        }).catch(err => console.error(err));
      }
      return;
    }

    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }]
      }));

      // Use recommended model
      const modelName = 'gemini-2.5-flash';
      const systemInstruction = profile?.aiPrompt || getPrompt(selectedLang);

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
              },
              {
                name: "talk_to_human",
                description: "Hand over the chat to a live human agent. Call this if the user specifically asks to talk to a person, an agent, or if the AI cannot help further.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Customer's name" },
                    email: { type: Type.STRING, description: "Customer's email (optional)" }
                  },
                  required: ["name"]
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
          if (fc.name === 'talk_to_human') {
            const args = fc.args as { name: string; email?: string };
            await startLiveChat(args.name, args.email);
            results.push({ name: fc.name, response: { success: true, message: "Human agent requested. Connection pending." } });
            continue;
          }

          const col = fc.name === 'book_appointment' ? 'appointments' : 'leads';
          const args = fc.args as any;
          try {
            await addDoc(collection(db, col), {
              ...args,
              profileId: profile.id,
              ownerId: profile.ownerId || (profile.id === 'platform' ? 'platform' : profile.id),
              createdAt: serverTimestamp(),
              status: fc.name === 'book_appointment' ? 'Pending' : 'New',
              source: 'AI Chatbot'
            });
            results.push({ name: fc.name, response: { success: true } });
          } catch (e) {
            console.error("DB Write Error:", e);
            results.push({ name: fc.name, response: { success: false, error: "DB Error" } });
            import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
              handleFirestoreError(e, OperationType.WRITE, col);
            });
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
      // More detailed error for debugging in development
      let errorMsg = "Unknown error";
      try {
        errorMsg = err?.message || (err && typeof err === 'object' ? JSON.stringify(err) : String(err));
      } catch(e) {
        errorMsg = "Unparseable error object.";
      }
      if (errorMsg.includes('API key not valid')) {
         setMessages(prev => [...prev, { role: 'model', content: 'Connection Error: Invalid API Key on server. Please check environment configuration.' }]);
      } else if (errorMsg.includes('Requested entity was not found') || errorMsg.includes('is not found')) {
         setMessages(prev => [...prev, { role: 'model', content: 'Model not found error. Please contact support.' }]);
      } else if (errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('Missing or insufficient permissions')) {
         setMessages(prev => [...prev, { role: 'model', content: 'Database permission error. Rules may be updating. Please wait a moment.' }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', content: `Maaf kijiyega, kuch problem aa rahi hai. (${errorMsg.substring(0, 50)}...)` }]);
      }
    }
    setLoading(false);

  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: window.innerWidth < 480 ? 100 : 20, 
      right: 20, 
      zIndex: 1000 
    }}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button 
            key="bot-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: 56, height: 56, borderRadius: '50%', background: '#2563eb', 
              color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            }}
          >
            <Bot size={28} />
          </motion.button>
        ) : (
          <motion.div 
            key="chat-window"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            style={{
              width: window.innerWidth < 480 ? 'calc(100vw - 40px)' : 350, 
              height: window.innerHeight < 600 ? '70vh' : 500, 
              bottom: window.innerWidth < 480 ? 100 : 20,
              right: 20,
              background: '#fff', borderRadius: 20, 
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)', display: 'flex', 
              flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0',
              position: 'fixed'
            }}
          >
            <div style={{ background: '#2563eb', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 10 }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{profile?.name} Assistant</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>Online • AI Powered</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {selectedLang && (
                  <>
                    <button onClick={changeLanguage} title="Change Language" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}><Languages size={18} /></button>
                    <button onClick={clearChat} title="Clear Chat" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}><Trash2 size={18} /></button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>

            <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
              {!selectedLang ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{ background: '#dbeafe', p: 4, borderRadius: '50%', marginBottom: 8 }}>
                    <Bot size={48} color="#2563eb" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Select Chat Language</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginBottom: 16, padding: '0 20px' }}>Choose your preferred language to start the conversation.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxHeight: '400px', overflowY: 'auto', alignItems: 'center' }}>
                    {CHAT_LANGUAGES.map(lang => (
                      <motion.button 
                        key={lang.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectLang(lang.id)} 
                        style={{ 
                          width: '85%', padding: '14px', background: '#fff', 
                          border: '1.5px solid #e2e8f0', borderRadius: 16, 
                          fontWeight: 600, cursor: 'pointer', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', gap: 10,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : showIdentityForm ? (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={submitIdentity}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center', p: 16 }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Join Chat</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginTop: 4 }}>Please enter your details to start.</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Name</label>
                    <input 
                      type="text" 
                      required
                      value={identityForm.name} 
                      onChange={e => setIdentityForm({...identityForm, name: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      value={identityForm.phone} 
                      onChange={e => setIdentityForm({...identityForm, phone: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                      placeholder="Your mobile no."
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, marginTop: 8, cursor: 'pointer' }}
                  >
                    Start Chatting
                  </motion.button>
                </motion.form>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                    >
                      <div style={{ 
                        background: msg.role === 'user' ? '#2563eb' : '#fff', 
                        color: msg.role === 'user' ? '#fff' : '#1e293b', 
                        boxShadow: msg.role === 'user' ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        padding: '12px 16px', borderRadius: 18, 
                        borderBottomRightRadius: msg.role === 'user' ? 4 : 18, 
                        borderBottomLeftRadius: msg.role === 'model' ? 4 : 18, 
                        fontSize: 14, lineHeight: 1.6 
                      }}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: '#64748b' }}
                    >
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span className="dot animate-bounce">.</span>
                        <span className="dot animate-bounce delay-100">.</span>
                        <span className="dot animate-bounce delay-200">.</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {selectedLang && !showIdentityForm && (
              <>
                {messages.length <= 1 && (
                  <div style={{ padding: '0 16px 12px', background: '#f8fafc' }}>
                    <button 
                      onClick={() => sendMessage(selectedLang === 'hi' ? "Aapke business aur services ke baare mein thoda aur bataiye." : selectedLang === 'ar' ? "أخبرني المزيد عن خدماتك." : "Tell me more about your services.")}
                      style={{
                        width: '100%', padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', 
                        borderRadius: 12, fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', 
                        gap: 10, cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Briefcase size={16} color="#2563eb" />
                      <span>{selectedLang === 'hi' ? 'Business & Services ki details' : selectedLang === 'ar' ? 'خدمات الأعمال' : 'Business & Services'}</span>
                    </button>
                  </div>
                )}
                <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: '#fff' }}>
                  <input 
                    type="text" value={input} onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={selectedLang === 'hi' ? "Apna sawaal puchiye..." : selectedLang === 'ar' ? "اسأل سؤالك..." : "Type your message..."} 
                    style={{ flex: 1, padding: '12px 18px', borderRadius: 25, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: 14 }} 
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage()} 
                    style={{ background: '#2563eb', color: '#fff', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
