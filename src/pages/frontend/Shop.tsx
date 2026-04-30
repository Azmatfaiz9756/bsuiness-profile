import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ShoppingCart, Heart, Search, ArrowLeft, Package, MapPin, Tag, CreditCard, Wallet, Trash2, Star, ChevronRight, Menu, X, Filter, SlidersHorizontal, Check, User, ArrowRight, Zap, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function FrontendShop() {
  const navigate = useNavigate();
  const { products, cart, setCart, wishlist, setWishlist, userOrders, setUserOrders, addresses, walletBalance, setWalletBalance, siteSettings, user, profiles, shopBanners } = useAppContext();
  const [view, setView] = useState<'catalog' | 'product' | 'cart' | 'checkout' | 'orders' | 'wishlist'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(addresses && addresses[0] ? addresses[0].id : '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    if (view !== 'catalog') return;
    const int = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (shopBanners?.length || 1));
    }, 5000);
    return () => clearInterval(int);
  }, [view, shopBanners]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopPaymentSuccess = params.get('shop_payment_success');
    if (shopPaymentSuccess === 'true') {
      alert('Payment Successful! Thank you for your order.');
      setCart([]);
      setView('orders');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Extract unique categories and brands
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))], [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))), [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) result = result.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())));
    if (selectedCategory !== 'All') result = result.filter((p: any) => p.category === selectedCategory);
    if (selectedBrands.length > 0) result = result.filter((p: any) => selectedBrands.includes(p.brand));
    result = result.filter((p: any) => p.price <= priceRange);
    
    if (sortBy === 'price-low') result.sort((a: any, b: any) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a: any, b: any) => b.price - a.price);
    if (sortBy === 'newest') result.reverse();
    return result;
  }, [products, search, selectedCategory, selectedBrands, priceRange, sortBy]);

  const topSelling = useMemo(() => [...products].sort((a: any, b: any) => a.stock - b.stock).slice(0, 4), [products]);

  const toggleBrand = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const addToCart = (product: any) => {
    const existing = cart.find((item: any) => item.product.id === product.id);
    if (existing) {
      setCart(cart.map((item: any) => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) setWishlist(wishlist.filter((id: string) => id !== productId));
    else setWishlist([...wishlist, productId]);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(cart.map((item: any) => item.product.id === productId ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((item: any) => item.qty > 0));
  };

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.product.price * item.qty), 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/create-shop-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          uid: user?.uid || 'guest',
          profileId: 'shop'
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error("Shop payment error:", err);
      alert(err.message || "Payment process failed. Please contact support.");
      setIsProcessingPayment(false);
    }
  };



  const handleExitShop = () => {
    const confirm = window.confirm("Do you want to exit the shop and back to Homepage?");
    if (confirm) {
        navigate('/');
    }
  };

  const handleBack = () => {
    if (view === 'catalog') {
        handleExitShop();
    } else {
        setView('catalog');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans relative">
      {/* Payment Processing Overlay */}
      <AnimatePresence>
        {isProcessingPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Processing Payment</h3>
              <p className="text-slate-500 text-sm font-medium">Please do not close this window or press back. Contacting secure gateway...</p>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 w-full opacity-50">
                <div className="text-[10px] font-black tracking-widest uppercase">Secured By Stripe</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <hr className="border-slate-100" />
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Price Range</h4>
                  <p className="text-sm font-bold text-slate-900 mb-2">Up to {siteSettings.currency} {priceRange}</p>
                  <input type="range" min="0" max="10000" step="100" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                {brands.length > 0 && (
                  <>
                    <hr className="border-slate-100" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Brands</h4>
                      <div className="flex flex-col gap-3">
                        {brands.map(b => (
                          <label key={b as string} className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={selectedBrands.includes(b as string)} onChange={() => toggleBrand(b as string)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                            {b as string}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-3 md:p-4 gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <button onClick={handleBack} className="p-2 hover:bg-slate-800 rounded-full transition flex items-center gap-1 group">
               <ArrowLeft size={18} />
               <span className="hidden md:inline text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
             </button>
            <h1 className="text-lg md:text-xl font-black tracking-tight"><Link to="/shop">STOREFRONT</Link></h1>
          </div>
          
          <div className="flex-1 max-w-2xl hidden md:flex items-center relative">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input type="text" placeholder="Search products, brands..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white pl-12 pr-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition" />
            
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="absolute right-1 top-1 bottom-1 bg-slate-700 text-sm border-none outline-none rounded-full px-4 text-slate-200 cursor-pointer">
              {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            {user ? (
               <div className="hidden lg:flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">{user.email?.[0].toUpperCase()}</div>
                 <div className="text-sm">
                   <div className="font-bold leading-tight">{user.email?.split('@')[0]}</div>
                   <div className="text-xs text-slate-400">Bal: {siteSettings.currency} {walletBalance}</div>
                 </div>
               </div>
            ) : (
               <Link to="/profile/placeholder" className="hidden lg:flex items-center gap-2 text-sm font-semibold hover:text-blue-400 transition"><User size={18}/> Login</Link>
            )}

            <button onClick={() => setView('orders')} className="flex flex-col items-center gap-0.5 md:gap-1 hover:text-blue-400 transition text-slate-400">
              <Package size={18} />
              <span className="text-[8px] md:text-[10px] font-bold">Orders</span>
            </button>
            <button onClick={() => setView('wishlist')} className="relative flex flex-col items-center gap-0.5 md:gap-1 hover:text-blue-400 transition text-slate-400">
              <Heart size={18} />
              <span className="text-[8px] md:text-[10px] font-bold">Wishlist</span>
              {wishlist.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
            </button>
            <button onClick={() => setView('cart')} className="relative flex flex-col items-center gap-0.5 md:gap-1 hover:text-blue-400 transition text-slate-400">
              <ShoppingCart size={18} />
              <span className="text-[8px] md:text-[10px] font-bold">Cart</span>
              {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{cart.length}</span>}
            </button>
            <button className="md:hidden p-2" onClick={() => setShowMobileSidebar(true)}><Menu size={20} /></button>
          </div>
        </div>
        
        {/* Marquee Navigation Bar */}
        {view === 'catalog' && (
          <div className="bg-slate-800 border-t border-slate-700 py-1.5 overflow-hidden flex items-center relative">
            <div className="flex gap-4 md:gap-8 whitespace-nowrap px-4 animate-marquee">
              {[1, 2].map((loop) => (
                <React.Fragment key={loop}>
                  <span className="text-[10px] md:text-sm font-bold text-amber-400 flex items-center gap-2"><Zap size={12}/> SPECIAL OFFER: GET 20% OFF WALLET RECHARGES</span>
                  <span className="text-xs font-medium text-slate-500">|</span>
                  <span className="text-[10px] md:text-sm font-bold text-blue-400 flex items-center gap-2"><Tag size={12}/> FREE SHIPPING ON ORDERS OVER 500 AED</span>
                  <span className="text-xs font-medium text-slate-500">|</span>
                  <span className="text-[10px] md:text-sm font-bold text-green-400 flex items-center gap-2"><Gift size={12}/> NEW ARRIVALS: METAL NFC CARDS</span>
                  <span className="text-xs font-medium text-slate-500">|</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
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
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Price Range</h4>
                    <p className="text-sm font-bold text-slate-900 mb-2">Up to {siteSettings.currency} {priceRange}</p>
                    <input type="range" min="0" max="10000" step="100" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  {brands.length > 0 && (
                    <>
                      <hr className="border-slate-100" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Brands</h4>
                        <div className="flex flex-col gap-2">
                          {brands.map(b => (
                            <label key={b as string} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                              <input type="checkbox" checked={selectedBrands.includes(b as string)} onChange={() => toggleBrand(b as string)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                              {b as string}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
               <div className="absolute -right-10 -bottom-10 opacity-20"><Zap size={120} /></div>
               <h3 className="font-black text-lg mb-2 relative z-10">Pro Plan Trial</h3>
               <p className="text-sm text-indigo-100 mb-4 relative z-10">Upgrade your digital networking with our Business Pro features.</p>
               <button className="bg-white text-indigo-600 text-sm font-bold py-2 px-4 rounded-full shadow-md hover:bg-indigo-50 transition relative z-10">Get 1 Month Free</button>
             </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {view === 'catalog' && (
            <div className="flex flex-col gap-8">
              {/* Sliders */}
              {(shopBanners && shopBanners.length > 0) && (
                <div className="relative h-48 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg group">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const banner = shopBanners[currentSlide];
                      if (!banner) return null;
                      
                      const bgStyle = banner.background === 'gradient'
                        ? { background: `linear-gradient(to right, ${banner.colorStart}, ${banner.colorEnd})` }
                        : { backgroundImage: `url(${banner.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
                      
                      const fontClass = banner.font === 'serif' ? 'font-serif' : banner.font === 'mono' ? 'font-mono' : 'font-sans';
                      
                      const getAnimation = (type: string) => {
                        if (type === 'fade') return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } };
                        if (type === 'bounce') return { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { type: 'spring', bounce: 0.6 } };
                        if (type === 'slide') return { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { type: 'tween' } };
                        if (type === 'spring') return { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring' } };
                        return { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } };
                      };
                      
                      const anim = getAnimation(banner.animation);

                      return (
                        <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                          className={`absolute inset-0 p-6 md:p-12 flex items-center justify-between ${fontClass}`} style={bgStyle}>
                          {banner.background === 'image' && <div className="absolute inset-0 bg-black/40 z-0" />}
                          
                          <div className="max-w-[70%] md:max-w-md text-white z-10 mix-blend-plus-lighter relative">
                            <motion.span {...anim} className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] md:text-xs font-bold tracking-widest uppercase mb-2 md:mb-4">Featured Item</motion.span>
                            <motion.h2 {...anim} className="text-xl md:text-5xl font-black mb-2 md:mb-4 leading-tight">{banner.title}</motion.h2>
                            <motion.p {...anim} className="text-[10px] md:text-lg text-white/80 font-medium mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">{banner.desc}</motion.p>
                            <motion.button {...anim} className="bg-white text-slate-900 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base flex items-center gap-2 hover:bg-slate-100 transition shadow-xl">Shop Now <ArrowRight size={14}/></motion.button>
                          </div>
                          <motion.div initial={{ x: 50, opacity: 0, rotate: -20 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring' }} className="absolute -right-4 md:relative md:right-0 text-[100px] md:text-[120px] filter drop-shadow-2xl z-10 text-white/20 md:text-white">
                            {banner.imageType === 'icon' ? banner.icon : (
                              banner.imageType === 'image' && banner.imageUrl ? (
                                <img src={banner.imageUrl} alt={banner.title} className="w-32 h-32 md:w-48 md:h-48 object-contain" />
                              ) : null
                            )}
                          </motion.div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                  
                  {/* Slider indicators */}
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
                    {shopBanners.map((_: any, i: number) => (
                      <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 md:h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-4 md:w-8 bg-white' : 'w-1 md:w-2 bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              )}

              {/* Top Selling Section */}
              {search === '' && selectedCategory === 'All' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Star className="text-amber-500 fill-amber-500"/> Top Selling</h2>
                    <button onClick={() => setSortBy('featured')} className="text-blue-600 font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {topSelling.map((p: any) => <ProductCard key={p.id} p={p} siteSettings={siteSettings} toggleWishlist={toggleWishlist} wishlist={wishlist} setView={setView} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />)}
                  </div>
                </div>
              )}

              {/* All Products */}
              <div id="all-products">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4 border-t border-slate-200">
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
                    {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} siteSettings={siteSettings} toggleWishlist={toggleWishlist} wishlist={wishlist} setView={setView} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product View */}
          {view === 'product' && selectedProduct && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-6 md:p-10">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8">
                <button onClick={() => setView('catalog')} className="hover:text-blue-600 transition">Storefront</button> <ChevronRight size={14}/>
                <button onClick={() => { setSelectedCategory(selectedProduct.category); setView('catalog'); }} className="hover:text-blue-600 transition">{selectedProduct.category}</button> <ChevronRight size={14}/>
                <span className="text-slate-900 font-bold">{selectedProduct.name}</span>
              </div>
              
              <div className="flex flex-col md:grid md:grid-cols-2 gap-10 lg:gap-16">
                <div className="aspect-square bg-slate-50 rounded-3xl flex items-center justify-center text-[150px] md:text-[200px] shadow-inner relative group p-10">
                   <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring' }} className="filter drop-shadow-xl">{selectedProduct.icon}</motion.div>
                   {selectedProduct.discountPrice && <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-black uppercase tracking-widest py-1.5 px-3 rounded-full shadow-lg border-2 border-white">Sale</div>}
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-3">{selectedProduct.brand || 'DBCOfficial'}</div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-none tracking-tight">{selectedProduct.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s === 5 ? "text-slate-300 fill-slate-300" : "text-amber-400 fill-amber-400"} />)}
                    </div>
                    <a href="#" className="text-sm font-bold text-blue-600 hover:underline">128 Reviews</a>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className={`text-sm font-bold ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>{selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>

                  <div className="mb-8">
                    {selectedProduct.discountPrice && <div className="text-lg text-slate-500 line-through font-bold mb-1">{siteSettings.currency} {selectedProduct.discountPrice}</div>}
                    <div className="text-4xl md:text-5xl font-black text-slate-900 flex items-baseline gap-2">
                       <span className="text-2xl font-bold text-slate-400">{siteSettings.currency}</span> {selectedProduct.price}
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2"><Check size={16} className="text-green-500"/> Price includes VAT & Delivery</div>
                  </div>

                  <p className="text-slate-600 text-lg leading-relaxed mb-8">{selectedProduct.desc}</p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button onClick={() => addToCart(selectedProduct)} disabled={selectedProduct.stock === 0} className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition ${selectedProduct.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'}`}>
                      <ShoppingCart size={20} /> Add to Cart
                    </button>
                    <button onClick={() => { addToCart(selectedProduct); setView('checkout'); }} disabled={selectedProduct.stock === 0} className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition ${selectedProduct.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30'}`}>
                      Buy Now
                    </button>
                    <button onClick={() => toggleWishlist(selectedProduct.id)} className={`w-16 rounded-2xl border-2 flex items-center justify-center transition ${wishlist.includes(selectedProduct.id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                      <Heart size={24} className={wishlist.includes(selectedProduct.id) ? 'fill-red-500' : ''} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600"><Package size={20}/></div>
                      <div className="text-sm font-bold text-slate-900">Free Next Day<br/><span className="text-slate-500 font-medium">Delivery</span></div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600"><CreditCard size={20}/></div>
                      <div className="text-sm font-bold text-slate-900">Secure 100%<br/><span className="text-slate-500 font-medium">Payment</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cart & Checkout (Unified visual style) */}
          {(view === 'cart' || view === 'checkout') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-8">{view === 'cart' ? 'Shopping Cart' : 'Secure Checkout'}</h2>
              
              {cart.length === 0 && view === 'cart' ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                  <ShoppingCart size={80} className="mx-auto text-slate-200 mb-6" />
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Cart is empty</h3>
                  <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
                  <button onClick={() => setView('catalog')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition">Start Shopping</button>
                </div>
              ) : (
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8">
                  {/* Left Col */}
                  <div className="flex flex-col gap-6">
                    {view === 'cart' && (
                      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                        {cart.map((item: any) => (
                           <div key={item.product.id} className="flex gap-4 md:gap-6 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                             <div className="w-20 md:w-24 aspect-square bg-slate-50 rounded-2xl flex items-center justify-center text-4xl">{item.product.icon}</div>
                             <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1 leading-tight">{item.product.name}</h4>
                                <div className="text-sm font-black text-slate-500 mb-3">{siteSettings.currency} {item.product.price}</div>
                                <div className="flex items-center gap-2 bg-slate-50 w-max rounded-lg p-1 border border-slate-100">
                                  <button onClick={() => updateCartQty(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-slate-600 hover:text-red-500">-</button>
                                  <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                                  <button onClick={() => updateCartQty(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm font-bold text-slate-600 hover:text-green-500">+</button>
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-4">
                                <div className="font-black text-lg md:text-xl text-slate-900">{siteSettings.currency} {item.product.price * item.qty}</div>
                                <button onClick={() => updateCartQty(item.product.id, -item.qty)} className="text-slate-400 hover:text-red-500 transition p-2"><Trash2 size={18}/></button>
                             </div>
                           </div>
                        ))}
                      </div>
                    )}
                    
                    {view === 'checkout' && (
                      <div className="flex flex-col gap-8">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><MapPin className="text-blue-600"/> Delivery Address</h3>
                          <div className="grid gap-4">
                             {addresses.map((a: any) => (
                               <label key={a.id} className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition ${selectedAddress === a.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                 <input type="radio" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="w-5 h-5 accent-blue-600 mt-0.5" />
                                 <div>
                                   <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">{a.type} {a.isDefault && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}</div>
                                   <div className="text-sm text-slate-600 leading-relaxed">{a.address}</div>
                                 </div>
                               </label>
                             ))}
                          </div>
                        </div>

                         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><CreditCard className="text-green-600"/> Payment Method</h3>
                          <div className="grid gap-4">
                             <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition border-blue-600 bg-blue-50`}>
                                <input type="radio" checked={true} readOnly className="w-5 h-5 accent-blue-600" />
                                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center"><CreditCard size={20}/></div>
                                <div className="font-bold text-slate-900">Secure Card Payment (Stripe)</div>
                             </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Col / Summary */}
                  <div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
                      <h3 className="text-lg font-black text-slate-900 mb-6">Order Summary</h3>
                      
                      {view === 'checkout' && (
                        <div className="flex gap-2 mb-6">
                          <input type="text" placeholder="Promo Code" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                          <button onClick={() => { if(couponCode === 'DBC10') setDiscount(subtotal*0.1); else alert('Invalid'); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">Apply</button>
                        </div>
                      )}

                      <div className="space-y-4 mb-6 text-sm font-bold text-slate-500">
                        <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900">{siteSettings.currency} {subtotal}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span className="text-green-500">FREE</span></div>
                        {discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{siteSettings.currency} {discount}</span></div>}
                      </div>
                      
                      <hr className="border-slate-100 border-dashed mb-6" />
                      
                      <div className="flex justify-between items-baseline mb-8">
                        <span className="text-lg font-black text-slate-900">Total</span>
                        <span className="text-3xl font-black text-slate-900">{siteSettings.currency} {total}</span>
                      </div>

                      {view === 'cart' ? (
                        <button onClick={() => setView('checkout')} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition">Proceed to Checkout</button>
                      ) : (
                        <button onClick={handleCheckout} disabled={isProcessingPayment} className={`w-full font-black py-4 rounded-2xl transition ${isProcessingPayment ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600'}`}>
                          {isProcessingPayment ? 'Processing...' : 'Place Order'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {view === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
               <h2 className="text-3xl font-black text-slate-900 mb-8">Your Orders</h2>
               {userOrders.length === 0 ? (
                 <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                   <Package size={80} className="mx-auto text-slate-200 mb-6" />
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                   <button onClick={() => setView('catalog')} className="mt-6 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition">Start Shopping</button>
                 </div>
               ) : (
                 <div className="flex flex-col gap-6">
                   {[...userOrders].reverse().map((o: any) => (
                     <div key={o.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 justify-between">
                       <div>
                         <div className="flex items-center gap-4 mb-2">
                           <h3 className="text-xl font-black text-slate-900">{o.id}</h3>
                           <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{o.status}</span>
                         </div>
                         <div className="text-sm font-medium text-slate-500 mb-6">Placed on {o.date}</div>
                         <div className="flex flex-wrap gap-4">
                           {o.items.map((i: any) => (
                             <div key={i.product.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl pr-6 border border-slate-100">
                               <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">{i.product.icon}</div>
                               <div>
                                 <div className="text-sm font-bold text-slate-900">{i.product.name}</div>
                                 <div className="text-xs font-bold text-slate-500">Qty: {i.qty}</div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                       <div className="flex flex-col justify-center items-start md:items-end md:border-l border-slate-100 md:pl-8">
                         <div className="text-sm font-bold text-slate-500 mb-1">Total Paid</div>
                         <div className="text-3xl font-black text-slate-900">{siteSettings.currency} {o.total}</div>
                         <button className="mt-4 text-sm font-bold text-blue-600 hover:underline">Track Order</button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </motion.div>
          )}

          {view === 'wishlist' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-3xl font-black text-slate-900 mb-8">My Wishlist</h2>
               {wishlist.length === 0 ? (
                 <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-4xl mx-auto">
                   <Heart size={80} className="mx-auto text-slate-200 mb-6" />
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Wishlist is empty</h3>
                   <button onClick={() => setView('catalog')} className="mt-6 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition">Discover Products</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                   {products.filter((p: any) => wishlist.includes(p.id)).map((p: any) => (
                     <ProductCard key={p.id} p={p} siteSettings={siteSettings} toggleWishlist={toggleWishlist} wishlist={wishlist} setView={setView} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />
                   ))}
                 </div>
               )}
            </motion.div>
          )}

        </main>
      </div>

    </div>
  );
}

// Reusable Product Card
const ProductCard = ({ p, siteSettings, toggleWishlist, wishlist, setView, setSelectedProduct, addToCart }: any) => (
  <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100 group relative flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    {/* Badges */}
    <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
      {p.stock === 0 && <span className="bg-slate-900 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-sm uppercase tracking-widest">Out of Stock</span>}
      {p.discountPrice && <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-sm uppercase tracking-widest">Sale</span>}
    </div>
    
    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} className={`absolute top-2 md:top-4 right-2 md:right-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition ${wishlist.includes(p.id) ? 'text-red-500' : 'text-slate-300 hover:text-slate-400'}`}>
      <Heart size={16} className={wishlist.includes(p.id) ? 'fill-red-500' : ''} />
    </button>
    
    <div onClick={() => { setSelectedProduct(p); setView('product'); }} className="aspect-[4/3] bg-slate-50 flex items-center justify-center text-5xl md:text-8xl cursor-pointer relative overflow-hidden">
      <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} className="z-0 filter drop-shadow-md">
        {p.icon || '📦'}
      </motion.div>
    </div>
    
    <div className="p-3 md:p-5 flex flex-col flex-1">
      <div className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 md:mb-2">{p.brand || p.category}</div>
      <h3 onClick={() => { setSelectedProduct(p); setView('product'); }} className="font-bold text-slate-900 text-xs md:text-base mb-2 md:mb-3 leading-snug cursor-pointer group-hover:text-blue-600 transition line-clamp-2">{p.name}</h3>
      
      <div className="mt-auto flex items-end justify-between">
        <div>
           {p.discountPrice && <div className="text-[10px] text-slate-400 line-through font-bold mb-0.5">{siteSettings.currency} {p.discountPrice}</div>}
           <div className="font-black text-sm md:text-xl text-slate-900">{siteSettings.currency} {p.price}</div>
        </div>
        <button onClick={() => addToCart(p)} disabled={p.stock === 0} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl transition ${p.stock === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95'}`}>
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  </div>
);
