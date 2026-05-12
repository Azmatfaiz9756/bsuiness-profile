import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ClassicModern from './templates/ClassicModern';
import ExecutiveDark from './templates/ExecutiveDark';
import MinimalClean from './templates/MinimalClean';
import { doc, getDoc, collection, query, where, getDocs, increment, updateDoc, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Share2, Download, Globe } from 'lucide-react';
import SEO from '../../components/SEO';
import { PromotionBanner } from '../../components/PromotionBanner';
import { useTranslation } from '../../lib/translations';

interface FullProfileProps {
  forcedId?: string;
}

export default function FullProfile({ forcedId }: FullProfileProps) {
  const { id: routeId } = useParams();
  const id = forcedId || routeId;
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';

  const { profiles } = useAppContext();

  // Optimized profile lookup with aggressive local caching
  const getInitialProfile = () => {
    // 1. Try global context first
    const fromContext = profiles.find((p: any) => 
      p.id === id || 
      (p.slug && p.slug.toLowerCase() === id?.toLowerCase())
    );
    if (fromContext) return fromContext;

    // 2. Try persistent local cache for instant second-load
    if (id) {
      const cached = localStorage.getItem(`vibe_cache_${id.trim().toLowerCase()}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const initialProfile = getInitialProfile();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [template, setTemplate] = useState(initialProfile?.template || 'classic');
  const [loading, setLoading] = useState(!initialProfile);
  const [isFetched, setIsFetched] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrMode, setQrMode] = useState<'online' | 'offline'>('online');
  const [localIsRtl, setLocalIsRtl] = useState(initialProfile?.isRtl || false);
  const t = useTranslation(localIsRtl);

  useEffect(() => {
    if (profile?.isRtl !== undefined) {
      setLocalIsRtl(profile.isRtl);
    }
  }, [profile?.isRtl]);

  // Handle pull-to-refresh: disable on profile ONLY as requested
  useEffect(() => {
    window.scrollTo(0, 0);
    const originalStyle = document.body.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = 'none';
    return () => {
      document.body.style.overscrollBehaviorY = originalStyle;
    };
  }, [id]);

  // JSON-LD Schema for SEO
  const schemaMarkup = profile ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name,
    "jobTitle": profile.title,
    "worksFor": {
      "@type": "Organization",
      "name": profile.company
    },
    "description": profile.bio,
    "image": profile.photo,
    "url": window.location.href,
    "sameAs": Array.isArray(profile.socialLinks) ? profile.socialLinks.map((l: any) => l.url) : []
  } : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      const cleanId = id.trim();
      const normalizedId = cleanId.toLowerCase();
      
      // Only show top-level loading if we don't have ANY profile data yet
      // We set isFetched to false to indicate we are starting a fresh check
      if (!profile) {
        setLoading(true);
      }
      setIsFetched(false);
      
      try {
        let foundProfile = null;
        
        // 1. Try direct ID first (Fastest path)
        const docRef = doc(db, 'profiles', cleanId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          foundProfile = { ...docSnap.data(), id: docSnap.id };
        } 
        
        // 2. If not found by ID, try Slug search
        if (!foundProfile) {
          const qSlugLowerCase = query(collection(db, 'profiles'), where('slug', '==', normalizedId), limit(1));
          const slugLowerSnap = await getDocs(qSlugLowerCase);
          
          if (!slugLowerSnap.empty) {
            foundProfile = { ...slugLowerSnap.docs[0].data(), id: slugLowerSnap.docs[0].id };
          }
        }

        // 3. Last fallback remote search
        if (!foundProfile) {
          const qFallback = query(collection(db, 'profiles'), where('id', '==', cleanId), limit(1));
          const fallbackSnap = await getDocs(qFallback);
          if (!fallbackSnap.empty) {
            foundProfile = { ...fallbackSnap.docs[0].data(), id: fallbackSnap.docs[0].id };
          }
        }

        if (foundProfile) {
          // Success: Update state and cache
          setProfile(foundProfile);
          if (foundProfile.template) setTemplate(foundProfile.template);
          
          // Persistence for instant "tap to open" feel next time
          localStorage.setItem(`vibe_cache_${normalizedId}`, JSON.stringify(foundProfile));
          if (foundProfile.id) {
            localStorage.setItem(`vibe_cache_${foundProfile.id.toLowerCase()}`, JSON.stringify(foundProfile));
          }
          
          // Increment views (Delayed background task)
          if (!isPreview) {
            try {
               const pId = foundProfile.id || cleanId;
               if (pId) {
                 const now = Date.now();
                 const storageKey = `last_view_${pId}`;
                 const lastView = localStorage.getItem(storageKey);
                 const FIFTEEN_MINUTES = 15 * 60 * 1000;
                 
                 // Save the profile we visited for sharing commission tracking
                 localStorage.setItem('dbc_profile_visited', pId);

                 if (!lastView || (now - parseInt(lastView)) > FIFTEEN_MINUTES) {
                   const { increment, updateDoc } = await import('firebase/firestore');
                   const updateRef = doc(db, 'profiles', pId);
                   await updateDoc(updateRef, { views: increment(1) });
                   localStorage.setItem(storageKey, now.toString());
                 }
               }
            } catch (err) {
               console.error("Failed to update profile views:", err);
            }
          }

          // SET THESE HERE to batch with setProfile
          setLoading(false);
          setIsFetched(true);

        } else {
          console.log("Profile not found after all remote searches");
          // Final check in local context profiles
          const existsInContext = profiles.find((p: any) => 
            p.id === cleanId || 
            (p.slug && p.slug.toLowerCase() === normalizedId)
          );
          
          if (existsInContext) {
            setProfile(existsInContext);
            if (existsInContext.template) setTemplate(existsInContext.template);
            setLoading(false);
            setIsFetched(true);
          } else {
            // ONLY set profile to null after ALL checks have failed
            // This is the trigger for the 404 UI
            console.warn(`No profile found for ID/Slug: ${id}`);
            setProfile(null);
            setLoading(false);
            setIsFetched(true);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // On error, if we don't have a profile yet, at least try context
        if (!profile) {
          const localProfile = profiles.find((p: any) => 
            p.id === id.trim() || 
            (p.slug && p.slug.toLowerCase() === id.trim().toLowerCase())
          );
          if (localProfile) {
            setProfile(localProfile);
            setLoading(false);
            setIsFetched(true);
          } else {
            setProfile(null);
            setLoading(false);
            setIsFetched(true);
          }
        }
      } 
      // Removed finally to ensure batching inside try/catch blocks Above
    };
    fetchProfile();
  }, [id, profiles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
        </div>
        <div className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Vibecard.ae
        </div>
      </div>
    );
  }

  // Only show "Not Found" if we are CERTAIN we finished fetching and still have no profile
  if (isFetched && !profile && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center text-slate-900">
        <div>
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 border border-slate-100">
            <X size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">{t.profileNotFound || "Profile Not Found"}</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">This profile might have been moved, deleted, or the URL is incorrect.</p>
          <Link to="/" className="mt-8 inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            {t.returnHome || "Return Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PromotionBanner />
      <SEO 
        title={`${profile.name} | ${profile.company} | Digital Business Card`}
        description={profile.bio || `View ${profile.name}'s professional profile on Vibecard.ae. Connect, scan, and save contact details.`}
        keywords={`${profile.name}, ${profile.company}, ${profile.title}, digital business card, UAE business`}
        image={profile.photo || "/logo.png"}
        url={window.location.href}
      />
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
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
        </div>
      )}

      {(() => {
        const displayProfile = { ...profile, isRtl: localIsRtl };
        return (
          <>
            <button 
              onClick={() => setLocalIsRtl(!localIsRtl)}
              className="fixed top-24 right-4 z-40 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all active:scale-95 md:right-8 md:top-28"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <Globe size={14} className="text-blue-600" />
              {localIsRtl ? 'English' : 'العربية'}
            </button>
            
            {template === 'classic' && <ClassicModern profile={displayProfile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
            {template === 'executive' && <ExecutiveDark profile={displayProfile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
            {template === 'minimal' && <MinimalClean profile={displayProfile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
          </>
        );
      })()}

      {!isPreview && (
        <>
          <button 
            onClick={() => setShowQR(true)}
            className="fixed bottom-24 left-4 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all z-40 md:left-8 md:bottom-28"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
          >
            <QrCode size={20} />
          </button>

          {showQR && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
              <div 
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowQR(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors"
                >
                  <X size={18} />
                </button>
                
                <h3 className="text-xl font-black text-slate-800 mb-2">{t.scanToConnect || "Scan to Connect"}</h3>
                <p className="text-sm font-medium text-slate-500 mb-4 text-center leading-relaxed">
                  {qrMode === 'online' ? t.scanOnlineTip || `Point your camera at this QR code to view ${profile?.name}'s profile.` : t.scanOfflineTip || `Scan to save ${profile?.name}'s contact details directly (No internet required).`}
                </p>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-[240px]">
                  <button 
                    onClick={() => setQrMode('online')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${qrMode === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.scanOnline || "Scan Online"}
                  </button>
                  <button 
                    onClick={() => setQrMode('offline')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${qrMode === 'offline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.scanOffline || "Scan Offline"}
                  </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-slate-100 mb-8 transition-opacity duration-300">
                  <QRCodeSVG 
                    value={qrMode === 'online' ? window.location.origin + window.location.pathname : `BEGIN:VCARD\nVERSION:3.0\nN:${profile?.name || ''}\nFN:${profile?.name || ''}\nORG:${profile?.company || ''}\nTITLE:${profile?.title || ''}\nTEL;TYPE=WORK,VOICE:${profile?.phone || ''}\nEMAIL;TYPE=PREF,INTERNET:${profile?.email || ''}\nURL:${profile?.website || window.location.origin + window.location.pathname}\nNOTE:${(profile?.bio || '').replace(/\\n|\n/g, '\\n')}\nEND:VCARD`} 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"Q"}
                    includeMargin={false}
                  />
                </div>

                <div className="flex w-full gap-3">
                  <button 
                    onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${profile?.name}'s Profile`,
                            url: window.location.href
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied to clipboard!");
                        }
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Share2 size={18} />
                    <span>{t.share || "Share"}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile?.name || ''}\nTITLE:${profile?.title || ''}\nORG:${profile?.company || ''}\nTEL:${profile?.phone || ''}\nEMAIL:${profile?.email || ''}\nURL:${window.location.href}\nEND:VCARD`;
                      const blob = new Blob([vcard], { type: "text/vcard" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${(profile?.name || 'profile').replace(/\s+/g, '_')}.vcf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Download size={18} />
                    <span>{t.save || "Save"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
