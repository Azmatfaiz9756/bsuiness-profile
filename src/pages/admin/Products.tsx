import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Package, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';

export default function AdminProducts() {
  const { products, setProducts } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const categories = [
    'Clothing & Garments', 'Toys & Games', 'Mobile Phones', 'Accessories', 'Gadgets',
    'Laptops & Computers', 'Tablets & iPads', 'Electronics', 'Antique Items', 
    'Digital Products', 'Home Appliances', 'NFC Cards', 'Books', 'Other'
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    status: 'Active',
    description: '',
    specifications: '',
    weight: '',
    isDigital: false
  });



  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'Electronics', brand: '', price: '', discountPrice: '', stock: '', status: 'Active', description: '', specifications: '', weight: '', isDigital: false });
    setShowModal(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      category: product.category || 'Electronics',
      brand: product.brand || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      status: product.status || 'Active',
      description: product.desc || product.description || '',
      specifications: product.specifications || '',
      weight: product.weight || '',
      isDigital: product.isDigital || false
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p: any) => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProducts(products.map((p: any) => p.id === editingId ? { ...p, ...formData, desc: formData.description } : p));
    } else {
      setProducts([{ ...formData, id: `PROD-${Date.now().toString().slice(-4)}`, desc: formData.description, icon: '📦' }, ...products]);
    }
    setShowModal(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Advanced Product Catalog</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Manage global e-commerce inventory across all categories.</p>
        </div>
        <button onClick={handleOpenAdd} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search by name, SKU, brand..." style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 14, fontWeight: 500 }}>
          <Filter size={18} /> Category Filter:
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Product Details</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Category/Brand</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pricing</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Inventory</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.icon || '📦'}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>SKU: {p.id}</div>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: 14 }}>
                  <div style={{ fontWeight: 500, color: '#334155' }}>{p.category}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{p.brand || '-'}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 15 }}>AED {p.price}</div>
                  {p.discountPrice && <div style={{ fontSize: 12, color: '#ef4444', textDecoration: 'line-through' }}>AED {p.discountPrice}</div>}
                </td>
                <td style={{ padding: '16px' }}>
                  {p.isDigital ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#8b5cf6', background: '#ede9fe', padding: '4px 8px', borderRadius: 4 }}>Digital</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: p.stock > 10 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444' }}>
                      {p.stock} Units
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 12, background: p.status === 'Active' ? '#dcfce7' : '#fee2e2', color: p.status === 'Active' ? '#166534' : '#991b1b' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleOpenEdit(p)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{editingId ? 'Edit Product Options' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto' }}>
              <form id="productForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Product Title</label>
                    <input required type="text" placeholder="e.g. iPhone 15 Pro Max, 256GB" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Brand</label>
                    <input type="text" placeholder="e.g. Apple, Nike" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Category</label>
                    <select value={formData.category || 'Electronics'} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Weight (kg) <span style={{color:'#94a3b8',fontWeight:400}}>(Optional)</span></label>
                    <input type="number" step="0.01" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      <input type="checkbox" checked={formData.isDigital} onChange={e => setFormData({...formData, isDigital: e.target.checked})} style={{ width: 18, height: 18 }} />
                      This is a Digital Product
                    </label>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Pricing & Inventory</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 }}>Regular Price (AED)</label>
                      <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 }}>Discount Price (Optional)</label>
                      <input type="number" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 }}>Stock Quantity</label>
                      <input required={!formData.isDigital} type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: e.target.value})} disabled={formData.isDigital} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', background: formData.isDigital ? '#e2e8f0' : '#fff' }} />
                    </div>
                  </div>
                </div>

                {/* Description & Specs */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Detailed Description</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Write a compelling description for this product..." style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Technical Specifications / Features (Bullet points)</label>
                  <textarea value={formData.specifications || ''} onChange={e => setFormData({...formData, specifications: e.target.value})} rows={3} placeholder="- 6.7-inch Super Retina XDR display\n- A17 Pro chip\n- Titanium design" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Product Status</label>
                  <select value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '200px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none' }}>
                    <option value="Active">Active (Visible in Store)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" form="productForm" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

