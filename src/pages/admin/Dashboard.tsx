import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { stats, profiles, orders, usersCount, profilesCount } = useAppContext();

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon">👥</div>
          <div className="stat-label">REGISTERED USERS</div>
          <div className="stat-value">{usersCount}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">👤</div>
          <div className="stat-label">ACTIVE PROFILES</div>
          <div className="stat-value">{profilesCount}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">👁️</div>
          <div className="stat-label">TOTAL VIEWS</div>
          <div className="stat-value">{stats.totalViews}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">💰</div>
          <div className="stat-label">SHOP REVENUE</div>
          <div className="stat-value">AED {stats.shopRevenue}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">👛</div>
          <div className="stat-label">ACTIVE WALLETS</div>
          <div className="stat-value">124</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Profiles</div>
            <Link to="/admin/profiles" className="card-action">View All →</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.slice(0, 5).map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div style={{fontWeight: 600, color: 'var(--text)'}}>{p.name}</div>
                    <div style={{fontSize: 11, color: 'var(--text3)'}}>{p.id}</div>
                  </td>
                  <td>
                     <span className={`badge ${p.plan === 'Business Pro' ? 'badge-gold' : p.plan === 'Premium' ? 'badge-blue' : 'badge-gray'}`}>
                       {p.plan}
                     </span>
                  </td>
                  <td>
                     <span className={`badge ${p.status === 'Active' ? 'badge-green' : p.status === 'Trial' ? 'badge-gold' : 'badge-red'}`}>
                       {p.status}
                     </span>
                  </td>
                  <td>
                    <Link to={`/profile/${p.id}`} className="action-btn">View Live</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Shop Orders</div>
            <Link to="/admin/shop-orders" className="card-action">View All →</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <div style={{fontWeight: 600, color: 'var(--text)'}}>{o.id}</div>
                    <div style={{fontSize: 11, color: 'var(--text3)'}}>{o.customer} · {o.items} items</div>
                  </td>
                  <td style={{color: 'var(--gold2)', fontWeight: 700}}>AED {o.total}</td>
                  <td>
                     <span className={`badge ${o.status === 'Delivered' ? 'badge-green' : o.status === 'Shipped' ? 'badge-blue' : 'badge-gold'}`}>
                       {o.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
