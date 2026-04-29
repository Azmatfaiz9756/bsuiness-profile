import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import {
  LayoutGrid,
  List,
  Sparkles,
  Smartphone,
  Share2,
  BarChart3,
  Zap,
  ArrowDown,
  Search,
  Filter,
  Loader2,
  MessageSquare,
  Bot
} from "lucide-react";
import { motion } from "motion/react";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";

function HeroSection() {
  return (
    <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-20 md:pt-32 md:pb-32 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8">
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-sm tracking-wide uppercase mb-6 border border-sky-400/20">
              <Sparkles size={16} /> Tap & Go Networking
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight md:leading-none mb-6 tracking-tighter uppercase italic">
              The <span className="text-sky-400">DBC</span>{" "}
              <br className="hidden md:block" /> Power.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed font-medium">
              Elevate your networking game. No apps, no paper. Just seamless
              digital profile exchange via NFC or QR.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center md:justify-start">
              <a
                href="#directory"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-sky-500/25 flex justify-center items-center"
              >
                Search Directory
              </a>
              <Link
                to="/plans"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-xl transition-all flex justify-center items-center"
              >
                View Plans
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated Mobile Device Mockup */}
        <div className="flex-1 flex justify-center md:justify-end w-full relative h-[650px]">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative rounded-[3rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19] w-[320px] shrink-0 z-10"
          >
            {/* iPhone Notch */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-900 rounded-b-xl"></div>
            </div>
            
            {/* Profile Screen Mockup - Executive Dark Theme */}
            <div className="w-full h-full bg-[#111] overflow-hidden relative flex flex-col text-white font-sans">
               {/* Background Image / Gradient */}
               <div className="h-48 relative bg-gradient-to-b from-slate-700 to-[#111] overflow-hidden">
                 <div 
                   className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center" 
                   style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512632578888-1c4b8bce1b48?auto=format&fit=crop&q=80&w=1000')" }}
                 />
                 <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#111] to-transparent z-10" />
               </div>
               
               <div className="flex-1 relative px-5 pb-5 flex flex-col items-center -mt-16 z-20">
                  {/* Avatar */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-28 h-28 bg-[#111] rounded-full p-1 shadow-2xl mb-4 border border-[#333]"
                  >
                    <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative">
                       <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5 }}
                     className="text-center w-full"
                  >
                    <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">Azmat Faiz <span className="text-blue-500">🦅</span></h3>
                    <p className="text-[#c2410c] text-sm mt-1">Luxury Real Estate Broker</p>
                    <p className="text-[#888] text-xs font-medium tracking-widest mt-1 uppercase">Dubai Premier Estates</p>
                    
                    <div className="flex justify-center mt-4">
                      <div className="inline-flex items-center gap-2 border border-[#333] px-3 py-1 rounded-full bg-[#1a1a1a]">
                         <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                         <span className="text-[10px] font-bold tracking-wider text-white">12420 VISITS</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#aaa] mt-5 px-2 leading-relaxed">
                      Award-winning real estate broker specializing in luxury properties in Dubai. Helping investors find their perfect home or high-yield investment properties.
                    </p>
                    
                    <div className="flex justify-center gap-4 mt-6">
                      <div className="text-sky-600"><svg xmlns="http://www.w3.org/2000/submit" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></div>
                      <div className="text-white"><svg xmlns="http://www.w3.org/2000/submit" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></div>
                      <div className="text-pink-500"><svg xmlns="http://www.w3.org/2000/submit" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      <div className="bg-[#22c55e] border-none text-white rounded py-2 font-bold text-xs shadow-md">
                        Get Directions
                      </div>
                      <div className="bg-[#3b82f6] border-none text-white rounded py-2 font-bold text-xs shadow-md">
                        Save Contact
                      </div>
                    </div>
                  </motion.div>
               </div>

               {/* Simulated Floating AI Chatbot Button */}
               <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", bounce: 0.5 }}
                  className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] z-50 cursor-pointer"
               >
                  <Bot size={28} className="text-white" />
               </motion.div>
            </div>
          </motion.div>
          
          {/* Floating Badges */}
          <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/4 -right-12 sm:-right-24 md:-right-12 lg:-right-24 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 z-0 md:z-20 scale-75 sm:scale-100"
          >
             <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center">
               <Bot size={20} />
             </div>
             <div>
               <div className="text-xs font-bold text-slate-400">AI Chatbot</div>
               <div className="text-sm font-extrabold text-white">Answering Leads</div>
             </div>
          </motion.div>
          
          <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-1/4 -left-12 sm:-left-24 md:-left-12 lg:-left-24 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 z-0 md:z-20 scale-75 sm:scale-100"
          >
             <div className="w-10 h-10 rounded-full bg-amber-900/50 text-amber-500 flex items-center justify-center font-bold">
               12k
             </div>
             <div>
               <div className="text-xs font-bold text-slate-400">Profile Views</div>
               <div className="text-sm font-extrabold text-white">+12% this week</div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PromotionalShowcase() {
  const benefits = [
    {
      title: "Interactive Digital Identity",
      desc: "Share your contact info, social links, and portfolio with a single tap using our NFC-enabled smart cards.",
      icon: <Share2 className="text-amber-500" size={24} />,
    },
    {
      title: "AI-Powered Chat Assistant",
      desc: "Let your own AI virtual assistant answer client inquiries, capture leads, and book appointments 24/7 directly from your profile.",
      icon: <Bot className="text-amber-500" size={24} />,
    },
    {
      title: "Real-time Analytics",
      desc: "Track profile views, tap engagement, and measure the exact ROI of your networking efforts.",
      icon: <BarChart3 className="text-amber-500" size={24} />,
    },
    {
      title: "Customizable Premium Branding",
      desc: "Choose from multiple professional templates like 'Executive Dark' and personalize them to match your unique brand identity.",
      icon: <Sparkles className="text-amber-500" size={24} />,
    },
  ];

  return (
    <div className="py-24 bg-slate-950 border-b border-slate-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-amber-500 font-bold text-sm tracking-wide uppercase mb-4 border border-slate-800">
            <Sparkles size={16} /> Premium Business Profiles
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            More than just a business card. <br className="hidden md:block"/>
            <span className="text-amber-500">It's your AI-powered business toolkit.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            See why leading luxury professionals and executives trust DBC to manage their digital presence, automate lead capture, and stand out from the crowd.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 text-center lg:text-left">
          {/* Benefits List */}
          <div className="w-full flex flex-col gap-8 md:grid md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-4 group items-start text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800 transition-colors"
              >
                <div className="shrink-0 mt-1">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:shadow-lg transition-all duration-300">
                    {benefit.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">{benefit.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium text-sm">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             viewport={{ once: true }}
             className="mt-8 pt-8 border-t border-slate-800 w-full flex justify-center lg:justify-end col-span-2 hidden"
          >
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function FrontendHome() {
  const { user, setIsLoginModalOpen, profiles: staticProfiles } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Business Types");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    "All Business Types",
    "Technology",
    "Real Estate",
    "Finance",
    "Consulting",
    "Design",
    "Medical",
    "Retail",
    "Education",
  ];
  const cities = [
    "All Cities",
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Fujairah",
    "Ras Al Khaimah",
    "Umm Al Quwain",
  ];

  const fetchProfiles = async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let q = query(collection(db, "profiles"), orderBy("name"), limit(12));

      let dbDocs: any[] = [];
      if (isInitial) {
        const snapshot = await getDocs(q);
        dbDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
        
        // Merge with static profiles
        const combined = [...staticProfiles];
        dbDocs.forEach(dbp => {
          if (!combined.find(p => p.email === dbp.email || p.id === dbp.id)) {
            combined.push(dbp);
          }
        });
        setProfiles(combined);
      } else if (lastDoc) {
        const nextQ = query(q, startAfter(lastDoc));
        const snapshot = await getDocs(nextQ);
        dbDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        setProfiles((prev) => {
          const combined = [...prev];
          dbDocs.forEach(dbp => {
             if (!combined.find(p => p.email === dbp.email || p.id === dbp.id)) {
               combined.push(dbp);
             }
          });
          return combined;
        });
        
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      if (isInitial) {
         setProfiles([...staticProfiles]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);
  }, [activeCategory, activeCity]);

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      activeCategory === "All Business Types" || p.category === activeCategory;
    const matchesCity = activeCity === "All Cities" || p.city === activeCity;

    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans overflow-x-hidden">
      {/* Animated Hero */}
      <HeroSection />

      {/* Promotional Showcase */}
      <PromotionalShowcase />

      {/* Brand Hero Section */}
      <div
        id="directory"
        className="bg-slate-900 text-white pt-12 md:pt-24 pb-12 px-4 md:px-8 text-center relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
            Network with <br />
            <span className="text-sky-400">The Powerhouse</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4 md:px-0">
            Direct access to thousands of verified professionals. Start your
            search below or filter by industry.
          </p>

          {/* Global Search Bar */}
          <div className="flex max-w-2xl mx-auto bg-white rounded-xl p-2 shadow-xl shrink-0">
            <div className="flex-1 flex items-center px-4">
              <span className="text-xl mr-3">🔍</span>
              <input
                type="text"
                placeholder="Search professionals, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold outline-none shrink-0"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold outline-none shrink-0"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center px-3.5 py-2.5 transition-colors ${viewMode === "grid" ? "bg-slate-900 text-white" : "bg-transparent text-slate-500 hover:bg-slate-50"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center px-3.5 py-2.5 transition-colors ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-transparent text-slate-500 hover:bg-slate-50"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Directory Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-sky-500" size={48} />
            <p className="text-slate-500 font-medium">
              Loading Business Directory...
            </p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`
                  ${
                    viewMode === "grid"
                      ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full"
                      : "flex flex-col gap-4"
                  }
                `}
            >
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % 12) * 0.05 }}
                    viewport={{ once: true }}
                    className={`
                      ${
                        viewMode === "grid"
                          ? "bg-white rounded-[20px] overflow-hidden border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 shadow-sm"
                          : "bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center p-5 hover:bg-slate-50 transition-colors"
                      }
                    `}
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Card Header Background */}
                        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                          {p.bannerUrl ? (
                            <img
                              src={p.bannerUrl}
                              className="w-full h-full object-cover opacity-80"
                              alt="Banner"
                            />
                          ) : p.bannerVideo ? (
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover opacity-80"
                            >
                              <source src={p.bannerVideo} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-500 opacity-80" />
                          )}
                          {idx === 0 && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-widest shadow-sm shadow-black/20 z-10">
                              FEATURED
                            </div>
                          )}
                        </div>

                        <div className="px-5 pb-6 relative flex-col">
                          {/* Avatar */}
                          <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-5 shadow-sm overflow-hidden">
                            {p.photoUrl ? (
                              <img
                                src={p.photoUrl}
                                className="w-full h-full rounded-full object-cover"
                                alt={p.name}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-3xl font-extrabold">
                                {p.avatar ||
                                  p.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="pt-12">
                            <div className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 truncate">
                              {p.name}
                              {(p.isVerified ||
                                p.plan === "Pro" ||
                                p.plan === "Enterprise") && (
                                <span className="text-sm text-sky-400">✓</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 font-medium truncate mb-0.5">
                              {p.title || "Professional"}
                            </div>
                            <div className="text-sm text-slate-900 font-bold mb-4 truncate">
                              {p.company || "DBC Member"}
                            </div>

                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                              <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                                {(p.views || 0) > 1000
                                  ? ((p.views || 0) / 1000).toFixed(1) + "k"
                                  : p.views || 0}{" "}
                                Views
                              </div>
                              {p.address && (
                                <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap truncate max-w-full">
                                  📍 {p.address.split(",")[0]}
                                </div>
                              )}
                            </div>

                            <Link
                              to={`/profile/${p.slug || p.id}`}
                              className="flex justify-center items-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors w-full"
                            >
                              View Digital Profile{" "}
                              <span className="ml-2">→</span>
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-2xl font-extrabold mr-0 sm:mr-6 shrink-0 mb-4 sm:mb-0 shadow-sm overflow-hidden">
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            p.avatar || p.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                          <div className="text-lg font-extrabold text-slate-900 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            {p.name}
                            {idx === 0 && (
                              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-0 sm:ml-2">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {p.title || "Professional"} @{" "}
                            <span className="font-bold text-slate-900">
                              {p.company || "DBC Member"}
                            </span>
                          </div>
                          {p.address && (
                            <div className="text-sm text-slate-500 mt-1 truncate">
                              📍 {p.address}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto shrink-0 justify-center sm:justify-end">
                          <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md font-bold whitespace-nowrap">
                            {(p.views || 0) > 1000
                              ? ((p.views || 0) / 1000).toFixed(1) + "k"
                              : p.views || 0}{" "}
                            Views
                          </div>
                          <Link
                            to={`/profile/${p.slug || p.id}`}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm w-full sm:w-auto text-center transition-colors shadow-sm"
                          >
                            View Profile
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <div
                    style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}
                  >
                    No profiles found
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Try adjusting your search or city/business type filters.
                  </div>
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
                  {loadingMore ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loadingMore ? "Loading Profiles..." : "Load More Businesses"}
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Claim your Brand Profile
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of professionals and brands in the official UAE
              directory. Create interactive NFC-enabled digital cards with
              advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-sky-400 hover:bg-sky-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all text-center"
                >
                  Enter Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="cursor-pointer bg-sky-400 hover:bg-sky-500 text-white border-none px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all"
                >
                  Sign in with Google or Phone to Start
                </button>
              )}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 text-[120px] opacity-5 -rotate-12 select-none">
            📱
          </div>
          <div className="absolute -bottom-10 -right-10 text-[120px] opacity-5 rotate-12 select-none">
            🤝
          </div>
        </motion.div>
      </div>
    </div>
  );
}
