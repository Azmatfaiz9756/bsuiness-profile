import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { MessageSquare, User, Send, CheckCircle2, Clock, Globe } from 'lucide-react';
import { AGENT_LANGUAGES } from '../../lib/languages';
import { ProxyGoogleGenAI } from '../../lib/gemini';

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerLang?: string;
  lastMessage: string;
  status: 'Active' | 'Queued' | 'Closed';
  updatedAt: any;
  profileId: string;
}

interface Message {
  id: string;
  text: string;
  senderType: 'Customer' | 'Agent' | 'AI';
  timestamp: any;
  translations?: Record<string, string>;
  originalText?: string;
}

export default function LiveAgentPanel({ profileId }: { profileId: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agentLang, setAgentLang] = useState(() => {
    try {
      return localStorage.getItem('agent_chat_lang') || 'en';
    } catch {
      return 'en';
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const ai = new ProxyGoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  // Listen to sessions
  useEffect(() => {
    if (!user) return;

    // If profileId is 'platform', we show ALL sessions (Super Agent mode)
    // For others, we listen for chats where they are priority or fallback
    const sessionsRef = collection(db, 'chat_sessions');
    
    let q;
    if (profileId === 'platform') {
      q = query(sessionsRef, orderBy('updatedAt', 'desc'));
    } else {
      // Default: show sessions for this profile or fallback
      q = query(
        sessionsRef,
        where('ownerId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let sessData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Sort by updatedAt descending
      sessData.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });

      setSessions(sessData);
    }, (error) => {
      import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.LIST, 'chat_sessions');
      });
    });

    return () => unsubscribe();
  }, [profileId, user]);

  // Listen to messages for selected session
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `chat_sessions/${selectedSessionId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgData);
    }, (error) => {
      import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.LIST, `chat_sessions/${selectedSessionId}/messages`);
      });
    });

    return () => unsubscribe();
  }, [selectedSessionId]);

  // Auto-translate incoming customer messages
  useEffect(() => {
    if (!selectedSessionId || messages.length === 0) return;
    
    const translateMessages = async () => {
      // Only target the last message from customer if it hasn't been translated
      const lastMsg = [...messages].reverse().find(m => m.senderType === 'Customer');
      if (!lastMsg) return;

      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      const cusLang = selectedSession?.customerLang || 'en';
      
      if (cusLang !== agentLang && (!lastMsg.translations || !lastMsg.translations[agentLang])) {
        try {
          const prompt = `Translate the following text to ${AGENT_LANGUAGES.find(l => l.id === agentLang)?.label || agentLang}. Output ONLY the translated text, without any additional comments:\n\n${lastMsg.text}`;
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });
          const result = response.text;
          
          if (result) {
            await updateDoc(doc(db, `chat_sessions/${selectedSessionId}/messages`, lastMsg.id), {
              [`translations.${agentLang}`]: result.trim()
            });
          }
        } catch (err: any) {
          console.error("Translation fail:", err);
          if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
            // Silently fail for auto-translation to avoid spamming the console
            // The UI will show "Translating..." or similar for a bit
          }
        }
      }
    };

    translateMessages();
  }, [messages, agentLang, selectedSessionId, sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const changeAgentLang = (lang: string) => {
    setAgentLang(lang);
    localStorage.setItem('agent_chat_lang', lang);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedSessionId) return;

    const text = input.trim();
    setInput('');
    setIsTranslating(true);

    let sentText = text;
    let originalText = text;
    let translations: any = {};

    const sess = sessions.find(s => s.id === selectedSessionId);
    const cusLang = sess?.customerLang || 'en';

    try {
      if (agentLang !== cusLang) {
        // Translate agent's message into customer's language
        const prompt = `Translate the following text from ${AGENT_LANGUAGES.find(l => l.id === agentLang)?.label || agentLang} to ${cusLang}. Output ONLY the translated text, without any additional comments:\n\n${text}`;
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });
          const result = response.text;
          if (result) {
            sentText = result.trim();
            translations[cusLang] = sentText;
            translations[agentLang] = text;
          }
        } catch (genAiErr: any) {
          console.error("Gemini translation error:", genAiErr);
          if (genAiErr.message?.includes('429')) {
             alert("AI Translation is currently busy. Sending message in your language instead.");
          }
        }
      }

      await addDoc(collection(db, `chat_sessions/${selectedSessionId}/messages`), {
        senderType: 'Agent',
        text: sentText,
        originalText,
        translations,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'chat_sessions', selectedSessionId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        status: 'Active'
      });
    } catch (err) {
      console.error("Error sending message:", err);
      try {
        const { handleFirestoreError, OperationType } = await import('../../lib/firestoreUtils');
        handleFirestoreError(err, OperationType.WRITE, `chat_sessions/${selectedSessionId}`);
      } catch (e) {}
    } finally {
      setIsTranslating(false);
    }
  };

  const closeSession = async (id: string) => {
    try {
      await updateDoc(doc(db, 'chat_sessions', id), {
        status: 'Closed',
        updatedAt: serverTimestamp()
      });
      if (selectedSessionId === id) setSelectedSessionId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* Sessions List */}
        <div className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-100 flex-col bg-slate-50/30`}>
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600" /> Active Chats
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold">No active chat requests.</p>
              </div>
            ) : (
              sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`w-full p-4 text-left border-b border-slate-100 transition-all flex items-center gap-3 ${selectedSessionId === s.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-white'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${s.status === 'Queued' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {s.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm text-slate-900 truncate tracking-tight">{s.customerName}</span>
                      {s.status === 'Queued' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-2">
                       {profileId === 'platform' && (
                         <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">{s.profileId}</span>
                       )}
                       <p className="text-[10px] text-slate-500 truncate font-medium">{s.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedSessionId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
          {selectedSessionId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedSessionId(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                    {selectedSession?.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 m-0">{selectedSession?.customerName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 m-0">{selectedSession?.customerEmail || 'Guest User'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition">
                      <Globe size={14} />
                      {AGENT_LANGUAGES.find(l => l.id === agentLang)?.label || 'Language'}
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 z-10 w-32">
                      {AGENT_LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => changeAgentLang(lang.id)}
                          className={`block w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition ${agentLang === lang.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => closeSession(selectedSessionId)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Close Chat
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/20">
                {messages.map((m, i) => {
                  const isAgent = m.senderType === 'Agent';
                  const isAI = m.senderType === 'AI';
                  let displayMessage = m.text;
                  let subtitleInfo: React.ReactNode = null;

                  if (isAgent) {
                    if (m.originalText && agentLang === selectedSession?.customerLang) {
                      displayMessage = m.originalText;
                    } else if (m.originalText) {
                      displayMessage = m.translations?.[agentLang] || m.originalText;
                    } else {
                      displayMessage = m.text;
                    }
                  } else {
                    if (agentLang !== selectedSession?.customerLang && m.translations?.[agentLang]) {
                       displayMessage = m.translations[agentLang];
                       subtitleInfo = <span className="opacity-75">Translated from {selectedSession?.customerLang}</span>;
                    } else if (agentLang !== selectedSession?.customerLang) {
                       subtitleInfo = <span className="opacity-75 italic text-slate-300">Translating...</span>;
                    }
                  }

                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col ${isAgent ? 'items-end' : (isAI ? 'items-center' : 'items-start')}`}
                    >
                      {isAI && (
                         <div className="bg-slate-100 text-slate-400 py-1 px-3 rounded-full text-[9px] font-bold mb-2 uppercase tracking-widest border border-slate-200">
                           AI Assisted Handled
                         </div>
                      )}
                      <div 
                        className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm font-medium shadow-sm border ${
                          isAgent 
                            ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                            : 'bg-white text-slate-900 border-slate-100 rounded-tl-none'
                        }`}
                      >
                        {displayMessage}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[9px] font-bold text-slate-400">
                          {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                        {subtitleInfo && (
                          <span className="text-[9px] font-bold text-slate-400">• {subtitleInfo}</span>
                        )}
                        {isAgent && selectedSession?.customerLang && selectedSession.customerLang !== agentLang && (
                           <span className="text-[9px] font-bold text-slate-400">• Sent in {selectedSession.customerLang}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a professional response..."
                    className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <MessageSquare size={40} className="opacity-20" />
              </div>
              <h3 className="text-slate-900 font-black text-lg m-0 uppercase tracking-tight">Select a conversation</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Pick an active customer from the list to start a real-time support session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
