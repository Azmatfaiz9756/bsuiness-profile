import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, CreditCard } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendWallet() {
  const { walletBalance, siteSettings } = useAppContext();

  return (
    <div className="section" style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ background: '#111827', borderRadius: 24, padding: 32, color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Wallet size={24} color="#9ca3af" />
          <div style={{ fontSize: 13, color: '#9ca3af', letterSpacing: 1, fontWeight: 700 }}>AVAILABLE BALANCE</div>
        </div>
        
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -1, marginBottom: 32 }}>
          <span style={{ fontSize: 24, color: '#9ca3af', fontWeight: 600, marginRight: 8 }}>{siteSettings.currency}</span>
          {walletBalance.toFixed(2)}
        </div>
        
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Total Earned (Referrals)</div>
            <div style={{ fontSize: 16, color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpRight size={16} /> {siteSettings.currency} 580.00
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Total Spent (Shop)</div>
            <div style={{ fontSize: 16, color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowDownRight size={16} /> {siteSettings.currency} 240.00
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Transaction History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { desc: 'Referral earned — Zaid Mohammed', time: 'Today, 2:30 PM', amt: '+20.00', type: 'plus' },
              { desc: 'Wallet top-up via Card', time: 'Today, 11:00 AM', amt: '+200.00', type: 'plus' },
              { desc: 'Shop purchase — NFC Sticker Pack', time: 'Yesterday, 4:15 PM', amt: '-100.00', type: 'minus' },
              { desc: 'Referral earned — Khaled Properties', time: 'Oct 12, 2026', amt: '+50.00', type: 'plus' },
            ].map((t, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: idx < 3 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.type === 'plus' ? '#dcfce7' : '#fee2e2', color: t.type === 'plus' ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.type === 'plus' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginBottom: 4 }}>{t.desc}</div>
                   <div style={{ fontSize: 12, color: '#6b7280' }}>{t.time}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.type === 'plus' ? '#059669' : '#111827' }}>
                  {t.type === 'plus' ? '+' : ''}{siteSettings.currency} {t.amt.replace('+', '').replace('-', '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, height: 'fit-content' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Top Up Wallet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <button style={{ padding: '12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{siteSettings.currency} 50</button>
            <button style={{ padding: '12px', border: '2px solid #2563eb', background: '#eff6ff', color: '#1e40af', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{siteSettings.currency} 100</button>
            <button style={{ padding: '12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{siteSettings.currency} 200</button>
            <button style={{ padding: '12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{siteSettings.currency} 500</button>
          </div>
          
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input type="number" placeholder="Custom amount" style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }} />
            <span style={{ position: 'absolute', right: 16, top: 12, color: '#9ca3af', fontWeight: 600 }}>{siteSettings.currency}</span>
          </div>

          <button style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', padding: '16px', borderRadius: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
            <CreditCard size={18} /> Pay via Card
          </button>
        </div>
      </div>
    </div>
  );
}
