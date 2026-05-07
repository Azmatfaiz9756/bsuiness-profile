import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldCheck } from "lucide-react";

export function PromotionBanner() {
  const { siteSettings } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const defaultSlides = [
    { id: 'trial', headline: 'HURRY UP! GET 1 MONTH FREE TRIAL ON PRO VERSION', btnText: 'CLAIM NOW', link: '/plans', color: '#2563eb' },
    { id: 'bonus', headline: 'WELCOME BONUS! JOIN NOW & GET 10 AED IN YOUR WALLET', btnText: 'JOIN NOW', link: '/', color: '#059669' }
  ];
  
  const trialEnabled = siteSettings?.trialEnabled ?? false;
  
  let slides = Array.isArray(siteSettings?.promotionSlides) && siteSettings.promotionSlides.length > 0 
    ? siteSettings.promotionSlides 
    : defaultSlides;

  // Filter out trial slide if disabled
  if (!trialEnabled) {
    slides = slides.filter((s: any) => s.id !== 'trial');
  }

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentSlide];

  const marqueeEnabled = siteSettings?.marqueeEnabled || false;
  const marqueeText = siteSettings?.marqueeText || '';
  const marqueeBgColor = siteSettings?.marqueeBgColor || '#2563eb';
  const marqueeTextColor = siteSettings?.marqueeTextColor || '#ffffff';
  const marqueeSpeed = siteSettings?.marqueeSpeed || 30;

  if (marqueeEnabled && marqueeText) {
    return (
      <div 
        className="relative z-50 py-2.5 overflow-hidden border-b border-white/10 shadow-lg"
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[1, 2, 3, 4].map((i) => (
            <span 
              key={i}
              className="inline-block px-8 text-xs md:text-sm font-black uppercase tracking-widest"
              style={{ color: marqueeTextColor }}
            >
              {marqueeText}
            </span>
          ))}
        </div>
        
        <style>{`
          .animate-marquee {
            animation: marquee ${marqueeSpeed}s linear infinite;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-25%); }
          }
        `}</style>
      </div>
    );
  }

  if (!activeSlide) return null;

  return (
    <div className="relative z-50 overflow-hidden py-3 shadow-lg transition-colors duration-500" style={{ backgroundColor: activeSlide.color || '#0f172a' }}>
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-4 text-white text-center"
          >
            <div className="hidden sm:block bg-white/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-sm">
              {activeSlide.btnText || 'LIMITED OFFER'}
            </div>
            <Link to={activeSlide.link || "/plans"} className="text-xs md:text-sm font-black uppercase tracking-wider hover:text-white/80 transition-colors flex items-center gap-2">
              <Zap size={14} fill="currentColor" className="text-amber-400 animate-pulse" />
              {activeSlide.headline}
              <Zap size={14} fill="currentColor" className="text-amber-400 animate-pulse" />
            </Link>
            <Link to={activeSlide.link || "/plans"} className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all">
              {activeSlide.btnText || 'CLAIM'}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
