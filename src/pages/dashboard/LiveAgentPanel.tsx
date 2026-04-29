import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { MessageSquare, User, Send, CheckCircle2, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail?: string;
  lastMessage: string;
  status: 'Active' | 'Queued' | 'Closed';
  updatedAt: any;
}

interface Message {
  id: string;
  text: string;
  senderType: 'Customer' | 'Agent' | 'AI';
  timestamp: any;
}

export default function LiveAgentPanel({ profileId }: { profileId: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to sessions
  useEffect(() => {
    const q = query(
      collection(db, 'chat_sessions'),
      where('profileId', '==', profileId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      setSessions(sessData);
    }, (error) => {
      import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.LIST, 'chat_sessions');
      });
    });

    return () => unsubscribe();
  }, [profileId]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedSessionId) return;

    const text = input.trim();
    setInput('');

    try {
      await addDoc(collection(db, `chat_sessions/${selectedSessionId}/messages`), {
        senderType: 'Agent',
        text,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'chat_sessions', selectedSessionId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        status: 'Active'
      });
    } catch (err) {
      console.error("Error sending message:", err);
      import('../../lib/firestoreUtils').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(err, OperationType.WRITE, `chat_sessions/${selectedSessionId}`);
      });
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
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
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
                    <p className="text-[10px] text-slate-500 truncate font-medium">{s.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {selectedSessionId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                    {selectedSession?.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 m-0">{selectedSession?.customerName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 m-0">{selectedSession?.customerEmail || 'Guest User'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => closeSession(selectedSessionId)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                >
                  Close Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/20">
                {messages.map((m, i) => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${m.senderType === 'Agent' ? 'items-end' : (m.senderType === 'AI' ? 'items-center' : 'items-start')}`}
                  >
                    {m.senderType === 'AI' && (
                       <div className="bg-slate-100 text-slate-400 py-1 px-3 rounded-full text-[9px] font-bold mb-2 uppercase tracking-widest border border-slate-200">
                         AI Assisted Handled
                       </div>
                    )}
                    <div 
                      className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm font-medium shadow-sm border ${
                        m.senderType === 'Agent' 
                          ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                          : 'bg-white text-slate-900 border-slate-100 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                      {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                ))}
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
