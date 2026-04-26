import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AdminWallets() {
  const [wallets, setWallets] = useState([
    { id: 'DBC000000042', name: 'Ahmed Al Rashidi', balance: 340, earned: 580, spent: 240 },
    { id: 'DBC000000098', name: 'Sara Khan', balance: 120, earned: 200, spent: 80 }
  ]);
  const [modalState, setModalState] = useState<{ open: boolean, type: 'Credit' | 'Debit', wallet: any }>({ open: false, type: 'Credit', wallet: null });
  const [amount, setAmount] = useState('');

  const handleExport = () => {
    alert("Exporting Wallet Reports...");
  };

  const handleAction = (type: 'Credit' | 'Debit', wallet: any) => {
    setModalState({ open: true, type, wallet });
    setAmount('');
  };

  const submitAction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    setWallets(wallets.map(w => {
      if (w.id === modalState.wallet.id) {
        if (modalState.type === 'Credit') {
          return { ...w, balance: w.balance + val, earned: w.earned + val };
        } else {
          const newBal = w.balance - val;
          return { ...w, balance: newBal < 0 ? 0 : newBal, spent: w.spent + val };
        }
      }
      return w;
    }));
    setModalState({ open: false, type: 'Credit', wallet: null });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Wallet Manager</h2>
        </div>
        <button className="topbar-btn" onClick={handleExport}>📥 Export</button>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
        <div className="stat-card gold">
          <div className="stat-label">TOTAL WALLET FUNDS</div>
          <div className="stat-value">AED 15,640</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">REFERRAL PAID OUT</div>
          <div className="stat-value">AED 4,820</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">TOP-UPS THIS MONTH</div>
          <div className="stat-value">AED 8,200</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">All Wallets</div>
          <div className="search-bar" style={{width: 200}}>
            <span style={{color: 'var(--text3)'}}>🔍</span>
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Balance</th>
              <th>Total Earned</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map(w => (
              <tr key={w.id}>
                <td style={{fontWeight: 600, color: 'var(--text)'}}>
                  {w.name} <div style={{fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace'}}>{w.id}</div>
                </td>
                <td style={{color: 'var(--gold2)', fontWeight: 800, fontSize: 16}}>AED {w.balance}</td>
                <td style={{color: 'var(--green)'}}>AED {w.earned}</td>
                <td style={{color: 'var(--red)'}}>AED {w.spent}</td>
                <td style={{display: 'flex', gap: 6}}>
                  <button className="action-btn btn-gold" style={{fontSize: 11}} onClick={() => handleAction('Credit', w)}>+ Credit</button>
                  <button className="action-btn" style={{fontSize: 11, color: 'var(--red)'}} onClick={() => handleAction('Debit', w)}>- Debit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState.open && modalState.wallet && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 12, width: '100%', maxWidth: 400}}>
            <h3 style={{margin: '0 0 8px', fontSize: 18}}>{modalState.type} {modalState.wallet.name}'s Wallet</h3>
            <p style={{margin: '0 0 20px', fontSize: 14, color: '#64748b'}}>Current Balance: AED {modalState.wallet.balance}</p>
            <form onSubmit={submitAction} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <label style={{display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4}}>Amount (AED)</label>
                <input required type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} style={{width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6}} placeholder="Enter amount" />
              </div>
              <div style={{display: 'flex', gap: 12, marginTop: 12}}>
                <button type="button" onClick={() => setModalState({ open: false, type: 'Credit', wallet: null })} style={{flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>
                <button type="submit" style={{flex: 1, padding: 10, background: modalState.type === 'Credit' ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                  {modalState.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
