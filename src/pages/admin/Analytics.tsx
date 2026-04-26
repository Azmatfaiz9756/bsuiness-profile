import React from 'react';

export default function AdminAnalytics() {
  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Analytics & Reports</h2>
        </div>
        <button className="topbar-btn" onClick={() => alert("Exporting all Analytics Reports...")}>📥 Export All Reports</button>
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
