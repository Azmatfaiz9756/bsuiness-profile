import React, { useState } from 'react';
import { UserPlus, CheckCircle, X } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from '../../../lib/translations';

export default function LeadCapture({ profile }: { profile: any }) {
  const t = useTranslation(profile.isRtl);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitForm = async () => {
    if (!name || !email) return alert('Name and Email are required');
    setLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        profileId: profile.id,
        ownerId: profile.ownerId || profile.userId || null,
        name,
        email,
        phone,
        company,
        message,
        source: 'Exchange Contact',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (e) {
      alert('Failed to send info.');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none py-3.5 px-4 rounded-xl font-bold cursor-pointer transition-all shadow-md mt-4 text-sm sm:text-base">
        <UserPlus size={18} /> {t.exchangeContacts || "Exchange Contact"}
      </button>

      {isOpen && (
        <div dir={profile.isRtl ? 'rtl' : 'ltr'} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 sm:pb-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full border-none cursor-pointer transition-colors">
              <X size={20} />
            </button>
            <div className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">{t.infoSent}</h3>
                  <p className="text-slate-500 mb-8 font-medium">{profile.name} {t.willBeInTouch}</p>
                  <button onClick={() => { setSuccess(false); setIsOpen(false); }} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold border-none cursor-pointer w-full transition-colors">{t.done}</button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">{t.exchangeContacts}</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">{t.shareDetailsWith} {String(profile?.name || 'User').split(' ')[0]}</p>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">{t.fullName} *</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border" placeholder={t.yourName} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">{t.email} *</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border" placeholder={t.yourEmail} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">{t.phone}</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border" placeholder="+1..." />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">{t.acmeIncPlaceholder}</label>
                        <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border" placeholder={t.acmeIncPlaceholder} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">{t.noteOptional}</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border resize-none" placeholder={t.notePlaceholder} rows={2} />
                    </div>

                    <button onClick={submitForm} disabled={loading} className="mt-4 w-full bg-slate-900 text-white font-extrabold py-3.5 rounded-xl border-none cursor-pointer hover:bg-slate-800 disabled:opacity-70 transition-colors">
                      {loading ? t.sending : t.sendInfo}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
