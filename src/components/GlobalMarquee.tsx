import React from 'react';
import { useAppContext } from '../context/AppContext';

export function GlobalMarquee() {
  const { siteSettings } = useAppContext();
  
  if (!siteSettings?.marqueeEnabled || !siteSettings?.marqueeText) return null;

  return (
    <div 
      className="relative z-[60] py-2 overflow-hidden border-b border-white/10"
      style={{ backgroundColor: siteSettings.marqueeBgColor || '#2563eb' }}
    >
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span 
            key={i}
            className="inline-block px-8 text-xs md:text-sm font-black uppercase tracking-widest"
            style={{ color: siteSettings.marqueeTextColor || '#ffffff' }}
          >
            {siteSettings.marqueeText}
          </span>
        ))}
      </div>
      
      <style>{`
        .animate-marquee {
          animation: marquee ${siteSettings.marqueeSpeed || 30}s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
