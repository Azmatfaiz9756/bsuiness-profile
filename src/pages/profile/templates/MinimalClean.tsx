import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Video,
  ArrowUpRight,
  ArrowDownToLine,
  Calendar,
  Download,
  MessageCircle,
  Link2,
  Wallet,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  Link as LinkIcon,
  UserPlus,
  Send,
  Share2,
  Bird,
  Volume2,
  VolumeX,
  Building,
  BadgeCheck,
  Contact2,
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";

import AppointmentBooking from "../components/AppointmentBooking";
import LeadCapture from "../components/LeadCapture";
import ProfileChatbot from "../components/ProfileChatbot";
import AddToHomeScreen from "../../../components/AddToHomeScreen";
import VerifiedBadge from "../components/VerifiedBadge";
import { useTranslation } from "../../../lib/translations";

export default function MinimalClean({
  profile,
  onExit,
}: {
  profile: any;
  onExit: () => void;
}) {
  const t = useTranslation(profile.isRtl);
  const { jobOpenings, siteSettings, user, profiles, setIsLoginModalOpen } = useAppContext();
  const [activeTab, setActiveTab] = useState<string | null>('home');
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const isOwner = user?.uid === profile.uid;
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasPayments = (profile.bankAccounts && profile.bankAccounts.length > 0) || profile.bankName;

  const navItems = [
    { id: 'home', label: t.home, icon: <Contact2 size={18} />, show: true },
    { id: 'services', label: t.services, icon: <Sparkles size={18} />, show: profile.services && profile.services.length > 0 },
    { id: 'shop', label: t.store, icon: <ShoppingBag size={18} />, show: profile.products && profile.products.length > 0 },
    { id: 'bank', label: t.bank, icon: <Building size={18} />, show: hasPayments },
  ].filter(item => item.show);

  const toggleAudio = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  const shareUrl = user ? `${window.location.origin}${window.location.pathname}?ref=${user.uid}` : window.location.href.split('?')[0];

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const AccordionItem = ({ title, children }: any) => {
    return (
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#a1a1aa",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          {title}
        </div>
        <div>{children}</div>
      </div>
    );
  };

  const handleSave = () => {
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}${profile.name2 ? ' & ' + profile.name2 : ''}\nTITLE:${profile.title}\nORG:${profile.company}\nTEL;TYPE=CELL:${profile.phone}\n`;
    if (profile.phone2) vcard += `TEL;TYPE=CELL:${profile.phone2}\n`;
    vcard += `EMAIL:${profile.email}\nURL:${profile.website}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${String(profile.name || 'profile').replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTheme = () => {
    switch(profile.profession) {
      case 'Welder': return { icon: '🔥', primary: '#ea580c' };
      case 'Doctor': return { icon: '⚕️', primary: '#0ea5e9' };
      case 'Carpenter': return { icon: '🪚', primary: '#d97706' };
      case 'AC Technician': return { icon: '❄️', primary: '#0284c7' };
      case 'Electrician': return { icon: '⚡', primary: '#eab308' };
      case 'Plumber': return { icon: '💧', primary: '#06b6d4' };
      case 'Mechanic': return { icon: '🔧', primary: '#475569' };
      case 'Engineer': return { icon: '📐', primary: '#2563eb' };
      case 'Lawyer': return { icon: '⚖️', primary: '#1e293b' };
      case 'Chef': return { icon: '👨‍🍳', primary: '#ef4444' };
      case 'Real Estate Agent': return { icon: '🏢', primary: '#0d9488' };
      default: return { icon: '', primary: '#111827' };
    }
  };

  const themeVars = getTheme();

  const handleWhatsAppShare = () => {
    if (!sharePhone) return alert("Enter a mobile number");
    window.open(
      `https://wa.me/${sharePhone}?text=Check out my digital profile: ${shareUrl}`,
      "_blank",
    );
  };

  const formatSocialUrl = (platform: string, value: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    
    if (trimmed.startsWith("www.")) {
      return `https://${trimmed}`;
    }

    const domains: Record<string, string> = {
      linkedin: 'linkedin.com',
      twitter: 'twitter.com',
      instagram: 'instagram.com',
      tiktok: 'tiktok.com',
      facebook: 'facebook.com',
      youtube: 'youtube.com',
      github: 'github.com'
    };

    const platformDomain = domains[platform.toLowerCase()];
    if (platformDomain && trimmed.includes(platformDomain)) {
      return `https://${trimmed}`;
    }
    
    switch (platform.toLowerCase()) {
      case 'linkedin': return `https://linkedin.com/in/${trimmed.replace('@', '')}`;
      case 'twitter': return `https://twitter.com/${trimmed.replace('@', '')}`;
      case 'instagram': return `https://instagram.com/${trimmed.replace('@', '')}`;
      case 'tiktok': return `https://tiktok.com/@${trimmed.replace('@', '')}`;
      case 'facebook': return `https://facebook.com/${trimmed.replace('@', '')}`;
      case 'youtube': return trimmed.startsWith('channel/') || trimmed.startsWith('c/') ? `https://youtube.com/${trimmed}` : `https://youtube.com/${trimmed.startsWith('@') ? trimmed : '@' + trimmed}`;
      case 'github': return `https://github.com/${trimmed.replace('@', '')}`;
      default: return trimmed;
    }
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
    <div
      dir={profile.isRtl ? 'rtl' : 'ltr'}
      style={{
        background: "#fafafa",
        minHeight: "100vh",
        paddingBottom: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
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
      <div
        className="shell"
        dir={profile.isRtl ? 'rtl' : 'ltr'}
        style={{
          background: "#fff",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {(profile.bannerVideo || profile.bannerUrl) && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 280,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            {profile.bannerVideo?.includes('youtube.com') || profile.bannerVideo?.includes('youtu.be') ? (
              (() => {
                const videoId = profile.bannerVideo.includes('v=') 
                  ? profile.bannerVideo.split('v=')[1]?.split('&')[0]
                  : profile.bannerVideo.split('/').pop()?.split('?')[0];
                return (
                      <div 
                      onClick={toggleAudio}
                      style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: 'pointer', zIndex: 1 }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '240%',
                        height: '240%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                      }}>
                        <iframe
                          ref={iframeRef}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&enablejsapi=1&playlist=${videoId}`}
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                        ></iframe>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 20,
                          right: 20,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </div>
                    </div>
                );
              })()
            ) : profile.bannerVideo ? (
              <div 
                onClick={() => setIsMuted(prev => !prev)}
                style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: 'pointer', zIndex: 1 }}
              >
                <video
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                >
                  <source src={profile.bannerVideo} type="video/mp4" />
                </video>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
              </div>
            ) : (
              <img 
                src={profile.bannerUrl} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt="Banner"
              />
            )}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.7)",
              }}
            />
          </div>
        )}

        <div
          style={{
            padding: "20px 32px",
            position: "relative",
            zIndex: 1,
            marginTop: (profile.bannerVideo || profile.bannerUrl) ? -60 : 0,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "#f4f4f5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#09090b",
              marginBottom: 24,
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              overflow: 'hidden'
            }}
          >
            {profile.photoUrl ? (
              <img src={profile.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={profile.name} />
            ) : (
              profile.avatar
            )}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: "#09090b",
              letterSpacing: -1,
              lineHeight: 1.1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {profile.name}
            {(profile.isVerified ||
              profile.plan === "Pro" ||
              profile.plan?.includes("Enterprise")) && (
              <span style={{ display: "inline-flex", marginLeft: 4 }}>
                <VerifiedBadge size={28} />
                <style>{`
                  .lucide-badge-check path:nth-child(1) { fill: #2563eb; }
                  .lucide-badge-check path:nth-child(2) { stroke: white; }
                `}</style>
              </span>
            )}
          </h1>
          <div style={{ fontSize: 16, color: "#52525b", marginTop: 12 }}>
            {profile.title}
          </div>
          <div style={{ fontSize: 16, color: "#a1a1aa", marginTop: 4 }}>
            {profile.company}
          </div>
          
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "#f4f4f5", padding: "4px 12px", borderRadius: 20, border: "1px solid #e4e4e7" }}>
             <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.4)" }}></span>
             <span style={{ fontSize: 12, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 1 }}>{profile.views || 0} {t.visits}</span>
          </div>

          {activeTab === 'home' && (
            <>
              {profile.bio && (
            <div
              style={{
                fontSize: 15,
                color: "#52525b",
                marginTop: 16,
                lineHeight: 1.6,
              }}
            >
              {profile.bio}
            </div>
          )}

          {profile.announcement && (
            <div
              style={{
                marginTop: 16,
                background: "#09090b",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              ✦ {profile.announcement}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
            {profile.quickPayAmount > 0 && (
              <button
                onClick={() => {
                  const paymentLink = profile.paymentLinks?.[0]?.url;
                  if (paymentLink) {
                    window.open(paymentLink, '_blank');
                  } else {
                    setActiveTab('payments');
                  }
                }}
                style={{
                  width: "100%",
                  background: "#18181b",
                  color: "#fff",
                  padding: "16px",
                  borderRadius: 999,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontSize: 16,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  border: "none",
                  textTransform: 'uppercase',
                  letterSpacing: 2
                }}
              >
                <Wallet size={20} /> {t.pay} {profile.quickPayCurrency || 'AED'} {profile.quickPayAmount}
              </button>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
              <LeadCapture profile={profile} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    background: "#2563eb",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  }}
                >
                  <Download size={16} /> {t.saveContact}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    background: "#f4f4f5",
                    color: "#09090b",
                    border: "1px solid #e4e4e7",
                    padding: "14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Share2 size={16} /> {t.share}
                </button>
              </div>

              {profile.googleReviewLink && (
                <button
                  onClick={() => window.open(profile.googleReviewLink, '_blank')}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "#f59e0b",
                    border: "1px solid #f59e0b",
                    padding: "14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 15,
                    marginTop: 4
                  }}
                >
                  <Star size={16} fill="currentColor" /> {t.googleReview}
                </button>
              )}
            </div>
            {!profile.plan?.includes("Enterprise") && (
              <Link
                to="/referrals"
                style={{
                  width: "100%",
                  background: "#f4f4f5",
                  color: "#71717a",
                  padding: "12px",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                  border: "1px solid #e4e4e7",
                }}
              >
                <Share2 size={16} /> {t.referEarn}
              </Link>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {profile.address && (
              <>
                <div
                  style={{
                    background: "#f4f4f5",
                    border: "1px solid #e4e4e7",
                    color: "#09090b",
                    padding: "16px",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <MapPin size={20} color="#52525b" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1 }}>{t.address}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#27272a" }}>
                      {profile.address_street ? (
                        <>
                          {profile.address_street}{profile.address_city ? `, ${profile.address_city}` : ''}
                          {profile.address_state ? `, ${profile.address_state}` : ''}
                          {profile.address_zip ? ` ${profile.address_zip}` : ''}
                        </>
                      ) : (
                        profile.address
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(profile.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: "100%",
                    background: "#16a34a",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    fontSize: 15,
                    boxShadow: "0 4px 12px rgba(22,163,74,0.2)",
                    boxSizing: "border-box",
                  }}
                >
                  <MapPin size={18} /> {t.getDirections}
                </a>
              </>
            )}

          </div>
          </>)}
        </div>

        <div
          style={{
            padding: "32px",
            paddingTop: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
              {t.contact}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <a
                href={`tel:${profile.phone}`}
                style={{
                  textDecoration: "none",
                  color: "#09090b",
                  fontSize: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <Phone size={20} /> {profile.phone} {profile.name2 ? `(${profile.name.split(' ')[0]})` : ''}
                </span>
                <span style={{ color: "#a1a1aa" }}>
                  <ArrowUpRight size={16} />
                </span>
              </a>
              {profile.phone2 && (
                <a
                  href={`tel:${profile.phone2}`}
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Phone size={20} /> {profile.phone2} {profile.name2 ? `(${profile.name2.split(' ')[0]})` : ''}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${(profile.whatsapp || profile.socials?.whatsapp || '').replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <MessageSquare size={20} color="#25D366" /> WhatsApp {profile.name2 ? `(${profile.name.split(' ')[0]})` : ''}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.whatsapp2 && (
                <a
                  href={`https://wa.me/${profile.whatsapp2.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <MessageSquare size={20} color="#25D366" /> WhatsApp {profile.name2 ? `(${profile.name2.split(' ')[0]})` : ''}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              <a
                href={`mailto:${profile.email}`}
                style={{
                  textDecoration: "none",
                  color: "#09090b",
                  fontSize: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <Mail size={20} /> {profile.email}
                </span>
                <span style={{ color: "#a1a1aa" }}>
                  <ArrowUpRight size={16} />
                </span>
              </a>
              <a
                href={`https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#09090b",
                  fontSize: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <Globe size={20} /> {profile.website}
                </span>
                <span style={{ color: "#a1a1aa" }}>
                  <ArrowUpRight size={16} />
                </span>
              </a>
              {(profile.address || profile.mapLink || profile.address_street) && (
                <a
                  href={profile.mapLink || '#'}
                  onClick={(e) => !profile.mapLink && e.preventDefault()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <MapPin size={20} /> 
                    {profile.address_street ? (
                      <>
                        {profile.address_street}{profile.address_city ? `, ${profile.address_city}` : ''}
                      </>
                    ) : (
                      profile.address || t.visitUs
                    )}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.documentUrl && (
                <a
                  href={profile.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FileText size={20} />{" "}
                    {profile.documentButtonText || t.businessDocument}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowDownToLine size={16} />
                  </span>
                </a>
              )}
              {Array.isArray(profile.customButtons) &&
                profile.customButtons.map((btn: any, index: number) => (
                  <a
                    key={index}
                    href={btn.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      color: btn.isPrimary ? "#2563eb" : "#09090b",
                      fontSize: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontWeight: btn.isPrimary ? 600 : 400,
                      }}
                    >
                      {btn.icon === "Globe" && <Globe size={20} />}
                      {btn.icon === "Calendar" && <Calendar size={20} />}
                      {btn.icon === "FileText" && <FileText size={20} />}
                      {btn.icon === "Download" && <Download size={20} />}
                      {btn.icon === "MessageCircle" && (
                        <MessageCircle size={20} />
                      )}
                      {(!btn.icon || btn.icon === "Link") && (
                        <Link2 size={20} />
                      )}
                      {btn.label}
                    </span>
                    <span
                      style={{ color: btn.isPrimary ? "#2563eb" : "#a1a1aa" }}
                    >
                      <ArrowUpRight size={16} />
                    </span>
                  </a>
                ))}

              {profile.socials?.linkedin && (
                <a
                  href={formatSocialUrl('linkedin', profile?.socials?.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaLinkedin size={20} color="#0a66c2" /> LinkedIn
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.socials?.twitter && (
                <a
                  href={formatSocialUrl('twitter', profile?.socials?.twitter)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaTwitter size={20} color="#1da1f2" /> X (Twitter)
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.socials?.instagram && (
                <a
                  href={formatSocialUrl('instagram', profile?.socials?.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaInstagram size={20} color="#E1306C" /> Instagram
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.socials?.tiktok && (
                <a
                  href={formatSocialUrl('tiktok', profile?.socials?.tiktok)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaTiktok size={20} color="#000" /> TikTok
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.socials?.facebook && (
                <a
                  href={formatSocialUrl('facebook', profile?.socials?.facebook)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaFacebook size={20} color="#1877f2" /> Facebook
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {profile.socials?.youtube && (
                <a
                  href={formatSocialUrl('youtube', profile?.socials?.youtube)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <FaYoutube size={20} color="#ff0000" /> YouTube
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              )}
              {Array.isArray(profile?.socialLinks) && profile.socialLinks.map((link: any, i: number) => (
                <a
                  key={`mlsl-${i}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#09090b",
                    fontSize: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Link2 size={20} color="#71717a" /> {link.label || 'Link'}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {activeTab === 'home' && profile.hours && Object.keys(profile.hours).length > 0 && (
            <AccordionItem id="hours" title={t.businessHours}>
              <div
                style={{
                  padding: 20,
                  background: "#f4f4f5",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const h = profile.hours[day];
                  if (!h) return null;
                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 15,
                        borderBottom:
                          day !== "Sunday" ? "1px solid #e4e4e7" : "none",
                        paddingBottom: day !== "Sunday" ? 12 : 0,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#09090b" }}>
                        {(t as any)[day]}
                      </span>
                      <span style={{ color: h.closed ? "#ef4444" : "#52525b" }}>
                        {h.closed ? (
                          t.closed
                        ) : (
                          <>
                            {h.open} - {h.close}
                            {h.split && h.open2 && h.close2 && (
                              <><br/><span style={{ fontSize: 12, opacity: 0.6 }}>&amp;</span> {h.open2} - {h.close2}</>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {(activeTab === 'home' || activeTab === 'services') && Array.isArray(profile.services) && profile.services.length > 0 && (
            <AccordionItem id="services" title={t.services}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
              {Array.isArray(profile?.services) && profile.services.map((svc: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      borderBottom: "1px solid #e4e4e7",
                      paddingBottom: 16,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#09090b",
                      }}
                    >
                      {svc.name}
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#52525b", marginTop: 4 }}
                    >
                      {svc.desc}
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#a1a1aa", marginTop: 4 }}
                    >
                      {svc.priceType === "Call for Price"
                        ? "Call for Price"
                        : svc.priceType === "Custom"
                          ? "Custom Pricing"
                          : svc.priceType === "Hourly"
                            ? `${svc.price || ""} / hr`
                            : svc.price}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {(activeTab === 'home' || activeTab === 'shop') && Array.isArray(profile.products) && profile.products.length > 0 && (
            <>
              {activeTab === 'shop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ 
                    background: '#fff', 
                    borderRadius: 24, 
                    overflow: 'hidden', 
                    border: '1px solid #e4e4e7',
                  }}>
                    {profile.storeMarquee && (
                      <div style={{ background: '#09090b', color: '#fff', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                         <div style={{ animation: 'marquee 15s linear infinite', display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                           ⚡ {profile.storeMarquee} &nbsp; &nbsp; &nbsp; ⚡ {profile.storeMarquee} &nbsp; &nbsp; &nbsp; ⚡ {profile.storeMarquee}
                         </div>
                      </div>
                    )}
                    {profile.storeBannerUrl && (
                      <div style={{ position: 'relative', height: 160, width: '100%' }}>
                        <img src={profile.storeBannerUrl} alt="Store Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #e4e4e7' }}>
                      {profile.storeCompanyLogo && (
                        <img src={profile.storeCompanyLogo} alt="Logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '1px solid #e4e4e7' }} />
                      )}
                      <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>{profile.storeCompanyName || profile.company || `${profile.name}'s Store`}</h2>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#52525b' }}>Verified Online Storefront</p>
                      </div>
                    </div>
                    
                    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                      {profile.products.map((prod: any, i: number) => (
                        <div key={`shop-${i}`} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column' }}>
                          {prod.image && (
                            <img src={prod.image} alt={prod.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderBottom: '1px solid #f4f4f5' }} />
                          )}
                          <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#09090b', marginBottom: 4 }}>{prod.name}</div>
                            <div style={{ fontSize: 12, color: '#52525b', marginBottom: 12, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.description}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#09090b', marginBottom: 12 }}>{prod.price}</div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#f4f4f5', borderRadius: 8, overflow: 'hidden' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: Math.max(1, (prev[i] || 1) - 1) })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#52525b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >-</button>
                                <div style={{ fontSize: 13, fontWeight: 'bold', width: 20, textAlign: 'center', color: '#09090b' }}>{productQuantities[i] || 1}</div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: (prev[i] || 1) + 1 })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#52525b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >+</button>
                              </div>
                              <a href={prod.link ? (() => { try { const u = new URL(prod.link); if(!u.searchParams.has('quantity')) u.searchParams.append('quantity', String(productQuantities[i] || 1)); return u.toString() } catch(e) { return prod.link } })() : `https://wa.me/${String(profile.phone || '').replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I would like to order: ${prod.name} (Quantity: ${productQuantities[i] || 1})`)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ flex: 1, background: prod.link ? '#09090b' : '#25D366', color: '#fff', textAlign: 'center', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                                {prod.link ? 'Buy Now' : 'WhatsApp'}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '0 24px 24px' }}>
                      <button 
                        onClick={() => {
                          const isCustomDomain = window.location.pathname === '/';
                          const storeUrl = isCustomDomain ? '/store' : `/profile/${profile.id || profile.slug}/store`;
                          window.open(storeUrl, '_blank');
                        }}
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: '#09090b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                        onMouseLeave={e => e.currentTarget.style.background = '#09090b'}
                      >
                        View Full Store ({profile.products.length} Products) <ArrowRight size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              )}
              {activeTab === 'home' && (
                <AccordionItem id="shop" title={t.products}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                  {Array.isArray(profile?.products) && profile.products.slice(0, 3).map((prod: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #e4e4e7",
                          borderRadius: 16,
                          padding: 16,
                        }}
                      >
                        {prod.image && (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                              marginBottom: 12,
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#09090b",
                          }}
                        >
                          {prod.name}
                        </div>
                        <div
                          style={{ fontSize: 14, color: "#52525b", marginTop: 4 }}
                        >
                          {prod.description}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 16,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#09090b",
                            }}
                          >
                            {prod.price}
                          </div>
                          {prod.link ? (
                            <a
                              href={prod.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: "#09090b",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              Buy Now
                            </a>
                          ) : (
                            <a
                              href={`https://wa.me/${String(profile.phone || '').replace(/[^0-9]/g, "")}?text=Hi, I would like to order: ${prod.name}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: "#25D366",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {Array.isArray(profile?.products) && profile.products.length > 0 && (
                      <button 
                        onClick={() => {
                          const isCustomDomain = window.location.pathname === '/';
                          const storeUrl = isCustomDomain ? '/store' : `/profile/${profile.id || profile.slug}/store`;
                          window.open(storeUrl, '_blank');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#f4f4f5',
                          color: '#09090b',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '8px'
                        }}
                      >
                        View Full Store ({profile.products.length} Products) <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </AccordionItem>
              )}
            </>
          )}

          {activeTab === 'home' && ((profile.gallery && profile.gallery.length > 0) ||
            (profile.videos && profile.videos.length > 0)) && (
            <AccordionItem id="media" title="Media">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ overflow: "hidden", paddingBottom: 16 }}>
                  <div className="gallery-slider-minimal">
                    {Array.isArray(profile?.gallery) && [...profile.gallery, ...profile.gallery].map(
                      (img: string, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              height: 200,
                              width: 280,
                              flexShrink: 0,
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "#f4f4f5",
                            }}
                          >
                            <img
                              src={img}
                              alt="Gallery item"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ),
                      )}
                  </div>
                </div>
                    {Array.isArray(profile?.videos) && profile.videos.map((vid: string, idx: number) => (
                        <div
                          key={"v" + idx}
                          style={{
                            position: "relative",
                            paddingBottom: "56.25%",
                            height: 0,
                            overflow: "hidden",
                            borderRadius: 12,
                            background: "#f4f4f5",
                          }}
                        >
                          <iframe
                            src={vid}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                            }}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube Video"
                          ></iframe>
                        </div>
                      ))}
              </div>
            </AccordionItem>
          )}

          {activeTab === 'home' && Array.isArray(profile.testimonials) && profile.testimonials.length > 0 && (
            <AccordionItem id="reviews" title={t.reviews}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
              {Array.isArray(profile?.testimonials) && profile.testimonials.map((test: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e4e4e7",
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <span
                          key={i}
                          style={{ color: "#09090b", fontSize: 14 }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: "#52525b",
                        fontStyle: "italic",
                        marginBottom: 16,
                        lineHeight: 1.5,
                      }}
                    >
                      "{test.quote}"
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          background: "#f4f4f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#a1a1aa",
                        }}
                      >
                        {test.name ? test.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#09090b",
                          }}
                        >
                          {test.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                          {test.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {activeTab === 'home' && Array.isArray(profile.faqs) && profile.faqs.length > 0 && (
            <AccordionItem id="faq" title={t.faqs}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
              {Array.isArray(profile?.faqs) && profile.faqs.map((faq: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      borderBottom: "1px solid #e4e4e7",
                      paddingBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#09090b",
                        marginBottom: 6,
                      }}
                    >
                      {faq.question}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#52525b",
                        lineHeight: 1.5,
                      }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}



          {(activeTab === 'home' || activeTab === 'bank') && (
          <AccordionItem id="platform" title={t.platformDetails}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#a1a1aa",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  PROFILE ID
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 16,
                      color: "#09090b",
                    }}
                  >
                    {profile.id}
                  </span>
            {(profile.isVerified ||
              profile.plan === "Pro" ||
              profile.plan?.includes("Enterprise")) && (
              <span style={{ display: "inline-flex", marginLeft: 4 }}>
                <VerifiedBadge size={28} />
              </span>
            )}
                </div>
              </div>
            </div>
          </AccordionItem>
          )}

          {(activeTab === 'home' || activeTab === 'bank') && (
              <div>
                {isOwner && (
                  <div
                    style={{
                      background: "#18181b",
                      padding: 24,
                      borderRadius: 16,
                      color: "#fff",
                      marginBottom: 24
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#a1a1aa", letterSpacing: 1, fontWeight: 700 }}>WALLET BALANCE</div>
                    <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>AED 340</div>
                    <button
                      style={{
                        width: "100%",
                        background: "#fff",
                        color: "#000",
                        border: "none",
                        padding: 12,
                        borderRadius: 8,
                        marginTop: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View Wallet
                    </button>
                  </div>
                )}
                {((profile.bankAccounts && profile.bankAccounts.length > 0) || (profile.bankName || profile.accountNumber)) && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#a1a1aa",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Bank Details
                  </div>
                )}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {profile.bankName && (
                    <div
                      style={{
                        border: "1px solid #e4e4e7",
                        padding: 20,
                        borderRadius: 20,
                        background: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 16,
                          alignItems: 'center',
                          borderBottom: '1px solid #f4f4f5',
                          paddingBottom: 12
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#09090b",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <Building size={18} className="text-blue-600" />
                          {profile.bankName}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                         Holder
                      </div>
                      <div style={{ fontSize: 14, color: '#09090b', fontWeight: 700, marginBottom: 20 }}>
                         {profile.accountName}
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Account Number</div>
                        <div
                          onClick={() => {
                            navigator.clipboard.writeText(profile.accountNumber);
                            alert("Account Number copied!");
                          }}
                          style={{
                            fontSize: 18,
                            color: "#2563eb",
                            fontWeight: 800,
                            fontFamily: "'JetBrains Mono', monospace",
                            background: '#f8fafc',
                            padding: '16px',
                            borderRadius: 12,
                            border: '1px dashed #cbd5e1',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            letterSpacing: 2
                          }}
                        >
                          {profile.accountNumber}
                          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: '#94a3b8' }}>COPY</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                        {profile.iban && (
                           <div 
                             onClick={() => {
                               navigator.clipboard.writeText(profile.iban);
                               alert("IBAN copied!");
                             }}
                             style={{ background: "#f8fafc", padding: "14px", borderRadius: 12, border: "1px solid #e2e8f0", cursor: "pointer" }}
                           >
                             <div style={{ fontSize: 10, fontWeight: 800, color: "#71717a", textTransform: "uppercase", display: 'flex', justifyContent: 'space-between' }}>
                               IBAN <span>COPY</span>
                             </div>
                             <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b", wordBreak: 'break-all', marginTop: 4, fontFamily: 'monospace' }}>{profile.iban}</div>
                           </div>
                        )}
                        <div style={{ display: 'flex', gap: 12 }}>
                          {profile.swiftCode && (
                            <div style={{ flex: 1, background: "#f8fafc", padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: "#71717a", textTransform: "uppercase" }}>SWIFT</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginTop: 4 }}>{profile.swiftCode}</div>
                            </div>
                          )}
                          {profile.ifscCode && (
                            <div style={{ flex: 1, background: "#f8fafc", padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: "#71717a", textTransform: "uppercase" }}>Routing</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b", marginTop: 4 }}>{profile.ifscCode}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {Array.isArray(profile?.bankAccounts) && profile.bankAccounts.map((acc: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #e4e4e7",
                          padding: 20,
                          borderRadius: 20,
                          background: '#ffffff',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 16,
                            alignItems: 'center',
                            borderBottom: '1px solid #f4f4f5',
                            paddingBottom: 12
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#09090b",
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10
                            }}
                          >
                            <Building size={18} className="text-blue-600" />
                            {acc.bankName}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#71717a",
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            {acc.country}
                          </span>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: '#71717a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Account Name</div>
                          <div style={{ fontSize: 14, color: '#09090b', fontWeight: 700 }}>{acc.accountName}</div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: '#71717a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Account Number</div>
                          <div
                            onClick={() => {
                              navigator.clipboard.writeText(acc.accountNumber);
                              alert("Account Number copied!");
                            }}
                            style={{
                              fontSize: 16,
                              color: "#2563eb",
                              fontWeight: 800,
                              fontFamily: "monospace",
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {acc.accountNumber}
                          </div>
                        </div>

                        {acc.iban && (
                          <div style={{ marginBottom: 16 }}>
                             <div style={{ fontSize: 10, color: '#71717a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>IBAN</div>
                             <div 
                               onClick={() => {
                                 navigator.clipboard.writeText(acc.iban);
                                 alert("IBAN copied!");
                               }}
                               style={{ fontSize: 13, color: "#09090b", fontWeight: 700, fontFamily: "monospace", wordBreak: 'break-all', cursor: 'pointer', background: '#f8fafc', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }}
                             >
                               {acc.iban}
                             </div>
                          </div>
                        )}

                        {acc.ifscCode && (
                          <div style={{ marginBottom: 16 }}>
                             <div style={{ fontSize: 10, color: '#71717a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>IFSC / Swift / Routing</div>
                             <div 
                               onClick={() => {
                                 navigator.clipboard.writeText(acc.ifscCode);
                                 alert("Code copied!");
                               }}
                               style={{ fontSize: 14, color: "#2563eb", fontWeight: 800, fontFamily: "monospace", cursor: "pointer", background: '#f8fafc', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}
                             >
                               {acc.ifscCode}
                             </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1, background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase" }}>SWIFT/BIC</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#09090b", marginTop: 2 }}>{acc.swiftCode || acc.swift || 'N/A'}</div>
                          </div>
                          <div style={{ flex: 1, background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#71717a", textTransform: "uppercase" }}>IFSC/Routing</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#09090b", marginTop: 2 }}>{acc.ifscCode || acc.routing || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div
                    style={{
                      background: "#f4f4f5",
                      padding: 24,
                      borderRadius: 16,
                      marginTop: 16,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#09090b", marginBottom: 8 }}>
                      Refer & Earn Rewards
                    </div>
                    <div style={{ fontSize: 13, color: "#71717a", marginBottom: 16, lineHeight: 1.5 }}>
                      {siteSettings?.trialEnabled && (
                        <div style={{ marginBottom: 8 }}>• <strong>{siteSettings?.trialPeriod || '1 Month'} Free Trial:</strong> All new business profiles get a free trial.</div>
                      )}
                      <div>• <strong>Referral Success:</strong> If your referral purchases within <strong>{siteSettings?.referralPurchaseWindow || 35} days</strong>, both of you earn rewards!</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          if (!user) {
                            alert("Please login first to refer friends!");
                            if (setIsLoginModalOpen) setIsLoginModalOpen(true);
                            return;
                          }
                          const userProfile = profiles?.find((p: any) => p.ownerId === user?.uid || p.email === user?.email);
                          const referralCode = userProfile?.id || `DBC-${user.uid.substring(0, 8).toUpperCase()}`;
                          navigator.clipboard.writeText(`${window.location.origin}/plans?ref=${referralCode}`);
                          alert("Referral link copied!");
                        }}
                        style={{
                          flex: 1,
                          background: "#fff",
                          border: "1px solid #e4e4e7",
                          padding: 12,
                          borderRadius: 8,
                          color: "#09090b",
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy Referral Link
                      </button>
                    </div>
                    <Link
                      to="/plans"
                      style={{
                        display: "block",
                        textDecoration: "none",
                        background: "#09090b",
                        color: "#fff",
                        textAlign: "center",
                        padding: "12px",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Get Started Now
                    </Link>
                  </div>
                  <Link
                    to="/shop"
                    style={{
                      textDecoration: "none",
                      background: "#f4f4f5",
                      padding: 16,
                      borderRadius: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#09090b",
                      }}
                    >
                      Member Shop
                    </span>
                    <span style={{ fontSize: 15, color: "#a1a1aa" }}>→</span>
                  </Link>
                </div>
              </div>
          )}

        {/* Share Modal */}
        {showShareModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.4)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: "90%",
                maxWidth: 400,
                borderRadius: 24,
                padding: 32,
                boxSizing: "border-box",
                position: "relative",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "#f4f4f5",
                  color: "#09090b",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  fontSize: 20,
                  textAlign: "center",
                  color: "#09090b",
                  fontWeight: 600,
                }}
              >
                Share Profile
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#52525b" }}
                >
                  Send via Mobile No.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid #e4e4e7",
                      outline: "none",
                      fontSize: 15,
                    }}
                  />
                  <button
                    onClick={handleWhatsAppShare}
                    style={{
                      background: "#09090b",
                      color: "#fff",
                      border: "none",
                      padding: "0 20px",
                      borderRadius: 8,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#52525b",
                    marginBottom: 16,
                  }}
                >
                  Share on Social Media
                </div>
                <div
                  style={{ display: "flex", gap: 12, justifyContent: "center" }}
                >
                  <a
                    href={`https://wa.me/?text=Check out this profile: ${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: 44,
                      height: 44,
                      background: "#25D366",
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    <FaWhatsapp size={20} />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: 44,
                      height: 44,
                      background: "#0077b5",
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    <FaLinkedin size={20} />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=Check out this profile!`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: 44,
                      height: 44,
                      background: "#1da1f2",
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    <FaTwitter size={20} />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: 44,
                      height: 44,
                      background: "#1877f2",
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    <FaFacebook size={20} />
                  </a>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#52525b",
                    marginBottom: 16,
                  }}
                >
                  Scan QR Code
                </div>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    display: "inline-block",
                    borderRadius: 16,
                    border: "1px solid #e4e4e7",
                  }}
                >
                  <QRCode
                    id="profile-qr-minimal"
                    value={shareUrl}
                    size={160}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  style={{
                    display: "block",
                    margin: "20px auto 0",
                    background: "#f4f4f5",
                    color: "#09090b",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 24,
            textAlign: "center",
            background: "#f4f4f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#09090b",
              marginBottom: 4,
            }}
          >
            Powered by VIBE Digital Connect
          </div>
          <div style={{ fontSize: 12, color: "#52525b", marginBottom: 16 }}>
            Create your own free digital profile today
          </div>
          <Link
            to="/register"
            style={{
              textDecoration: "none",
              background: "#09090b",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Get My Free Card
          </Link>
        </div>

        <div style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #e4e4e7',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0',
          zIndex: 100,
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === item.id ? '#09090b' : '#a1a1aa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              {item.icon}
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</span>
            </button>
          ))}
        </div>

        <ProfileChatbot profile={profile} />
        <AddToHomeScreen profileName={profile.name} />
        </div>
      </div>
    </div>
  );
}
