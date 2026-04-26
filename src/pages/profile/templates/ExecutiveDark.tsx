import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { 
  Linkedin, Twitter, Instagram, Facebook, Youtube, Contact2, Send,
  PhoneCall, Mail, Globe, MapPin, FileDown, CalendarDays, Video,
  CreditCard, Wallet, ShoppingBag, Contact
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';

import AppointmentBooking from '../components/AppointmentBooking';
import ProfileChatbot from '../components/ProfileChatbot';

export default function ExecutiveDark({ profile, onExit }: { profile: any, onExit: () => void }) {
  const [activeTab, setActiveTab] = useState('about');
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
    const svg = document.getElementById("profile-qr-dark");
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
    <div style={{ background: '#000000', minHeight: '100vh', paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          @keyframes slide-dark {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .gallery-slider-dark {
            display: flex;
            gap: 12px;
            width: max-content;
            animation: slide-dark 15s linear infinite;
          }
          .gallery-slider-dark:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="shell" style={{ background: '#111111', maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative', borderLeft: '1px solid #222', borderRight: '1px solid #222' }}>
        
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', borderBottom: '1px solid #222' }}>
           <button onClick={onExit} style={{ background: '#222', border: '1px solid #444', color: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
             Exit Preview
           </button>
           <div style={{ background: '#b45309', border: '1px solid #78350f', color: '#fff', fontSize: 10, padding: '4px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>
             {profile.plan.toUpperCase()}
           </div>
        </div>
        {profile.bannerVideo && (
          <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', zIndex: 0 }}>
             <video autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}>
               <source src={profile.bannerVideo} type="video/mp4" />
             </video>
             <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(transparent, #111)' }} />
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '10px 20px 30px', position: 'relative', zIndex: 1, marginTop: profile.bannerVideo ? -40 : 20 }}>
          <div style={{ width: 110, height: 110, background: 'linear-gradient(135deg, #78350f, #b45309)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#fef3c7', border: '4px solid #111', boxShadow: '0 0 0 1px #333' }}>
             {profile.avatar}
          </div>
          
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{profile.name}</h1>
          <div style={{ fontSize: 14, color: '#b45309', fontWeight: 500, marginTop: 6 }}>{profile.title}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{profile.company}</div>
          
          {profile.bio && (
            <div style={{ fontSize: 13, color: '#aaa', marginTop: 16, lineHeight: 1.6, maxWidth: 360, margin: '16px auto 0' }}>
              {profile.bio}
            </div>
          )}

          {profile.socials && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {profile.socials.linkedin && <a href={`https://linkedin.com/in/${profile.socials.linkedin}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#0a66c2' }}><FaLinkedin size={22} /></a>}
              {profile.socials.twitter && <a href={`https://twitter.com/${profile.socials.twitter}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#fff' }}><FaTwitter size={22} /></a>}
              {profile.socials.instagram && <a href={`https://instagram.com/${profile.socials.instagram}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#E1306C' }}><FaInstagram size={22} /></a>}
              {profile.socials.tiktok && <a href={`https://tiktok.com/${profile.socials.tiktok}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#fff' }}><FaTiktok size={22} /></a>}
              {profile.socials.facebook && <a href={`https://facebook.com/${profile.socials.facebook}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1877f2' }}><FaFacebook size={22} /></a>}
              {profile.socials.youtube && <a href={`https://youtube.com/${profile.socials.youtube}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#ff0000' }}><FaYoutube size={22} /></a>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button onClick={handleSave} style={{ flex: 1, background: '#fff', color: '#000', border: 'none', padding: '12px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Contact2 size={16} /> Save Contact</button>
            <button onClick={() => setShowShareModal(true)} style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid #444', padding: '12px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Send size={16} /> Share Profile</button>
          </div>

          {profile.meetingUrl ? (
            <div style={{ marginTop: 12 }}>
              <a href={profile.meetingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', background: '#b45309', color: '#fff', padding: '12px', borderRadius: 4, fontWeight: 700 }}>
                <CalendarDays size={18} /> Book an Appointment
              </a>
            </div>
          ) : (
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <AppointmentBooking profile={profile} />
            </div>
          )}
        </div>

        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, display: 'flex', overflowX: 'auto' }}>
             {['about', 'services', 'inquiry', 'business'].map(t => (
               <div 
                 key={t}
                 onClick={() => setActiveTab(t)}
                 style={{ flex: 1, textAlign: 'center', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: activeTab === t ? '#b45309' : '#666', borderBottom: activeTab === t ? '2px solid #b45309' : '2px solid transparent', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}
               >
                 {t}
               </div>
             ))}
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {activeTab === 'about' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <a href={`tel:${profile.phone}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #222' }}>
                  <div style={{ color: '#b45309' }}><PhoneCall size={24} /></div>
                  <div><div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mobile</div><div style={{ fontSize: 15, fontWeight: 500, color: '#eee' }}>{profile.phone}</div></div>
                </a>
                <a href={`mailto:${profile.email}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #222' }}>
                  <div style={{ color: '#b45309' }}><Mail size={24} /></div>
                  <div><div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Email</div><div style={{ fontSize: 15, fontWeight: 500, color: '#eee' }}>{profile.email}</div></div>
                </a>
                <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #222' }}>
                  <div style={{ color: '#b45309' }}><Globe size={24} /></div>
                  <div><div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Website</div><div style={{ fontSize: 15, fontWeight: 500, color: '#eee' }}>{profile.website}</div></div>
                </a>
                {profile.address && profile.mapLink && (
                  <a href={profile.mapLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #222' }}>
                    <div style={{ color: '#b45309' }}><MapPin size={24} /></div>
                    <div><div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Company Address</div><div style={{ fontSize: 15, fontWeight: 500, color: '#eee' }}>{profile.address}</div></div>
                  </a>
                )}
                <div onClick={() => alert('Downloading Portfolio...')} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                  <div style={{ color: '#b45309' }}><FileDown size={24} /></div>
                  <div><div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Portfolio</div><div style={{ fontSize: 15, fontWeight: 500, color: '#eee' }}>Download PDF</div></div>
                </div>
             </div>
          )}
          {activeTab === 'services' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profile.services && profile.services.length > 0 ? profile.services.map((svc: any, i: number) => (
                  <div key={i} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{svc.name}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{svc.desc}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#b45309', marginTop: 8 }}>
                      {svc.priceType === 'Call for Price' ? 'Call for Price' : svc.priceType === 'Custom' ? 'Custom Pricing' : svc.priceType === 'Hourly' ? `${svc.price || ''} / hr` : svc.price}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 20, color: '#666', fontSize: 14 }}>No services listed.</div>
                )}
                
                {profile.gallery && profile.gallery.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Portfolio</div>
                    <div style={{ overflow: 'hidden', paddingBottom: 12 }}>
                      <div className="gallery-slider-dark">
                        {[...profile.gallery, ...profile.gallery].map((img: string, idx: number) => (
                          <div key={idx} style={{ height: 160, width: 240, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#222', border: '1px solid #333' }}>
                            <img src={img} alt="Portfolio item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {profile.videos && profile.videos.map((vid: string, idx: number) => (
                      <div key={'v'+idx} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, background: '#222', border: '1px solid #333', marginBottom: 12 }}>
                        <iframe src={vid} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube Video"></iframe>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}
          {activeTab === 'inquiry' && (
             <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Request a Consultation</div>
                <input type="text" placeholder="Full Name" style={{ width: '100%', padding: 12, borderRadius: 4, border: '1px solid #333', background: '#1a1a1a', color: '#fff', marginBottom: 12, boxSizing: 'border-box' }} />
                <input type="email" placeholder="Email Address" style={{ width: '100%', padding: 12, borderRadius: 4, border: '1px solid #333', background: '#1a1a1a', color: '#fff', marginBottom: 12, boxSizing: 'border-box' }} />
                <textarea placeholder="How can I help you?" rows={4} style={{ width: '100%', padding: 12, borderRadius: 4, border: '1px solid #333', background: '#1a1a1a', color: '#fff', marginBottom: 16, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                <button onClick={() => alert('Request Sent!')} style={{ width: '100%', background: '#b45309', color: '#fff', border: 'none', padding: 12, borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Send Request</button>
             </div>
          )}
          {activeTab === 'business' && (
             <div>
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 20, borderRadius: 8, color: '#fff', marginBottom: 16 }}>
                   <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>DBC MEMBER ID</div>
                   <div style={{ fontSize: 16, color: '#b45309', fontFamily: 'monospace', fontWeight: 600 }}>{profile.id}</div>
                </div>
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 20, borderRadius: 8, color: '#fff', marginBottom: 16 }}>
                   <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Executive Wallet</div>
                   <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CURRENT BALANCE</div>
                   <div style={{ fontSize: 32, fontWeight: 800, color: '#b45309' }}>AED 340</div>
                </div>
                {profile.bankAccounts && profile.bankAccounts.length > 0 && (
                  <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 20, borderRadius: 8, color: '#fff', marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Banking Details</div>
                    {profile.bankAccounts.map((acc: any, i: number) => (
                       <div key={i} style={{ marginBottom: i < profile.bankAccounts.length - 1 ? 16 : 0 }}>
                         <div style={{ fontSize: 11, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{acc.bankName} - {acc.country}</div>
                         {acc.accountNumber && <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#ccc', marginBottom: 2 }}>A/C: {acc.accountNumber}</div>}
                         <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#ccc', marginBottom: 2 }}>IBAN: {acc.iban}</div>
                         <div style={{ fontSize: 12, color: '#888' }}>SWIFT: {acc.swift} | Name: {acc.accountName}</div>
                       </div>
                    ))}
                  </div>
                )}
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 20, borderRadius: 8, color: '#fff' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Referral Program</div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Join the DBC network using my referral code. We both earn rewards!</div>
                  <div style={{ background: '#000', border: '1px solid #333', padding: 12, borderRadius: 4, fontFamily: 'monospace', color: '#b45309', textAlign: 'center', marginBottom: 12 }}>
                    dbc.ae/ref/{profile.id ? profile.id.slice(-6) : 'LINK'}
                  </div>
                  <Link to="/plans" style={{ display: 'inline-block', width: '100%', boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none', background: '#333', color: '#fff', border: 'none', padding: '10px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Sign Up Now</Link>
                </div>
             </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#111', width: '90%', maxWidth: 400, borderRadius: 12, padding: 32, boxSizing: 'border-box', position: 'relative', border: '1px solid #333' }}>
              <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', color: '#fff', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
              
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, textAlign: 'center', color: '#fff' }}>Share Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Send via Mobile No.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="+971501234567" value={sharePhone} onChange={e => setSharePhone(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 4, border: '1px solid #333', background: '#000', color: '#fff' }} />
                  <button onClick={handleWhatsAppShare} style={{ background: '#b45309', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Send</button>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 12 }}>Scan QR Code</div>
                <div style={{ background: '#fff', padding: 16, display: 'inline-block', borderRadius: 8 }}>
                  <QRCode id="profile-qr-dark" value={window.location.href} size={150} />
                </div>
                <button onClick={downloadQR} style={{ display: 'block', margin: '16px auto 0', background: 'transparent', color: '#b45309', border: '1px solid #b45309', padding: '8px 16px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
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
