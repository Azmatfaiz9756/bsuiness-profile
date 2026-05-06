import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldCheck } from "lucide-react";

export function PromotionBanner() {
  const { siteSettings } = useAppContext();
  
  const defaultSlides = [
    { id: 'trial', headline: 'HURRY UP! GET 1 MONTH FREE TRIAL ON PRO VERSION', btnText: 'CLAIM NOW', link: '/plans', color: '#2563eb' },
    { id: 'bonus', headline: 'WELCOME BONUS! JOIN NOW & GET 10 AED IN YOUR WALLET', btnText: 'JOIN NOW', link: '/', color: '#059669' }
  ];
  
  const slides = siteSettings?.promotionSlides?.length > 0 
    ? siteSettings.promotionSlides 
    : defaultSlides;

  if (!slides || slides.length === 0) return null;

  // For the marquee effect, we join all headlines
  const marqueeText = slides.map(s => s.headline).join(" • ");
  const activeSlide = slides[0]; // Use first slide's color and link as primary

  return (
    <div className="relative z-40 overflow-hidden py-2" style={{ backgroundColor: activeSlide.color || '#0f172a' }}>
      <div className="flex items-center whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-10 pr-10"
        >
          {/* Repeating 4 times to ensure continuous scroll */}
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex items-center gap-10">
              {slides.map((s: any, idx: number) => (
                <div key={`${i}-${idx}`} className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-white/20">
                    {s.btnText || 'OFFER'}
                  </div>
                  <Link to={s.link || "/plans"} className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] hover:underline transition-all">
                    {s.headline}
                  </Link>
                  <Zap size={10} fill="currentColor" className="text-amber-400" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
