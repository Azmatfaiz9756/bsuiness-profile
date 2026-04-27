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
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      {/* Brand Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-20 pb-16 px-4 md:px-8 text-center relative overflow-hidden">
         <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
         <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
         
         <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest mb-6 border border-white/20">
              THE PREMIER BUSINESS DIRECTORY
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
              Discover Leading <br />
              <span className="text-sky-400">Brands & Professionals</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4 md:px-0">
              Connect with verified experts, executives, and top-tier companies. Explore their interactive digital profiles and portfolios.
            </p>

            {/* Global Search Bar */}
            <div className="flex max-w-2xl mx-auto bg-white rounded-xl p-2 shadow-xl shrink-0 mx-4 md:mx-auto">
              <div className="flex-1 flex items-center px-4">
                <span className="text-xl mr-3">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search space..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border-none py-3 text-base outline-none text-slate-900"
                />
              </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl -mt-6 mx-auto relative z-20 px-4 md:px-6">
         {/* Filters & View Toggle */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0">
               <select 
                 value={activeCategory} 
                 onChange={e => setActiveCategory(e.target.value)}
                 className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold outline-none shrink-0"
               >
                 {categories.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>

               <select 
                 value={activeCity} 
                 onChange={e => setActiveCity(e.target.value)}
                 className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold outline-none shrink-0"
               >
                 {cities.map(city => (
                   <option key={city} value={city}>{city}</option>
                 ))}
               </select>
            </div>
            
            <div className="hidden md:flex bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`flex items-center justify-center px-3.5 py-2.5 transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
               >
                 <LayoutGrid size={18} />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`flex items-center justify-center px-3.5 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
               >
                 <List size={18} />
               </button>
            </div>
         </div>

         {/* Directory Display */}
         <div className={`
           ${viewMode === 'grid' 
             ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full'
             : 'flex flex-col gap-4' }
          `}>
           {filteredProfiles.length > 0 ? filteredProfiles.map((p, idx) => (
              <div key={p.id} className={`
                ${viewMode === 'grid'
                 ? 'bg-white rounded-[20px] overflow-hidden border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-200'
                 : 'bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center p-5 hover:bg-slate-50 transition-colors'
                }
              `} 
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Card Header Background */}
                    <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                      {p.bannerVideo ? (
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80">
                          <source src={p.bannerVideo} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-500 opacity-80" />
                      )}
                      {idx === 0 && <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-widest shadow-sm shadow-black/20 z-10">FEATURED</div>}
                    </div>
                    
                    <div className="px-5 pb-6 relative flex-col">
                      {/* Avatar */}
                      <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-5 shadow-sm">
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-3xl font-extrabold">
                          {p.avatar || p.name.substring(0,2).toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="pt-12">
                        <div className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 truncate">
                          {p.name}
                          <span className="text-sm text-sky-400">✓</span>
                        </div>
                        <div className="text-sm text-slate-600 font-medium truncate mb-0.5">{p.title || 'Professional'}</div>
                        <div className="text-sm text-slate-900 font-bold mb-4 truncate">{p.company || 'DBC Member'}</div>
                        
                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                           <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                             {p.views > 1000 ? (p.views/1000).toFixed(1) + 'k' : p.views} Views
                           </div>
                           {p.address && (
                             <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap truncate max-w-full">
                               📍 {p.address.split(',')[0]}
                             </div>
                           )}
                        </div>
                        
                        <Link to={`/profile/${p.slug || p.id}`} className="flex justify-center items-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors w-full">
                          View Digital Profile <span className="ml-2">→</span>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-2xl font-extrabold mr-0 sm:mr-6 shrink-0 mb-4 sm:mb-0 shadow-sm">
                      {p.avatar || p.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                      <div className="text-lg font-extrabold text-slate-900 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        {p.name}
                        {idx === 0 && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-0 sm:ml-2">FEATURED</span>}
                      </div>
                      <div className="text-sm text-slate-600 truncate">{p.title || 'Professional'} @ <span className="font-bold text-slate-900">{p.company || 'DBC Member'}</span></div>
                      {p.address && (
                        <div className="text-sm text-slate-500 mt-1 truncate">📍 {p.address}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto shrink-0 justify-center sm:justify-end">
                      <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md font-bold whitespace-nowrap">
                         {p.views > 1000 ? (p.views/1000).toFixed(1) + 'k' : p.views} Views
                      </div>
                      <Link to={`/profile/${p.slug || p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm w-full sm:w-auto text-center transition-colors shadow-sm">
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
         <div className="mt-16 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 md:p-16 text-center border border-slate-200 relative overflow-hidden shadow-sm">
           <div className="relative z-10">
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Claim your Brand Profile</h2>
             <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
               Join thousands of professionals and brands in the official UAE directory. Create interactive NFC-enabled digital cards with advanced analytics.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link to="/dashboard" className="bg-sky-400 hover:bg-sky-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all text-center">
                    Enter Dashboard
                  </Link>
                ) : (
                  <button onClick={async () => {
                    import('../../firebase').then(m => m.loginWithGoogle());
                  }} className="cursor-pointer bg-sky-400 hover:bg-sky-500 text-white border-none px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all">
                    Sign in with Google to Start
                  </button>
                )}
             </div>
           </div>
           {/* Decorative elements */}
           <div className="absolute -top-10 -left-10 text-[120px] opacity-5 -rotate-12 select-none">📱</div>
           <div className="absolute -bottom-10 -right-10 text-[120px] opacity-5 rotate-12 select-none">🤝</div>
         </div>

      </div>
    </div>
  );
}
