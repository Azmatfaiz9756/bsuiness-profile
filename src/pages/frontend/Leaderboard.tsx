import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Star, Flame, Sparkles, User, Briefcase, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { maskProfileForDirectory } from '../../lib/privacy';
import { Link } from 'react-router-dom';

export default function FrontendLeaderboard() {
  const { profiles } = useAppContext();
  const [filter, setFilter] = useState('monthly');
  const [rankedProfiles, setRankedProfiles] = useState<any[]>([]);

  useEffect(() => {
    // Process and mask profiles
    const processed = profiles
      .map(p => maskProfileForDirectory(p))
      .filter(p => p !== null);

    // Creating "New" Ranks based on time filter
    let sorted = [...processed];
    if (filter === 'monthly') {
      sorted = sorted.map(p => ({ ...p, views: Math.floor((p.views || 0) * 0.4) }));
    } else if (filter === 'weekly') {
      sorted = sorted.map(p => ({ ...p, views: Math.floor((p.views || 0) * 0.1) }));
    }
    
    const randomizedRanks = sorted.sort((a, b) => (b.views || 0) - (a.views || 0)).map((p, idx) => ({
      ...p,
      rank: idx + 1,
      isNew: (p.views || 0) < 10
    }));

    setRankedProfiles(randomizedRanks);
  }, [profiles, filter]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900 py-12 md:py-24">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50 to-slate-50 pointer-events-none" />
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full font-black text-[10px] tracking-widest uppercase mb-6 shadow-xl shadow-blue-500/20"
          >
            <Trophy size={14} /> Professional Rankings
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Elite <span className="text-blue-600">Leaderboard</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed"
          >
            Recognizing the most influential professionals based on digital engagement and profile reach. 
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mt-12"
          >
            {['monthly', 'weekly', 'all-time'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${filter === f ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Top 3 Featured Professionals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Rank 2 */}
          {rankedProfiles[1] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center relative shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group order-2 md:order-1 self-end min-h-[360px] flex flex-col justify-center"
            >
              <div className="absolute -top-4 left-1/2 -track-x-1/2 -translate-x-1/2 bg-slate-100 text-slate-600 px-4 py-1 rounded-full font-black border-2 border-white text-xs shadow-sm shadow-slate-200 uppercase tracking-widest leading-none flex items-center h-6">SECOND</div>
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-3xl font-black border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden font-mono text-slate-300">
                 {rankedProfiles[1].avatar ? rankedProfiles[1].avatar : <User size={40} className="text-slate-200" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{rankedProfiles[1].name}</h3>
              <div className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">{rankedProfiles[1].company}</div>
              <div className="mt-auto">
                <div className="inline-flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-2xl text-sm font-black text-slate-700 border border-slate-100">
                  <Flame className="text-blue-500 fill-blue-500" size={16} /> {rankedProfiles[1].views.toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">EXP</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rank 1 */}
          {rankedProfiles[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-blue-600 rounded-[3rem] p-10 text-center relative shadow-2xl shadow-blue-500/10 z-10 order-1 md:order-2 transition-all hover:shadow-blue-500/20"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-black border-4 border-white text-sm shadow-xl shadow-blue-500/30 uppercase tracking-widest leading-none flex items-center h-8">ELITE #1</div>
              <Sparkles size={24} className="absolute top-8 right-8 text-blue-500 animate-pulse" />
              <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-5xl font-black shadow-inner border border-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50"></div>
                <span className="relative z-10">{rankedProfiles[0].avatar ? rankedProfiles[0].avatar : <User size={50} className="text-slate-200" />}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 truncate px-2">{rankedProfiles[0].name}</h3>
              <div className="text-base font-bold text-blue-600 mb-10 uppercase tracking-[0.2em]">{rankedProfiles[0].company}</div>
              
              <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/20">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Current Influence</div>
                <div className="flex items-center justify-center gap-3">
                  <Star className="fill-white" size={24} />
                  <span className="text-4xl font-black">{rankedProfiles[0].views.toLocaleString()}</span>
                  <span className="text-xs font-bold opacity-80 mt-2">EXP</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rank 3 */}
          {rankedProfiles[2] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center relative shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group order-3 self-end min-h-[360px] flex flex-col justify-center"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-600 px-4 py-1 rounded-full font-black border-2 border-white text-xs shadow-sm shadow-slate-200 uppercase tracking-widest leading-none flex items-center h-6">THIRD</div>
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-3xl font-black border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden font-mono text-slate-300">
                 {rankedProfiles[2].avatar ? rankedProfiles[2].avatar : <User size={40} className="text-slate-200" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{rankedProfiles[2].name}</h3>
              <div className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">{rankedProfiles[2].company}</div>
              <div className="mt-auto">
                <div className="inline-flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-2xl text-sm font-black text-slate-700 border border-slate-100">
                  <TrendingUp className="text-emerald-500" size={16} /> {rankedProfiles[2].views.toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">EXP</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search & List Header */}
        <div className="bg-white rounded-t-[2.5rem] border-t border-x border-slate-200 p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Rising Professionals</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Global Directory Ranking</p>
            </div>
            <div className="bg-slate-100 rounded-full py-2 px-4 flex items-center gap-2 text-slate-500 border border-slate-200/50">
               <Briefcase size={14} className="text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Global Talent Index</span>
            </div>
          </div>
        </div>

        {/* List of Professionals */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white rounded-b-[2.5rem] border border-slate-200 overflow-hidden shadow-xl mb-24"
        >
          {rankedProfiles.slice(3, 15).map((p, idx) => (
            <motion.div 
              key={p.id} 
              variants={item}
              className={`flex items-center p-6 md:p-8 transition-all hover:bg-slate-50 group cursor-pointer ${idx < rankedProfiles.slice(3, 15).length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="w-12 font-black text-slate-300 text-lg group-hover:text-blue-400 transition-colors">#{p.rank}</div>
              <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center text-xl font-bold mr-6 shadow-sm border border-slate-100 shrink-0 group-hover:scale-110 transition-transform overflow-hidden relative">
                 {p.avatar ? p.avatar : <User size={24} className="text-slate-200" />}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-black text-slate-900 truncate text-xl">{p.name}</div>
                  {p.isNew && (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                      <Sparkles size={8} /> New
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-400 truncate uppercase tracking-wider flex items-center gap-2">
                   {p.company}
                   <span className="w-1 h-1 rounded-full bg-slate-300" />
                   <span className="text-[10px] text-slate-300">Professional Profile</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-black text-slate-900 whitespace-nowrap text-right tracking-tight text-xl mb-1">
                  {p.views.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Influence</div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {rankedProfiles.length <= 3 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-20 h-20 bg-slate-50 border border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300">
                 <Medal size={40} />
               </div>
               <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">More rankings arriving soon</p>
            </div>
          )}

          {rankedProfiles.length > 15 && (
            <div className="p-10 border-t border-slate-100 text-center">
              <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                Load More Rankings
              </button>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30 mb-20"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 blur-[100px] rounded-full" />
           
           <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Want to join the Elite?</h2>
           <p className="text-blue-100 max-w-xl mx-auto mb-10 font-bold relative z-10">
             Optimize your profile reach and digital presence to climb the global leaderboard.
           </p>
           <Link to="/dashboard" className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/20 relative z-10">
             Manage My Profile <ExternalLink size={18} />
           </Link>
        </motion.div>

      </div>
    </div>
  );
}
