import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AdminProducts() {
  const { products: contextProducts } = useAppContext();
  const [products, setProducts] = useState(contextProducts || []);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'Active'
  });

  useEffect(() => {
    if (products.length === 0 && contextProducts.length > 0) {
      setProducts(contextProducts);
    }
  }, [contextProducts]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', stock: '', status: 'Active' });
    setShowModal(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category || 'NFC Card',
      price: product.price,
      stock: product.stock,
      status: product.status || 'Active'
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
      setProducts(products.map((p: any) => p.id === editingId ? { ...p, ...formData } : p));
    } else {
      setProducts([...products, { ...formData, id: `PROD-${Date.now().toString().slice(-4)}` }]);
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Product Manager</h2>
        </div>
        <div style={{display: 'flex', gap: 10}}>
          <button className="topbar-btn btn-gold" onClick={handleOpenAdd}>+ Add Product</button>
        </div>
      </div>

      <div className="filters">
        <div className="search-bar" style={{width: 220}}>
          <span style={{color: 'var(--text3)'}}>🔍</span>
          <input type="text" placeholder="Search products..." />
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <div style={{fontWeight: 600, color: 'var(--text)'}}>{p.name}</div>
                </td>
                <td style={{fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)'}}>{p.id}</td>
                <td>{p.category}</td>
                <td style={{color: 'var(--gold2)', fontWeight: 700}}>AED {p.price}</td>
                <td>
                  <span style={{color: p.stock > 10 ? 'var(--green)' : p.stock > 0 ? 'var(--orange)' : 'var(--red)', fontWeight: 600}}>
                    {p.stock} in stock
                  </span>
                </td>
                <td>
                  <span className={`badge ${p.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{display: 'flex', gap: 6}}>
                  <button className="action-btn" onClick={() => handleOpenEdit(p)}>Edit</button>
                  <button className="action-btn" style={{color: 'var(--red)'}} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 400}}>
            <h3 style={{margin: '0 0 20px', fontSize: 18}}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} />
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Price (AED)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} />
                </div>
              </div>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: 12, marginTop: 12}}>
                <button type="button" onClick={() => setShowModal(false)} style={{flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>
                <button type="submit" style={{flex: 1, padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
