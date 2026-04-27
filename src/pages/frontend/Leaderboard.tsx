import React, { useState } from 'react';
import { Trophy, TrendingUp, Medal, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function FrontendLeaderboard() {
  const { profiles } = useAppContext();
  const [filter, setFilter] = useState('monthly');

  // Sort profiles by views to simulate leaderboard ranking
  const sortedProfiles = [...profiles].sort((a, b) => b.views - a.views);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-amber-100 text-amber-600 w-16 h-16 rounded-full mb-4 shadow-inner">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">DBC Leaderboard</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Discover the top networking professionals in the UAE. Rankings are based on profile visits, connections made, and referrals.
        </p>

        <div className="inline-flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          {['all-time', 'monthly', 'weekly'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 md:px-6 py-2 border-none rounded-lg font-semibold text-sm md:text-base capitalize transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 items-end mb-12">
        {/* Rank 2 */}
        {sortedProfiles[1] && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center relative shadow-sm order-2 md:order-1 mt-6 md:mt-0">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">2</div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-xl md:text-2xl font-bold shadow-md">{sortedProfiles[1].avatar}</div>
            <h3 className="text-lg font-extrabold mb-1">{sortedProfiles[1].name}</h3>
            <div className="text-sm text-slate-500 mb-3 line-clamp-1">{sortedProfiles[1].company}</div>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 border border-slate-100">
              <TrendingUp size={14} /> {sortedProfiles[1].views} Points
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {sortedProfiles[0] && (
          <div className="bg-gradient-to-b from-white to-yellow-50 border-2 border-yellow-400 rounded-3xl p-6 md:p-8 text-center relative shadow-xl shadow-yellow-400/20 z-10 order-1 md:order-2">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md">1</div>
            <Medal size={40} className="absolute top-4 right-4 text-yellow-500 opacity-20" />
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-yellow-200 shadow-lg">{sortedProfiles[0].avatar}</div>
            <h3 className="text-xl md:text-2xl font-black mb-1">{sortedProfiles[0].name}</h3>
            <div className="text-sm md:text-base text-slate-500 mb-4 line-clamp-1">{sortedProfiles[0].company}</div>
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-xl text-base font-extrabold text-amber-700 border border-yellow-200">
              <Star size={16} className="fill-amber-700 text-amber-700" /> {sortedProfiles[0].views} Points
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {sortedProfiles[2] && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center relative shadow-sm order-3 mt-6 md:mt-0">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">3</div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-xl md:text-2xl font-bold shadow-md">{sortedProfiles[2].avatar}</div>
            <h3 className="text-lg font-extrabold mb-1">{sortedProfiles[2].name}</h3>
            <div className="text-sm text-slate-500 mb-3 line-clamp-1">{sortedProfiles[2].company}</div>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 border border-slate-100">
              <TrendingUp size={14} /> {sortedProfiles[2].views} Points
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {sortedProfiles.slice(3).map((p, idx) => (
          <div key={p.id} className={`flex items-center p-4 md:p-6 transition-colors cursor-pointer hover:bg-slate-50 ${idx < sortedProfiles.slice(3).length - 1 ? 'border-b border-slate-100' : ''}`}>
            <div className="w-8 font-bold text-slate-400 text-lg">{idx + 4}</div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-600 to-slate-500 text-white rounded-full flex items-center justify-center text-sm md:text-base font-bold mr-4 shadow-sm shrink-0">{p.avatar}</div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="font-bold text-slate-900 mb-0.5 truncate">{p.name}</div>
              <div className="text-sm text-slate-500 truncate">{p.company}</div>
            </div>
            <div className="font-black text-blue-600 whitespace-nowrap text-right">
              {p.views} <span className="text-xs font-semibold text-slate-400 hidden sm:inline">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
