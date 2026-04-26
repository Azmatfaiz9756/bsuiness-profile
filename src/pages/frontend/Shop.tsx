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
    <div className="section" style={{ maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#fff', padding: '16px 24px', borderRadius: 16, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {view !== 'catalog' && (
            <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
            {view === 'catalog' ? 'Official Store' : view.charAt(0).toUpperCase() + view.slice(1)}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => setView('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: view === 'orders' ? '#2563eb' : '#6b7280', position: 'relative' }}>
            <Package size={24} />
          </button>
          <button onClick={() => setView('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: view === 'wishlist' ? '#2563eb' : '#6b7280', position: 'relative' }}>
            <Heart size={24} />
            {wishlist.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlist.length}</span>}
          </button>
          <button onClick={() => setView('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: view === 'cart' ? '#2563eb' : '#6b7280', position: 'relative' }}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </button>
        </div>
      </div>

      {view === 'catalog' && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 250 }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: 13, color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {['All Products', 'NFC Cards', 'Accessories', 'Stickers', 'Bundles'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === cat ? '#1e40af' : '#d1d5db'}`, background: filter === cat ? '#1e40af' : '#fff', color: filter === cat ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredProducts.map((p: any) => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', position: 'relative', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <button 
                  onClick={() => toggleWishlist(p.id)}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlist.includes(p.id) ? '#ef4444' : '#9ca3af' }}
                >
                  <Heart size={18} fill={wishlist.includes(p.id) ? '#ef4444' : 'none'} />
                </button>
                <div onClick={() => { setSelectedProduct(p); setView('product'); }} style={{ height: 180, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, cursor: 'pointer' }}>
                  {p.icon}
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>{p.category}</div>
                  <div onClick={() => { setSelectedProduct(p); setView('product'); }} style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8, cursor: 'pointer', minHeight: 40 }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1e40af' }}>{siteSettings.currency} {p.price}</div>
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      style={{ background: p.stock === 0 ? '#d1d5db' : '#111827', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: p.stock === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'product' && selectedProduct && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: 40, background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e5e7eb' }}>
           <div style={{ height: 400, background: '#f3f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120 }}>
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
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ShoppingCart size={64} style={{ color: '#d1d5db', margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: 20, color: '#374151', marginBottom: 16 }}>Your cart is empty</h3>
              <button onClick={() => setView('catalog')} style={{ background: '#111827', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>Continue Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 32 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>Shopping Cart ({cart.length} items)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', gap: 16, border: '1px solid #f3f4f6', padding: 16, borderRadius: 12 }}>
                      <div style={{ width: 80, height: 80, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{item.product.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: '#111827' }}>{item.product.name}</div>
                          <div style={{ fontWeight: 800, color: '#1e40af' }}>{siteSettings.currency} {item.product.price * item.qty}</div>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>{siteSettings.currency} {item.product.price} each</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #d1d5db', borderRadius: 6, padding: 4 }}>
                            <button onClick={() => updateCartQty(item.product.id, -1)} style={{ width: 28, height: 28, border: 'none', background: '#f3f4f6', borderRadius: 4, cursor: 'pointer' }}>-</button>
                            <span style={{ fontWeight: 600, width: 20, textAlign: 'center' }}>{item.qty}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} style={{ width: 28, height: 28, border: 'none', background: '#f3f4f6', borderRadius: 4, cursor: 'pointer' }}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', padding: 24, borderRadius: 16, border: '1px solid #e5e7eb', height: 'fit-content' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#4b5563' }}>
                  <span>Subtotal</span>
                  <span>{siteSettings.currency} {subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#059669' }}>
                    <span>Discount</span>
                    <span>-{siteSettings.currency} {discount}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #d1d5db', margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 800, fontSize: 18, color: '#111827' }}>
                  <span>Total</span>
                  <span>{siteSettings.currency} {total}</span>
                </div>
                
                <button onClick={() => setView('checkout')} style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'checkout' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Checkout</h2>
            
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MapPin size={20} color="#2563eb" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Shipping Address</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map((addr: any) => (
                  <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, border: `2px solid ${selectedAddress === addr.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer', background: selectedAddress === addr.id ? '#eff6ff' : '#fff' }}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} style={{ marginTop: 4 }} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{addr.type} {addr.isDefault && <span style={{ fontSize: 10, background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Default</span>}</div>
                      <div style={{ color: '#4b5563', fontSize: 14 }}>{addr.address}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CreditCard size={20} color="#2563eb" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Payment Method</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: `2px solid ${paymentMethod === 'wallet' ? '#2563eb' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                  <Wallet size={20} color="#6b7280" />
                  <div style={{ flex: 1, fontWeight: 600 }}>DBC Wallet</div>
                  <div style={{ fontWeight: 700, color: walletBalance >= total ? '#059669' : '#ef4444' }}>Balance: {siteSettings.currency} {walletBalance}</div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: `2px solid ${paymentMethod === 'card' ? '#2563eb' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <CreditCard size={20} color="#6b7280" />
                  <div style={{ fontWeight: 600 }}>Credit / Debit Card</div>
                </label>
              </div>
            </div>
          </div>
          
          <div style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Tag size={20} color="#2563eb" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Apply Coupon</h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  placeholder="Enter code (try DBC10)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                />
                <button onClick={handleApplyCoupon} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: 24, borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#4b5563' }}>{item.qty}x {item.product.name}</span>
                    <span style={{ fontWeight: 600 }}>{siteSettings.currency} {item.product.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #d1d5db', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#4b5563' }}>
                <span>Subtotal</span>
                <span>{siteSettings.currency} {subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#4b5563' }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#059669' }}>
                  <span>Discount</span>
                  <span>-{siteSettings.currency} {discount}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #d1d5db', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 800, fontSize: 18, color: '#111827' }}>
                <span>Total</span>
                <span>{siteSettings.currency} {total}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={paymentMethod === 'wallet' && walletBalance < total}
                style={{ width: '100%', background: (paymentMethod === 'wallet' && walletBalance < total) ? '#d1d5db' : '#2563eb', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: (paymentMethod === 'wallet' && walletBalance < total) ? 'not-allowed' : 'pointer' }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>My Orders</h2>
          {userOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No orders yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {userOrders.map((order: any, idx: number) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Order ID</div>
                      <div style={{ fontWeight: 700 }}>{order.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Date</div>
                      <div style={{ fontWeight: 600 }}>{order.date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Total</div>
                      <div style={{ fontWeight: 700, color: '#1e40af' }}>{siteSettings.currency} {order.total}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Status</div>
                      <div style={{ fontWeight: 600, color: '#059669', background: '#dcfce7', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>{order.status}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {order.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.product.icon}</div>
                        <div style={{ flex: 1, fontSize: 14 }}>{item.qty}x {item.product.name}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#4b5563' }}>{siteSettings.currency} {item.product.price * item.qty}</div>
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
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>Your wishlist is empty.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {products.filter(p => wishlist.includes(p.id)).map((p: any) => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Heart size={18} fill="#ef4444" />
                  </button>
                  <div onClick={() => { setSelectedProduct(p); setView('product'); }} style={{ height: 180, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, cursor: 'pointer' }}>
                    {p.icon}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>{p.category}</div>
                    <div onClick={() => { setSelectedProduct(p); setView('product'); }} style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8, cursor: 'pointer', minHeight: 40 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#1e40af' }}>{siteSettings.currency} {p.price}</div>
                      <button 
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                        style={{ background: p.stock === 0 ? '#d1d5db' : '#111827', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: p.stock === 0 ? 'not-allowed' : 'pointer' }}
                      >
                        Add to Cart
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

