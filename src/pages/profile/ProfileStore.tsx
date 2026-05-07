import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShoppingCart, Search, ArrowLeft, Heart, ChevronRight, Menu, X, Filter, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProfileChatbot from './components/ProfileChatbot';

interface ProfileStoreProps {
  forcedId?: string;
}

export default function ProfileStore({ forcedId }: ProfileStoreProps) {
  const { id: routeId } = useParams();
  const id = forcedId || routeId;
  const navigate = useNavigate();
  const { profiles } = useAppContext();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'catalog' | 'product'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      const cleanId = id.trim();
      const normalizedId = cleanId.toLowerCase();
      
      let foundProfile = profiles.find((p: any) => 
        p.id === cleanId || 
        (p.slug && p.slug.toLowerCase() === normalizedId)
      );

      if (!foundProfile) {
        try {
          // Parallel search matches FullProfile logic
          const docRef = doc(db, 'profiles', cleanId);
          const qSlugLowerCase = query(collection(db, 'profiles'), where('slug', '==', normalizedId));

          const [docSnap, slugLowerSnap] = await Promise.all([
            getDoc(docRef),
            getDocs(qSlugLowerCase)
          ]);

          if (docSnap.exists()) {
            foundProfile = { ...docSnap.data(), id: docSnap.id };
          } else if (!slugLowerSnap.empty) {
            foundProfile = { ...slugLowerSnap.docs[0].data(), id: slugLowerSnap.docs[0].id };
          }
        } catch (e) {
          console.error(e);
        }
      }

      setProfile(foundProfile || null);
      setLoading(false);
    };

    fetchProfile();
  }, [id, profiles]);

  const products = useMemo(() => Array.isArray(profile?.products) ? profile.products : [], [profile]);

  // Extract unique categories
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p: any) => p.category || 'General').filter(Boolean)))], [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) result = result.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== 'All') result = result.filter((p: any) => (p.category || 'General') === selectedCategory);
    
    // Sort basic implementation
    if (sortBy === 'price-low') {
        result.sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
            const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
            return priceA - priceB;
        });
    }
    if (sortBy === 'price-high') {
        result.sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
            const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
            return priceB - priceA;
        });
    }
    if (sortBy === 'newest') result.reverse();

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const toggleWishlist = (id: string) => {
      // Stub
  };

  const handleActionClick = (p: any, type: 'buy' | 'whatsapp' = 'whatsapp', qty: number = 1) => {
    if (type === 'buy' && p.link) {
      try {
        const url = new URL(p.link);
        if (!url.searchParams.has('quantity')) {
          url.searchParams.append('quantity', qty.toString());
        }
        window.open(url.toString(), '_blank');
      } catch (e) {
        window.open(p.link, '_blank');
      }
    } else {
      const phone = String(profile?.phone || '').replace(/[^0-9]/g, "");
      const txt = encodeURIComponent(`Hi, I would like to order: ${p.name} (Quantity: ${qty})`);
      window.open(`https://wa.me/${phone}?text=${txt}`, '_blank');
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!profile) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Store Not Found</h2>
                  <p className="text-slate-500 mb-6">We couldn't find the requested store profile.</p>
                  <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition">Back to Home</Link>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-4/5 max-w-sm h-full p-6 overflow-y-auto shadow-2xl">
              <button onClick={() => setShowMobileSidebar(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition"><X size={20} /></button>
              
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><Filter size={16}/> Filters</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Categories</h4>
                  <div className="flex flex-col gap-1">
                    {categories.map((c: any) => (
                      <button key={c} onClick={() => { setSelectedCategory(c); setShowMobileSidebar(false); }} className={`text-left text-sm py-2 px-3 rounded-xl font-bold transition ${selectedCategory === c ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-3 md:p-4 gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <button onClick={() => {
                 if (view === 'catalog') {
                     const isCustomDomain = window.location.pathname === '/store';
                     if (isCustomDomain) {
                       navigate('/');
                     } else {
                       navigate(`/profile/${id}`);
                     }
                 } else {
                     setView('catalog');
                 }
             }} className="p-2 hover:bg-slate-800 rounded-full transition flex items-center gap-1 group">
               <ArrowLeft size={18} />
               <span className="hidden md:inline text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
             </button>
            <h1 className="text-lg md:text-xl font-black tracking-tight"><Link to={`/profile/${id}/store`}>{profile.name}'s Store</Link></h1>
          </div>
          
          <div className="flex-1 max-w-2xl hidden md:flex items-center relative">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white pl-12 pr-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition" />
            
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="absolute right-1 top-1 bottom-1 bg-slate-700 text-sm border-none outline-none rounded-full px-4 text-slate-200 cursor-pointer">
              {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button className="md:hidden p-2" onClick={() => setShowMobileSidebar(true)}><Menu size={20} /></button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex gap-8">
        
        {/* Sidebar Nav (Desktop) */}
        {view === 'catalog' && (
          <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6">
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Filter size={16}/> Filters</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Categories</h4>
                    <div className="flex flex-col gap-1">
                      {categories.map((c: any) => (
                        <button key={c} onClick={() => setSelectedCategory(c)} className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition ${selectedCategory === c ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {view === 'catalog' && (
            <div className="flex flex-col gap-8">
              
              {/* All Products */}
              <div id="all-products">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                   <h2 className="text-2xl font-black text-slate-900">All Products</h2>
                   <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">Sort:</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white border border-slate-200 text-sm font-bold text-slate-700 py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                   </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
                    <p className="text-slate-500">We couldn't find anything matching your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((p: any, i: number) => <ProductCard key={i} p={p} toggleWishlist={toggleWishlist} setView={setView} setSelectedProduct={setSelectedProduct} setQuantity={setQuantity} handleActionClick={handleActionClick} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product View */}
          {view === 'product' && selectedProduct && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-6 md:p-10">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8 overflow-x-auto whitespace-nowrap">
                <button onClick={() => setView('catalog')} className="hover:text-blue-600 transition truncate">{profile.name}'s Store</button> <ChevronRight size={14} className="shrink-0"/>
                <button onClick={() => { setSelectedCategory(selectedProduct.category || 'General'); setView('catalog'); }} className="hover:text-blue-600 transition truncate">{selectedProduct.category || 'General'}</button> <ChevronRight size={14} className="shrink-0"/>
                <span className="text-slate-900 font-bold truncate">{selectedProduct.name}</span>
              </div>
              
              <div className="flex flex-col md:grid md:grid-cols-2 gap-10 lg:gap-16">
                <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden shadow-inner relative group p-0">
                   {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                        <div className="w-full h-full flex items-center justify-center text-[100px] md:text-[150px]">📦</div>
                   )}
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-3">{selectedProduct.category || 'General'}</div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-none tracking-tight">{selectedProduct.name}</h1>
                  
                  <div className="mb-8 mt-2">
                    <div className="text-4xl md:text-5xl font-black text-slate-900 flex items-baseline gap-2">
                       {selectedProduct.price}
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-8">{selectedProduct.description}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition font-black text-xl">-</button>
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 h-12 bg-transparent text-center font-black text-lg text-slate-900 outline-none p-0" />
                      <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition font-black text-xl">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {selectedProduct.link ? (
                      <>
                        <button onClick={() => handleActionClick(selectedProduct, 'buy', quantity)} className="flex-1 py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30">
                          Buy Now
                        </button>
                        <button onClick={() => handleActionClick(selectedProduct, 'whatsapp', quantity)} className="flex-1 py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-xl shadow-[#25D366]/30">
                          WhatsApp
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleActionClick(selectedProduct, 'whatsapp', quantity)} className="flex-1 py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-xl shadow-[#25D366]/30">
                        Order via WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {profile && <ProfileChatbot profile={profile} />}
    </div>
  );
}

// Reusable Product Card
const ProductCard = ({ p, toggleWishlist, setView, setSelectedProduct, setQuantity, handleActionClick }: any) => (
  <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100 group relative flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div onClick={() => { setSelectedProduct(p); setQuantity(1); setView('product'); }} className="aspect-[4/3] bg-slate-50 flex items-center justify-center text-5xl md:text-8xl cursor-pointer relative overflow-hidden">
      {p.image ? (
        <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      ) : (
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} className="z-0 filter drop-shadow-md">
          📦
        </motion.div>
      )}
    </div>
    
    <div className="p-3 md:p-5 flex flex-col flex-1">
      <div className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 md:mb-2">{p.category || 'General'}</div>
      <h3 onClick={() => { setSelectedProduct(p); setQuantity(1); setView('product'); }} className="font-bold text-slate-900 text-xs md:text-base mb-2 md:mb-3 leading-snug cursor-pointer group-hover:text-blue-600 transition line-clamp-2">{p.name}</h3>
      
      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
           <div className="font-black text-sm md:text-xl text-slate-900 truncate">{p.price}</div>
        </div>
        {p.link ? (
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleActionClick(p, 'buy'); }} className="flex-shrink-0 px-3 py-2 md:px-4 md:py-2 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg text-xs md:text-sm font-bold shadow-slate-900/20 hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
                Buy
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleActionClick(p, 'whatsapp'); }} className="flex-shrink-0 px-3 py-2 md:px-4 md:py-2 flex items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg text-xs md:text-sm font-bold shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
                WhatsApp
            </button>
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); handleActionClick(p, 'whatsapp'); }} className="flex-shrink-0 px-3 py-2 md:px-4 md:py-2 flex items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg text-xs md:text-sm font-bold shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-transform whitespace-nowrap">
              WhatsApp
          </button>
        )}
      </div>
    </div>
  </div>
);
