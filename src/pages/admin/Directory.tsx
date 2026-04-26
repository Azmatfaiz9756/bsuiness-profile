import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AdminDirectory() {
  const { profiles, setProfiles } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.company.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'featured') return matchesSearch && p.featured;
      if (filter === 'vip') return matchesSearch && p.plan === 'VIP Executive';
      return matchesSearch;
    });
  }, [profiles, searchTerm, filter]);

  const toggleFeatured = (id: string) => {
    setProfiles(profiles.map((p: any) => p.id === id ? { ...p, featured: !p.featured } : p));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Business Directory</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage public visibility of all member profiles.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="topbar-btn" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }}>Export CSV</button>
           <button className="topbar-btn btn-gold">Publish Updates</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">TOTAL MEMBERS</div>
          <div className="stat-value">{profiles.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">FEATURED</div>
          <div className="stat-value">{profiles.filter((p: any) => p.featured).length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">DIRECTORY VIEWS</div>
          <div className="stat-value">42.8K</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">CONVERSION</div>
          <div className="stat-value">12.5%</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
           <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
             <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
               type="text" 
               placeholder="Search by name, company, or ID..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14 }}
             />
           </div>
           <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'featured', 'vip'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ 
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: filter === f ? '#0f172a' : '#f1f5f9',
                    color: filter === f ? '#fff' : '#64748b'
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>MEMBER</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>COMPANY</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>PLAN</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>VISIBILITY</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb' }}>{p.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: 14, color: '#334155' }}>{p.company}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: p.plan.includes('VIP') ? '#fefce8' : '#eff6ff',
                      color: p.plan.includes('VIP') ? '#a16207' : '#1e40af'
                    }}>
                      {p.plan}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 13, fontWeight: 500 }}>
                      <CheckCircle size={14} /> Active
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <div style={{ width: 32, height: 16, background: p.featured ? '#2563eb' : '#e2e8f0', borderRadius: 10, position: 'relative', cursor: 'pointer' }} onClick={() => toggleFeatured(p.id)}>
                         <div style={{ width: 12, height: 12, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: p.featured ? 18 : 2, transition: 'all 0.2s' }}></div>
                       </div>
                       <span style={{ fontSize: 12, color: p.featured ? '#2563eb' : '#64748b', fontWeight: 600 }}>{p.featured ? 'Featured' : 'Standard'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                       <a href={`/profile/${p.slug}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#f1f5f9', color: '#475569', padding: '6px', borderRadius: 6 }}>
                         <Search size={14} />
                       </a>
                       <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }}>
                         <ArrowUpRight size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProfiles.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No profiles found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}
