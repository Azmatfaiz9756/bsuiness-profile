import React from 'react';
import { Link } from 'react-router-dom';

export default function FrontendTemplates() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 font-sans">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Profile Templates</h2>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Choose a template that matches your brand. All templates include wallet, referral, shop & rank buttons.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Classic Modern', id: 'classic', bg: 'bg-gradient-to-br from-indigo-900 to-blue-600', text: 'text-white' },
          { name: 'Executive Dark', id: 'executive', bg: 'bg-slate-900', text: 'text-white' },
          { name: 'Minimal Clean', id: 'minimal', bg: 'bg-slate-100', text: 'text-slate-900' }
        ].map(tpl => (
           <div 
             key={tpl.id} 
             onClick={() => window.location.href = '/profile/DBC000000042'}
             className="bg-white rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-blue-500 cursor-pointer transition-colors shadow-sm"
           >
             <div className={`h-48 md:h-56 ${tpl.bg} flex items-center justify-center ${tpl.text} text-xl md:text-2xl font-black`}>
               {tpl.name}
             </div>
             <div className="p-6 text-center">
               <div className="text-lg font-bold text-slate-900">{tpl.name}</div>
               <div className="text-sm text-slate-500 mt-1">Includes full DBC features</div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
