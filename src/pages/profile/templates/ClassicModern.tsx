import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { 
  Linkedin, Twitter, Instagram, Facebook, Youtube, Github, 
  PhoneCall, Mail, Globe, MapPin, FileDown, CalendarDays, 
  CreditCard, Wallet, ShoppingBag, Send, Link as LinkIcon, 
  Sparkles, Contact2, Video, MessageSquare
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaInstagram, FaTiktok, FaFacebook, FaYoutube, FaGithub } from 'react-icons/fa';

import AppointmentBooking from '../components/AppointmentBooking';
import ProfileChatbot from '../components/ProfileChatbot';

export default function ClassicModern({ profile, onExit }: { profile: any, onExit: () => void }) {
  const [activeTab, setActiveTab] = useState('contact');
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
    const svg = document.getElementById("profile-qr");
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
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .gallery-slider {
            display: flex;
            gap: 10px;
            width: max-content;
            animation: slide 15s linear infinite;
          }
          .gallery-slider:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="shell" style={{ background: '#fff', maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px' }}>
          <button onClick={onExit} style={{ background: 'rgba(0,0,0,0.05)', color: '#1a1a2e', border: 'none', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← Exit Preview
          </button>
          <div style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
            {profile.plan.toUpperCase()}
          </div>
        </div>
        <div style={{ background: profile.bannerVideo ? '#000' : 'linear-gradient(135deg,#1a1a2e,#1a56db)', height: 180, position: 'relative', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
          {profile.bannerVideo && (
            <video autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}>
              <source src={profile.bannerVideo} type="video/mp4" />
            </video>
          )}
        </div>

        <div style={{ marginTop: -50, textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 100, height: 100, background: '#fff', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
             <div style={{ width: 90, height: 90, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#1e40af' }}>
               {profile.avatar}
             </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 20px' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{profile.name}</h1>
          <div style={{ fontSize: 14, color: '#1a56db', fontWeight: 600, marginTop: 4 }}>{profile.title}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{profile.company}</div>
          
          {profile.bio && (
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 12, lineHeight: 1.5 }}>
              {profile.bio}
            </div>
          )}

          {profile.socials && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              {profile.socials.linkedin && <a href={`https://linkedin.com/in/${profile.socials.linkedin}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#0a66c2' }}><FaLinkedin size={18} /></a>}
              {profile.socials.twitter && <a href={`https://twitter.com/${profile.socials.twitter}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#1da1f2' }}><FaTwitter size={18} /></a>}
              {profile.socials.instagram && <a href={`https://instagram.com/${profile.socials.instagram}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#E1306C' }}><FaInstagram size={18} /></a>}
              {profile.socials.tiktok && <a href={`https://tiktok.com/${profile.socials.tiktok}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#000000' }}><FaTiktok size={18} /></a>}
              {profile.socials.facebook && <a href={`https://facebook.com/${profile.socials.facebook}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#1877f2' }}><FaFacebook size={18} /></a>}
              {profile.socials.youtube && <a href={`https://youtube.com/${profile.socials.youtube}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#ff0000' }}><FaYoutube size={18} /></a>}
              {profile.socials.github && <a href={`https://github.com/${profile.socials.github}`} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#333333' }}><FaGithub size={18} /></a>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={handleSave} style={{ flex: 1, background: '#1a1a2e', color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Contact2 size={16} /> Save Contact</button>
            <button onClick={() => setShowShareModal(true)} style={{ flex: 1, background: '#f3f4f6', color: '#1f2937', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Send size={16} /> Share Profile</button>
          </div>

          {profile.meetingUrl ? (
            <div style={{ marginTop: 12 }}>
              <a href={profile.meetingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', background: '#1a56db', color: '#fff', padding: '12px', borderRadius: 12, fontWeight: 700 }}>
                <CalendarDays size={18} /> Book a Meeting
              </a>
            </div>
          ) : (
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <AppointmentBooking profile={profile} />
            </div>
          )}
        </div>

        <div style={{ padding: '0 20px', marginTop: 10 }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ fontSize: 20, color: '#1e40af' }}><CreditCard size={24} /></div>
             <div>
               <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', letterSpacing: 1 }}>DBC MEMBER ID</div>
               <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>{profile.id}</div>
             </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: 20 }}>
          <div onClick={() => setActiveTab('contact')} style={{ background: activeTab === 'contact' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'contact' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'contact' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><PhoneCall size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>CONTACT</div>
          </div>
          <div onClick={() => setActiveTab('services')} style={{ background: activeTab === 'services' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'services' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'services' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><Sparkles size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>SERVICES</div>
          </div>
          <div onClick={() => setActiveTab('referral')} style={{ background: activeTab === 'referral' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'referral' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'referral' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><LinkIcon size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>REFER</div>
          </div>
          <div onClick={() => setActiveTab('wallet')} style={{ background: activeTab === 'wallet' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'wallet' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'wallet' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><Wallet size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>WALLET</div>
          </div>
          <div onClick={() => setActiveTab('shop')} style={{ background: activeTab === 'shop' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'shop' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'shop' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><ShoppingBag size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>SHOP</div>
          </div>
          <div onClick={() => setActiveTab('inquiry')} style={{ background: activeTab === 'inquiry' ? '#dbeafe' : '#f3f4f6', border: `1px solid ${activeTab === 'inquiry' ? '#93c5fd' : '#e5e7eb'}`, padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ marginBottom: 4, color: activeTab === 'inquiry' ? '#1e40af' : '#6b7280', display: 'flex', justifyContent: 'center' }}><Mail size={20} /></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a' }}>INQUIRY</div>
          </div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {activeTab === 'contact' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href={`tel:${profile.phone}`} style={{ textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: '#dcfce7', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><PhoneCall size={20} /></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Call Mobile</div><div style={{ fontSize: 12, color: '#6b7280' }}>{profile.phone}</div></div>
                </a>
                <a href={`mailto:${profile.email}`} style={{ textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: '#fee2e2', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}><Mail size={20} /></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Email</div><div style={{ fontSize: 12, color: '#6b7280' }}>{profile.email}</div></div>
                </a>
                {profile.whatsapp && (
                  <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: '#dcfce7', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><MessageSquare size={20} /></div>
                    <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>WhatsApp</div><div style={{ fontSize: 12, color: '#6b7280' }}>+{profile.whatsapp}</div></div>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: '#e0e7ff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><Globe size={20} /></div>
                    <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Website</div><div style={{ fontSize: 12, color: '#6b7280' }}>{profile.website}</div></div>
                  </a>
                )}
                {profile.address && profile.mapLink && (
                  <a href={profile.mapLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: '#fef3c7', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><MapPin size={20} /></div>
                    <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Directions</div><div style={{ fontSize: 12, color: '#6b7280' }}>{profile.address}</div></div>
                  </a>
                )}
                <div onClick={() => alert('Downloading...')} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                  <div style={{ background: '#f3f4f6', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}><FileDown size={20} /></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Download Resume</div><div style={{ fontSize: 12, color: '#6b7280' }}>PDF Document</div></div>
                </div>
             </div>
          )}
          {activeTab === 'services' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profile.services && profile.services.length > 0 ? profile.services.map((svc: any, i: number) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{svc.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{svc.desc}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a56db', marginTop: 8 }}>
                      {svc.priceType === 'Call for Price' ? 'Call for Price' : svc.priceType === 'Custom' ? 'Custom Pricing' : svc.priceType === 'Hourly' ? `${svc.price || ''} / hr` : svc.price}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 14 }}>No services listed.</div>
                )}
                
                {profile.gallery && profile.gallery.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 10, textAlign: 'left' }}>Projects & Media</div>
                    <div style={{ overflow: 'hidden', paddingBottom: 10 }}>
                      <div className="gallery-slider">
                        {[...profile.gallery, ...profile.gallery].map((img: string, idx: number) => (
                          <div key={idx} style={{ height: 160, width: 240, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6' }}>
                            <img src={img} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {profile.videos && profile.videos.map((vid: string, idx: number) => (
                      <div key={'v'+idx} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, background: '#f3f4f6', marginBottom: 10 }}>
                        <iframe src={vid} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube Video"></iframe>
                      </div>
                    ))}
                  </div>
                )}

                {profile.team && profile.team.length > 0 && (
                   <div style={{ marginTop: 8 }}>
                     <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1f2937' }}>Our Team</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {profile.team.map((member: any, i: number) => (
                          <div key={`tm-${i}`} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 12, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                             {member.image ? <img src={member.image} alt={member.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', fontWeight: 'bold' }}>{member.name?.[0]}</div>}
                             <div>
                               <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{member.name}</div>
                               <div style={{ fontSize: 12, color: '#6b7280' }}>{member.role}</div>
                               {member.desc && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{member.desc}</div>}
                             </div>
                          </div>
                        ))}
                     </div>
                   </div>
                )}
                
                {profile.testimonials && profile.testimonials.length > 0 && (
                   <div style={{ marginTop: 8 }}>
                     <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1f2937' }}>Testimonials</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {profile.testimonials.map((test: any, i: number) => (
                          <div key={`ts-${i}`} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>
                             <div style={{ fontSize: 13, fontStyle: 'italic', color: '#4b5563', marginBottom: 10 }}>"{test.quote}"</div>
                             <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{test.name}</div>
                             <div style={{ fontSize: 11, color: '#6b7280' }}>{test.role}</div>
                          </div>
                        ))}
                     </div>
                   </div>
                )}
             </div>
          )}
          {activeTab === 'inquiry' && (
             <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 20, borderRadius: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Send an Inquiry</div>
                <input type="text" placeholder="Your Name" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12, boxSizing: 'border-box' }} />
                <input type="email" placeholder="Your Email" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12, boxSizing: 'border-box' }} />
                <textarea placeholder="Message" rows={4} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 16, fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
                <button onClick={() => alert('Message Sent!')} style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Submit</button>
             </div>
          )}
          {activeTab === 'wallet' && (
             <>
               <div style={{ background: '#1a1a2e', padding: 24, borderRadius: 16, color: '#fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>WALLET BALANCE</div>
                  <div style={{ fontSize: 40, fontWeight: 900 }}>AED 340</div>
                  <button style={{ width: '100%', background: '#1a56db', color: '#fff', border: 'none', padding: 12, borderRadius: 8, marginTop: 16, fontWeight: 600, cursor: 'pointer' }}>Top Up</button>
               </div>
               
               {profile.bankAccounts && profile.bankAccounts.length > 0 && (
                 <div style={{ marginTop: 16 }}>
                   <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 10, textAlign: 'left' }}>Bank Details</div>
                   {profile.bankAccounts.map((acc: any, i: number) => (
                     <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, marginBottom: 10 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                         <span style={{ fontSize: 14, fontWeight: 700 }}>{acc.bankName}</span>
                         <span style={{ fontSize: 12, color: '#1a56db', fontWeight: 600 }}>{acc.country}</span>
                       </div>
                       {acc.accountNumber && <div style={{ fontSize: 14, color: '#4b5563', fontFamily: 'monospace', marginBottom: 4 }}>A/C: {acc.accountNumber}</div>}
                       <div style={{ fontSize: 14, color: '#4b5563', fontFamily: 'monospace', marginBottom: 4 }}>IBAN: {acc.iban}</div>
                       <div style={{ fontSize: 12, color: '#6b7280' }}>SWIFT: {acc.swift} • Name: {acc.accountName}</div>
                     </div>
                   ))}
                 </div>
               )}
             </>
          )}
          {activeTab === 'shop' && (
             <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
               <div style={{ fontSize: 16, fontWeight: 800, color: '#1f2937', marginBottom: 16 }}>Exclusive Member Shop</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ color: '#1a56db' }}><CreditCard size={32} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>NFC Gold Card</div><div style={{ fontSize: 12, color: '#1a56db', fontWeight: 600 }}>AED 200</div></div>
                  <button style={{ background: '#1f2937', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Add</button>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: '#1a56db' }}><MapPin size={32} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>NFC Sticker</div><div style={{ fontSize: 12, color: '#1a56db', fontWeight: 600 }}>AED 50</div></div>
                  <button style={{ background: '#1f2937', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Add</button>
               </div>
             </div>
          )}
          {activeTab === 'referral' && (
             <div style={{ background: '#1a56db', padding: 24, borderRadius: 16, color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Get Your Own Digital Profile</div>
                <div style={{ fontSize: 13, color: '#dbeafe', marginBottom: 16 }}>Join the DBC network using my referral code. We both earn rewards!</div>
                <div style={{ background: '#fff', color: '#1e40af', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
                  dbc.ae/ref/{profile.id ? profile.id.slice(-6) : 'LINK'}
                </div>
                <Link to="/plans" style={{ display: 'inline-block', textDecoration: 'none', background: '#1e3a8a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Sign Up Now</Link>
             </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 480, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, boxSizing: 'border-box', position: 'relative' }}>
              <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
              
              <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20, textAlign: 'center' }}>Share Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>Send via Mobile No.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="e.g. +971501234567" value={sharePhone} onChange={e => setSharePhone(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d5db' }} />
                  <button onClick={handleWhatsAppShare} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Send</button>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 12 }}>Scan QR Code</div>
                <div style={{ background: '#fff', padding: 16, display: 'inline-block', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <QRCode id="profile-qr" value={window.location.href} size={150} />
                </div>
                <button onClick={downloadQR} style={{ display: 'block', margin: '12px auto 0', background: 'transparent', color: '#1a56db', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
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

