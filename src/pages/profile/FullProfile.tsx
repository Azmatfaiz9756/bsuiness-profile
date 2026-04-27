import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ClassicModern from './templates/ClassicModern';
import ExecutiveDark from './templates/ExecutiveDark';
import MinimalClean from './templates/MinimalClean';

export default function FullProfile() {
  const { id } = useParams();
  const { profiles } = useAppContext();
  
  // Find passing profile by id OR slug
  const profile = profiles.find((p: any) => p.id === id || p.slug === id) || profiles[0];
  
  const [template, setTemplate] = useState('classic');

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
    }
  }, [profile]);

  const handleExit = () => {
     window.location.href = '/admin'; // or history
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-slate-900 px-3 py-2.5 flex flex-wrap gap-2 items-center border-b-2 border-slate-800 shadow-md">
         <span className="text-[10px] font-bold text-slate-400 tracking-widest mr-2 uppercase">Profile Template</span>
         {['classic', 'executive', 'minimal'].map(tName => (
           <button 
              key={tName}
              onClick={() => setTemplate(tName)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border-2 ${template === tName ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}
           >
             {tName.toUpperCase()}
           </button>
         ))}
         <Link to="/admin" className="ml-auto text-white text-xs font-semibold hover:text-blue-400 transition-colors">Exit Preview</Link>
      </div>

      {template === 'classic' && <ClassicModern profile={profile} onExit={handleExit} />}
      {template === 'executive' && <ExecutiveDark profile={profile} onExit={handleExit} />}
      {template === 'minimal' && <MinimalClean profile={profile} onExit={handleExit} />}
    </>
  );
}
