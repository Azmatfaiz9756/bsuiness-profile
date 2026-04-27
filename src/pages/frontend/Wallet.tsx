import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, CreditCard } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendWallet() {
  const { walletBalance, siteSettings } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Wallet size={24} className="text-slate-400" />
          <div className="text-sm text-slate-400 tracking-wider font-bold">AVAILABLE BALANCE</div>
        </div>
        
        <div className="text-5xl md:text-6xl font-black tracking-tight mb-10 relative z-10">
          <span className="text-2xl md:text-3xl text-slate-400 font-semibold mr-3">{siteSettings.currency}</span>
          {walletBalance.toFixed(2)}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 relative z-10">
          <div>
            <div className="text-xs md:text-sm text-slate-400 mb-1">Total Earned (Referrals)</div>
            <div className="text-base md:text-lg text-emerald-400 font-bold flex items-center gap-1.5">
              <ArrowUpRight size={18} /> {siteSettings.currency} 580.00
            </div>
          </div>
          <div>
            <div className="text-xs md:text-sm text-slate-400 mb-1">Total Spent (Shop)</div>
            <div className="text-base md:text-lg text-red-400 font-bold flex items-center gap-1.5">
              <ArrowDownRight size={18} /> {siteSettings.currency} 240.00
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] gap-6 md:gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg md:text-xl font-extrabold mb-6">Transaction History</h3>
          <div className="flex flex-col">
            {[
              { desc: 'Referral earned — Zaid Mohammed', time: 'Today, 2:30 PM', amt: '+20.00', type: 'plus' },
              { desc: 'Wallet top-up via Card', time: 'Today, 11:00 AM', amt: '+200.00', type: 'plus' },
              { desc: 'Shop purchase — NFC Sticker Pack', time: 'Yesterday, 4:15 PM', amt: '-100.00', type: 'minus' },
              { desc: 'Referral earned — Khaled Properties', time: 'Oct 12, 2026', amt: '+50.00', type: 'plus' },
            ].map((t, idx) => (
              <div key={idx} className={`flex items-center gap-4 py-4 ${idx < 3 ? 'border-b border-slate-100' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'plus' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {t.type === 'plus' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                   <div className="text-sm md:text-base text-slate-900 font-bold mb-0.5 truncate">{t.desc}</div>
                   <div className="text-xs md:text-sm text-slate-500">{t.time}</div>
                </div>
                <div className={`text-base md:text-lg font-black whitespace-nowrap ${t.type === 'plus' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'plus' ? '+' : ''}{siteSettings.currency} {t.amt.replace('+', '').replace('-', '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 h-fit shadow-sm mt-6 md:mt-0">
          <h3 className="text-lg md:text-xl font-extrabold mb-6">Top Up Wallet</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors">{siteSettings.currency} 50</button>
            <button className="py-3 border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-xl font-black">{siteSettings.currency} 100</button>
            <button className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors">{siteSettings.currency} 200</button>
            <button className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors">{siteSettings.currency} 500</button>
          </div>
          
          <div className="relative mb-6">
            <input type="number" placeholder="Custom amount" className="w-full py-3.5 pl-4 pr-16 border border-slate-300 rounded-xl text-base font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            <span className="absolute right-4 top-3.5 text-slate-400 font-bold">{siteSettings.currency}</span>
          </div>

          <button className="w-full bg-slate-900 text-white border-none py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <CreditCard size={18} /> Pay via Card
          </button>
        </div>
      </div>
    </div>
  );
}
