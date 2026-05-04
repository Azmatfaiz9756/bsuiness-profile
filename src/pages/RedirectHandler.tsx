import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Loader2, AlertCircle } from 'lucide-react';

const RedirectHandler: React.FC = () => {
  const { serial } = useParams<{ serial: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const resolveRedirect = async () => {
      if (!serial) return;

      try {
        const q = query(
          collection(db, 'cards'), 
          where('serial', '==', serial),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Invalid card serial number.');
          return;
        }

        const cardData = snapshot.docs[0].data();
        
        if (!cardData.profileId) {
          setError('This card has not been activated yet. Please contact the owner.');
          return;
        }

        if (cardData.status === 'Blocked') {
          setError('This card has been deactivated.');
          return;
        }

        // Redirect to the profile
        navigate(`/${cardData.profileId}`, { replace: true });
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Something went wrong. Please try again.');
      }
    };

    resolveRedirect();
  }, [serial, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {!error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-200 blur-2xl rounded-full opacity-20 animate-pulse"></div>
            <Loader2 size={48} className="text-indigo-600 animate-spin relative z-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Syncing your connection...</h1>
            <p className="text-slate-500 font-medium">Please wait while we redirect you to the digital card.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-red-50 border border-red-100 p-8 rounded-[32px] text-center shadow-xl shadow-red-900/5"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-black text-red-900 mb-3">Activation Required</h1>
          <p className="text-red-700/80 font-medium mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white border border-red-200 text-red-700 font-bold rounded-2xl hover:bg-red-100 transition-colors"
          >
            Go to Homepage
          </button>
        </motion.div>
      )}
      
      <div className="absolute bottom-12 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Powered by Vibe Digital</p>
      </div>
    </div>
  );
};

export default RedirectHandler;
