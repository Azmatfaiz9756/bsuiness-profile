import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ClassicModern from './templates/ClassicModern';
import ExecutiveDark from './templates/ExecutiveDark';
import MinimalClean from './templates/MinimalClean';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Share2, Download, MessageCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import { PromotionBanner } from '../../components/PromotionBanner';

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
  
  // Try to find profile in context immediately to avoid flicker
  const initialProfile = profiles.find((p: any) => p.id === id || p.slug === id);
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [template, setTemplate] = useState(initialProfile?.template || 'classic');
  const [loading, setLoading] = useState(!initialProfile);
  const [showQR, setShowQR] = useState(false);

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
          foundProfile = { ...docSnap.data(), id: docSnap.id };
        } else {
          // If not found, try searching by slug
          const q = query(collection(db, 'profiles'), where('slug', '==', id));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            foundProfile = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
          }
        }

        if (foundProfile) {
          setProfile(foundProfile);
          if (foundProfile.template) {
            setTemplate(foundProfile.template);
          }
          
          // Increment views
          if (!isPreview) {
            try {
               const pId = foundProfile.id || id;
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
                   console.log("View recorded for", pId);
                 } else {
                   console.log("View throttled for", pId);
                 }
               }
            } catch (err) {
               console.error("Failed to update profile views:", err);
            }
          }

        } else {
          // If no profile found in DB, we stay at null to show 404
          const existsInContext = profiles.find((p: any) => p.id === id || p.slug === id);
          if (existsInContext) {
            setProfile(existsInContext);
          } else {
            setProfile(null);
          }
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
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-b-blue-400 animate-spin-reverse opacity-50"></div>
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: '#64748b', textTransform: 'uppercase' }}>
          Initializing Profile
        </div>
        <style>{`
          .animate-spin-reverse {
            animation: spin-reverse 1.5s linear infinite;
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!profile) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>Profile Not Found</div>;
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

      {template === 'classic' && <ClassicModern profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
      {template === 'executive' && <ExecutiveDark profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
      {template === 'minimal' && <MinimalClean profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}

      {!isPreview && (
        <>
          {profile?.whatsapp && (
            <a 
              href={`https://wa.me/${String(profile.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-24 right-4 w-12 h-12 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:right-8 md:bottom-28 animate-pulse"
              style={{ boxShadow: '0 10px 25px -5px rgba(37,211,102,0.4)' }}
            >
              <MessageCircle size={24} fill="currentColor" />
            </a>
          )}
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
                
                <h3 className="text-xl font-black text-slate-800 mb-2">Scan to Connect</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 text-center leading-relaxed">
                  Point your camera at this QR code to view and save {profile?.name}'s profile.
                </p>

                <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-slate-100 mb-8">
                  <QRCodeSVG 
                    value={window.location.href} 
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
                    <span>Share</span>
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
                    <span>Save</span>
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
