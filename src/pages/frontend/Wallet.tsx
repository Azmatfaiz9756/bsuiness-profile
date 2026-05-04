import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, CreditCard, LogIn } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useSearchParams } from 'react-router-dom';

export default function FrontendWallet() {
  const { walletBalance, setWalletBalance, siteSettings, user, setIsLoginModalOpen } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [amountParam, setAmountParam] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCanceled = searchParams.get('payment_canceled');
    const amt = searchParams.get('amount');

    if (paymentSuccess === 'true' && amt && searchParams.get('session_id')) {
      const sessionId = searchParams.get('session_id');
      const addAmount = Number(amt);
      
      if (!isNaN(addAmount) && sessionId) {
        const verifyPayment = async () => {
          try {
            const apiUrl = '';
            const verifyRes = await fetch(`${apiUrl}/api/verify-checkout-session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });

            if (!verifyRes.ok) throw new Error('Verification failed.');
            const verifyData = await verifyRes.json();
            
            if (verifyData.verified) {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('../../firebase');
              const newBalance = walletBalance + addAmount;
              setWalletBalance(newBalance);
              if (user) {
                await setDoc(doc(db, 'users', user.uid), { walletBalance: newBalance }, { merge: true });
              }
              alert(`Successfully added ${siteSettings?.currency || 'AED'} ${addAmount} to your wallet!`);
            } else {
              alert('Payment verification failed.');
            }
          } catch (e) {
            console.error("Payment verification error:", e);
            alert('Payment verification error.');
          } finally {
            searchParams.delete('payment_success');
            searchParams.delete('session_id');
            searchParams.delete('amount');
            setSearchParams(searchParams);
          }
        };
        verifyPayment();
      }
    } else if (paymentCanceled === 'true') {
      alert('Payment was canceled.');
      searchParams.delete('payment_canceled');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, setWalletBalance, siteSettings]);

  const handleTopUp = async (amount: number) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const apiUrl = '';
      const response = await fetch(`${apiUrl}/api/create-wallet-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          uid: user.uid,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create topup session');
      }
    } catch (err: any) {
      console.error("Wallet topup error:", err);
      alert(err.message || 'Operation failed');
      setIsProcessing(false);
    }
  };

  const handleCustomTopUp = () => {
    const amtNumber = Number(amountParam);
    if (!isNaN(amtNumber) && amtNumber >= 10) {
      handleTopUp(amtNumber);
    } else {
      alert(`Please enter a valid amount (minimum 10 ${siteSettings?.currency || 'AED'})`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-32 font-sans flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Wallet size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900">Your Digital Wallet</h1>
        <p className="text-slate-500 max-w-lg mb-8 text-lg">
          Please login or create an account to view your wallet balance, manage your funds, and track your referral earnings.
        </p>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
        >
          <LogIn size={20} /> Login to Access Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Wallet size={24} className="text-slate-400" />
          <div className="text-sm text-slate-400 tracking-wider font-bold">AVAILABLE BALANCE</div>
        </div>
        
        <div className="text-5xl md:text-6xl font-black tracking-tight mb-10 relative z-10">
          <span className="text-2xl md:text-3xl text-slate-400 font-semibold mr-3">{siteSettings?.currency || 'AED'}</span>
          {(walletBalance || 0).toFixed(2)}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 relative z-10">
          <div>
            <div className="text-xs md:text-sm text-slate-400 mb-1">Total Earned (Referrals)</div>
            <div className="text-base md:text-lg text-emerald-400 font-bold flex items-center gap-1.5">
              <ArrowUpRight size={18} /> {siteSettings?.currency || 'AED'} 0.00
            </div>
          </div>
          <div>
            <div className="text-xs md:text-sm text-slate-400 mb-1">Total Spent (Shop)</div>
            <div className="text-base md:text-lg text-red-400 font-bold flex items-center gap-1.5">
              <ArrowDownRight size={18} /> {siteSettings?.currency || 'AED'} 0.00
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] gap-6 md:gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg md:text-xl font-extrabold mb-6">Transaction History</h3>
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <p>No recent transactions.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 h-fit shadow-sm mt-6 md:mt-0">
          <h3 className="text-lg md:text-xl font-extrabold mb-6">Top Up Wallet</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button onClick={() => handleTopUp(50)} disabled={isProcessing} className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50">{siteSettings?.currency || 'AED'} 50</button>
            <button onClick={() => handleTopUp(100)} disabled={isProcessing} className="py-3 border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-xl font-black disabled:opacity-50">{siteSettings?.currency || 'AED'} 100</button>
            <button onClick={() => handleTopUp(200)} disabled={isProcessing} className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50">{siteSettings?.currency || 'AED'} 200</button>
            <button onClick={() => handleTopUp(500)} disabled={isProcessing} className="py-3 border border-slate-300 bg-white rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50">{siteSettings?.currency || 'AED'} 500</button>
          </div>
          
          <div className="relative mb-6">
            <input type="number" 
                   value={amountParam}
                   onChange={e => setAmountParam(e.target.value)}
                   disabled={isProcessing}
                   placeholder="Custom amount" 
                   className="w-full py-3.5 pl-4 pr-16 border border-slate-300 rounded-xl text-base font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-100" />
            <span className="absolute right-4 top-3.5 text-slate-400 font-bold">{siteSettings?.currency || 'AED'}</span>
          </div>

          <button onClick={handleCustomTopUp} disabled={isProcessing} className="w-full bg-slate-900 text-white border-none py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50">
            <CreditCard size={18} /> {isProcessing ? 'Processing Gateway...' : 'Pay via Card'}
          </button>
        </div>
      </div>
    </div>
  );
}
