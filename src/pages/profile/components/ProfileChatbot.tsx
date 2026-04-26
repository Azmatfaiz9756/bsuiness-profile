import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Briefcase } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function ProfileChatbot({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'ar' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetings = {
    hi: `Aadaab! Main ${profile?.name} ka AI assistant hoon. Main aapki kis tarah madad kar sakta hoon?`,
    en: `Hello! I'm the AI assistant for ${profile?.name}. How can I assist you today?`,
    ar: `مرحباً! أنا المساعد الذكي لـ ${profile?.name}. كيف يمكنني مساعدتك اليوم؟`
  };

  const prompts = {
    hi: `Aap ${profile?.name} ke ek behad muhazzib (polite) AI assistant hain. 
Aapko hamesha North Indian Hindustani (Urdu-Hindi mix) mein baat karni hai, jisme tehzeeb aur tameez jhalakti ho. 
Sanskrit-heavy shabd (words) ka istemal bilkul na karein. 'Aap', 'Farmayiye', 'Shukriya', 'Tashreef rakhiye' jaise alfaz ka istemal karein.
Context: Aap ${profile?.name} (Title: ${profile?.title} at ${profile?.company}) ko represent karte hain.
Bio: ${profile?.bio}.`,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (customMessage?: string) => {
    const textToSend = customMessage !== undefined ? customMessage : input.trim();
    if (!textToSend || loading || !selectedLang) return;
    
    if (customMessage === undefined) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      contents.push({
        role: 'user',
        parts: [{ text: textToSend }]
      });

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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 20, right: 20, width: 60, height: 60, 
          borderRadius: '50%', background: '#2563eb', color: '#fff', 
          border: 'none', cursor: 'pointer', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)', zIndex: 100
        }}
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 350, height: 500, 
      background: '#fff', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 100, overflow: 'hidden'
    }}>
      <div style={{ background: '#2563eb', color: '#fff', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={20} />
          <span style={{ fontWeight: 600 }}>{profile?.name} AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
        {!selectedLang ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Bot size={48} color="#2563eb" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Select Language</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginBottom: 16 }}>Choose how you would like to interact with {profile?.name}'s AI Assistant.</p>
            
            <button onClick={() => setSelectedLang('en')} style={{ width: '80%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🇬🇧 English (Business)
            </button>
            <button onClick={() => setSelectedLang('hi')} style={{ width: '80%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🇮🇳 Hindustani (Tehzeeb)
            </button>
            <button onClick={() => setSelectedLang('ar')} style={{ width: '80%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🇦🇪 Arabic (Formal)
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ background: msg.role === 'user' ? '#2563eb' : '#fff', color: msg.role === 'user' ? '#fff' : '#1e293b', border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 12, borderBottomRightRadius: msg.role === 'user' ? 0 : 12, borderBottomLeftRadius: msg.role === 'model' ? 0 : 12, fontSize: 14, lineHeight: 1.5 }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
              {selectedLang === 'hi' ? 'Aapka jawab likha jaa raha hai...' : selectedLang === 'ar' ? 'جارٍ كتابة الرد...' : 'AI is typing...'}
            </div>}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {selectedLang && messages.length <= 1 && (
         <div style={{ padding: '0 12px 12px', background: '#f8fafc' }}>
           <button 
             onClick={() => sendMessage(selectedLang === 'hi' ? "Aapke business aur mukhya services ke baare mein thoda tafseel se bataiye." : selectedLang === 'ar' ? "أخبرني المزيد عن أعمالك وخدماتك الرئيسية." : "Tell me more about your business and key services.")}
             style={{
               width: '100%', padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', 
               borderRadius: 8, fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', 
               gap: 8, cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
             }}
           >
             <Briefcase size={16} color="#2563eb" />
             <span>{selectedLang === 'hi' ? 'Business & Services samjhaiye' : selectedLang === 'ar' ? 'اشرح لي الخدمات والعمل' : 'Explain Business & Services'}</span>
           </button>
         </div>
      )}

      {selectedLang && (
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, background: '#fff' }}>
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={selectedLang === 'hi' ? "Apna sawaal puchiye..." : selectedLang === 'ar' ? "اسأل سؤالك..." : "Ask a question..."} 
            style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid #cbd5e1', outline: 'none' }} 
          />
          <button onClick={() => sendMessage()} style={{ background: '#2563eb', color: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
        </div>
      )}
    </div>
  );
}
