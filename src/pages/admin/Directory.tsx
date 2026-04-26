import React, { useState } from 'react';

export default function AdminDirectory() {
  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Omar Farooq', plan: 'Business Pro', score: 892, featured: true },
    { id: 2, name: 'Ahmed Al Rashidi', plan: 'Business Pro', score: 841, featured: true },
    { id: 3, name: 'Sara Khan', plan: 'Premium', score: 670, featured: false }
  ]);

  const toggleFeatured = (id: number) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Business Directory</h2>
        </div>
        <button className="topbar-btn btn-gold" onClick={() => alert("Snapshot saved.")}>💾 Save Snapshot</button>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
        <div className="stat-card gold">
          <div className="stat-label">LISTED PROFILES</div>
          <div className="stat-value">1,284</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">FEATURED (PRO)</div>
          <div className="stat-value">{175 + profiles.filter(p => p.featured).length}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">DIRECTORY VIEWS</div>
          <div className="stat-value">28,400</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Featured / Top Profiles</div>
          <button className="action-btn" onClick={() => alert("Manage Featured Profiles...")}>Manage Featured</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Profile</th>
              <th>Plan</th>
              <th>Score</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.sort((a,b) => b.score - a.score).map((p, idx) => (
              <tr key={p.id}>
                <td style={{fontSize: 20, fontWeight: 900, color: idx === 0 ? 'var(--gold)' : 'var(--text2)'}}>#{idx + 1}</td>
                <td style={{color: 'var(--text)', fontWeight: 600}}>{p.name}</td>
                <td><span className={`badge ${p.plan === 'Business Pro' ? 'badge-gold' : 'badge-blue'}`}>{p.plan}</span></td>
                <td style={{color: 'var(--gold2)', fontWeight: 700}}>{p.score}</td>
                <td>
                  <span className={`badge ${p.featured ? 'badge-green' : 'badge-gray'}`}>
                    {p.featured ? 'Featured' : 'Normal'}
                  </span>
                </td>
                <td>
                  {p.featured ? (
                    <button className="action-btn" style={{color: 'var(--red)'}} onClick={() => toggleFeatured(p.id)}>Unfeature</button>
                  ) : (
                    <button className="action-btn btn-gold" style={{fontSize: 11}} onClick={() => toggleFeatured(p.id)}>Set Featured</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
