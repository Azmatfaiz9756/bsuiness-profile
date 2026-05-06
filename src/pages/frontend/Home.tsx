import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { useAppContext } from "../../context/AppContext";
import {
  LayoutGrid,
  List,
  Sparkles,
  Smartphone,
  Share2,
  BarChart3,
  Zap,
  ArrowDown,
  Shield,
  Search,
  Filter,
  Loader2,
  MessageSquare,
  Bot,
  DollarSign
} from "lucide-react";
import { motion } from "motion/react";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";

import ProfileChatbot from "../profile/components/ProfileChatbot";
import { maskProfileForDirectory } from "../../lib/privacy";
import SEO from "../../components/SEO";

function ROISummary() {
  return (
    <div className="py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] tracking-widest uppercase mb-6 border border-emerald-100">
                <DollarSign size={14} /> High ROI Networking
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Save Money. <br/> <span className="text-blue-600">Save the Planet.</span></h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                Traditional paper cards cost thousands and destroy forests. Our digital cards are a one-time 
                setup that pays for itself in just 90 days.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                 <div className="space-y-2">
                    <div className="text-3xl font-black text-slate-900">2,000 AED+</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight">Yearly Savings <br/> (Per 10 Users)</div>
                 </div>
                 <div className="space-y-2">
                    <div className="text-3xl font-black text-emerald-500">100%</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight">Eco-Friendly <br/> (Zero Waste)</div>
                 </div>
              </div>

              <Link to="/features" className="group inline-flex items-center gap-4 text-blue-600 font-black uppercase tracking-widest text-sm">
                View Full ROI Calculator <span className="p-2 bg-blue-50 rounded-full group-hover:translate-x-2 transition-transform">→</span>
              </Link>
           </div>

           <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 relative shadow-2xl">
              <div className="absolute top-8 right-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                 <BarChart3 size={12} /> Live Dashboard Preview
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">Efficiency Impact</h3>
              
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0 border border-slate-200">
                       <Smartphone size={24} />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Connect Rate</div>
                       <div className="text-lg font-black text-slate-900">4.5x Higher than Paper</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0 border border-slate-200">
                       <Zap size={24} />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Lead Sync Time</div>
                       <div className="text-lg font-black text-slate-900">Instant (Real-time CRM)</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0 border border-slate-200">
                       <Bot size={24} />
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Staffing Costs</div>
                       <div className="text-lg font-black text-slate-900">AI Replaces Human Admin</div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-200 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-bold text-slate-600">Active Campaign ROI: 420%</span>
                 </div>
                 <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Verified</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const titleWords = ["VIBE", "DIGITAL", "CONNECT."];
  const subTitleText = "Elevate your networking game. No apps, no paper. Just seamless digital profile exchange via NFC or QR.";
  const subTitleWords = subTitleText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100,
      }
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.4 }
    },
  };

  return (
    <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden min-h-[600px] flex flex-col justify-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        {/* Text Content */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left pt-12 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[10px] sm:text-xs tracking-widest uppercase border border-sky-400/20">
                <Sparkles size={14} className="animate-pulse" /> Tap & Go Networking
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] sm:text-xs tracking-widest uppercase border border-emerald-400/20">
                <Shield size={14} /> End-to-End Encrypted
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter uppercase min-h-[120px] md:min-h-[220px]">
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-x-[0.2em]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {titleWords[0].split("").map((char, index) => (
                  <motion.span key={index} variants={letterVariants} className="inline-block text-black [-webkit-text-stroke:1.5px_#ffffff] drop-shadow-md">
                    {char}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-x-[0.2em] mt-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {titleWords[1].split("").map((char, index) => (
                  <motion.span key={index} variants={letterVariants} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </motion.div>
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-x-[0.2em] mt-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {titleWords[2].split("").map((char, index) => (
                  <motion.span 
                    key={index} 
                    variants={letterVariants} 
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            </h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed font-medium min-h-[80px]"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 1.2
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {subTitleWords.map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block mr-1">
                  {word}
                </motion.span>
              ))}
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
              <a
                href="#directory"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-sky-500/25 flex justify-center items-center text-base uppercase tracking-wider"
              >
                Get Started Free
              </a>
              {siteSettings?.trialEnabled && (
                <Link
                  to="/plans"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black py-4 px-10 rounded-2xl transition-all flex justify-center items-center text-base uppercase tracking-wider"
                >
                  Start {siteSettings.trialMonths || 1}-Month Trial
                </Link>
              )}
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-slate-800 pt-8 w-full max-w-md">
              <div>
                <div className="text-2xl font-black text-white">10X</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">More Leads</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">24/7</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Support</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-black text-white">99%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Mobile Device Mockup */}
        <div className="flex-1 flex justify-center items-center w-full relative sm:h-[700px] mt-12 lg:mt-0">
          <div className="relative group shrink-0">
            {/* Floating Badges - Absolute relative to group for better control */}
            <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-10 -right-12 sm:-right-32 z-30 bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] border border-white/10 flex items-center gap-3 scale-75 sm:scale-100 origin-right"
            >
               <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                 <Bot size={22} />
               </div>
               <div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase">AI Assistant</div>
                 <div className="text-xs font-black text-white">Answering Leads...</div>
               </div>
            </motion.div>
            
            <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-20 -left-12 sm:-left-24 z-30 bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(16,185,129,0.5)] border border-white/10 flex items-center gap-3 scale-75 sm:scale-100 origin-left"
            >
               <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                 <Sparkles size={22} />
               </div>
               <div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase">Profile Views</div>
                 <div className="text-xs font-black text-white">12,420 Active</div>
               </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden aspect-[9/19] w-[280px] sm:w-[320px] shrink-0 z-10"
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
                <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
              </div>
              
              {/* Profile Screen Mockup - Executive Dark Theme */}
              <div className="w-full h-full bg-[#0a0a0a] overflow-hidden relative flex flex-col text-white font-sans">
                 {/* Background Image / Gradient */}
                 <div className="h-44 relative overflow-hidden">
                   <div 
                     className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" 
                     style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80')" }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
                   <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
                 </div>
                 
                 <div className="flex-1 relative px-6 pb-6 flex flex-col items-center -mt-16 z-20">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-[#0a0a0a] rounded-full p-1 shadow-2xl mb-4 border border-white/10"
                    >
                      <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400" alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 0.5 }}
                       className="text-center w-full"
                    >
                      <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">Azmat Faiz <span className="text-blue-500">🦅</span></h3>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Founder, DBC Network</p>
                      
                      <div className="flex justify-center mt-5">
                        <div className="inline-flex items-center gap-2 border border-white/5 py-1 px-4 rounded-full bg-white/5 backdrop-blur-sm shadow-xl">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] font-black tracking-[0.2em] text-white">PRO MEMBER</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center transition-all hover:bg-white/10">
                           <div className="text-blue-400 mb-1"><Smartphone size={18} className="mx-auto" /></div>
                           <div className="text-[10px] font-black tracking-widest uppercase">Save</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-center transition-all hover:bg-white/10">
                           <div className="text-emerald-400 mb-1"><Share2 size={18} className="mx-auto" /></div>
                           <div className="text-[10px] font-black tracking-widest uppercase">Share</div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-3">
                        <div className="w-full h-10 bg-white text-black rounded-xl font-black text-[10px] uppercase flex items-center justify-center tracking-widest shadow-lg">
                           Get Directions
                        </div>
                        <div className="w-full h-10 bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center tracking-widest">
                           WhatsApp Me
                        </div>
                      </div>
                    </motion.div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionalShowcase() {
  const benefits = [
    {
      title: "Smart Lead Capture",
      desc: "Stop losing clients. Every time someone 'Connects', their details are automatically saved to your Private CRM dashboard for instant follow-up.",
      icon: <Zap className="text-blue-500" size={24} />,
    },
    {
      title: "AI Virtual Assistant",
      desc: "Turn your profile into a 24/7 store. Your AI chatbot answers FAQs, shares pricing, and collects requirements while you focus on work.",
      icon: <Bot className="text-blue-500" size={24} />,
    },
    {
      title: "One-Tap Connectivity",
      desc: "Forget manual typing. Share your contact, social media, and portfolio via NFC or QR code. It's the fastest way to save a lead—period.",
      icon: <Smartphone className="text-blue-500" size={24} />,
    },
    {
      title: "Full Business Suite",
      desc: "Integrate Appointment Booking, E-commerce Shops, and Multi-language support to serve customers globally without any technical friction.",
      icon: <LayoutGrid className="text-blue-500" size={24} />,
    },
  ];

  return (
    <div className="py-24 bg-slate-950 border-b border-slate-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-4 border border-slate-800">
            <Sparkles size={16} className="animate-pulse" /> The Future of Networking
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.05]">
            It's not a card. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">It's a lead magnet.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Conventional paper cards go to the bin. DBC profiles live on the phone, capture lead data, and use AI to convert visitors into customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/30 hover:bg-slate-800/80 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">{benefit.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>

        <BusinessComparison />
      </div>
    </div>
  );
}

function BusinessComparison() {
  const comparison = [
    { label: "Updates", paper: "Impossible (Need Reprint)", dbc: "Instant (Live Changes)" },
    { label: "Data Quality", paper: "Zero Tracking", dbc: "Real-time Analytics" },
    { label: "Lead Capture", paper: "Manual / Forgotten", dbc: "Auto-Saved to CRM" },
    { label: "Assistant", paper: "None", dbc: "AI 24/7 Chatbot" },
    { label: "Environment", paper: "Trees Destroyed", dbc: "100% Eco-Friendly" },
  ];

  return (
    <div className="max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden bg-slate-900/80 border border-slate-800 shadow-3xl">
      <div className="bg-slate-800/50 p-8 border-b border-slate-700/50 text-center">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Modern Standard</h3>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Comparing Traditional Cards vs. Smart Profiles</p>
      </div>
      <div className="p-4 sm:p-8">
        <div className="space-y-4">
          {comparison.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-4 border-b border-slate-800 last:border-0">
               <div className="text-slate-200 font-bold text-sm uppercase tracking-wide">{item.label}</div>
               <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <div className="w-4 h-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-[8px] font-black italic">!</div>
                  {item.paper}
               </div>
               <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-tight">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">✓</div>
                  {item.dbc}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatbotShowcase() {
  const messages = [
    { text: "Hi! How much for a digital card bundle?", sender: "user", time: "10:00 AM" },
    { text: "Our starter bundle is AED 320! Which includes a premium card and leather holder. I can help you purchase it right now, want the link?", sender: "bot", time: "10:00 AM" },
    { text: "Yes please!", sender: "user", time: "10:01 AM" },
    { text: "Here is the direct checkout link: vibedigitalconnect.com/pay. Let me know if you need any other help!", sender: "bot", time: "10:01 AM" }
  ];

  return (
    <div className="py-24 bg-white border-b border-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
           {/* Text Side */}
           <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-xs tracking-widest uppercase mb-6">
                <MessageSquare size={16} /> Virtual Assistant
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Never miss a lead. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Your AI works 24/7.</span>
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-xl mx-auto lg:mx-0">
                Turn your digital profile into an automated sales machine. Our advanced AI chatbots are trained on your business data to answer queries, capture leads, and sell products even while you sleep.
              </p>
              
              <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto lg:mx-0 mb-10">
                 <div className="flex flex-col gap-2">
                    <div className="text-3xl font-black text-slate-900">100%</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Automated Replies</div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="text-3xl font-black text-blue-600">3x</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">More Conversions</div>
                 </div>
              </div>

              <Link
                to="/plans"
                className="inline-flex bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-slate-900/10 items-center gap-3 text-base uppercase tracking-wider"
              >
                 <Bot size={20} /> Equip Your AI Chatbot
              </Link>
           </div>
           
           {/* Interactive Chat Mockup Side */}
           <div className="flex-1 w-full max-w-md mx-auto relative perspective-[1000px]">
              <motion.div 
                 initial={{ opacity: 0, rotateY: -10, x: 20 }}
                 whileInView={{ opacity: 1, rotateY: -5, x: 0 }}
                 transition={{ duration: 0.8 }}
                 viewport={{ once: true }}
                 className="bg-[#f8fafc] rounded-[2rem] border-8 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
              >
                 {/* Chat Header */}
                 <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Bot size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">DBC AI Assistant</div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Online
                      </div>
                    </div>
                 </div>
                 
                 {/* Chat Body */}
                 <div className="p-6 h-[400px] flex flex-col gap-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-50 opacity-50 z-0"></div>
                    {messages.map((msg, idx) => (
                      <motion.div 
                         key={idx}
                         initial={{ opacity: 0, y: 10 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.8 + 0.5, duration: 0.4 }}
                         viewport={{ once: true }}
                         className={`relative z-10 flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                         <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                            {msg.text}
                         </div>
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 3.8 }}
                      viewport={{ once: true }}
                      className="relative z-10 mt-auto"
                    >
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                         <div className="w-full text-slate-400 text-xs font-medium pl-2">Type a message...</div>
                         <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                           <Zap size={14} />
                         </div>
                      </div>
                    </motion.div>
                 </div>
              </motion.div>
              
              {/* Back Decor */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-[40px] z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-[40px] z-0"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowSection() {
  const steps = [
    {
      title: "Build Your Profile",
      desc: "Customize your professional look, add services, link socials, and train your AI assistant in minutes.",
      icon: <LayoutGrid size={32} />,
      color: "bg-blue-500"
    },
    {
      title: "Share with a Tap",
      desc: "Use your NFC card or unique QR code to instantly share your profile. No apps required by the recipient.",
      icon: <Smartphone size={32} />,
      color: "bg-indigo-500"
    },
    {
      title: "Grow Your Network",
      desc: "Manage leads, view analytics, and let your AI staff book meetings while you scale your business.",
      icon: <BarChart3 size={32} />,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Three steps to smart networking.</h2>
          <p className="text-slate-500 font-medium">Getting started is faster than printing a single paper card.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
               <div className={`w-24 h-24 rounded-3xl ${step.color} text-white flex items-center justify-center mb-8 shadow-2xl shadow-${step.color.split('-')[1]}-200 relative`}>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </div>
                  {step.icon}
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{step.title}</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateShowcase() {
  const templates = [
    {
      id: 'classic',
      name: 'Classic Modern',
      desc: 'Clean, light, and professional template for modern businesses.',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
      badge: 'POPULAR'
    },
    {
      id: 'executive',
      name: 'Executive Dark',
      desc: 'Elegant dark mode design with gold accents for a premium feel.',
      image: 'https://images.unsplash.com/photo-1579389083395-4507e9f4c307?w=800&q=80',
      badge: 'PREMIUM'
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      desc: 'Focused on clarity and whitespace for a minimalist aesthetic.',
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
      badge: 'NEW'
    }
  ];

  return (
    <div className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
            <LayoutGrid size={14} /> Design Your First Impression
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">Professional Templates</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Choose from our hand-crafted collection of premium digital business card designs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((tpl, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
               <div className="aspect-[4/5] overflow-hidden relative">
                  <img src={tpl.image} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 right-6">
                     <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20">
                        {tpl.badge}
                     </span>
                  </div>
               </div>
               <div className="p-8 text-center">
                  <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{tpl.name}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{tpl.desc}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FrontendHome() {
  const { user, setIsLoginModalOpen, profiles: staticProfiles, selectedCountry } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Business Types");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    "All Business Types",
    "Technology",
    "Real Estate",
    "Finance",
    "Consulting",
    "Design",
    "Medical",
    "Retail",
    "Education",
  ];
  const cities = [
    "All Cities",
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Fujairah",
    "Ras Al Khaimah",
    "Umm Al Quwain",
  ];

  const fetchProfiles = async (isInitial = true) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let q = query(collection(db, "profiles"), orderBy("name"), limit(12));

      let dbDocs: any[] = [];
      if (isInitial) {
        const snapshot = await getDocs(q);
        dbDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
        
        // Merge with static profiles and apply masking
        const combined = [...staticProfiles]
          .map(p => maskProfileForDirectory(p))
          .filter(p => p !== null);

        dbDocs.forEach(dbp => {
          const masked = maskProfileForDirectory(dbp);
          if (masked && !combined.find(p => p.email === masked.email || p.id === masked.id)) {
            combined.push(masked);
          }
        });
        setProfiles(combined);
      } else if (lastDoc) {
        const nextQ = query(q, startAfter(lastDoc));
        const snapshot = await getDocs(nextQ);
        dbDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        setProfiles((prev) => {
          const combined = [...prev];
          dbDocs.forEach(dbp => {
             const masked = maskProfileForDirectory(dbp);
             if (masked && !combined.find(p => p.email === masked.email || p.id === masked.id)) {
               combined.push(masked);
             }
          });
          return combined;
        });
        
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 12);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      if (isInitial) {
         setProfiles([...staticProfiles]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);
  }, [activeCategory, activeCity]);

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      activeCategory === "All Business Types" || p.category === activeCategory;
    const matchesCity = activeCity === "All Cities" || p.city === activeCity;
    const matchesCountry = selectedCountry === 'Global' || p.country === selectedCountry || (!p.country && selectedCountry === 'UAE');

    return matchesSearch && matchesCategory && matchesCity && matchesCountry;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans overflow-x-hidden">
      <SEO 
        title="VIBE Digital Connect | Smart NFC Business Cards UAE"
        description="Elevate your networking with VIBE Digital Connect. No apps, no paper. Just seamless digital profile exchange via NFC or QR for professionals in the UAE."
        keywords="digital business card Dubai, NFC business card UAE, smart networking, professional directory, digital business cards"
        url="https://vibecard.ae"
      />

      {/* Limited Offer Banner */}
      {siteSettings?.trialEnabled && (
        <div className="text-white py-3 px-4 relative z-40 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 overflow-hidden" style={{ backgroundColor: siteSettings.bannerColor || '#2563eb' }}>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
            style={{ color: siteSettings.bannerColor || '#2563eb' }}
          >
            Limited Offer
          </motion.div>
          <p className="text-sm font-black uppercase tracking-tight m-0">
            {siteSettings.trialHeadline || `Hurry Up! Get ${siteSettings.trialMonths || 1} Month FREE Trial on PRO Version`}
          </p>
          <Link to="/plans" className="text-white border border-white/40 hover:bg-white transition-all px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ '--hover-color': siteSettings.bannerColor || '#2563eb' } as any}>
            {siteSettings.trialBtnText || 'Claim Now'}
          </Link>
          <style>{`
            a[style*="--hover-color"]:hover {
              color: var(--hover-color) !important;
            }
          `}</style>
        </div>
      )}

      {/* Animated Hero */}
      <HeroSection />

      {/* ROI Calculator Overview Section */}
      <ROISummary />

      {/* Promotional Showcase */}
      <PromotionalShowcase />
      
      {/* Templates Showcase */}
      <TemplateShowcase />
      
      {/* How it Works */}
      <WorkflowSection />
      
      {/* AI Chatbot Section */}
      <ChatbotShowcase />

      {/* Brand Hero Section */}
      <div
        id="directory"
        className="bg-slate-900 text-white pt-12 md:pt-24 pb-12 px-4 md:px-8 text-center relative overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-400/10 rounded-full blur-[40px]" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
            Network with <br />
            <span className="text-sky-400">The Powerhouse</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4 md:px-0">
            Direct access to thousands of verified professionals. Start your
            search below or filter by industry.
          </p>

          {/* Security Info Card */}
          <div className="max-w-4xl mx-auto mb-12 p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 shadow-2xl relative overflow-hidden text-left sm:text-center flex flex-col sm:items-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 relative z-10">
                <Shield size={14} /> Certified Secure Network
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight relative z-10">
               Protected by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">End-to-End Encryption.</span>
             </h3>
             <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mb-8 relative z-10 leading-relaxed">
               Your business interactions and personal data are shielded with zero-knowledge cryptographic security. We give you full control over what info shows in directories while maintaining a powerful direct-link profile.
             </p>
             <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full justify-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Zap size={18} />
                   </div>
                   <div className="text-left">
                      <div className="text-white text-xs font-black uppercase">Rapid Delivery</div>
                      <div className="text-slate-500 text-[10px] font-bold tracking-wide leading-none">Instant global sync</div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
                      <Shield size={18} />
                   </div>
                   <div className="text-left">
                      <div className="text-white text-xs font-black uppercase">Private Discovery</div>
                      <div className="text-slate-500 text-[10px] font-bold tracking-wide leading-none">Partial visibility mode</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex max-w-2xl mx-auto bg-white rounded-xl p-2 shadow-xl shrink-0">
            <div className="flex-1 flex items-center px-4">
              <span className="text-xl mr-3">🔍</span>
              <input
                type="text"
                placeholder="Search professionals, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none py-3 text-base outline-none text-slate-900 rounded-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl -mt-6 mx-auto relative z-20 px-4 md:px-6">
        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0 scrollbar-hide no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-sm outline-none shrink-0 shadow-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-sm outline-none shrink-0 shadow-sm"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center px-4 py-2.5 transition-colors ${viewMode === "grid" ? "bg-slate-900 text-white" : "bg-transparent text-slate-500 hover:bg-slate-50"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center px-4 py-2.5 transition-colors ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-transparent text-slate-500 hover:bg-slate-50"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Directory Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-sky-500" size={48} />
            <p className="text-slate-500 font-medium">
              Loading Business Directory...
            </p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`
                  ${
                    viewMode === "grid"
                      ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full"
                      : "flex flex-col gap-4"
                  }
                `}
            >
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % 12) * 0.05 }}
                    viewport={{ once: true }}
                    className={`
                      ${
                        viewMode === "grid"
                          ? "bg-white rounded-[20px] overflow-hidden border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 shadow-sm"
                          : "bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center p-5 hover:bg-slate-50 transition-colors"
                      }
                    `}
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Card Header Background */}
                        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                          {p.bannerUrl ? (
                            <img
                              src={p.bannerUrl}
                              className="w-full h-full object-cover opacity-80"
                              alt="Banner"
                            />
                          ) : p.bannerVideo ? (
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover opacity-80"
                            >
                              <source src={p.bannerVideo} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-500 opacity-80" />
                          )}
                          {idx === 0 && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-widest shadow-sm shadow-black/20 z-10">
                              FEATURED
                            </div>
                          )}
                        </div>

                        <div className="px-5 pb-6 relative flex-col">
                          {/* Avatar */}
                          <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-5 shadow-sm overflow-hidden">
                            {p.photoUrl ? (
                              <img
                                src={p.photoUrl}
                                className="w-full h-full rounded-full object-cover"
                                alt={p.name}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-3xl font-extrabold">
                                {p.avatar ||
                                  p.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="pt-12">
                            <div className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 truncate">
                              {p.name}
                              {(p.isVerified ||
                                p.plan === "Pro" ||
                                p.plan === "Enterprise") && (
                                <span className="text-sm text-sky-400">✓</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 font-medium truncate mb-0.5">
                              {p.title || "Professional"}
                            </div>
                            <div className="text-sm text-slate-900 font-bold mb-4 truncate">
                              {p.company || "DBC Member"}
                            </div>

                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                              <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                                {(p.views || 0) > 1000
                                  ? ((p.views || 0) / 1000).toFixed(1) + "k"
                                  : p.views || 0}{" "}
                                Views
                              </div>
                              {p.address && (
                                <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap truncate max-w-full">
                                  📍 {p.address.split(",")[0]}
                                </div>
                              )}
                            </div>

                            <Link
                              to={`/profile/${p.slug || p.id}`}
                              className="flex justify-center items-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors w-full"
                            >
                              View Digital Profile{" "}
                              <span className="ml-2">→</span>
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full text-white flex items-center justify-center text-2xl font-extrabold mr-0 sm:mr-6 shrink-0 mb-4 sm:mb-0 shadow-sm overflow-hidden">
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            p.avatar || p.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                          <div className="text-lg font-extrabold text-slate-900 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            {p.name}
                            {idx === 0 && (
                              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-0 sm:ml-2">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {p.title || "Professional"} @{" "}
                            <span className="font-bold text-slate-900">
                              {p.company || "DBC Member"}
                            </span>
                          </div>
                          {p.address && (
                            <div className="text-sm text-slate-500 mt-1 truncate">
                              📍 {p.address}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto shrink-0 justify-center sm:justify-end">
                          <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md font-bold whitespace-nowrap">
                            {(p.views || 0) > 1000
                              ? ((p.views || 0) / 1000).toFixed(1) + "k"
                              : p.views || 0}{" "}
                            Views
                          </div>
                          <Link
                            to={`/profile/${p.slug || p.id}`}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm w-full sm:w-auto text-center transition-colors shadow-sm"
                          >
                            View Profile
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <div
                    style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}
                  >
                    No profiles found
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Try adjusting your search or city/business type filters.
                  </div>
                </div>
              )}
            </motion.div>

            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => fetchProfiles(false)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 px-8 py-3 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loadingMore ? "Loading Profiles..." : "Load More Businesses"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Call to Action for joining directory */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 md:p-16 text-center border border-slate-200 relative overflow-hidden shadow-sm"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Claim your Brand Profile
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of professionals and brands in the official UAE
              directory. Create interactive NFC-enabled digital cards with
              advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-sky-400 hover:bg-sky-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all text-center"
                >
                  Enter Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="cursor-pointer bg-sky-400 hover:bg-sky-500 text-white border-none px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-400/20 transition-all"
                >
                  Sign in with Google or Phone to Start
                </button>
              )}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 text-[120px] opacity-5 -rotate-12 select-none">
            📱
          </div>
          <div className="absolute -bottom-10 -right-10 text-[120px] opacity-5 rotate-12 select-none">
            🤝
          </div>
        </motion.div>
      </div>

      <ProfileChatbot profile={{
        id: 'platform',
        name: 'DBC Support',
        title: 'Virtual Assistant',
        company: 'DBC Network',
        bio: 'Official DBC AI assistant.',
        services: [
          { title: 'Digital Business Cards', description: 'NFC-enabled dynamic cards' },
          { title: 'Platform Support', description: 'User guidance and premium support' }
        ],
        email: 'support@vibedigitalconnect.com',
        phone: ''
      }} />
    </div>
  );
}
