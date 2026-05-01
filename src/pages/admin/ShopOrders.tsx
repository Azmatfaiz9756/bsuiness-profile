import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

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
    let csv = "ID,Customer,Items,Total,Status,Date\n";
    orders.forEach((o: any) => {
      csv += `${o.id},"${o.customer}",${o.items},${o.total},${o.status},"${o.date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "shop_orders.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Orders exported to CSV!");
  };

  const handleDownloadLabel = (courier: string) => {
    const labelData = `--- ${courier} SHIPPING LABEL ---\nOrder ID: ${viewedOrder.id}\nCustomer: ${viewedOrder.customer}\nDate: ${new Date().toLocaleDateString()}\n\nDeliver To: UAE\nWeight: 1.2kg\nTotal Items: ${viewedOrder.items}\n----------------------------------`;
    const blob = new Blob([labelData], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courier.toLowerCase()}_label_${viewedOrder.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${courier} Label downloaded successfully!`);
  };

  const [splitModalOpen, setSplitModalOpen] = useState(false);

  const handleUpdateStatus = (newStatus: string) => {
    if(!viewedOrder) return;
    setOrders(orders.map((o: any) => o.id === viewedOrder.id ? { ...o, status: newStatus } : o));
    setViewedOrder({ ...viewedOrder, status: newStatus });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 24, fontWeight: 800, color: '#0f172a'}}>Order & Logistics Tracking</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Manage split shipments, print Aramex labels, and returns.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="topbar-btn" onClick={() => toast.success('Aramex API Settings Dashboard opened...')} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: 8, fontWeight: 600 }}>⚙️ Couriers</button>
          <button className="topbar-btn" onClick={handleExport} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600 }}>📥 Export CSV</button>
        </div>
      </div>

      <div className="filters" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select className="filter-select" style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}><option>All Status</option><option>Pending Return</option><option>Inspecting</option></select>
        <select className="filter-select" style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}><option>All Payment</option></select>
        <select className="filter-select" style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}><option>This Month</option></select>
        <div style={{ flex: 1, position: 'relative' }}>
          <input type="text" placeholder="Global Search: Order ID, Customer Name, or IMEI..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Order #</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Items / Split</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>{o.id}</td>
                <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{o.customer}<br/><span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{o.date}</span></td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{o.items} items</div>
                  <span onClick={() => { setViewedOrder(o); setSplitModalOpen(true); }} style={{ cursor: 'pointer', fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>📦 Split Shipment</span>
                </td>
                <td style={{ padding: '16px', color: '#10b981', fontWeight: 700 }}>AED {o.total}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 12, background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Shipped' ? '#dbeafe' : '#fef3c7', color: o.status === 'Delivered' ? '#166534' : o.status === 'Shipped' ? '#1e40af' : '#b45309' }}>
                    {o.status}
                  </span>
                  {o.id === 'ORD-5432' && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>Inspect Return</div>}
                </td>
                <td style={{ padding: '16px' }}>
                  <button style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#334155' }} onClick={() => setViewedOrder(o)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewedOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 16, width: '100%', maxWidth: 600, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <h3 style={{margin: 0, fontSize: 18, fontWeight: 800}}>Order Management: {viewedOrder.id}</h3>
              <button onClick={() => setViewedOrder(null)} style={{background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b'}}>&times;</button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Customer</div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{viewedOrder.customer}</div>
                </div>
                <div style={{background: '#f8fafc', padding: 12, borderRadius: 8}}>
                  <div style={{fontSize: 11, color: '#64748b'}}>Total Paid</div>
                  <div style={{fontSize: 14, fontWeight: 600, color: '#2563eb'}}>AED {viewedOrder.total}</div>
                </div>
              </div>

              {/* Logistics Section */}
              <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#334155' }}>Logistics & Courier</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleDownloadLabel('Aramex')} style={{ flex: 1, padding: '10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Generate Aramex Label</button>
                  <button onClick={() => handleDownloadLabel('SMSA')} style={{ flex: 1, padding: '10px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Generate SMSA Label</button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setSplitModalOpen(true)} style={{ padding: '8px', width: '100%', background: '#f8fafc', color: '#475569', border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>✂️ Split Shipment into Multiple Packages</button>
                </div>
              </div>

              <div>
                <label style={{display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8}}>Update Order Status</label>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                  {['Processing', 'Shipped', 'Delivered'].map(st => (
                    <button 
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: viewedOrder.status === st ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: viewedOrder.status === st ? '#eff6ff' : '#fff',
                        color: viewedOrder.status === st ? '#1e40af' : '#64748b'
                      }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8}}>Return / Replacement Workflow</label>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                  {['Pending Return', 'Inspecting', 'Refunded', 'Replaced'].map(st => (
                    <button 
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: viewedOrder.status === st ? '2px solid #ea580c' : '1px solid #cbd5e1',
                        background: viewedOrder.status === st ? '#fff7ed' : '#fff',
                        color: viewedOrder.status === st ? '#c2410c' : '#64748b'
                      }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: 12, marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16}}>
              <button onClick={() => setViewedOrder(null)} style={{width: '100%', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, color: '#334155'}}>Close Options</button>
            </div>
          </div>
        </div>
      )}

      {splitModalOpen && viewedOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20}}>
          <div style={{background: '#fff', padding: 24, borderRadius: 16, width: '100%', maxWidth: 450, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'}}>
            <h3 style={{margin: '0 0 16px', fontSize: 18, fontWeight: 800}}>Select Items for Package 1</h3>
            <p style={{fontSize: 13, color: '#64748b', marginBottom: 16}}>Remaining items will automatically be assigned to Package 2.</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24}}>
              <label style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer'}}>
                <input type="checkbox" defaultChecked />
                <span style={{fontSize: 14, fontWeight: 600}}>iPhone 15 Pro Max 256GB</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer'}}>
                <input type="checkbox" />
                <span style={{fontSize: 14, fontWeight: 600}}>Custom NFC Business Card (Printing)</span>
              </label>
            </div>
            <div style={{display: 'flex', gap: 12}}>
              <button 
                onClick={() => {
                  toast.success('Shipment successfully split into 2 packages!');
                  setSplitModalOpen(false);
                }} 
                style={{flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>
                Confirm Split
              </button>
              <button onClick={() => setSplitModalOpen(false)} style={{flex: 1, padding: '10px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
