import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { 
  Phone, Mail, Globe, MapPin, FileText, 
  Linkedin, Twitter, Instagram, Facebook, Youtube, Video,
  ArrowUpRight, ArrowDownToLine, Calendar, Download
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';

import AppointmentBooking from '../components/AppointmentBooking';
import ProfileChatbot from '../components/ProfileChatbot';

export default function MinimalClean({ profile, onExit }: { profile: any, onExit: () => void }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState('');

  const handleSave = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nTITLE:${profile.title}\nORG:${profile.company}\nTEL:${profile.phone}\nEMAIL:${profile.email}\nURL:${profile.website}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = () => {
    if (!sharePhone) return alert('Enter a mobile number');
    window.open(`https://wa.me/${sharePhone}?text=Check out my digital profile: ${window.location.href}`, '_blank');
  };

  const downloadQR = () => {
    const svg = document.getElementById("profile-qr-minimal");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "QR_Code.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          @keyframes slide-minimal {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .gallery-slider-minimal {
            display: flex;
            gap: 16px;
            width: max-content;
            animation: slide-minimal 15s linear infinite;
          }
          .gallery-slider-minimal:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="shell" style={{ background: '#fff', maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
        
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
           <button onClick={onExit} style={{ background: '#f4f4f5', color: '#52525b', border: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
             ← Exit Preview
           </button>
           <div style={{ color: '#09090b', fontSize: 11, padding: '4px 10px', borderRadius: 999, fontWeight: 600, border: '1px solid #e4e4e7', background: '#fff' }}>
             {profile.plan.toUpperCase()}
           </div>
        </div>
        {profile.bannerVideo && (
          <div style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden', zIndex: 0 }}>
             <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
               <source src={profile.bannerVideo} type="video/mp4" />
             </video>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)' }} />
          </div>
        )}

        <div style={{ padding: '20px 32px', position: 'relative', zIndex: 1, marginTop: profile.bannerVideo ? -60 : 0 }}>
          <div style={{ width: 80, height: 80, background: '#f4f4f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#09090b', marginBottom: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
             {profile.avatar}
          </div>
          
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#09090b', letterSpacing: -1, lineHeight: 1.1 }}>{profile.name}</h1>
          <div style={{ fontSize: 16, color: '#52525b', marginTop: 12 }}>{profile.title}</div>
          <div style={{ fontSize: 16, color: '#a1a1aa', marginTop: 4 }}>{profile.company}</div>
          
          {profile.bio && (
            <div style={{ fontSize: 15, color: '#52525b', marginTop: 16, lineHeight: 1.6 }}>
              {profile.bio}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button onClick={handleSave} style={{ flex: 1, background: '#09090b', color: '#fff', border: 'none', padding: '14px', borderRadius: 999, fontWeight: 500, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Download size={16} /> Save</button>
            <button onClick={() => setShowShareModal(true)} style={{ flex: 1, background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', padding: '14px', borderRadius: 999, fontWeight: 500, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Share <ArrowUpRight size={16} /></button>
          </div>

          {profile.meetingUrl ? (
            <div style={{ marginTop: 12 }}>
              <a href={profile.meetingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', textDecoration: 'none', background: '#f4f4f5', color: '#09090b', padding: '14px', borderRadius: 999, fontWeight: 600, fontSize: 15 }}>
                <Calendar size={18} /> Book Appointment
              </a>
            </div>
          ) : (
            <div style={{ marginTop: 24, textAlign: 'left' }}>
               <AppointmentBooking profile={profile} />
            </div>
          )}
        </div>

        <div style={{ padding: '32px', paddingTop: 0, position: 'relative', zIndex: 1 }}>
           <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Contact</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <a href={`tel:${profile.phone}`} style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Phone size={20} /> {profile.phone}</span>
                   <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                 </a>
                 <a href={`mailto:${profile.email}`} style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Mail size={20} /> {profile.email}</span>
                   <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                 </a>
                 <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Globe size={20} /> {profile.website}</span>
                   <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                 </a>
                 {profile.address && profile.mapLink && (
                   <a href={profile.mapLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><MapPin size={20} /> {profile.address}</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 <div onClick={() => alert('Downloading...')} style={{ cursor: 'pointer', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FileText size={20} /> Download Resume</span>
                   <span style={{ color: '#a1a1aa' }}><ArrowDownToLine size={16} /></span>
                 </div>
                 
                 {profile.socials?.linkedin && (
                   <a href={`https://linkedin.com/in/${profile.socials.linkedin}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaLinkedin size={20} color="#0a66c2" /> LinkedIn</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 {profile.socials?.twitter && (
                   <a href={`https://twitter.com/${profile.socials.twitter}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaTwitter size={20} color="#1da1f2" /> X (Twitter)</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 {profile.socials?.instagram && (
                   <a href={`https://instagram.com/${profile.socials.instagram}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaInstagram size={20} color="#E1306C" /> Instagram</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 {profile.socials?.tiktok && (
                   <a href={`https://tiktok.com/${profile.socials.tiktok}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaTiktok size={20} color="#000" /> TikTok</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 {profile.socials?.facebook && (
                   <a href={`https://facebook.com/${profile.socials.facebook}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaFacebook size={20} color="#1877f2" /> Facebook</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
                 {profile.socials?.youtube && (
                   <a href={`https://youtube.com/${profile.socials.youtube}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#09090b', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FaYoutube size={20} color="#ff0000" /> YouTube</span>
                     <span style={{ color: '#a1a1aa' }}><ArrowUpRight size={16} /></span>
                   </a>
                 )}
              </div>
           </div>

           {profile.services && profile.services.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                 <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Services</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {profile.services.map((svc: any, i: number) => (
                     <div key={i} style={{ borderBottom: '1px solid #e4e4e7', paddingBottom: 16, marginBottom: 4 }}>
                       <div style={{ fontSize: 16, fontWeight: 600, color: '#09090b' }}>{svc.name}</div>
                       <div style={{ fontSize: 14, color: '#52525b', marginTop: 4 }}>{svc.desc}</div>
                       <div style={{ fontSize: 14, color: '#a1a1aa', marginTop: 4 }}>
                         {svc.priceType === 'Call for Price' ? 'Call for Price' : svc.priceType === 'Custom' ? 'Custom Pricing' : svc.priceType === 'Hourly' ? `${svc.price || ''} / hr` : svc.price}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
           )}

           {(profile.gallery && profile.gallery.length > 0 || profile.videos && profile.videos.length > 0) && (
              <div style={{ marginBottom: 32 }}>
                 <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Media</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ overflow: 'hidden', paddingBottom: 16 }}>
                     <div className="gallery-slider-minimal">
                       {profile.gallery && [...profile.gallery, ...profile.gallery].map((img: string, idx: number) => (
                         <div key={idx} style={{ height: 200, width: 280, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#f4f4f5' }}>
                           <img src={img} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                       ))}
                     </div>
                   </div>
                   {profile.videos && profile.videos.map((vid: string, idx: number) => (
                     <div key={'v'+idx} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, background: '#f4f4f5' }}>
                       <iframe src={vid} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube Video"></iframe>
                     </div>
                   ))}
                 </div>
              </div>
           )}

           <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Inquiry</div>
              <div style={{ border: '1px solid #e4e4e7', padding: 24, borderRadius: 16 }}>
                 <input type="text" placeholder="Name" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #e4e4e7', marginBottom: 12, outline: 'none', fontSize: 15, background: 'transparent' }} />
                 <input type="email" placeholder="Email" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #e4e4e7', marginBottom: 12, outline: 'none', fontSize: 15, background: 'transparent' }} />
                 <textarea placeholder="Message" rows={3} style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #e4e4e7', marginBottom: 24, outline: 'none', fontSize: 15, fontFamily: 'inherit', resize: 'vertical', background: 'transparent' }}></textarea>
                 <button onClick={() => alert('Sent!')} style={{ width: '100%', background: '#09090b', color: '#fff', border: 'none', padding: 14, borderRadius: 999, fontWeight: 500, cursor: 'pointer', fontSize: 15 }}>Send Message</button>
              </div>
           </div>

           <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Platform ID</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontFamily: 'monospace', fontSize: 16, color: '#09090b' }}>{profile.id}</span>
                 <span style={{ background: '#e4e4e7', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#52525b' }}>Verified</span>
              </div>
           </div>

           <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>DBC Wallet & Bank</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 <div style={{ background: '#f4f4f5', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: 15, fontWeight: 500, color: '#09090b' }}>Wallet Balance</span>
                   <span style={{ fontSize: 15, fontWeight: 600, color: '#09090b' }}>AED 340</span>
                 </div>
                 {profile.bankAccounts && profile.bankAccounts.map((acc: any, i: number) => (
                   <div key={i} style={{ border: '1px solid #e4e4e7', padding: 16, borderRadius: 12 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <span style={{ fontSize: 14, fontWeight: 600, color: '#09090b' }}>{acc.bankName}</span>
                       <span style={{ fontSize: 12, color: '#52525b', fontWeight: 500 }}>{acc.country}</span>
                     </div>
                     {acc.accountNumber && <div style={{ fontSize: 14, color: '#52525b', fontFamily: 'monospace', marginBottom: 4 }}>A/C: {acc.accountNumber}</div>}
                     <div style={{ fontSize: 14, color: '#52525b', fontFamily: 'monospace', marginBottom: 4 }}>IBAN: {acc.iban}</div>
                     <div style={{ fontSize: 12, color: '#a1a1aa' }}>SWIFT: {acc.swift} • Name: {acc.accountName}</div>
                   </div>
                 ))}
                 <Link to="/plans" style={{ textDecoration: 'none', background: '#f4f4f5', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                   <span style={{ fontSize: 15, fontWeight: 500, color: '#09090b' }}>Join Platform / Referral</span>
                   <span style={{ fontSize: 15, color: '#a1a1aa' }}>→</span>
                 </Link>
                 <Link to="/shop" style={{ textDecoration: 'none', background: '#f4f4f5', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                   <span style={{ fontSize: 15, fontWeight: 500, color: '#09090b' }}>Member Shop</span>
                   <span style={{ fontSize: 15, color: '#a1a1aa' }}>→</span>
                 </Link>
              </div>
           </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', width: '90%', maxWidth: 400, borderRadius: 24, padding: 32, boxSizing: 'border-box', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
              <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#f4f4f5', color: '#09090b', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, textAlign: 'center', color: '#09090b', fontWeight: 600 }}>Share Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b' }}>Send via Mobile No.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="+971 50 123 4567" value={sharePhone} onChange={e => setSharePhone(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e4e4e7', outline: 'none', fontSize: 15 }} />
                  <button onClick={handleWhatsAppShare} style={{ background: '#09090b', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 15 }}>Send</button>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#52525b', marginBottom: 16 }}>Scan QR Code</div>
                <div style={{ background: '#fff', padding: 16, display: 'inline-block', borderRadius: 16, border: '1px solid #e4e4e7' }}>
                  <QRCode id="profile-qr-minimal" value={window.location.href} size={160} />
                </div>
                <button onClick={downloadQR} style={{ display: 'block', margin: '20px auto 0', background: '#f4f4f5', color: '#09090b', border: 'none', padding: '10px 20px', borderRadius: 999, fontWeight: 500, cursor: 'pointer', fontSize: 14 }}>
                  Download QR Code
                </button>
              </div>

            </div>
          </div>
        )}

        <ProfileChatbot profile={profile} />
      </div>
    </div>
  );
}
