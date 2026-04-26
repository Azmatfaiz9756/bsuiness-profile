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
      <div style={{ background: '#1a1a2e', padding: '10px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 200, borderBottom: '2px solid #2d2d4a', alignItems: 'center' }}>
         <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: 1, marginRight: 10}}>PROFILE TEMPLATE</span>
         {['classic', 'executive', 'minimal'].map(tName => (
           <button 
              key={tName}
              onClick={() => setTemplate(tName)}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: template === tName ? '#1a56db' : 'transparent',
                color: template === tName ? '#fff' : '#9ca3af',
                border: `1.5px solid ${template === tName ? '#1a56db' : '#374151'}`
              }}
           >
             {tName.toUpperCase()}
           </button>
         ))}
         <Link to="/admin" style={{marginLeft: 'auto', color: '#fff', fontSize: 12}}>Exit Preview</Link>
      </div>

      {template === 'classic' && <ClassicModern profile={profile} onExit={handleExit} />}
      {template === 'executive' && <ExecutiveDark profile={profile} onExit={handleExit} />}
      {template === 'minimal' && <MinimalClean profile={profile} onExit={handleExit} />}
    </>
  );
}
