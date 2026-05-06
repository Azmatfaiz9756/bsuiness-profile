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

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div className="relative z-40 overflow-hidden" style={{ backgroundColor: slide.color || '#0f172a' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div 
          key={slide.id + currentSlide}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
          className="text-white py-2.5 px-4 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 min-h-[44px]"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
            style={{ color: slide.color || '#2563eb' }}
          >
            Offer
          </motion.div>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] m-0">
            {slide.headline}
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to={slide.link || "/plans"} 
              className="text-white border border-white/40 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-blue-600 flex items-center gap-2"
              style={{ 
                backgroundColor: 'transparent',
                color: 'white'
              }}
            >
              <Zap size={10} fill="currentColor" /> {slide.btnText || 'Claim Now'}
            </Link>
            <span className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40">
              <ShieldCheck size={14} className="shrink-0" /> 
              Verified
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
