import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { LayoutGrid, List, Sparkles, Smartphone, Share2, BarChart3, Zap, ArrowDown, Search, Filter, Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { collection, query, where, limit, getDocs, startAfter, orderBy, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';

function ScrollyHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Floating background cards animations
  const card1X = useTransform(smoothProgress, [0, 0.5, 1], [-100, 50, 0]);
  const card1Rot = useTransform(smoothProgress, [0, 1], [-15, 5]);
  
  const card2X = useTransform(smoothProgress, [0, 0.5, 1], [100, -50, 0]);
  const card2Rot = useTransform(smoothProgress, [0, 1], [15, -5]);

  // Main card animations
  const cardRotateX = useTransform(smoothProgress, [0, 0.2, 0.4, 0.6, 0.8], [15, 0, -15, 0, 10]);
  const cardRotateY = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [0, 180, 360, 450]);
  const cardScale = useTransform(smoothProgress, [0, 0.2, 0.5, 0.8], [1.1, 1.7, 1.5, 1.1]);
  
  // Text animations
  const text1Opacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const text1Y = useTransform(smoothProgress, [0, 0.15], [0, -40]);
  
  const text2Opacity = useTransform(smoothProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0]);
  const text2Y = useTransform(smoothProgress, [0.15, 0.25, 0.5], [40, 0, -40]);

  const text3Opacity = useTransform(smoothProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]);
  const text3Y = useTransform(smoothProgress, [0.5, 0.6, 0.85], [40, 0, -40]);

  const bgGradient = useTransform(
    smoothProgress, 
    [0, 0.3, 0.6, 1], 
    ["linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
     "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)", 
     "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
     "linear-gradient(135deg, #0f172a 0%, #0f172a 100%)"]
  );

  const samples = [
    { name: "Alex Rivera", title: "Tech Innovator", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", color: "#38bdf8" },
    { name: "Sarah Chen", title: "Creative Lead", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", color: "#f472b6" },
    { name: "Omar Hassan", title: "Global Assets", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", color: "#fbbf24" }
  ];

  return (
    <div ref={containerRef} className="relative h-[250vh] md:h-[400vh] bg-slate-900">
      <motion.div 
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ background: bgGradient }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random()
              }}
            />
          ))}
        </div>

        {/* Floating Background Cards (Desktop only for flair) */}
        <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
           <motion.div 
             style={{ x: card1X, rotate: card1Rot, opacity: useTransform(smoothProgress, [0, 0.4], [0.4, 0]) }}
             className="absolute top-1/4 left-10 w-48 h-64 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
           />
           <motion.div 
             style={{ x: card2X, rotate: card2Rot, opacity: useTransform(smoothProgress, [0, 0.4], [0.4, 0]) }}
             className="absolute bottom-1/4 right-10 w-48 h-64 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
           />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-20">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 relative h-24 md:h-64 flex flex-col items-center md:items-start justify-center">
            <motion.div 
              style={{ opacity: text1Opacity, y: text1Y }} 
              className="absolute inset-0 flex flex-col justify-center text-center md:text-left"
            >
              <h2 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter leading-none italic uppercase">
                The <span className="text-sky-400">DBC</span> <br /> Power.
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium tracking-wide">Elevate your networking game.</p>
            </motion.div>

            <motion.div 
              style={{ opacity: text2Opacity, y: text2Y }} 
              className="absolute inset-0 flex flex-col justify-center text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                 <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white">
                    <Smartphone size={20} />
                 </div>
                 <span className="text-sky-400 font-bold uppercase tracking-widest text-xs">Tap & Go</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-none">
                One Tap. <br /> All Connections.
              </h2>
              <p className="text-slate-400 text-sm md:text-lg max-w-md">No apps, no paper. Just seamless digital profile exchange via NFC or QR.</p>
            </motion.div>

            <motion.div 
              style={{ opacity: text3Opacity, y: text3Y }} 
              className="absolute inset-0 flex flex-col justify-center text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                 <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                    <Zap size={20} />
                 </div>
                 <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Smart Platform</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-none">
                Live <br /> Verification.
              </h2>
              <p className="text-slate-400 text-sm md:text-lg max-w-md">Join the elite network of verified professionals across the UAE.</p>
            </motion.div>
          </div>

          {/* Interactive Card Stack */}
          <div className="w-full md:w-1/2 flex items-center justify-center perspective-[3000px]">
             <motion.div 
                style={{ 
                   rotateX: cardRotateX, 
                   rotateY: cardRotateY, 
                   scale: cardScale,
                   transformStyle: "preserve-3d"
                }}
                className="relative w-60 h-[380px] md:w-80 md:h-[500px]"
             >
                {/* Sample Background Shadows for "Stack" effect */}
                <div className="absolute inset-0 bg-white/5 rounded-[40px] translate-x-3 translate-y-3 blur-md" />
                <div className="absolute inset-0 bg-white/5 rounded-[40px] translate-x-6 translate-y-6 blur-lg" />

                {/* Main Dynamic Card Front */}
                <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl p-6 flex flex-col backface-hidden overflow-hidden border-2 border-slate-200">
                   {/* Top Highlight */}
                   <div className="absolute top-0 left-0 right-0 h-1/3 bg-slate-900 flex items-end justify-center p-6">
                      <div className="absolute top-4 right-4 text-sky-400"><Zap size={20} /></div>
                   </div>

                   <div className="mt-auto relative z-10">
                      <div className="w-24 h-24 bg-white rounded-full p-1 mx-auto mb-6 shadow-xl -mt-12">
                         <img 
                           src={samples[0].img} 
                           alt="Alex" 
                           className="w-full h-full object-cover rounded-full"
                         />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-900 leading-tight">Alex Rivera</div>
                        <div className="text-sm font-bold text-sky-600 uppercase tracking-widest mt-1">Founder @ TechEdge</div>
                        
                        <div className="mt-8 grid grid-cols-4 gap-2 px-2">
                           {[...Array(4)].map((_, i) => (
                             <div key={i} className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors">
                                <Zap size={14} />
                             </div>
                           ))}
                        </div>

                        <div className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-sm uppercase tracking-widest shadow-xl">
                           View Profile
                        </div>
                      </div>
                   </div>
                </div>

                {/* Main Dynamic Card Back */}
                <motion.div 
                  className="absolute inset-0 bg-slate-900 rounded-[40px] shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-slate-800"
                  style={{ rotateY: 180 }}
                >
                   <div className="w-32 h-32 border-2 border-sky-500/30 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 animate-pulse bg-sky-500/5 rounded-full scale-125"></div>
                      <Smartphone className="text-sky-400" size={48} />
                   </div>
                   <div className="mt-8 text-center">
                      <div className="text-white font-black text-2xl tracking-tighter italic uppercase">DBC PRO</div>
                      <div className="text-slate-500 text-xs mt-2 font-mono uppercase tracking-widest">NFC Encrypted</div>
                   </div>
                   
                   <div className="absolute bottom-10 flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
                   </div>
                </motion.div>
             </motion.div>

             {/* Secondary Dynamic Elements that fade in/out */}
             <motion.div 
               className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl p-4 flex flex-col items-center justify-center"
               style={{ 
                 opacity: useTransform(smoothProgress, [0.3, 0.45, 0.6], [0, 1, 0]),
                 scale: useTransform(smoothProgress, [0.3, 0.45, 0.6], [0.8, 1, 0.8]),
                 y: useTransform(smoothProgress, [0.3, 0.45, 0.6], [20, 0, -20])
               }}
             >
                <img src={samples[1].img} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mb-2 ring-2 ring-pink-500" />
                <div className="text-[10px] md:text-xs font-black text-slate-900 uppercase">Sarah Chen</div>
                <div className="text-[8px] md:text-[10px] text-pink-500 font-bold">Creative Lead</div>
             </motion.div>

             <motion.div 
               className="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-xl p-4 flex flex-col items-center justify-center"
               style={{ 
                 opacity: useTransform(smoothProgress, [0.6, 0.75, 0.9], [0, 1, 0]),
                 scale: useTransform(smoothProgress, [0.6, 0.75, 0.9], [0.8, 1, 0.8]),
                 y: useTransform(smoothProgress, [0.6, 0.75, 0.9], [20, 0, -20])
               }}
             >
                <img src={samples[2].img} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mb-2 ring-2 ring-amber-500" />
                <div className="text-[10px] md:text-xs font-black text-slate-900 uppercase">Omar Hassan</div>
                <div className="text-[8px] md:text-[10px] text-amber-500 font-bold">Global Assets</div>
             </motion.div>
          </div>
        </div>

        {/* Fixed Scroll Indicator for Mobile */}
        <motion.div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ opacity: useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]) }}
        >
           <span className="text-[8px] text-white/40 font-bold tracking-[0.5em] uppercase">Scroll</span>
           <motion.div 
             animate={{ y: [0, 6, 0] }}
             transition={{ duration: 1.5, repeat: Infinity }}
             className="text-sky-400"
           >
             <ArrowDown size={16} />
           </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function FrontendHome() {
  const { user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Business Types');
  const [activeCity, setActiveCity] = useState('All Cities');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const categories = ['All Business Types', 'Technology', 'Real Estate', 'Finance', 'Consulting', 'Design', 'Medical', 'Retail', 'Education'];
  const cities = ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];

  const fetchProfiles = async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let q = query(
        collection(db, 'profiles'),
        orderBy('name'),
        limit(12)
      );

      if (isInitial) {
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProfiles(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
      } else if (lastDoc) {
        const nextQ = query(q, startAfter(lastDoc));
        const snapshot = await getDocs(nextQ);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProfiles(prev => [...prev, ...docs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);
  }, [activeCategory, activeCity]);

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All Business Types' || p.category === activeCategory;
    const matchesCity = activeCity === 'All Cities' || p.city === activeCity;

    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans overflow-x-hidden">
      {/* Animated Scrolly Hero */}
      <ScrollyHero />

      {/* Brand Hero Section */}
      <div id="directory" className="bg-slate-900 text-white pt-12 md:pt-24 pb-12 px-4 md:px-8 text-center relative overflow-hidden">
         <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
         <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
         
         <div className="max-w-3xl mx-auto relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
              Network with <br />
              <span className="text-sky-400">The Powerhouse</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4 md:px-0">
               Direct access to thousands of verified professionals. Start your search below or filter by industry.
            </p>

            {/* Global Search Bar */}
            <div className="flex max-w-2xl mx-auto bg-white rounded-xl p-2 shadow-xl shrink-0">
              <div className="flex-1 flex items-center px-4">
                <span className="text-xl mr-3">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search professionals, companies, or keywords..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border-none py-3 text-base outline-none text-slate-900 rounded-none bg-transparent"
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
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="animate-spin text-sky-500" size={48} />
               <p className="text-slate-500 font-medium">Loading Business Directory...</p>
            </div>
          ) : (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`
                  ${viewMode === 'grid' 
                    ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full'
                    : 'flex flex-col gap-4' }
                `}>
                {filteredProfiles.length > 0 ? filteredProfiles.map((p, idx) => (
                   <motion.div 
                     key={p.id}
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx % 12 * 0.05 }}
                     viewport={{ once: true }}
                     className={`
                      ${viewMode === 'grid'
                       ? 'bg-white rounded-[20px] overflow-hidden border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 shadow-sm'
                       : 'bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center p-5 hover:bg-slate-50 transition-colors'
                      }
                    `} 
                   >
                     {viewMode === 'grid' ? (
                       <>
                         {/* Card Header Background */}
                         <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                           {p.bannerUrl ? (
                             <img src={p.bannerUrl} className="w-full h-full object-cover opacity-80" alt="Banner" />
                           ) : p.bannerVideo ? (
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
                           <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-5 shadow-sm overflow-hidden">
                             {p.photoUrl ? (
                               <img src={p.photoUrl} className="w-full h-full rounded-full object-cover" alt={p.name} />
                             ) : (
                               <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-3xl font-extrabold">
                                 {p.avatar || p.name.substring(0,2).toUpperCase()}
                               </div>
                             )}
                           </div>
                           
                           <div className="pt-12">
                             <div className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 truncate">
                               {p.name}
                               {(p.isVerified || p.plan === 'Pro' || p.plan === 'Enterprise') && <span className="text-sm text-sky-400">✓</span>}
                             </div>
                             <div className="text-sm text-slate-600 font-medium truncate mb-0.5">{p.title || 'Professional'}</div>
                             <div className="text-sm text-slate-900 font-bold mb-4 truncate">{p.company || 'DBC Member'}</div>
                             
                             <div className="flex items-center gap-2 mb-6 flex-wrap">
                                <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                                  {(p.views || 0) > 1000 ? ((p.views || 0)/1000).toFixed(1) + 'k' : (p.views || 0)} Views
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
                         <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-2xl font-extrabold mr-0 sm:mr-6 shrink-0 mb-4 sm:mb-0 shadow-sm overflow-hidden">
                           {p.photoUrl ? (
                             <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                           ) : (
                             p.avatar || p.name.substring(0,2).toUpperCase()
                           )}
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
                              {(p.views || 0) > 1000 ? ((p.views || 0)/1000).toFixed(1) + 'k' : (p.views || 0)} Views
                           </div>
                           <Link to={`/profile/${p.slug || p.id}`} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm w-full sm:w-auto text-center transition-colors shadow-sm">
                             View Profile
                           </Link>
                         </div>
                       </>
                     )}
                   </motion.div>
                )) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b', background: '#fff', borderRadius: 20, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>No profiles found</div>
                    <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or city/business type filters.</div>
                  </div>
                )}
              </motion.div>

              {hasMore && (
                <div className="mt-12 text-center">
                  <button 
                    onClick={() => fetchProfiles(false)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-white border border-slate-200 px-8 py-3 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loadingMore ? 'Loading Profiles...' : 'Load More Businesses'}
                  </button>
                </div>
              )}
            </>
          )}

         {/* Call to Action for joining directory */}
         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-16 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 md:p-16 text-center border border-slate-200 relative overflow-hidden shadow-sm"
         >
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
         </motion.div>
      </div>
    </div>
  );
}
