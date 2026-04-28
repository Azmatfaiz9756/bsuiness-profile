import React, { useState, useEffect } from 'react';
import { setupRecaptcha, sendPhoneOtp, loginWithGoogle } from '../firebase';
import { X, Phone, Mail } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [method, setMethod] = useState<'select' | 'phone'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input_phone' | 'verify_otp'>('input_phone');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && method === 'phone' && step === 'input_phone') {
      setupRecaptcha('recaptcha-container');
    }
  }, [isOpen, method, step]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await sendPhoneOtp(phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('verify_otp');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to send OTP. Ensure number includes country code (e.g. +971)');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-center mb-8">Sign in to manage your business profile</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          {method === 'select' && (
            <div className="space-y-4">
              <button
                onClick={() => setMethod('phone')}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 p-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <Phone size={20} />
                Continue with Phone
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 p-3 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          )}

          {method === 'phone' && step === 'input_phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+971501234567"
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Include country code (e.g. +971 for UAE)</p>
              </div>
              <div id="recaptcha-container"></div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <button
                type="button"
                onClick={() => setMethod('select')}
                className="w-full text-sm text-slate-500 hover:text-slate-800"
              >
                Back to all options
              </button>
            </form>
          )}

          {method === 'phone' && step === 'verify_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
              <button
                type="button"
                onClick={() => setStep('input_phone')}
                className="w-full text-sm text-slate-500 hover:text-slate-800"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
