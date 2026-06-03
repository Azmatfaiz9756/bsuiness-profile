import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Briefcase, Languages, Trash2, CalendarCheck, UserPlus, Headset } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { ProxyGoogleGenAI } from '../../../lib/gemini';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { CHAT_LANGUAGES } from "../../../lib/languages";
import { useAppContext } from "../../../context/AppContext";

const Type = { STRING: 'STRING', OBJECT: 'OBJECT', ARRAY: 'ARRAY' };

export default function ProfileChatbot({ profile }: { profile: any }) {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
      setViewportHeight(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [liveChatSessionId, setLiveChatSessionId] = useState<string | null>(null);
  const [isLiveAgentRequesting, setIsLiveAgentRequesting] = useState(false);
  const [stockData, setStockData] = useState<string>('');
  const [formattedStock, setFormattedStock] = useState<string>('');

  useEffect(() => {
    if (stockData) {
      console.log("Stock Data received:", stockData.substring(0, 500));
      // Simple CSV to readable text conversion for AI context
      const lines = stockData.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length > 1) {
        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0];
        const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
        const headers = firstLine.split(delimiter).map(h => h.trim());
        
        // Take up to 50 rows for more complete inventory context
        const dataRows = lines.slice(1, 50).map(row => {
          const cells = row.split(delimiter).map(c => c.trim());
          return headers.map((h, i) => `${h}: ${cells[i] || 'N/A'}`).join(', ');
        });
        setFormattedStock(dataRows.join('\n'));
      } else {
        setFormattedStock(stockData);
      }
    }
  }, [stockData]);

  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityForm, setIdentityForm] = useState({ name: '', phone: '', countryCode: '+971' });
  const [identityError, setIdentityError] = useState('');
  const [visitorDetails, setVisitorDetails] = useState<{name: string, phone: string, id: string} | null>(null);
  const [routingStatus, setRoutingStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const lsPrefix = `chat_${profile?.id}_${user?.uid || 'guest'}`;
  const lsKeyLang = `${lsPrefix}_lang`;
  const lsKeyHistory = `${lsPrefix}_history`;
  const lsKeySession = `${lsPrefix}_session`;
  const lsKeyVisitor = `${lsPrefix}_visitor`;

  const ai = new ProxyGoogleGenAI({ apiKey: profile?.aiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
IMPORTANT - LIVE INVENTORY (CRITICAL KNOWLEDGE):
The business has provided the following stock list. You MUST check this list first for any questions about products, availability, or prices.

CURRENT STOCK LIST:
${formattedStock}

INVENTORY RULES:
1. SEARCH: Look for matching names in the list above. If found, confirm it's in stock.
2. PRICE: ${profile?.showStockPrice ? "Prices mentioned in the list can be shared." : "Do NOT share numerical prices."}
3. NOT FOUND: If a product is NOT in the list, state that you don't have that specific item's stock information right now but can take an inquiry.
4. "Kya stock hai?": If asked what's in stock, list the items found in the data above.
`;
    } else if (profile?.stockSyncEnabled && !formattedStock) {
      stockContext = `
IMPORTANT: Stock sync is ENABLED but the inventory list is currently EMPTY or failed to sync. 
Tell the user that currently the live stock data is being updated and you can take an inquiry for any product they are looking for.
Do NOT make up any products or prices.
`;
    }

    const truncate = (str: string, len: number) => {
      if (!str) return 'N/A';
      return str.length > len ? str.substring(0, len) + '...' : str;
    };

    const translationInfo = `
# SYSTEM KNOWLEDGE AND FACTS
Please review the below knowledge base data carefully. If the data is formatted as a CSV (comma separated values) list, or tabular data, parse it rows by rows to understand the Products, Specifications, and their corresponding Prices accurately. You MUST refer strictly to this data.
---
${profile?.aiPrompt || 'Respond as a professional assistant for ' + profile?.name}
---

# SALES STRATEGY & RULES
${profile?.aiSalesInstructions || 'Be helpful and try to capture leads by asking for name and number when user is interested.'}

# BUSINESS DETAILS
- Name: ${profile?.name}
- Services: ${truncate(Array.isArray(profile?.services) ? profile.services.map((s: any) => `${s.name || s.title}: ${s.desc || s.description}`).join('; ') : 'None', 1000)}
- WhatsApp: ${profile?.whatsapp || profile?.phone}
- Email: ${profile?.email}
- Website: ${window.location.origin}/profile/${profile?.slug || profile?.id}

# OPERATIONAL RULES
- Language: Respond strictly in ${CHAT_LANGUAGES.find(l => l.id === langId)?.label || langId}.
- Tone: Professional, helpful, and concise (max 2-3 short sentences).
- Accuracy: NEVER invent products or prices. Only quote from the System Knowledge and Facts provided above.
- Leads: If the user expresses interest in services or stock items, politely ask for their Name and Mobile Number for follow-up.
`;

    if (langId === 'hi') {
      return `Aap ${profile?.name} ke Professional Digital Assistant hain. 
Aapko aam Hindustani language (Natural & Human-like) use karni hai.

${stockContext}
${translationInfo}

# HIDAYAT (IMPORTANT):
1. LIVE INVENTORY: Agar user kisi product ya stock ke bare mein kuch bhi puche, toh upar 'LIVE INVENTORY' dekh kar jawab dein.
2. AGAR STOCK MEIN NAHI HAI: Agar item stock list mein nahi hai, toh kahein "Sir/Ma'am, filhal iska live stock record update ho raha hai, lekin main aapki inquiry note kar leta hoon."
3. PEHCHAN: Hamesha bataiye ke aap ${profile?.name} ke assistant hain.
4. INQUIRY: Customer ka Name aur Mobile Number lijiye agar wo kisi cheez mein dilchaspi dikhaye.
5. LIVE AGENT: Agar user bole ki usko "human", "insaan", "live agent", ya "customer care" se baat karni hai, toh 'talk_to_human' function tool call karein. Agar aapne already unka naam pucha tha aur unhone ab apna naam bata diya hai, toh TURANT 'talk_to_human' tool call karein. 'send_inquiry' call mat kijiye.
6. OWNER INSTRUCTIONS: Jo 'SYSTEM KNOWLEDGE' mein instructions hain, unhe sabse pehle follow karein.

Greeting: "Assalamualekum! Main ${profile?.name} ka digital assistant hoon. Main aapki kaise madad kar sakta hoon?"`;
    }
    
    if (langId === 'ar') {
      return `أنت مساعد ذكي محترف لـ ${profile?.name}.
${translationInfo}
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة بيضاء مهذبة).

${stockContext}

معلومات العمل:
- الاسم: ${profile?.name}
- المسمى الوظيفي: ${profile?.title}
- الشركة: ${profile?.company}
- الخبرات: ${profile?.experience}
- الخدمات: ${Array.isArray(profile?.services) ? profile.services.map((s: any) => `${s.name || s.title}`).join('، ') : 'N/A'}
- التواصل: ${profile?.email}, ${profile?.phone}, WhatsApp: ${profile?.whatsapp || profile?.phone}

هام: إذا طلب المستخدم التحدث إلى وكيل بشري أو خدمة العملاء، استخدم أداة 'talk_to_human' فوراً. إذا أعطاك اسمه بعد أن طلبته، اتصل بـ 'talk_to_human' فوراً. لا تستخدم 'send_inquiry' لذلك.
ساعد الزوار في التعرف على الخدمات والتواصل.`;
    }

    const lang = CHAT_LANGUAGES.find(l => l.id === langId);
    return `You are a professional AI business assistant for ${profile?.name}.
${translationInfo}
Your tone should be helpful, clear, and professional.
You MUST communicate primarily in ${lang?.label || langId}.

${stockContext}

Full Profile Context:
- Name: ${truncate(profile?.name, 100)}
- Title: ${truncate(profile?.title, 100)}
- Company: ${truncate(profile?.company, 100)}
- Bio: ${truncate(profile?.bio, 1000)}
- Skills: ${truncate(Array.isArray(profile?.skills) ? profile.skills.join(', ') : 'N/A', 500)}
- Experience: ${truncate(profile?.experience, 1000)}
- Address: ${truncate(profile?.address, 300)}
- WhatsApp: ${profile?.whatsapp || profile?.phone}
- Services: ${truncate(Array.isArray(profile?.services) ? profile.services.map((s: any) => `${s.name || s.title}: ${s.desc || s.description}`).join('; ') : 'None', 1500)}
- Contact: Email: ${profile?.email}, Phone: ${profile?.phone}
- Socials: ${(() => { try { return JSON.stringify(profile?.socials || {}); } catch(e) { return 'Error parsing'; } })().substring(0, 500)}

VERY IMPORTANT RULE: If the user explicitly asks to talk to a "human agent", "real person", "support team", "live chat", or "customer care", you MUST call the \`talk_to_human\` function tool immediately. If you just asked for their name to connect them and they provided it, call \`talk_to_human\` IMMIEDATELY. DO NOT call \`send_inquiry\` when they just want to chat with a live agent.

Assist visitors with inquiries about the business, services, and contact information in ${lang?.label || langId}.
IMPORTANT: Keep your responses EXTREMELY concise (max 2-3 short sentences). Avoid fluff for maximum speed. Always respond in ${lang?.label || langId}.`;
  };

  // Fetch Stock Data if enabled
  useEffect(() => {
    if (profile?.stockSyncEnabled) {
      const fetchStock = async () => {
        try {
          if ((profile.stockSourceType === 'Manual' || profile.stockSourceType === 'FileUpload') && profile.stockManualData) {
            setStockData(profile.stockManualData);
          } else if (profile.stockSourceType === 'CRM') {
            const apiUrl = '';
            const resp = await fetch(`${apiUrl}/api/crm/stock/${profile.id}`);
            if (resp.ok) {
               const data = await resp.json();
               if (data.stock) setStockData(data.stock);
            }
          }
        } catch (e) {
          console.error("Stock sync error:", e);
        }
      };
      fetchStock();
    }
  }, [profile?.stockSyncEnabled, profile?.stockSourceType, profile?.stockManualData, profile?.crmProvider, profile?.id]);

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

  // Enterprise Routing Logic
  useEffect(() => {
    if (!liveChatSessionId || !profile) return;

    const sessionRef = doc(db, 'chat_sessions', liveChatSessionId);
    let timer: any;

    const unsubscribe = onSnapshot(sessionRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      
      if (data.status === 'Queued' && data.routingLevel === 'Priority') {
        setRoutingStatus('Trying to connect to staff member...');
        if (countdown === null) setCountdown(20);

        if (!timer) {
          timer = setTimeout(async () => {
             // Fallback to other available team members
             try {
               const { query, collection, where, getDocs } = await import('firebase/firestore');
               // Find Enterprise owner ID
               const enterpriseOwnerId = profile.ownerId || (profile.id !== 'platform' ? profile.id : null);
               if (!enterpriseOwnerId) return;

               const availableAgentsQuery = query(
                 collection(db, 'profiles'),
                 where('ownerId', '==', enterpriseOwnerId),
                 where('availabilityStatus', '==', 'available'),
                 where('isSubProfile', '==', true)
               );
               
               const agentSnaps = await getDocs(availableAgentsQuery);
               const availableAgentIds = agentSnaps.docs
                 .map(d => d.id)
                 .filter(id => id !== profile.id); // Exclude the priority agent who didn't respond

               if (availableAgentIds.length > 0) {
                 await updateDoc(sessionRef, {
                   routingLevel: 'Fallback',
                   fallbackAgentIds: availableAgentIds,
                   updatedAt: serverTimestamp()
                 });
                 setRoutingStatus('Staff member busy, connecting to available team...');
                 setCountdown(null);
               } else {
                 setRoutingStatus('All staff busy, please wait or leave a message.');
               }
             } catch (e) {
               console.error("Routing Fallback Error:", e);
             }
          }, 20000);
        }
      } else if (data.status === 'Active') {
        setRoutingStatus('Connected to Agent');
        setCountdown(null);
        if (timer) clearTimeout(timer);
      }
    }, (error) => {
      import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.GET, `chat_sessions/${liveChatSessionId}`);
      });
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [liveChatSessionId, profile]);

  // Countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const startLiveChat = async (customerName: string, customerEmail?: string) => {
    setIsLiveAgentRequesting(true);
    // Show UI feedback immediately
    setMessages(prev => [...prev, { role: 'model', content: selectedLang === 'hi' ? "Zaroor! Main ek live agent ko connect kar raha hoon. Please line pe bane rahein..." : "Sure! Connecting you to a live agent. Please stay online..." }]);
    
    try {
      const sessDoc = await addDoc(collection(db, 'chat_sessions'), {
        profileId: profile.id,
        ownerId: profile.ownerId || profile.userId || (profile.id === 'platform' ? 'platform' : profile.id),
        customerName: visitorDetails?.name || customerName || 'Visitor',
        customerPhone: visitorDetails?.phone || '',
        customerEmail: customerEmail || '',
        customerLang: selectedLang || 'en',
        status: 'Queued',
        routingLevel: 'Priority',
        priorityAgentId: profile.id,
        assignedAgentId: null,
        lastMessage: 'Requested human agent',
        updatedAt: serverTimestamp(),
        source: 'AI Chatbot'
      });
      
      setLiveChatSessionId(sessDoc.id);
      
      // Add initial messages
      let delay = 0;
      for (const m of messages.slice(-5)) { // Just last 5 messages for context
        await addDoc(collection(db, `chat_sessions/${sessDoc.id}/messages`), {
          senderType: m.role === 'user' ? 'Customer' : 'Agent',
          text: m.content || '(Attachment)',
          timestamp: new Date(Date.now() + delay) // slightly offset so they sort correctly
        });
        delay += 10;
      }
      // Add the handover message
      await addDoc(collection(db, `chat_sessions/${sessDoc.id}/messages`), {
        senderType: 'Customer',
        text: 'I want to talk to a human agent.',
        timestamp: new Date(Date.now() + delay)
      });

    } catch (e) {
      console.error("[ProfileChatbot] startLiveChat error:", e);
      import('../../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.WRITE, 'chat_sessions');
      });
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, live support is currently unavailable. Connection failed." }]);
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

  const phoneValidationRules: Record<string, { min: number, max: number, placeholder: string }> = {
    '+971': { min: 9, max: 9, placeholder: '50 123 4567' },
    '+91': { min: 10, max: 10, placeholder: '98765 43210' },
    '+1': { min: 10, max: 10, placeholder: '202 555 0123' },
    '+44': { min: 10, max: 11, placeholder: '7700 900000' },
    '+966': { min: 9, max: 9, placeholder: '50 123 4567' },
    '+974': { min: 8, max: 8, placeholder: '3312 3456' },
    '+973': { min: 8, max: 8, placeholder: '3912 3456' },
    '+965': { min: 8, max: 8, placeholder: '9123 4567' },
    '+968': { min: 8, max: 8, placeholder: '9123 4567' },
    '+92': { min: 10, max: 10, placeholder: '300 1234567' },
  };

  const submitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityForm.name || !identityForm.phone) return;
    
    const rules = phoneValidationRules[identityForm.countryCode];
    if (rules) {
      const pLen = identityForm.phone.length;
      if (pLen < rules.min || pLen > rules.max) {
        setIdentityError(`Phone number must be ${rules.min === rules.max ? rules.min : `${rules.min}-${rules.max}`} digits for ${identityForm.countryCode}`);
        return;
      }
    }

    setIdentityError('');
    const newVisitor = { 
      name: identityForm.name.trim(), 
      phone: `${identityForm.countryCode} ${identityForm.phone.trim()}`, 
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
      // Use recommended model
      const modelName = 'gemini-3-flash-preview';
      const basePrompt = getPrompt(selectedLang);
      
      const systemInstruction = basePrompt;

      // Limit history to keep request body small (very important for custom domain proxies)
      const historyLimit = 8;
      const recentMessages = messages.slice(-historyLimit);

      const processedHistory = recentMessages.map(msg => ({
        role: msg.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }]
      }));

      const chatContents = [
        ...processedHistory,
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
                description: "Send a contact inquiry or capture a lead. Requires name, phone (mobile number), and inquiry message.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Lead's full name" },
                    phone: { type: Type.STRING, description: "Lead's mobile/phone number" },
                    message: { type: Type.STRING, description: "Information about what they want to know/buy" }
                  },
                  required: ["name", "phone", "message"]
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
                  }
                }
              }
            ]
          }]
        }
      });

      let functionCalls: any[] = response.functionCalls || [];

      // Fallback: If Gemini model outputs raw JSON with 'tool_calls' in OpenAI format inside text
      let cleanedText = response.text || '';
      if (functionCalls.length === 0 && cleanedText && (cleanedText.includes('tool_calls') || cleanedText.includes('talk_to_human'))) {
        try {
          const match = cleanedText.match(/\{[\s\S]*"tool_calls"[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
              functionCalls = parsed.tool_calls.map((tc: any) => {
                let args = {};
                const params = tc.function?.arguments || tc.function?.parameters || tc.arguments;
                if (typeof params === 'string') {
                  try { args = JSON.parse(params); } catch(e) {}
                } else if (typeof params === 'object') {
                  args = params;
                }
                return {
                  name: tc.function?.name || tc.name,
                  args: args
                };
              });
            }
            // Remove the raw JSON from the text so it doesn't show in the chat UI
            cleanedText = cleanedText.replace(match[0], '').trim();
          }
        } catch (e) {
          console.error("Tried to parse tool_calls from text, failed:", e);
        }

        // Hard ultimate fallback: If it STILL couldn't parse but mentioned talk_to_human
        if (functionCalls.length === 0 && cleanedText.includes('talk_to_human')) {
          functionCalls = [{ name: 'talk_to_human', args: { name: 'Visitor' } }];
          cleanedText = cleanedText.replace(/\{[\s\S]*\}/g, '').trim(); 
        }
      }

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
            // Add a timeout to firestore write to prevent hanging the chat
            const dbPromise = addDoc(collection(db, col), {
              ...args,
              profileId: profile.id,
              ownerId: profile.ownerId || (profile.id === 'platform' ? 'platform' : profile.id),
              createdAt: serverTimestamp(),
              status: fc.name === 'book_appointment' ? 'Pending' : 'New',
              source: 'AI Chatbot'
            });

            // If it takes > 5s, we just continue to not freeze the UI
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Database timeout")), 5000)
            );

            await Promise.race([dbPromise, timeoutPromise]);
            results.push({ name: fc.name, response: { success: true } });
          } catch (e) {
            console.error(`Tool execution error [${fc.name}]:`, e);
            results.push({ name: fc.name, response: { success: false, error: String(e) } });
          }
        }

        if (results.some(r => r.name === 'talk_to_human')) {
          console.log("[ProfileChatbot] talk_to_human caught. Early exiting genContent loop.");
          setLoading(false);
          return;
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
        } else {
          setMessages(prev => [...prev, { role: 'model', content: "Okay, I have processed that for you." }]);
        }
      } else {
        const text = cleanedText || response.text;
        if (text) {
          setMessages(prev => [...prev, { role: 'model', content: text }]);
        } else {
          setMessages(prev => [...prev, { role: 'model', content: "Okay, I understand." }]);
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
      if (errorMsg.includes('API key not valid') || errorMsg.includes('Invalid API Key') || errorMsg.includes('Invalid key')) {
         setMessages(prev => [...prev, { role: 'model', content: 'Connection Error: Invalid Gemini API Key. Please check the GEMINI_API_KEY on your server or dashboard settings.' }]);
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
              width: isMobile ? '100%' : 350, 
              height: isMobile ? `${viewportHeight}px` : (window.innerHeight < 600 ? '70vh' : 500), 
              bottom: 0,
              right: 0,
              top: isMobile ? 0 : 'auto',
              background: '#fff', 
              borderRadius: isMobile ? 0 : 20, 
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)', display: 'flex', 
              flexDirection: 'column', overflow: 'hidden', border: isMobile ? 'none' : '1px solid #e2e8f0',
              position: 'fixed',
              zIndex: 10000
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
                  <div style={{ background: '#dbeafe', padding: 16, borderRadius: '50%', marginBottom: 8 }}>
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center', padding: 16 }}
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
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select 
                        value={identityForm.countryCode}
                        onChange={e => {
                          setIdentityError('');
                          setIdentityForm({...identityForm, countryCode: e.target.value});
                        }}
                        style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc', width: '100px', fontSize: 14, fontWeight: 600 }}
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+92">🇵🇰 +92</option>
                      </select>
                      <input 
                        type="tel" 
                        required
                        value={identityForm.phone} 
                        onChange={e => {
                          setIdentityError('');
                          setIdentityForm({...identityForm, phone: e.target.value.replace(/\D/g, '')});
                        }}
                        style={{ flex: 1, padding: '12px 18px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', width: '100%', fontSize: 14, fontWeight: 500 }}
                        placeholder={phoneValidationRules[identityForm.countryCode]?.placeholder || "Mobile no."}
                      />
                    </div>
                  </div>
                  {identityError && (
                    <div style={{ color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>
                      {identityError}
                    </div>
                  )}
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
                {routingStatus && (
                  <div style={{ padding: '8px 16px', background: '#eff6ff', borderTop: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{routingStatus}</span>
                     </div>
                     {countdown !== null && countdown > 0 && (
                        <div style={{ fontSize: 9, color: '#64748b', fontWeight: 500 }}>Please wait {countdown} seconds while we connect you...</div>
                     )}
                  </div>
                )}
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
