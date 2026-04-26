import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AdminShopOrders() {
  const { orders: contextOrders } = useAppContext();
  const [orders, setOrders] = useState(contextOrders || []);
  const [viewedOrder, setViewedOrder] = useState<any>(null);

  useEffect(() => {
    if (orders.length === 0 && contextOrders.length > 0) {
      setOrders(contextOrders);
    }
  }, [contextOrders]);

  const handleExport = () => {
    alert("Exporting CSV file...");
  };

  const handleUpdateStatus = (newStatus: string) => {
    if(!viewedOrder) return;
    setOrders(orders.map((o: any) => o.id === viewedOrder.id ? { ...o, status: newStatus } : o));
    setViewedOrder({ ...viewedOrder, status: newStatus });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Shop Orders</h2>
        </div>
        <button className="topbar-btn" onClick={handleExport}>📥 Export CSV</button>
      </div>

      <div className="filters">
        <select className="filter-select"><option>All Status</option></select>
        <select className="filter-select"><option>All Payment</option></select>
        <select className="filter-select"><option>This Month</option></select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id}>
                <td style={{fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)'}}>{o.id}</td>
                <td style={{fontWeight: 600, color: 'var(--text)'}}>{o.customer}</td>
                <td>{o.items} items</td>
                <td style={{color: 'var(--gold2)', fontWeight: 700}}>AED {o.total}</td>
                <td>
                  <span className={`badge ${o.status === 'Delivered' ? 'badge-green' : o.status === 'Shipped' ? 'badge-blue' : 'badge-gold'}`}>
                    {o.status}
                  </span>
                </td>
                <td style={{color: 'var(--text3)', fontSize: 12}}>{o.date}</td>
                <td>
                  <button className="action-btn" onClick={() => setViewedOrder(o)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewedOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 500}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <h3 style={{margin: 0, fontSize: 18}}>Order Details {viewedOrder.id}</h3>
              <button onClick={() => setViewedOrder(null)} style={{background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Customer</div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{viewedOrder.customer}</div>
                </div>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Date</div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{viewedOrder.date}</div>
                </div>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Items</div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{viewedOrder.items} x Items</div>
                </div>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Total Paid</div>
                  <div style={{fontSize: 14, fontWeight: 600, color: '#2563eb'}}>AED {viewedOrder.total}</div>
                </div>
              </div>

              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Update Status</label>
                <div style={{display: 'flex', gap: 8}}>
                  {['Processing', 'Shipped', 'Delivered'].map(st => (
                    <button 
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: viewedOrder.status === st ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: viewedOrder.status === st ? '#eff6ff' : '#fff',
                        color: viewedOrder.status === st ? '#1e40af' : '#64748b'
                      }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: 12, marginTop: 24}}>
              <button onClick={() => setViewedOrder(null)} style={{flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
