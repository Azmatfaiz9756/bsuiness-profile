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

        {/* Hero Image/Card */}
        <div className="flex-1 flex justify-center md:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-[320px] aspect-[4/5]"
          >
            {/* Front Card */}
            <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl p-6 flex flex-col border border-slate-200 z-20">
              <div className="absolute top-0 left-0 right-0 h-32 bg-slate-900 flex items-start justify-end p-6 rounded-t-[38px]">
                <div className="text-sky-400 bg-white/10 p-2 rounded-full backdrop-blur-md">
                  <Zap size={20} />
                </div>
              </div>
              <div className="mt-16 relative z-10 flex flex-col grow items-center">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                    alt="Alex"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-2xl font-black text-slate-900 leading-tight">
                  Alex Rivera
                </div>
                <div className="text-sm font-bold text-sky-600 uppercase tracking-widest mt-1 mb-6">
                  Founder @ TechEdge
                </div>

                <div className="grid grid-cols-4 gap-2 w-full mb-auto">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-slate-50 rounded-[14px] flex items-center justify-center text-slate-400 border border-slate-100"
                    >
                      <LayoutGrid size={18} />
                    </div>
                  ))}
                </div>

                <div className="w-full py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-sm uppercase tracking-widest mt-6">
                  NFC Enabled
                </div>
              </div>
            </div>

            {/* Back Card Decoration (Peek) */}
            <div className="absolute inset-0 bg-sky-500 rounded-[40px] shadow-2xl translate-x-4 translate-y-4 rotate-3 z-10 flex items-center justify-center p-8 border border-sky-400"></div>
            <div className="absolute inset-0 bg-slate-800 rounded-[40px] shadow-xl -translate-x-4 translate-y-8 -rotate-3 z-0" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function FrontendHome() {
  const { user, setIsLoginModalOpen } = useAppContext();
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

      if (isInitial) {
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProfiles(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
      } else if (lastDoc) {
        const nextQ = query(q, startAfter(lastDoc));
        const snapshot = await getDocs(nextQ);
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProfiles((prev) => [...prev, ...docs]);
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
