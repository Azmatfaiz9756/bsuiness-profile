import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Plus, X, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AddToHomeScreen({ profileName }: { profileName: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (!isStandalone) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios');
        // iOS doesn't support beforeinstallprompt, so we show our custom info prompt
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      } else if (/android/.test(userAgent)) {
        setPlatform('android');
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowPrompt(false);
      return;
    }
    // Show the native install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: 100,
          left: 16,
          right: 16,
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <button 
          onClick={() => setShowPrompt(false)}
          style={{ position: 'absolute', top: 12, right: 12, color: '#64748b', background: 'transparent', border: 'none' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, background: '#2563eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}>
            <Smartphone className="text-white" size={28} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Add to Home Screen</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Install {profileName}'s profile as an app</p>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
          {platform === 'ios' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>1. Tap the Share icon <Download size={16} className="inline-block transform rotate-180" style={{ color: '#2563eb' }} /> at bottom</p>
              <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>2. Scroll & select "Add to Home Screen" <Plus size={16} className="inline-block border border-slate-300 rounded" /></p>
            </div>
          ) : platform === 'android' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{deferredPrompt ? 'Tap "Install" to add this profile to your home screen.' : '1. Tap the menu ⋮ in Chrome'}</p>
              {!deferredPrompt && <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>2. Select "Install App" or "Add to Home Screen"</p>}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>Open menu and select "Add to Home Screen"</p>
          )}
        </div>

        <button 
          onClick={deferredPrompt ? handleInstallClick : () => setShowPrompt(false)}
          style={{
            width: '100%',
            padding: '14px',
            background: '#0f172a',
            color: '#fff',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            border: 'none',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          {deferredPrompt ? 'Install App' : 'Got it'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
