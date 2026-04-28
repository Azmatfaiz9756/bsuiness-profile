import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const [method, setMethod] = useState<'stripe' | 'razorpay'>('stripe');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate real API call to VPS
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        {!success && (
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
             <X size={20} />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 mb-6">Your plan has been activated.</p>
              <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Complete Payment</h2>
              <p className="text-slate-500 mb-6 text-sm">
                You are subscribing to the <strong className="text-slate-900">{plan?.name || 'Plan'}</strong> for {plan?.price || 'AED 0'}.
              </p>

              <div className="space-y-3 mb-6">
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${method === 'stripe' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment_method" checked={method === 'stripe'} onChange={() => setMethod('stripe')} className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        Stripe <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wider">International</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Credit / Debit Card, Apple Pay, Google Pay</div>
                    </div>
                  </div>
                </label>

                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${method === 'razorpay' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment_method" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        Razorpay <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">India & UAE</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">UPI, Cards, NetBanking</div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg mb-6 flex items-center gap-3 border border-slate-100">
                <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-tight">
                  Payments are secured with 256-bit encryption. We do not store your card details on our servers.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold p-3.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard size={18} />
                    Pay {plan?.price || 'AED 0'} securely
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
