import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Briefcase, Languages, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";

export default function ProfileChatbot({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'ar' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetings = {
    hi: `Namaste! Main ${profile?.name} ka AI assistant hoon. Main aapki kaise madad kar sakta hoon?`,
    en: `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`,
    ar: `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`
  };

  const prompts = {
    hi: `Aap ${profile?.name} ke AI assistant hain. Aapko hamesha North India ki aam Hindustani (Hindi-Urdu mix) mein baat karni hai jo Delhi style mein boli jati hai.
Polite rahein aur 'Aap' ka use karein, lekin bohot zyada mushkil Urdu words use na karein. 
Simple words zyada use karein, sanskrit-heavy words (jaise 'vistar', 'mukhya', 'adhik') bilkul use na karein. Unki jagah 'zyada info', 'khas', 'zyada' use karein.
Lehja (tone) friendly aur helpful hona chahiye.
Context: Aap ${profile?.name} (Title: ${profile?.title} at ${profile?.company}) ko represent karte hain.
Bio: ${profile?.bio}.`,
    en: `You are a professional AI business assistant for ${profile?.name} (Title: ${profile?.title} at ${profile?.company}).
Your tone should be helpful, clear, and professional. 
Context: ${profile?.bio}. Contact: Email: ${profile?.email}, Phone: ${profile?.phone}.`,
    ar: `أنت مساعد ذكي محترف لـ ${profile?.name} (المسمى الوظيفي: ${profile?.title} في ${profile?.company}).
يجب أن يكون أسلوبك محترماً ولبقاً باللغة العربية (لهجة خليجية بيضاء أو فصحى مهذبة).
السياق: ${profile?.bio}. التواصل: البريد: ${profile?.email}, الهاتف: ${profile?.phone}.`
  };

  // Persist language and history
  useEffect(() => {
    const savedLang = localStorage.getItem(`chat_lang_${profile?.id}`);
    if (savedLang) setSelectedLang(savedLang as any);

    const savedHistory = localStorage.getItem(`chat_history_${profile?.id}`);
    if (savedHistory) {
      try { setMessages(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, [profile?.id]);

  useEffect(() => {
    if (selectedLang) {
       localStorage.setItem(`chat_lang_${profile?.id}`, selectedLang);
       if (messages.length === 0) {
         setMessages([{ role: 'model', content: greetings[selectedLang] }]);
       }
    }
  }, [selectedLang, profile?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${profile?.id}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, profile?.id]);

  const clearChat = () => {
    if (window.confirm('Delete chat history?')) {
      setMessages([{ role: 'model', content: greetings[selectedLang || 'en'] }]);
      localStorage.removeItem(`chat_history_${profile?.id}`);
    }
  };

  const changeLanguage = () => {
    setSelectedLang(null);
    setMessages([]);
    localStorage.removeItem(`chat_history_${profile?.id}`);
    localStorage.removeItem(`chat_lang_${profile?.id}`);
  };

  const sendMessage = async (customMessage?: string) => {
    const textToSend = customMessage !== undefined ? customMessage : input.trim();
    if (!textToSend || loading || !selectedLang) return;
    
    if (customMessage === undefined) setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents = newMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: profile?.aiPrompt || prompts[selectedLang],
        },
        contents: contents,
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Connection issue.' }]);
      }
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setMessages(prev => [...prev, { role: 'model', content: 'Error connecting to AI.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
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
              width: 60, height: 60, borderRadius: '50%', background: '#2563eb', 
              color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            }}
          >
            <Bot size={30} />
          </motion.button>
        ) : (
          <motion.div 
            key="chat-window"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            style={{
              width: window.innerWidth < 400 ? '90vw' : 350, 
              height: window.innerHeight < 600 ? '70vh' : 500, 
              bottom: window.innerWidth < 400 ? 10 : 20,
              right: window.innerWidth < 400 ? '5vw' : 20,
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
                  
                  {[
                    { id: 'en', label: 'English (Business)', flag: '🇬🇧' },
                    { id: 'hi', label: 'Hindustani (Urdu/Hindi)', flag: '🇮🇳' },
                    { id: 'ar', label: 'Arabic (العربية)', flag: '🇦🇪' }
                  ].map(lang => (
                    <motion.button 
                      key={lang.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLang(lang.id as any)} 
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
                </motion.div>
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

            {selectedLang && (
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
