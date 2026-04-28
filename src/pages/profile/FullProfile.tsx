import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ClassicModern from './templates/ClassicModern';
import ExecutiveDark from './templates/ExecutiveDark';
import MinimalClean from './templates/MinimalClean';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function FullProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';

  const { profiles } = useAppContext();
  
  // Try to find profile in context immediately to avoid flicker
  const initialProfile = profiles.find((p: any) => p.id === id || p.slug === id);
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [template, setTemplate] = useState(initialProfile?.template || 'classic');
  const [loading, setLoading] = useState(!initialProfile);

  // Fetch from Firebase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      // If we don't have it yet, set loading
      if (!profile) {
        setLoading(true);
      }
      
      try {
        let foundProfile = null;
        // Try to fetch by UID (id) first
        const docRef = doc(db, 'profiles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          foundProfile = docSnap.data();
        } else {
          // If not found, try searching by slug
          const q = query(collection(db, 'profiles'), where('slug', '==', id));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            foundProfile = querySnapshot.docs[0].data();
          }
        }

        if (foundProfile) {
          setProfile(foundProfile);
          if (foundProfile.template) {
            setTemplate(foundProfile.template);
          }
        } else if (!profile) {
          // Only fallback to first profile if we have absolutely nothing
          setProfile(profiles[0]);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (!profile) {
          const localProfile = profiles.find((p: any) => p.id === id || p.slug === id) || profiles[0];
          setProfile(localProfile);
          if (localProfile && localProfile.template) {
            setTemplate(localProfile.template);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, profiles]);

  // Inject SEO metadata specifically for this profile on mount
  useEffect(() => {
    if (profile && profile.seo) {
      document.title = profile.seo.title || `${profile.name} | ${profile.company} | DBC Member`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', profile.seo.desc || '');

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', profile.seo.keywords || '');
    } else if (profile) {
      document.title = `${profile.name} | ${profile.company} | DBC Member`;
    }
  }, [profile]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0f172a', 
        color: '#fff' 
      }}>
        <div style={{
          width: 50,
          height: 50,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ marginTop: 24, fontSize: 14, fontWeight: 500, letterSpacing: '0.05em', color: '#94a3b8' }}>
          LOADING PROFILE
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>Profile Not Found</div>;
  }

  return (
    <>
      {isPreview && (
        <div className="sticky top-0 z-50 bg-slate-900 px-3 py-2.5 flex flex-wrap gap-2 items-center border-b-2 border-slate-800 shadow-md">
           <span className="text-[10px] font-bold text-slate-400 tracking-widest mr-2 uppercase">Preview Theme</span>
           {['classic', 'executive', 'minimal'].map(tName => (
             <button 
                key={tName}
                onClick={() => setTemplate(tName)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border-2 ${template === tName ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
             >
               {tName.toUpperCase()}
             </button>
           ))}
           <button onClick={() => navigate('/dashboard')} className="ml-auto text-white text-xs font-semibold hover:text-blue-400 transition-colors">Exit Preview</button>
        </div>
      )}

      {template === 'classic' && <ClassicModern profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
      {template === 'executive' && <ExecutiveDark profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
      {template === 'minimal' && <MinimalClean profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
    </>
  );
}
