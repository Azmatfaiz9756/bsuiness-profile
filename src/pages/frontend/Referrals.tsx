import React from 'react';
import { Share2, Users, Gift, TrendingUp, Copy } from 'lucide-react';

export default function FrontendReferrals() {
  const referralCode = 'DBC-REF-99X';
  const referralLink = `https://dbc.ae/join?ref=${referralCode}`;

  const copyRef = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-8 md:p-12 rounded-3xl text-center mb-8 shadow-lg shadow-blue-500/20">
        <Gift size={48} className="mx-auto mb-6 text-white" />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Refer & Earn Wallet Money</h1>
        <p className="text-base md:text-lg text-blue-50 max-w-xl mx-auto mb-8 leading-relaxed">
          Invite other businesses to join Dubai Digital Connect. You both get AED 50 in your wallet when they activate their profile.
        </p>
        <div className="bg-white p-2 rounded-xl flex flex-col md:flex-row gap-2 max-w-md mx-auto shadow-sm">
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
            className="flex-1 border-none bg-transparent px-4 py-2 md:py-0 text-sm font-medium text-slate-900 outline-none text-center md:text-left"
          />
          <button onClick={copyRef} className="bg-slate-900 text-white border-none px-6 py-2.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <Users size={20} />
            <div className="font-semibold text-sm">Total Referrals</div>
          </div>
          <div className="text-3xl font-black text-slate-900">12</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <TrendingUp size={20} />
            <div className="font-semibold text-sm">Active Conversions</div>
          </div>
          <div className="text-3xl font-black text-emerald-600">8</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <Gift size={20} />
            <div className="font-semibold text-sm">Total Earned</div>
          </div>
          <div className="text-3xl font-black text-blue-600">AED 400</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold mb-6">Recent Referrals</h2>
        <div className="flex flex-col">
          {[
            { name: 'Khaled Properties', date: 'Oct 12, 2026', status: 'Completed', amount: '+AED 50' },
            { name: 'Design House Studio', date: 'Oct 10, 2026', status: 'Pending', amount: 'AED 0' },
            { name: 'Tech Solutions LLC', date: 'Oct 05, 2026', status: 'Completed', amount: '+AED 50' }
          ].map((r, i) => (
            <div key={i} className={`flex items-center justify-between py-4 ${i < 2 ? 'border-b border-slate-100' : ''}`}>
              <div>
                <div className="font-bold text-slate-900 mb-1">{r.name}</div>
                <div className="text-sm text-slate-500">{r.date}</div>
              </div>
              <div className="text-right">
                <div className={`font-black mb-1 ${r.status === 'Completed' ? 'text-emerald-600' : 'text-slate-500'}`}>{r.amount}</div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
