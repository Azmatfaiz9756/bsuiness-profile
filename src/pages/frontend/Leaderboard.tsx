import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Star, Flame, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendLeaderboard() {
  const { profiles } = useAppContext();
  const [filter, setFilter] = useState('monthly');
  const [rankedProfiles, setRankedProfiles] = useState<any[]>([]);

  useEffect(() => {
    // Creating "New" Ranks based on time filter to reset them or give different visuals
    let sorted = [...profiles];
    if (filter === 'monthly') {
      sorted = sorted.map(p => ({ ...p, views: Math.floor(p.views * 0.4) }));
    } else if (filter === 'weekly') {
      sorted = sorted.map(p => ({ ...p, views: Math.floor(p.views * 0.1) }));
    }
    
    // Give new users 0 or realistic points
    const randomizedRanks = sorted.sort((a, b) => b.views - a.views).map((p, idx) => ({
      ...p,
      rank: idx + 1,
      isNew: p.views < 10
    }));

    setRankedProfiles(randomizedRanks);
  }, [profiles, filter]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A0F1C] relative font-sans text-slate-200 py-10 md:py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40vh] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-blue-400 font-bold text-sm tracking-widest uppercase mb-6 backdrop-blur-md">
            <Trophy size={16} /> Elite Rankings
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Leaderboard</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            The most influential professionals and digital profiles this {filter === 'all-time' ? 'decade' : filter.replace('ly','')}.
          </p>

          <div className="inline-flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md mt-10 md:mt-12 backdrop-saturate-150">
            {['all-time', 'monthly', 'weekly'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${filter === f ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium - Modern Premium Design */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-end mb-16 px-4 md:px-0">
          
          {/* Rank 2 */}
          {rankedProfiles[1] && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 text-center relative shadow-2xl order-2 md:order-1 transition-transform hover:-translate-y-2">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-[#0A0F1C] text-lg shadow-lg">2</div>
              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-[2rem] rotate-3 mx-auto mb-6 flex items-center justify-center text-3xl font-black shadow-xl ring-2 ring-slate-700/50">{rankedProfiles[1].avatar}</div>
              <h3 className="text-xl font-black text-white mb-1">{rankedProfiles[1].name}</h3>
              <div className="text-sm text-slate-400 mb-6">{rankedProfiles[1].company}</div>
              <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 border border-slate-700/50">
                <Flame className="text-orange-400" size={16} /> {rankedProfiles[1].views} EXP
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {rankedProfiles[0] && (
            <div className="bg-gradient-to-b from-blue-900/40 to-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-[2.5rem] p-10 text-center relative shadow-2xl shadow-blue-900/20 z-10 order-1 md:order-2 transition-transform hover:-translate-y-4">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-green-400 text-white w-12 h-12 rounded-full flex items-center justify-center font-black border-4 border-[#0A0F1C] text-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">1</div>
              <Sparkles size={24} className="absolute top-6 right-6 text-blue-400 animate-pulse" />
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-emerald-400 text-white rounded-[2.5rem] -rotate-3 mx-auto mb-8 flex items-center justify-center text-5xl font-black shadow-2xl ring-4 ring-blue-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <span className="relative z-10">{rankedProfiles[0].avatar}</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{rankedProfiles[0].name}</h3>
              <div className="text-base text-blue-200/60 mb-8">{rankedProfiles[0].company}</div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 px-6 py-2.5 rounded-2xl text-lg font-black text-blue-400 border border-blue-500/20">
                <Star className="fill-blue-400 text-blue-400" size={20} /> {rankedProfiles[0].views} EXP
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {rankedProfiles[2] && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 text-center relative shadow-2xl order-3 mt-6 md:mt-0 transition-transform hover:-translate-y-2">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-900 text-orange-200 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-[#0A0F1C] text-lg shadow-lg">3</div>
              <div className="w-24 h-24 bg-gradient-to-br from-orange-900/50 to-red-900/50 text-orange-200 rounded-[2rem] -rotate-3 mx-auto mb-6 flex items-center justify-center text-3xl font-black shadow-xl ring-2 ring-orange-900/50">{rankedProfiles[2].avatar}</div>
              <h3 className="text-xl font-black text-white mb-1">{rankedProfiles[2].name}</h3>
              <div className="text-sm text-slate-400 mb-6">{rankedProfiles[2].company}</div>
              <div className="inline-flex items-center gap-2 bg-orange-900/20 px-4 py-2 rounded-xl text-sm font-bold text-orange-400 border border-orange-900/30">
                <Flame className="text-orange-500" size={16} /> {rankedProfiles[2].views} EXP
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl">
          {rankedProfiles.slice(3).map((p, idx) => (
            <div key={p.id} className={`flex items-center p-5 md:p-6 transition-all hover:bg-slate-800/40 group ${idx < rankedProfiles.slice(3).length - 1 ? 'border-b border-slate-800/50' : ''}`}>
              <div className="w-10 font-bold text-slate-500 text-lg group-hover:text-slate-300 transition-colors">#{p.rank}</div>
              <div className="w-12 h-12 bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center text-lg font-bold mr-5 shadow-inner border border-slate-700/50 shrink-0 group-hover:scale-105 transition-transform">{p.avatar}</div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-bold text-slate-200 mb-1 truncate text-lg">{p.name} {p.isNew && <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider relative -top-0.5">New</span>}</div>
                <div className="text-sm text-slate-500 truncate">{p.company}</div>
              </div>
              <div className="font-black text-blue-400 whitespace-nowrap text-right tracking-tight">
                {p.views.toLocaleString()} <span className="text-xs font-bold text-slate-600 ml-1 hidden sm:inline">EXP</span>
              </div>
            </div>
          ))}
          {rankedProfiles.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium">
              No elite ranks established for this period yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
