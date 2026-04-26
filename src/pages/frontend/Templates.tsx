import React from 'react';
import { Link } from 'react-router-dom';

export default function FrontendTemplates() {
  return (
    <div className="section">
      <div style={{textAlign: 'center', marginBottom: 28}}>
        <div className="section-title">Profile Templates</div>
        <div className="section-sub">Choose a template that matches your brand. All templates include wallet, referral, shop & rank buttons.</div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
        {[
          { name: 'Classic Modern', id: 'classic', bg: 'linear-gradient(135deg, #1a1a2e, #1a56db)' },
          { name: 'Executive Dark', id: 'executive', bg: '#111111' },
          { name: 'Minimal Clean', id: 'minimal', bg: '#f4f4f5' }
        ].map(tpl => (
           <div key={tpl.id} style={{borderRadius: 16, overflow: 'hidden', border: '2px solid transparent', cursor: 'pointer', transition: '.2s', background: '#fff'}} 
                onMouseEnter={e => (e.currentTarget as any).style.borderColor = 'var(--blue)'}
                onMouseLeave={e => (e.currentTarget as any).style.borderColor = 'transparent'}
                onClick={() => window.location.href = '/profile/DBC000000042'}
           >
             <div style={{height: 180, background: tpl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tpl.id === 'minimal' ? '#09090b' : '#fff', fontSize: 24, fontWeight: 800}}>
               {tpl.name}
             </div>
             <div style={{padding: '16px', textAlign: 'center'}}>
               <div style={{fontSize: 16, fontWeight: 700, color: 'var(--blk2)'}}>{tpl.name}</div>
               <div style={{fontSize: 13, color: 'var(--gray)', marginTop: 4}}>Includes full DBC features</div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
