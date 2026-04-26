import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { LayoutGrid, List } from 'lucide-react';

export default function FrontendHome() {
  const { profiles, user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Business Types');
  const [activeCity, setActiveCity] = useState('All Cities');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All Business Types', 'Technology', 'Real Estate', 'Finance', 'Consulting', 'Design'];
  const cities = ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Simple category matching for demo purposes based on job title/company
    let profileCat = 'All Business Types';
    if (p.title?.toLowerCase().includes('tech') || p.title?.toLowerCase().includes('engineer')) profileCat = 'Technology';
    else if (p.company?.toLowerCase().includes('real estate')) profileCat = 'Real Estate';
    else if (p.company?.toLowerCase().includes('capital') || p.title?.toLowerCase().includes('finance')) profileCat = 'Finance';
    else if (p.title?.toLowerCase().includes('consultant')) profileCat = 'Consulting';
    else if (p.title?.toLowerCase().includes('design') || p.title?.toLowerCase().includes('creative')) profileCat = 'Design';
    else profileCat = 'Technology'; // Fallback
    
    const matchesCategory = activeCategory === 'All Business Types' || profileCat === activeCategory;

    let profileCity = 'Remote';
    if (p.address?.toLowerCase().includes('dubai')) profileCity = 'Dubai';
    else if (p.address?.toLowerCase().includes('abu dhabi')) profileCity = 'Abu Dhabi';
    else if (p.address?.toLowerCase().includes('sharjah')) profileCity = 'Sharjah';
    const matchesCity = activeCity === 'All Cities' || profileCity === activeCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
      {/* Brand Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: '80px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
         <div style={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
         
         <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 24, border: '1px solid rgba(255,255,255,0.2)' }}>
              THE PREMIER BUSINESS DIRECTORY
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
              Discover Leading <br />
              <span style={{ color: '#38bdf8' }}>Brands & Professionals</span>
            </h1>
            <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Connect with verified experts, executives, and top-tier companies. Explore their interactive digital profiles and portfolios.
            </p>

            {/* Global Search Bar */}
            <div style={{ display: 'flex', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <span style={{ fontSize: 20, marginRight: 12 }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name, profession, or company..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', border: 'none', padding: '12px 0', fontSize: 16, outline: 'none', color: '#0f172a' }} 
                />
              </div>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '-20px auto 0', position: 'relative', zIndex: 10, padding: '0 20px' }}>
         {/* Filters & View Toggle */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
               <select 
                 value={activeCategory} 
                 onChange={e => setActiveCategory(e.target.value)}
                 style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 600, outline: 'none' }}
               >
                 {categories.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>

               <select 
                 value={activeCity} 
                 onChange={e => setActiveCity(e.target.value)}
                 style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 600, outline: 'none' }}
               >
                 {cities.map(city => (
                   <option key={city} value={city}>{city}</option>
                 ))}
               </select>
            </div>
            
            <div style={{ display: 'flex', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
               <button 
                 onClick={() => setViewMode('grid')}
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', border: 'none', background: viewMode === 'grid' ? '#0f172a' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
               >
                 <LayoutGrid size={18} />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', border: 'none', background: viewMode === 'list' ? '#0f172a' : 'transparent', color: viewMode === 'list' ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
               >
                 <List size={18} />
               </button>
            </div>
         </div>

         {/* Directory Display */}
         <div style={
           viewMode === 'grid' 
             ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }
             : { display: 'flex', flexDirection: 'column', gap: 16 }
         }>
           {filteredProfiles.length > 0 ? filteredProfiles.map((p, idx) => (
              <div key={p.id} style={
                viewMode === 'grid'
                 ? { background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }
                 : { background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', padding: 20 }
              } 
              onMouseEnter={e => { if (viewMode==='grid') { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; } else { e.currentTarget.style.background = '#f8fafc'; } }} 
              onMouseLeave={e => { if (viewMode==='grid') { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; } else { e.currentTarget.style.background = '#fff'; } }}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Card Header Background */}
                    <div style={{ height: 100, background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0)', position: 'relative', overflow: 'hidden' }}>
                      {p.bannerVideo ? (
                        <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}>
                          <source src={p.bannerVideo} type="video/mp4" />
                        </video>
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', opacity: 0.8 }} />
                      )}
                      {idx === 0 && <div style={{ position: 'absolute', top: 16, right: 16, background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>FEATURED</div>}
                    </div>
                    
                    <div style={{ padding: '0 24px 24px', position: 'relative' }}>
                      {/* Avatar */}
                      <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', padding: 4, position: 'absolute', top: -40, left: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>
                          {p.avatar || p.name.substring(0,2).toUpperCase()}
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 50 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.name}
                          <span style={{ fontSize: 14, color: '#38bdf8' }}>✓</span>
                        </div>
                        <div style={{ fontSize: 14, color: '#475569', fontWeight: 500, marginBottom: 2 }}>{p.title || 'Professional'}</div>
                        <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginBottom: 16 }}>{p.company || 'DBC Member'}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                           <div style={{ fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}>
                             {p.views > 1000 ? (p.views/1000).toFixed(1) + 'k' : p.views} Views
                           </div>
                           {p.address && (
                             <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                               📍 {p.address.split(',')[0]}
                             </div>
                           )}
                        </div>
                        
                        <Link to={`/profile/${p.slug || p.id}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget as any).style.background='#1e293b'} onMouseLeave={e => (e.currentTarget as any).style.background='#0f172a'}>
                          View Digital Profile <span style={{ marginLeft: 8 }}>→</span>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, marginRight: 24, flexShrink: 0 }}>
                      {p.avatar || p.name.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name}
                        {idx === 0 && <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 12, marginLeft: 8 }}>FEATURED</span>}
                      </div>
                      <div style={{ fontSize: 14, color: '#475569' }}>{p.title || 'Professional'} @ <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.company || 'DBC Member'}</span></div>
                      {p.address && (
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>📍 {p.address}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: 6, fontWeight: 600 }}>
                         {p.views > 1000 ? (p.views/1000).toFixed(1) + 'k' : p.views} Views
                      </div>
                      <Link to={`/profile/${p.slug || p.id}`} style={{ textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                        View Profile
                      </Link>
                    </div>
                  </>
                )}
              </div>
           )) : (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b', background: '#fff', borderRadius: 20, border: '1px dashed #cbd5e1' }}>
               <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
               <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>No profiles found</div>
               <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or city/business type filters.</div>
             </div>
           )}
         </div>

         {/* Call to Action for joining directory */}
         <div style={{ marginTop: 60, background: 'linear-gradient(135deg, #fff, #f8fafc)', borderRadius: 24, padding: '60px 40px', textAlign: 'center', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
             <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Claim your Brand Profile</h2>
             <p style={{ fontSize: 16, color: '#475569', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
               Join thousands of professionals and brands in the official UAE directory. Create interactive NFC-enabled digital cards with advanced analytics.
             </p>
             <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {user ? (
                  <Link to="/dashboard" style={{ textDecoration: 'none', background: '#38bdf8', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 4px 6px rgba(56, 189, 248, 0.2)' }}>
                    Enter Dashboard
                  </Link>
                ) : (
                  <button onClick={async () => {
                    import('../../firebase').then(m => m.loginWithGoogle());
                  }} style={{ cursor: 'pointer', border: 'none', background: '#38bdf8', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, boxShadow: '0 4px 6px rgba(56, 189, 248, 0.2)' }}>
                    Sign in with Google to Start
                  </button>
                )}
             </div>
           </div>
           {/* Decorative elements */}
           <div style={{ position: 'absolute', top: -20, left: -20, fontSize: 150, opacity: 0.02, transform: 'rotate(-15deg)' }}>📱</div>
           <div style={{ position: 'absolute', bottom: -20, right: -20, fontSize: 150, opacity: 0.02, transform: 'rotate(15deg)' }}>🤝</div>
         </div>

      </div>
    </div>
  );
}
