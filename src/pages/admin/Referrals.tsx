import React from 'react';

export default function AdminReferrals() {
  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Referral Manager</h2>
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        <div className="stat-card gold">
          <div className="stat-label">TOTAL REFERRALS</div>
          <div className="stat-value">241</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">COMPLETED</div>
          <div className="stat-value">241</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">PENDING</div>
          <div className="stat-value">18</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">TOTAL PAID</div>
          <div className="stat-value">AED 4,820</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Referral Log</div></div>
        <table>
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Referred</th>
              <th>Date</th>
              <th>Status</th>
              <th>Earning</th>
              <th>Daily Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{color: 'var(--text)', fontWeight: 600}}>Ahmed Al Rashidi</td>
              <td style={{color: 'var(--text2)'}}>Zaid Mohammed</td>
              <td style={{color: 'var(--text3)', fontSize: 12}}>Apr 6, 2024</td>
              <td><span className="badge badge-green">Completed</span></td>
              <td style={{color: 'var(--green)', fontWeight: 700}}>+AED 20</td>
              <td style={{color: 'var(--text2)'}}>3 / 10 today</td>
            </tr>
            <tr>
              <td style={{color: 'var(--text)', fontWeight: 600}}>Sara Khan</td>
              <td style={{color: 'var(--text2)'}}>Nour Al Ali</td>
              <td style={{color: 'var(--text3)', fontSize: 12}}>Apr 5, 2024</td>
              <td><span className="badge badge-green">Completed</span></td>
              <td style={{color: 'var(--green)', fontWeight: 700}}>+AED 20</td>
              <td style={{color: 'var(--text2)'}}>1 / 10 today</td>
            </tr>
            <tr>
              <td style={{color: 'var(--text)', fontWeight: 600}}>Omar Farooq</td>
              <td style={{color: 'var(--text2)'}}>Pending user...</td>
              <td style={{color: 'var(--text3)', fontSize: 12}}>Apr 6, 2024</td>
              <td><span className="badge badge-gold">Pending</span></td>
              <td style={{color: 'var(--text3)'}}>Pending</td>
              <td style={{color: 'var(--text2)'}}>7 / 10 today</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
