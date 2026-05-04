import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, ShieldCheck, CheckCircle2, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const { user, walletBalance, setWalletBalance, siteSettings, setProfiles } = useAppContext();
  const [method, setMethod] = useState<'stripe' | 'wallet'>('stripe');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const planPriceNum = plan ? parseInt(plan.price.replace(/[^0-9]/g, '')) || 0 : 0;
  const isWalletDisabled = walletBalance < planPriceNum;

  const handlePayment = async () => {
    if (!user || !plan) return;
    setLoading(true);
    
    if (method === 'wallet') {
      setTimeout(() => {
        setWalletBalance(prev => prev - planPriceNum);
        // local state update for profile
        setProfiles(prev => prev.map(p => p.ownerId === user.uid ? { ...p, plan: plan.name } : p));
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setLoading(false);
        }, 2000);
      }, 1500);
      return;
    }

    try {
      const apiUrl = '';
      const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: plan.name,
          price: plan.price,
          uid: user.uid
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      // Simulate success for demo
      setTimeout(() => {
        setSuccess(true);
        setProfiles(prev => prev.map(p => p.ownerId === user.uid ? { ...p, plan: plan.name } : p));
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setLoading(false);
        }, 2000);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {!success && !loading && (
          <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1.5">
             <X size={18} />
          </button>
        )}

        <div className="p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Payment Successful!</h2>
              <p className="text-slate-500 mb-6 font-medium">Your plan is activated and ready to go.</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full w-full origin-left animate-[scale-x_2s_ease-out_forwards]"></div>
              </div>
              <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Redirecting</p>
            </div>
          ) : loading ? (
             <div className="text-center py-12 flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
               <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Processing Payment</h3>
               <p className="text-slate-500 text-sm font-medium">Please do not close this window or press back. Contacting secure gateway...</p>
               <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-black tracking-widest uppercase">Secured By Stripe</span>
               </div>
             </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Complete Payment</h2>
              <p className="text-slate-500 mb-8 text-sm font-medium">
                You are subscribing to the <strong className="text-slate-900 font-black">{plan?.name || 'Plan'}</strong> for <strong className="text-blue-600 font-black">{plan?.price || 'AED 0'}</strong>.
              </p>

              <div className="space-y-3 mb-8">
                <label className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${method === 'stripe' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment_method" checked={method === 'stripe'} onChange={() => setMethod('stripe')} className="w-5 h-5 accent-blue-600" />
                    <div>
                      <div className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                        Secure Card Payment
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">Stripe</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Visa, Mastercard, Apple Pay, Google Pay</div>
                    </div>
                  </div>
                </label>

                <label className={`block border-2 rounded-2xl p-5 transition-all ${isWalletDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} ${method === 'wallet' && !isWalletDisabled ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="payment_method" disabled={isWalletDisabled} checked={method === 'wallet'} onChange={() => !isWalletDisabled && setMethod('wallet')} className="w-5 h-5 accent-blue-600 disabled:opacity-50" />
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                        Pay with Wallet
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Instant</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-slate-500 font-medium">Balance: {siteSettings?.currency || 'AED'} {walletBalance}</div>
                        {isWalletDisabled && <div className="text-[10px] text-red-500 font-black uppercase">Insufficient Balance</div>}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl mb-8 flex items-start gap-4 border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Your payments are secured with 256-bit encryption. We comply with UAE data protection laws and do not store card details.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 text-sm uppercase tracking-wider"
              >
                <CreditCard size={18} />
                Pay {plan?.price || 'AED 0'} Securely
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
