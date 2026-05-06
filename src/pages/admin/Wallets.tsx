import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ open: boolean, type: 'Credit' | 'Debit', wallet: any }>({ open: false, type: 'Credit', wallet: null });
  const [amount, setAmount] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const data = snap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().email || 'Unnamed User',
          balance: doc.data().walletBalance || 0,
          earned: doc.data().totalEarned || 0,
          spent: doc.data().totalSpent || 0,
          email: doc.data().email
        }));
        setWallets(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [refresh]);

  const handleExport = () => {
    alert("Exporting Wallet Reports...");
  };

  const handleAction = (type: 'Credit' | 'Debit', wallet: any) => {
    setModalState({ open: true, type, wallet });
    setAmount('');
  };

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    try {
      const walletDocRef = doc(db, 'users', modalState.wallet.id);
      let newBalance = modalState.wallet.balance;
      let newEarned = modalState.wallet.earned;
      let newSpent = modalState.wallet.spent;

      if (modalState.type === 'Credit') {
        newBalance += val;
        newEarned += val;
      } else {
        newBalance = Math.max(0, newBalance - val);
        newSpent += val;
      }

      await setDoc(walletDocRef, {
        walletBalance: newBalance,
        totalEarned: newEarned,
        totalSpent: newSpent
      }, { merge: true });

      alert(`Successfully ${modalState.type === 'Credit' ? 'credited' : 'debited'} AED ${val}`);
      setRefresh(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert('Failed to update wallet.');
    }
    
    setModalState({ open: false, type: 'Credit', wallet: null });
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalEarned = wallets.reduce((acc, w) => acc + w.earned, 0);
  const totalSpent = wallets.reduce((acc, w) => acc + w.spent, 0);

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
          <div className="stat-value">AED {totalBalance.toLocaleString()}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">TOTAL EARNED (REFERRALS)</div>
          <div className="stat-value">AED {totalEarned.toLocaleString()}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">TOTAL SPENT / WITHDRAWN</div>
          <div className="stat-value">AED {totalSpent.toLocaleString()}</div>
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
