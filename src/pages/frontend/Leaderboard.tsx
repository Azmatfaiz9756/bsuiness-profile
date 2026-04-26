import React, { useState } from 'react';
import { Trophy, TrendingUp, Medal, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendLeaderboard() {
  const { profiles } = useAppContext();
  const [filter, setFilter] = useState('monthly');

  // Sort profiles by views to simulate leaderboard ranking
  const sortedProfiles = [...profiles].sort((a, b) => b.views - a.views);

  return (
    <div className="section" style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', color: '#d97706', width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }}>
          <Trophy size={32} />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111827', marginBottom: 16 }}>DBC Leaderboard</h1>
        <p style={{ fontSize: 16, color: '#4b5563', maxWidth: 600, margin: '0 auto 24px' }}>
          Discover the top networking professionals in the UAE. Rankings are based on profile visits, connections made, and referrals.
        </p>

        <div style={{ display: 'inline-flex', background: '#f3f4f6', padding: 4, borderRadius: 12 }}>
          {['all-time', 'monthly', 'weekly'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '8px 24px', border: 'none', background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#111827' : '#6b7280', fontWeight: 600, borderRadius: 8, cursor: 'pointer', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', textTransform: 'capitalize' }}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 16, alignItems: 'end', marginBottom: 40 }}>
        {/* Rank 2 */}
        {sortedProfiles[1] && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: '#d1d5db', color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid #fff' }}>2</div>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>{sortedProfiles[1].avatar}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{sortedProfiles[1].name}</h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{sortedProfiles[1].company}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              <TrendingUp size={14} /> {sortedProfiles[1].views} Points
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {sortedProfiles[0] && (
          <div style={{ background: 'linear-gradient(to bottom, #fff, #fefce8)', border: '2px solid #fde047', borderRadius: 20, padding: 32, textAlign: 'center', position: 'relative', boxShadow: '0 10px 25px -5px rgba(253, 224, 71, 0.4)', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', background: '#eab308', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '3px solid #fff' }}>1</div>
            <Medal size={40} color="#eab308" style={{ position: 'absolute', top: 16, right: 16, opacity: 0.2 }} />
            <div style={{ width: 100, height: 100, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, border: '4px solid #fef08a' }}>{sortedProfiles[0].avatar}</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{sortedProfiles[0].name}</h3>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>{sortedProfiles[0].company}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '6px 16px', borderRadius: 12, fontSize: 15, fontWeight: 800, color: '#b45309' }}>
              <Star size={16} fill="#b45309" color="#b45309" /> {sortedProfiles[0].views} Points
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {sortedProfiles[2] && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: '#b45309', color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid #fff' }}>3</div>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>{sortedProfiles[2].avatar}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{sortedProfiles[2].name}</h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{sortedProfiles[2].company}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              <TrendingUp size={14} /> {sortedProfiles[2].views} Points
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {sortedProfiles.slice(3).map((p, idx) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: idx < sortedProfiles.slice(3).length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <div style={{ width: 30, fontWeight: 700, color: '#9ca3af' }}>{idx + 4}</div>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #475569, #64748b)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginRight: 16 }}>{p.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{p.company}</div>
            </div>
            <div style={{ fontWeight: 800, color: '#3b82f6' }}>{p.views} <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>pts</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
