import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
const ClassicModern = lazy(() => import('./templates/ClassicModern'));
const ExecutiveDark = lazy(() => import('./templates/ExecutiveDark'));
const MinimalClean = lazy(() => import('./templates/MinimalClean'));
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Share2, Download } from 'lucide-react';
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
  const initialProfile = profiles.find((p: any) => 
    p.id === id || 
    (p.slug && p.slug.toLowerCase() === id?.toLowerCase())
  );
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [template, setTemplate] = useState(initialProfile?.template || 'classic');
  const [loading, setLoading] = useState(!initialProfile);
  const [showQR, setShowQR] = useState(false);
  const [qrMode, setQrMode] = useState<'online' | 'offline'>('online');

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
      
      const cleanId = id.trim();
      const normalizedId = cleanId.toLowerCase();
      
      // If we don't have it yet, set loading
      if (!profile) {
        setLoading(true);
      }
      
      try {
        let foundProfile = null;
        console.log("Searching for profile with ID or Slug:", cleanId);

        // Run primary queries in parallel to speed up load time
        const docRef = doc(db, 'profiles', cleanId);
        const qSlugLowerCase = query(collection(db, 'profiles'), where('slug', '==', normalizedId));
        
        const [docSnap, slugLowerSnap] = await Promise.all([
          getDoc(docRef),
          getDocs(qSlugLowerCase)
        ]);

        if (docSnap.exists()) {
          console.log("Profile found by direct ID match");
          foundProfile = { ...docSnap.data(), id: docSnap.id };
        } else if (!slugLowerSnap.empty) {
          console.log("Profile found by lowercase slug match");
          foundProfile = { ...slugLowerSnap.docs[0].data(), id: slugLowerSnap.docs[0].id };
        } else {
          // 3. Try searching by original ID as slug (mixed case)
          const qOrig = query(collection(db, 'profiles'), where('slug', '==', cleanId));
          const snapOrig = await getDocs(qOrig);
          if (!snapOrig.empty) {
            console.log("Profile found by mixed-case slug match");
            foundProfile = { ...snapOrig.docs[0].data(), id: snapOrig.docs[0].id };
          } else {
            // 4. Last resort: search by id field as fallback for some older profiles
            const q2 = query(collection(db, 'profiles'), where('id', '==', cleanId));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
              console.log("Profile found by 'id' field fallback");
              foundProfile = { ...snap2.docs[0].data(), id: snap2.docs[0].id };
            }
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

        } else {
          console.log("Profile not found in any Firebase search");
          // If no profile found in DB, we stay at null to show 404
          const existsInContext = profiles.find((p: any) => 
            p.id === cleanId || 
            (p.slug && p.slug.toLowerCase() === normalizedId)
          );
          if (existsInContext) {
            setProfile(existsInContext);
          } else {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (!profile) {
          const cleanId = id.trim();
          const normalizedId = cleanId.toLowerCase();
          const localProfile = profiles.find((p: any) => 
            p.id === cleanId || 
            (p.slug && p.slug.toLowerCase() === normalizedId)
          ) || (profiles.length > 0 ? profiles[0] : null);
          
          if (localProfile) {
            setProfile(localProfile);
            if (localProfile.template) {
              setTemplate(localProfile.template);
            }
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

      <Suspense fallback={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
        </div>
      }>
        {template === 'classic' && <ClassicModern profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
        {template === 'executive' && <ExecutiveDark profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
        {template === 'minimal' && <MinimalClean profile={profile} onExit={isPreview ? () => navigate('/dashboard') : undefined} />}
      </Suspense>

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
                
                <h3 className="text-xl font-black text-slate-800 mb-2">Scan to Connect</h3>
                <p className="text-sm font-medium text-slate-500 mb-4 text-center leading-relaxed">
                  {qrMode === 'online' ? `Point your camera at this QR code to view ${profile?.name}'s profile.` : `Scan to save ${profile?.name}'s contact details directly (No internet required).`}
                </p>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-full max-w-[240px]">
                  <button 
                    onClick={() => setQrMode('online')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${qrMode === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Online View
                  </button>
                  <button 
                    onClick={() => setQrMode('offline')} 
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${qrMode === 'offline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Offline Save
                  </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-slate-100 mb-8 transition-opacity duration-300">
                  <QRCodeSVG 
                    value={qrMode === 'online' ? window.location.href : `BEGIN:VCARD\nVERSION:3.0\nN:${profile?.name || ''}\nFN:${profile?.name || ''}\nORG:${profile?.company || ''}\nTITLE:${profile?.title || ''}\nTEL;TYPE=WORK,VOICE:${profile?.phone || ''}\nEMAIL;TYPE=PREF,INTERNET:${profile?.email || ''}\nURL:${profile?.website || window.location.href}\nNOTE:${(profile?.bio || '').replace(/\\n|\n/g, '\\n')}\nEND:VCARD`} 
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
