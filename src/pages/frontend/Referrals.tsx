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
    <div className="section" style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: '#fff', padding: 40, borderRadius: 24, textAlign: 'center', marginBottom: 32 }}>
        <Gift size={48} style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Refer & Earn Wallet Money</h1>
        <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 500, margin: '0 auto 24px' }}>
          Invite other businesses to join Dubai Digital Connect. You both get AED 50 in your wallet when they activate their profile.
        </p>
        <div style={{ background: '#fff', padding: 8, borderRadius: 12, display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
          <input 
            type="text" 
            value={referralLink} 
            readOnly 
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 12px', fontSize: 14, color: '#111827', outline: 'none' }} 
          />
          <button onClick={copyRef} style={{ background: '#111827', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#6b7280' }}>
            <Users size={20} />
            <div style={{ fontWeight: 600 }}>Total Refferals</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>12</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#6b7280' }}>
            <TrendingUp size={20} />
            <div style={{ fontWeight: 600 }}>Active Conversions</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#059669' }}>8</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#6b7280' }}>
            <Gift size={20} />
            <div style={{ fontWeight: 600 }}>Total Earned</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>AED 400</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 32, borderRadius: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Recent Referrals</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'Khaled Properties', date: 'Oct 12, 2026', status: 'Completed', amount: '+AED 50' },
            { name: 'Design House Studio', date: 'Oct 10, 2026', status: 'Pending', amount: 'AED 0' },
            { name: 'Tech Solutions LLC', date: 'Oct 05, 2026', status: 'Completed', amount: '+AED 50' }
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{r.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: r.status === 'Completed' ? '#059669' : '#6b7280', marginBottom: 4 }}>{r.amount}</div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: r.status === 'Completed' ? '#dcfce7' : '#f3f4f6', color: r.status === 'Completed' ? '#059669' : '#4b5563', display: 'inline-block' }}>{r.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
