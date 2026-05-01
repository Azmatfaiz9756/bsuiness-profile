import React from 'react';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const handleExportAnalytics = () => {
    const data = "Report,Value\nTotal Views Today,8450\nNetwork Touches,1420\nMeeting Booked,12\nProfile Score,98\nTotal Wallet Balance,AED 14050\nNew Members,145";
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "analytics_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully!");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 24, fontWeight: 800, color: '#0f172a'}}>Advanced Sales Analytics</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>The "Brain" for sales logic. Track heatmaps, CLV, and product performance.</p>
        </div>
        <button className="topbar-btn" onClick={handleExportAnalytics} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600 }}>📥 Export Reports</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-label">TOTAL VIEWS TODAY</div>
          <div className="stat-value">4,820</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">NEW PROFILES TODAY</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">SHOP ORDERS TODAY</div>
          <div className="stat-value">28</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">REVENUE TODAY</div>
          <div className="stat-value">AED 5,200</div>
        </div>
      </div>

      {/* Advanced Sales Analytics Added features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>🗺️ Sales Heatmap (UAE Focus)</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Mapping order density across major hubs.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                <span>Deira (Wholesale Hub)</span><span>45% of orders</span>
              </div>
              <div style={{ height: 8, background: '#fef2f2', borderRadius: 4 }}><div style={{ width: '45%', height: '100%', background: '#ef4444', borderRadius: 4 }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                <span>Dubai Marina</span><span>25% of orders</span>
              </div>
              <div style={{ height: 8, background: '#fffbeb', borderRadius: 4 }}><div style={{ width: '25%', height: '100%', background: '#f59e0b', borderRadius: 4 }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                <span>Sharjah</span><span>20% of orders</span>
              </div>
              <div style={{ height: 8, background: '#f0fdf4', borderRadius: 4 }}><div style={{ width: '20%', height: '100%', background: '#10b981', borderRadius: 4 }}></div></div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>📦 Product Performance</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Identifying Fast Moving vs Dead Stock properties.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f766e' }}>🚀 Fast Moving: iPhone 15 Pro Max 256GB</span>
                <span style={{ fontSize: 12, color: '#0f766e', fontWeight: 600 }}>120 Sold / week</span>
              </div>
            </div>
            <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>⚠️ Dead Stock: iPhone 12 Mini Cases</span>
                <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>0 Sold in 45 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Customer Lifetime Value (CLV) Cohorts</div></div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Tracking repeat purchase patterns of your customer base.</p>
          <table style={{ width: '100%', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Customer Cohort</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Avg. Orders</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Lifetime Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>Top 10% VIPs</td><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>14</td><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#2563eb' }}>AED 42,500</td></tr>
              <tr><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>Returning (2-5 orders)</td><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>3.2</td><td style={{ padding: 12, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#2563eb' }}>AED 8,100</td></tr>
              <tr><td style={{ padding: 12 }}>One-time Buyers</td><td style={{ padding: 12 }}>1</td><td style={{ padding: 12, fontWeight: 700, color: '#2563eb' }}>AED 1,200</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-header"><div className="card-title">Views by Day</div></div>
          <div style={{height: 120, display: 'flex', alignItems: 'flex-end', gap: 4}}>
            {[32, 41, 38, 52, 48, 61, 48].map((v, i) => (
              <div key={i} style={{flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.4)', height: `${v}%`, borderRadius: '4px 4px 0 0'}}></div>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text3)'}}>
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Revenue by Plan Type</div></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8}}>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
                <span style={{fontSize: 13, color: 'var(--text2)'}}>Business Pro</span>
                <span style={{fontSize: 13, fontWeight: 700, color: 'var(--gold)'}}>AED 21,153</span>
              </div>
              <div style={{height: 6, background: '#e2e8f0', borderRadius: 3}}>
                 <div style={{width: '72%', height: '100%', background: '#3b82f6', borderRadius: 3}}></div>
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
                <span style={{fontSize: 13, color: 'var(--text2)'}}>Premium</span>
                <span style={{fontSize: 13, fontWeight: 700, color: 'var(--blue)'}}>AED 14,628</span>
              </div>
              <div style={{height: 6, background: '#e2e8f0', borderRadius: 3}}>
                 <div style={{width: '50%', height: '100%', background: '#8b5cf6', borderRadius: 3}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
