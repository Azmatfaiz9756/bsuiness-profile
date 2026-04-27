import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ShoppingCart, Heart, Search, ArrowLeft, Package, MapPin, Tag, CreditCard, Wallet, Trash2 } from 'lucide-react';

export default function FrontendShop() {
  const { products, cart, setCart, wishlist, setWishlist, userOrders, setUserOrders, addresses, walletBalance, setWalletBalance, siteSettings } = useAppContext();
  const [view, setView] = useState<'catalog' | 'product' | 'cart' | 'checkout' | 'orders' | 'wishlist'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filter, setFilter] = useState('All Products');
  const [search, setSearch] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const filteredProducts = products.filter((p: any) => 
    (filter === 'All Products' || p.category === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id: string) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'DBC10') {
      setDiscount(subtotal * 0.10);
      alert('10% Discount applied!');
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'wallet' && walletBalance < total) {
      alert('Insufficient wallet balance');
      return;
    }
    if (paymentMethod === 'wallet') {
      setWalletBalance((prev: number) => prev - total);
    }
    
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total,
      addressId: selectedAddress,
      status: 'Placed',
      date: new Date().toLocaleDateString()
    };
    
    setUserOrders([...userOrders, newOrder]);
    setCart([]);
    setDiscount(0);
    setCouponCode('');
    setView('orders');
    alert('Order placed successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12 font-sans">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          {view !== 'catalog' && (
            <button onClick={() => setView('catalog')} className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 m-0">
            {view === 'catalog' ? 'Official Store' : view.charAt(0).toUpperCase() + view.slice(1)}
          </h2>
        </div>
        <div className="flex gap-4 md:gap-6">
          <button onClick={() => setView('orders')} className={`relative transition-colors ${view === 'orders' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
            <Package size={24} />
          </button>
          <button onClick={() => setView('wishlist')} className={`relative transition-colors ${view === 'wishlist' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
            <Heart size={24} />
            {wishlist.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold px-1">{wishlist.length}</span>}
          </button>
          <button onClick={() => setView('cart')} className={`relative transition-colors ${view === 'cart' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold px-1">{cart.length}</span>}
          </button>
        </div>
      </div>

      {view === 'catalog' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 pl-11 pr-4 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0 md:max-w-[60%]">
              {['All Products', 'NFC Cards', 'Accessories', 'Stickers', 'Bundles'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-full border text-sm font-bold transition-all shrink-0 ${filter === cat ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p: any) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col group">
                <button 
                  onClick={() => toggleWishlist(p.id)}
                  className={`absolute top-3 right-3 bg-white/80 backdrop-blur border border-slate-200 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <Heart size={18} className={wishlist.includes(p.id) ? 'fill-red-500' : ''} />
                </button>
                <div onClick={() => { setSelectedProduct(p); setView('product'); }} className="h-48 md:h-56 bg-slate-100 flex items-center justify-center text-6xl md:text-7xl cursor-pointer group-hover:scale-105 transition-transform duration-300">
                  {p.icon}
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
                  <div className="text-[10px] md:text-xs text-blue-600 uppercase tracking-widest font-extrabold mb-1.5">{p.category}</div>
                  <div onClick={() => { setSelectedProduct(p); setView('product'); }} className="text-base md:text-lg font-extrabold text-slate-900 mb-2 cursor-pointer line-clamp-2 min-h-[3rem]">{p.name}</div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <div className="text-lg md:text-xl font-black text-slate-900">{siteSettings.currency} {p.price}</div>
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${p.stock === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {p.stock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'product' && selectedProduct && (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
           <div className="h-64 md:h-96 bg-slate-100 rounded-2xl flex items-center justify-center text-8xl md:text-9xl">
              {selectedProduct.icon}
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{selectedProduct.category}</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111827', marginBottom: 16, lineHeight: 1.2 }}>{selectedProduct.name}</h1>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1e40af', marginBottom: 24 }}>{siteSettings.currency} {selectedProduct.price}</div>
              <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.6, marginBottom: 32 }}>{selectedProduct.desc}</p>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  disabled={selectedProduct.stock === 0}
                  style={{ flex: 1, background: selectedProduct.stock === 0 ? '#d1d5db' : '#111827', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: selectedProduct.stock === 0 ? 'not-allowed' : 'pointer' }}
                >
                  {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  style={{ width: 56, height: 56, background: '#fff', border: '1px solid #d1d5db', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlist.includes(selectedProduct.id) ? '#ef4444' : '#6b7280' }}
                >
                  <Heart size={24} fill={wishlist.includes(selectedProduct.id) ? '#ef4444' : 'none'} />
                </button>
              </div>
              <div style={{ marginTop: 24, fontSize: 14, color: selectedProduct.stock > 0 ? '#059669' : '#ef4444', fontWeight: 600 }}>
                {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Currently unavailable'}
              </div>
           </div>
        </div>
      )}

      {view === 'cart' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShoppingCart size={64} className="text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl text-slate-700 mb-6 font-semibold">Your cart is empty</h3>
              <button onClick={() => setView('catalog')} className="bg-slate-900 hover:bg-slate-800 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-bold transition-colors">Continue Shopping</button>
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-[1fr_350px] gap-8">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold mb-6 border-b border-slate-200 pb-4">Shopping Cart ({cart.length} items)</h3>
                <div className="flex flex-col gap-5">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 border border-slate-100 p-4 rounded-xl items-start sm:items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-lg flex items-center justify-center text-3xl sm:text-4xl shrink-0">{item.product.icon}</div>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                          <div className="font-bold text-slate-900">{item.product.name}</div>
                          <div className="font-black text-blue-700">{siteSettings.currency} {item.product.price * item.qty}</div>
                        </div>
                        <div className="text-slate-500 text-sm mb-3">{siteSettings.currency} {item.product.price} each</div>
                        <div className="flex justify-between items-center sm:items-start flex-wrap gap-3">
                          <div className="flex items-center gap-3 border border-slate-300 rounded-lg p-1">
                            <button onClick={() => updateCartQty(item.product.id, -1)} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center transition-colors">-</button>
                            <span className="font-bold w-5 text-center text-sm">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center transition-colors">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} className="bg-transparent border-none text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1.5 text-sm font-bold transition-colors">
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit mt-2 md:mt-0">
                <h3 className="text-lg font-bold mb-5 text-slate-900">Order Summary</h3>
                <div className="flex justify-between mb-3 text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>{siteSettings.currency} {subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-3 text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{siteSettings.currency} {discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 my-4" />
                <div className="flex justify-between mb-6 font-black text-lg md:text-xl text-slate-900">
                  <span>Total</span>
                  <span>{siteSettings.currency} {total}</span>
                </div>
                
                <button onClick={() => setView('checkout')} className="w-full bg-slate-900 hover:bg-slate-800 text-white border-none py-3.5 rounded-xl font-bold transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'checkout' && (
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 order-2 lg:order-1">
            <h2 className="text-xl md:text-2xl font-black mb-8 text-slate-900">Checkout</h2>
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold m-0 text-slate-900">Shipping Address</h3>
              </div>
              <div className="flex flex-col gap-3">
                {addresses.map((addr: any) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <div className="font-bold mb-1 flex items-center text-slate-900">{addr.type} {addr.isDefault && <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-xs ml-2 font-bold uppercase tracking-wider">Default</span>}</div>
                      <div className="text-slate-600 text-sm leading-relaxed">{addr.address}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold m-0 text-slate-900">Payment Method</h3>
              </div>
              <div className="flex flex-col gap-3">
                <label className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="shrink-0" />
                  <Wallet size={20} className="text-slate-500 shrink-0" />
                  <div className="flex-1 font-bold text-slate-900 whitespace-nowrap">DBC Wallet</div>
                  <div className={`font-bold ml-auto text-sm sm:text-base w-full sm:w-auto text-right mt-2 sm:mt-0 ${walletBalance >= total ? 'text-emerald-600' : 'text-red-500'}`}>Balance: {siteSettings.currency} {walletBalance}</div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="shrink-0" />
                  <CreditCard size={20} className="text-slate-500 shrink-0" />
                  <div className="font-bold text-slate-900">Credit / Debit Card</div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="h-fit flex flex-col gap-6 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={20} className="text-blue-600" />
                <h3 className="text-base font-bold m-0 text-slate-900">Apply Coupon</h3>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code (try DBC10)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
                />
                <button onClick={handleApplyCoupon} className="bg-slate-900 hover:bg-slate-800 text-white border-none px-4 py-2.5 rounded-lg font-bold transition-colors shadow-sm">Apply</button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-5 text-slate-900">Order Summary</h3>
              <div className="flex flex-col gap-3 mb-5">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm text-slate-600 font-medium">
                    <span className="truncate pr-4">{item.qty}x {item.product.name}</span>
                    <span className="font-bold text-slate-900 whitespace-nowrap">{siteSettings.currency} {item.product.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-300 my-4" />
              <div className="flex justify-between mb-3 text-slate-600 font-medium text-sm md:text-base">
                <span>Subtotal</span>
                <span>{siteSettings.currency} {subtotal}</span>
              </div>
              <div className="flex justify-between mb-3 text-slate-600 font-medium text-sm md:text-base">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-3 text-emerald-600 font-medium text-sm md:text-base">
                  <span>Discount</span>
                  <span>-{siteSettings.currency} {discount}</span>
                </div>
              )}
              <div className="border-t border-slate-300 my-4" />
              <div className="flex justify-between mb-6 font-black text-lg md:text-xl text-slate-900">
                <span>Total</span>
                <span>{siteSettings.currency} {total}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={paymentMethod === 'wallet' && walletBalance < total}
                className={`w-full text-white border-none py-3.5 rounded-xl font-bold transition-colors shadow-sm ${paymentMethod === 'wallet' && walletBalance < total ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-slate-900">My Orders</h2>
          {userOrders.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 font-medium">No orders yet.</div>
          ) : (
            <div className="flex flex-col gap-4 md:gap-6">
              {userOrders.map((order: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 md:p-6 bg-slate-50">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between mb-4 border-b border-slate-200 pb-4 gap-4">
                    <div className="w-1/2 sm:w-auto">
                      <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Order ID</div>
                      <div className="font-bold text-slate-900">{order.id}</div>
                    </div>
                    <div className="w-1/2 sm:w-auto text-right sm:text-left">
                      <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Date</div>
                      <div className="font-bold text-slate-700">{order.date}</div>
                    </div>
                    <div className="w-full sm:w-auto sm:text-right mt-2 sm:mt-0">
                      <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider hidden sm:block">Total</div>
                      <div className="font-black text-blue-700 text-lg">{siteSettings.currency} {order.total}</div>
                    </div>
                    <div className="w-full sm:w-auto mt-2 sm:mt-0 text-right">
                      <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Status</div>
                      <div className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1 pb-1.5 rounded-full text-xs inline-block">{order.status}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xl shrink-0">{item.product.icon}</div>
                        <div className="flex-1 text-sm font-medium text-slate-700">{item.qty}x {item.product.name}</div>
                        <div className="text-sm font-bold text-slate-900">{siteSettings.currency} {item.product.price * item.qty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'wishlist' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-slate-900">My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 font-medium">Your wishlist is empty.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => wishlist.includes(p.id)).map((p: any) => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col group">
                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur border border-slate-200 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors z-10 text-red-500 hover:text-red-600"
                  >
                    <Heart size={18} className="fill-red-500" />
                  </button>
                  <div onClick={() => { setSelectedProduct(p); setView('product'); }} className="h-48 md:h-56 bg-slate-100 flex items-center justify-center text-6xl md:text-7xl cursor-pointer group-hover:scale-105 transition-transform duration-300">
                    {p.icon}
                  </div>
                  <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
                    <div className="text-[10px] md:text-xs text-blue-600 uppercase tracking-widest font-extrabold mb-1.5">{p.category}</div>
                    <div onClick={() => { setSelectedProduct(p); setView('product'); }} className="text-base md:text-lg font-extrabold text-slate-900 mb-2 cursor-pointer line-clamp-2 min-h-[3rem]">{p.name}</div>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                      <div className="text-lg md:text-xl font-black text-slate-900">{siteSettings.currency} {p.price}</div>
                      <button 
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${p.stock === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        {p.stock === 0 ? 'Out of Stock' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

