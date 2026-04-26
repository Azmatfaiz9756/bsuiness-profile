import React, { useState } from 'react';

export default function AdminPromoCodes() {
  const [promos, setPromos] = useState([
    { id: '1', code: 'SUMMER2026', discount: '20%', type: 'Percentage', usage: 45, status: 'Active' },
    { id: '2', code: 'NEWUSER50', discount: '50 AED', type: 'Fixed', usage: 120, status: 'Active' },
    { id: '3', code: 'FLASHX', discount: '15%', type: 'Percentage', usage: 890, status: 'Expired' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'Percentage',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ code: '', discount: '', type: 'Percentage', status: 'Active' });
    setShowModal(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code,
      discount: promo.discount.replace(/[^0-9.]/g, ''),
      type: promo.type,
      status: promo.status
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      setPromos(promos.filter((p: any) => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDiscount = formData.type === 'Percentage' ? `${formData.discount}%` : `${formData.discount} AED`;
    
    if (editingId) {
      setPromos(promos.map((p: any) => p.id === editingId ? { ...p, ...formData, discount: formattedDiscount } : p));
    } else {
      setPromos([...promos, { ...formData, discount: formattedDiscount, id: Date.now().toString(), usage: 0 }]);
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Promo Codes</h2>
        </div>
        <div style={{display: 'flex', gap: 10}}>
          <button className="topbar-btn btn-gold" onClick={handleOpenAdd}>+ Create Promo</button>
        </div>
      </div>

      <div className="filters">
        <div className="search-bar" style={{width: 220}}>
          <span style={{color: 'var(--text3)'}}>🔍</span>
          <input type="text" placeholder="Search codes..." />
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Promo Code</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <div style={{fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace', fontSize: 16}}>{p.code}</div>
                </td>
                <td>{p.type}</td>
                <td style={{color: 'var(--gold2)', fontWeight: 700}}>{p.discount}</td>
                <td style={{fontWeight: 600}}>{p.usage} times</td>
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
            <h3 style={{margin: '0 0 20px', fontSize: 18}}>{editingId ? 'Edit Promo' : 'Create Promo Code'}</h3>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Code</label>
                <input required type="text" value={formData.code} style={{textTransform: 'uppercase', width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}}>
                    <option>Percentage</option>
                    <option>Fixed</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Discount Value</label>
                  <input required type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} placeholder={formData.type === 'Percentage' ? '%' : 'AED'} />
                </div>
              </div>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}}>
                  <option>Active</option>
                  <option>Expired</option>
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
