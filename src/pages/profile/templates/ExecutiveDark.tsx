import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Contact2,
  Send,
  PhoneCall,
  Mail,
  Globe,
  MapPin,
  FileDown,
  CalendarDays,
  Video,
  CreditCard,
  ShoppingBag,
  Contact,
  FileText,
  Download,
  MessageCircle,
  Calendar,
  Link2,
  Wallet,
  MessageSquare,
  Link as LinkIcon,
  UserPlus,
  Share2,
  Bird,
  Volume2,
  VolumeX,
  Building,
  BadgeCheck,
  ArrowRight
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

export default function ExecutiveDark({
  profile,
  onExit,
}: {
  profile: any;
  onExit: () => void;
}) {
  const t = useTranslation(profile.isRtl);
  const { jobOpenings, siteSettings, user, profiles, setIsLoginModalOpen } = useAppContext();
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState("");
  const [activeTab, setActiveTab] = useState('home');
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const isOwner = user?.uid === profile.uid;
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: t.home, icon: <Contact2 size={18} />, show: true },
    { id: 'services', label: t.services, icon: <Globe size={18} />, show: profile.services && profile.services.length > 0 },
    { id: 'shop', label: t.store, icon: <ShoppingBag size={18} />, show: profile.products && profile.products.length > 0 },
    { id: 'bank', label: t.bank, icon: <Building size={18} />, show: (profile.bankAccounts && profile.bankAccounts.length > 0) || profile.bankName },
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

  const SectionContainer = ({ icon, title, children }: any) => {
    return (
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#222",
            borderBottom: "1px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "#eee",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {icon}
          {title}
        </div>
        <div style={{ padding: "20px", background: "#111" }}>{children}</div>
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

  const handleWhatsAppShare = () => {
    if (!sharePhone) return alert("Enter a mobile number");
    window.open(
      `https://wa.me/${sharePhone}?text=Check out my digital profile: ${shareUrl}`,
      "_blank",
    );
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
    <div
      dir={profile.isRtl ? 'rtl' : 'ltr'}
      style={{
        background: "#000000",
        minHeight: "100vh",
        paddingBottom: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
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
      <div
        className="shell"
        dir={profile.isRtl ? 'rtl' : 'ltr'}
        style={{
          background: "#111111",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
          borderLeft: "1px solid #222",
          borderRight: "1px solid #222",
        }}
      >
        {(profile.bannerVideo || profile.bannerUrl) && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 220,
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
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.8,
                  }}
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
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.8,
                }}
                alt="Banner"
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "50%",
                background: "linear-gradient(transparent, #111)",
              }}
            />
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            padding: "10px 20px 30px",
            position: "relative",
            zIndex: 1,
            marginTop: (profile.bannerVideo || profile.bannerUrl) ? -40 : 20,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              background: "linear-gradient(135deg, #78350f, #b45309)",
              borderRadius: "50%",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "#fef3c7",
              border: "4px solid #111",
              boxShadow: "0 0 0 1px #333",
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
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: -0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {profile.name}
            {(profile.isVerified ||
              profile.plan === "Pro" ||
              profile.plan?.includes("Enterprise")) && (
              <span style={{ display: "inline-flex", marginLeft: 4 }}>
                <VerifiedBadge size={28} />
              </span>
            )}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "#b45309",
              fontWeight: 500,
              marginTop: 6,
            }}
          >
            {profile.title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#888",
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {profile.company}
          </div>
          
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "#111", padding: "4px 12px", borderRadius: 20, border: "1px solid #333" }}>
             <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }}></span>
             <span style={{ fontSize: 11, fontWeight: 700, color: "#ccc", textTransform: "uppercase", letterSpacing: 1 }}>{profile.views || 0} {t.visits}</span>
          </div>

          {activeTab === 'home' && (
            <>
              {profile.bio && (
            <div
              style={{
                fontSize: 13,
                color: "#aaa",
                marginTop: 16,
                lineHeight: 1.6,
                maxWidth: 360,
                margin: "16px auto 0",
              }}
            >
              {profile.bio}
            </div>
          )}

          {profile.announcement && (
            <div
              style={{
                marginTop: 16,
                background: "#451a03",
                color: "#fef3c7",
                padding: "10px 16px",
                borderRadius: 4,
                borderLeft: "4px solid #b45309",
                fontSize: 13,
                fontWeight: 700,
                display: "inline-block",
              }}
            >
              ✦ {profile.announcement}
            </div>
          )}

          {profile?.socials && (
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              {profile?.socials?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile?.socials?.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#0a66c2" }}
                >
                  <FaLinkedin size={22} />
                </a>
              )}
              {profile?.socials?.twitter && (
                <a
                  href={`https://twitter.com/${profile?.socials?.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#fff" }}
                >
                  <FaTwitter size={22} />
                </a>
              )}
              {profile?.socials?.instagram && (
                <a
                  href={`https://instagram.com/${profile?.socials?.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#E1306C" }}
                >
                  <FaInstagram size={22} />
                </a>
              )}
              {profile?.socials?.tiktok && (
                <a
                  href={`https://tiktok.com/${profile?.socials?.tiktok}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#fff" }}
                >
                  <FaTiktok size={22} />
                </a>
              )}
              {profile?.socials?.facebook && (
                <a
                  href={`https://facebook.com/${profile?.socials?.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#1877f2" }}
                >
                  <FaFacebook size={22} />
                </a>
              )}
              {profile?.socials?.youtube && (
                <a
                  href={`https://youtube.com/${profile?.socials?.youtube}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#ff0000" }}
                >
                  <FaYoutube size={22} />
                </a>
              )}
              {Array.isArray(profile?.socialLinks) && profile.socialLinks.map((link: any, i: number) => (
                <a
                  key={`exsl-${i}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  title={link.label}
                  style={{ textDecoration: "none", color: "#94a3b8" }}
                >
                  <Link2 size={20} />
                </a>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 24,
            }}
          >
            {profile.quickPayAmount > 0 && (
              <button
                onClick={() => {
                  const paymentLink = profile.paymentLinks?.[0]?.url;
                  if (paymentLink) {
                    window.open(paymentLink, '_blank');
                  }
                }}
                style={{
                  width: "100%",
                  background: "#16a34a",
                  color: "#fff",
                  padding: "16px",
                  borderRadius: 4,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontSize: 16,
                  boxShadow: "0 8px 16px rgba(22,163,74,0.3)",
                  border: "none",
                  textTransform: 'uppercase',
                  letterSpacing: 2
                }}
              >
                <Wallet size={20} /> {t.pay} {profile.quickPayCurrency || 'AED'} {profile.quickPayAmount}
              </button>
            )}
            
            <div style={{ display: "flex", gap: 12 }}>
              {!profile.plan?.includes("Enterprise") && (
                <Link
                  to="/referrals"
                  style={{
                    flex: 1,
                    background: "#b45309",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  <Share2 size={16} /> {t.referEarn}
                </Link>
              )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              <LeadCapture profile={profile} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    background: "#b45309",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  <Download size={16} /> {t.saveContact}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #333",
                    padding: "12px",
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  <Share2 size={16} /> {t.share}
                </button>
              </div>
            </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {profile.address && (
              <>
                <div
                  style={{
                    background: "#262626",
                    border: "1px solid #404040",
                    color: "#f5f5f5",
                    padding: "14px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <MapPin size={20} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>{t.address}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
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
                    borderRadius: 4,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                >
                  <MapPin size={18} /> {t.getDirections}
                </a>
              </>
            )}

            {profile.documentUrl && (
              <a
                href={profile.documentUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#262626",
                  border: "1px solid #404040",
                  color: "#f5f5f5",
                  padding: 14,
                  borderRadius: 4,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <FileText size={18} />{" "}
                {profile.documentButtonText || t.downloadDoc}
              </a>
            )}
            {Array.isArray(profile?.customButtons) &&
              profile.customButtons.map((btn: any, index: number) => (
                <a
                  key={index}
                  href={btn.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: btn.isPrimary ? "#b45309" : "#262626",
                    border: btn.isPrimary ? "none" : "1px solid #404040",
                    color: "#f5f5f5",
                    padding: 14,
                    borderRadius: 4,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                  }}
                >
                  {btn.icon === "Globe" && <Globe size={18} />}
                  {btn.icon === "Calendar" && <Calendar size={18} />}
                  {btn.icon === "FileText" && <FileText size={18} />}
                  {btn.icon === "Download" && <Download size={18} />}
                  {btn.icon === "MessageCircle" && <MessageCircle size={18} />}
                  {(!btn.icon || btn.icon === "Link") && <Link2 size={18} />}
                  {btn.label}
                </a>
              ))}
          </div>
          </>)}
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          {activeTab === 'home' && (
            <SectionContainer
              title="About & Contact"
              icon={<Contact size={18} />}
            >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <a
                href={`tel:${profile.phone}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid #222",
                }}
              >
                <div style={{ color: "#b45309" }}>
                  <PhoneCall size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    {profile.name2 ? profile.name.split(' ')[0] : 'Mobile'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                    {profile.phone}
                  </div>
                </div>
              </a>
              {profile.phone2 && (
                <a
                  href={`tel:${profile.phone2}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid #222",
                  }}
                >
                  <div style={{ color: "#b45309" }}>
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      {profile.name2.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                      {profile.phone2}
                    </div>
                  </div>
                </a>
              )}
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${(profile.whatsapp || profile.socials?.whatsapp || '').replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid #222",
                  }}
                >
                  <div style={{ color: "#25D366" }}>
                    <FaWhatsapp size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      WhatsApp {profile.name2 ? `(${profile.name.split(' ')[0]})` : ''}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                      +{profile.whatsapp}
                    </div>
                  </div>
                </a>
              )}
              {profile.whatsapp2 && (
                <a
                  href={`https://wa.me/${profile.whatsapp2.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid #222",
                  }}
                >
                  <div style={{ color: "#25D366" }}>
                    <FaWhatsapp size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      WhatsApp {profile.name2 ? `(${profile.name2.split(' ')[0]})` : ''}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                      +{profile.whatsapp2}
                    </div>
                  </div>
                </a>
              )}
              <a
                href={`mailto:${profile.email}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid #222",
                }}
              >
                <div style={{ color: "#b45309" }}>
                  <Mail size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                    {profile.email}
                  </div>
                </div>
              </a>
              <a
                href={`https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid #222",
                }}
              >
                <div style={{ color: "#b45309" }}>
                  <Globe size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Website
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}>
                    {profile.website}
                  </div>
                </div>
              </a>
              {(profile.address || profile.mapLink || profile.address_street) && (
                <a
                  href={profile.mapLink || '#'}
                  onClick={(e) => !profile.mapLink && e.preventDefault()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid #222",
                  }}
                >
                  <div style={{ color: "#b45309" }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      Company Address
                    </div>
                    <div
                      style={{ fontSize: 15, fontWeight: 500, color: "#eee" }}
                    >
                      {profile.address_street ? (
                        <>
                          {profile.address_street}{profile.address_city ? `, ${profile.address_city}` : ''}
                          {profile.address_state ? `, ${profile.address_state}` : ''}
                          {profile.address_zip ? ` ${profile.address_zip}` : ''}
                        </>
                      ) : (
                        profile.address || 'Visit Us'
                      )}
                    </div>
                  </div>
                </a>
              )}
              {profile.hours && Object.keys(profile.hours).length > 0 && (
                <div
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#b45309",
                      borderBottom: "1px solid #2a2a2a",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Business Hours
                  </div>
                  <div
                    style={{
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
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
                            fontSize: 13,
                            color: "#aaa",
                            paddingBottom: 8,
                            borderBottom:
                              day !== "Sunday" ? "1px dashed #222" : "none",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#eee" }}>
                            {day}
                          </span>
                          <span>
                            {h.closed ? (
                              <span style={{ color: "#ef4444" }}>Closed</span>
                            ) : (
                              <>
                                {h.open} - {h.close}
                                {h.split && h.open2 && h.close2 && (
                                  <><br/><span style={{ fontSize: 11, color: '#777' }}>&amp;</span> {h.open2} - {h.close2}</>
                                )}
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </SectionContainer>
          )}
          {(activeTab === 'home' || activeTab === 'services') && Array.isArray(profile?.services) && profile.services.length > 0 && (
            <SectionContainer title="Services" icon={<Globe size={18} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.isArray(profile?.services) && profile.services.map((svc: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}
                    >
                      {svc.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                      {svc.desc}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#b45309",
                        marginTop: 8,
                      }}
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

                {activeTab === 'home' && profile.gallery && profile.gallery.length > 0 && (
            <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Portfolio
                    </div>
                    <div style={{ overflow: "hidden", paddingBottom: 12 }}>
                      <div className="gallery-slider-dark">
                        {Array.isArray(profile?.gallery) && [...profile.gallery, ...profile.gallery].map(
                          (img: string, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                height: 160,
                                width: 240,
                                flexShrink: 0,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#222",
                                border: "1px solid #333",
                              }}
                            >
                              <img
                                src={img}
                                alt="Portfolio item"
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
                            borderRadius: 8,
                            background: "#222",
                            border: "1px solid #333",
                            marginBottom: 12,
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
                )}
              </div>
            </SectionContainer>
          )}
          {(activeTab === 'home' || activeTab === 'shop') && Array.isArray(profile?.products) && profile.products.length > 0 && (
            <>
              {activeTab === 'shop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ 
                    background: '#1a1a1a', 
                    borderRadius: 24, 
                    overflow: 'hidden', 
                    border: '1px solid #2a2a2a',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}>
                    {profile.storeMarquee && (
                      <div style={{ background: '#b45309', color: '#fff', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                         <div style={{ animation: 'marquee 15s linear infinite', display: 'inline-block', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                           ⭐ {profile.storeMarquee} &nbsp; &nbsp; &nbsp; ⭐ {profile.storeMarquee} &nbsp; &nbsp; &nbsp; ⭐ {profile.storeMarquee}
                         </div>
                      </div>
                    )}
                    {profile.storeBannerUrl && (
                      <div style={{ position: 'relative', height: 180, width: '100%' }}>
                        <img src={profile.storeBannerUrl} alt="Store Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1a1a1a, transparent)' }} />
                      </div>
                    )}
                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #2a2a2a', marginTop: profile.storeBannerUrl ? -40 : 0, position: 'relative', zIndex: 10 }}>
                      {profile.storeCompanyLogo && (
                        <img src={profile.storeCompanyLogo} alt="Logo" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', background: '#222', border: '3px solid #1a1a1a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }} />
                      )}
                      <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{profile.storeCompanyName || profile.company || `${profile.name}'s Shop`}</h2>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#b45309' }}>Exclusive Storefront</p>
                      </div>
                    </div>
                    
                    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                      {profile.products.map((prod: any, i: number) => (
                        <div key={`shop-${i}`} style={{ background: '#222', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#b45309';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a2a2a';}}>
                          {prod.image && (
                            <img src={prod.image} alt={prod.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderBottom: '1px solid #2a2a2a', opacity: 0.9 }} />
                          )}
                          <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{prod.name}</div>
                            <div style={{ fontSize: 11, color: '#888', marginBottom: 12, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.description}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                              <div style={{ fontSize: 14, fontWeight: 900, color: '#b45309' }}>{prod.price}</div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#333', borderRadius: 8, overflow: 'hidden' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: Math.max(1, (prev[i] || 1) - 1) })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >-</button>
                                <div style={{ fontSize: 13, fontWeight: 'bold', width: 20, textAlign: 'center', color: '#fff' }}>{productQuantities[i] || 1}</div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: (prev[i] || 1) + 1 })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >+</button>
                              </div>
                              <a href={prod.link ? (() => { try { const u = new URL(prod.link); if(!u.searchParams.has('quantity')) u.searchParams.append('quantity', String(productQuantities[i] || 1)); return u.toString() } catch(e) { return prod.link } })() : `https://wa.me/${String(profile.phone || '').replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I would like to order: ${prod.name} (Quantity: ${productQuantities[i] || 1})`)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ flex: 1, background: prod.link ? '#b45309' : '#25D366', color: '#fff', textAlign: 'center', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {prod.link ? 'Buy' : 'WA'}
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
                          background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '15px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Visit Premium Storefront <ArrowRight size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              )}
              {activeTab === 'home' && (
                <SectionContainer title="Store Highlights" icon={<ShoppingBag size={18} />}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Array.isArray(profile?.products) && profile.products.slice(0, 3).map((prod: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #2a2a2a",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        {prod.image && (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{
                              width: "100%",
                              height: 160,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div style={{ padding: 16 }}>
                          <div
                            style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}
                          >
                            {prod.name}
                          </div>
                          <div
                            style={{ fontSize: 13, color: "#888", marginTop: 4 }}
                          >
                            {prod.description}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#b45309",
                              }}
                            >
                              {prod.price}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#333', borderRadius: 8, overflow: 'hidden' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: Math.max(1, (prev[i] || 1) - 1) })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >-</button>
                                <div style={{ fontSize: 13, fontWeight: 'bold', width: 20, textAlign: 'center', color: '#fff' }}>{productQuantities[i] || 1}</div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProductQuantities(prev => ({ ...prev, [i]: (prev[i] || 1) + 1 })) }}
                                  style={{ padding: '6px 10px', fontSize: 16, fontWeight: 'bold', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >+</button>
                              </div>
                              <a href={prod.link ? (() => { try { const u = new URL(prod.link); if(!u.searchParams.has('quantity')) u.searchParams.append('quantity', String(productQuantities[i] || 1)); return u.toString() } catch(e) { return prod.link } })() : `https://wa.me/${String(profile.phone || '').replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I would like to order: ${prod.name} (Quantity: ${productQuantities[i] || 1})`)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ flex: 1, background: prod.link ? '#b45309' : '#25D366', color: '#fff', textAlign: 'center', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {prod.link ? 'Buy Now' : 'WhatsApp'}
                              </a>
                            </div>
                          </div>
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
                          background: '#1a1a1a',
                          color: '#b45309',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '4px'
                        }}
                      >
                        View Full Store ({profile.products.length} Products) <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </SectionContainer>
              )}
            </>
          )}
          {activeTab === 'home' && Array.isArray(profile?.testimonials) && profile.testimonials.length > 0 && (
            <SectionContainer title="Reviews" icon={<MessageSquare size={18} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.isArray(profile?.testimonials) && profile.testimonials.map((test: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <span
                          key={i}
                          style={{ color: "#b45309", fontSize: 14 }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#aaa",
                        fontStyle: "italic",
                        marginBottom: 12,
                      }}
                    >
                      "{test.quote}"
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                    >
                      {test.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {test.role}
                    </div>
                  </div>
                ))}
              </div>
            </SectionContainer>
          )}
          {activeTab === 'home' && Array.isArray(profile?.faqs) && profile.faqs.length > 0 && (
            <SectionContainer title="FAQs" icon={<MessageSquare size={18} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.isArray(profile?.faqs) && profile.faqs.map((faq: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#eee",
                        marginBottom: 8,
                      }}
                    >
                      Q: {faq.question}
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6 }}
                    >
                      A: {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </SectionContainer>
          )}

          {(activeTab === 'home' || activeTab === 'bank') && (
            <SectionContainer
              title={isOwner ? "Wallet & Platform" : "Platform Details"}
              icon={<Wallet size={18} />}
            >
            <div>
              {isOwner && (
                <div
                  style={{
                    background: "#1a1a2e",
                    padding: 24,
                    borderRadius: 8,
                    color: "#fff",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      letterSpacing: 1,
                    }}
                  >
                    WALLET BALANCE
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>AED 340</div>
                  <button
                    style={{
                      width: "100%",
                      background: "#b45309",
                      color: "#fff",
                      border: "none",
                      padding: 10,
                      borderRadius: 4,
                      marginTop: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Top Up
                  </button>
                </div>
              )}
              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  padding: 20,
                  borderRadius: 8,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  PROFILE ID
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#b45309",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {profile.id}
                </div>
              </div>
              {(activeTab === 'home' || activeTab === 'bank') && profile?.bankAccounts && profile.bankAccounts.length > 0 && (
                <div
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    padding: 20,
                    borderRadius: 8,
                    color: "#fff",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}
                  >
                    Banking Details
                  </div>
                  {Array.isArray(profile.bankAccounts) && profile.bankAccounts.map((acc: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        background: "#121212",
                        padding: 20,
                        borderRadius: 16,
                        border: "1px solid #333",
                        marginBottom: i < profile.bankAccounts.length - 1 ? 16 : 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#fef3c7",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 16,
                          borderBottom: "1px solid #222",
                          paddingBottom: 12
                        }}
                      >
                        <Building size={18} className="text-amber-200" />
                        {acc.bankName}
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Account Holder</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{acc.accountName}</div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                         <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Account Number</div>
                         <div 
                           onClick={() => {
                             navigator.clipboard.writeText(acc.accountNumber);
                             alert("Account Number copied!");
                           }}
                           style={{ 
                             fontSize: 16, 
                             fontWeight: 800, 
                             color: "#fef3c7", 
                             background: "#0a0a0a", 
                             padding: "12px", 
                             borderRadius: 8, 
                             textAlign: "center",
                             fontFamily: "monospace",
                             cursor: "pointer",
                             border: "1px solid #333"
                           }}
                         >
                           {acc.accountNumber}
                         </div>
                      </div>

                      {acc.iban && (
                        <div style={{ marginBottom: 16 }}>
                           <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>IBAN</div>
                           <div 
                             onClick={() => {
                               navigator.clipboard.writeText(acc.iban);
                               alert("IBAN copied!");
                             }}
                             style={{ 
                               fontSize: 12, 
                               fontWeight: 700, 
                               color: "#ccc", 
                               wordBreak: "break-all",
                               background: "#0a0a0a",
                               padding: "12px",
                               borderRadius: 8,
                               fontFamily: "monospace",
                               cursor: "pointer",
                               border: "1px solid #333"
                             }}
                           >
                             {acc.iban}
                           </div>
                        </div>
                      )}

                      {acc.ifscCode && (
                        <div style={{ marginBottom: 16 }}>
                           <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>IFSC / Swift / Routing</div>
                           <div 
                             onClick={() => {
                               navigator.clipboard.writeText(acc.ifscCode);
                               alert("Code copied!");
                             }}
                             style={{ 
                               fontSize: 14, 
                               fontWeight: 800, 
                               color: "#fef3c7", 
                               background: "#0a0a0a", 
                               padding: "10px", 
                               borderRadius: 8, 
                               textAlign: "center",
                               fontFamily: "monospace",
                               cursor: "pointer",
                               border: "1px solid #333"
                             }}
                           >
                             {acc.ifscCode}
                           </div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: "#0a0a0a", padding: "8px", borderRadius: 4 }}>
                          <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase" }}>SWIFT/BIC</div>
                          <div style={{ fontSize: 12, color: "#ccc" }}>{acc.swiftCode || acc.swift || 'N/A'}</div>
                        </div>
                        <div style={{ background: "#0a0a0a", padding: "8px", borderRadius: 4 }}>
                          <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase" }}>IFSC/Routing</div>
                          <div style={{ fontSize: 12, color: "#ccc" }}>{acc.ifscCode || acc.routing || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  padding: 24,
                  borderRadius: 8,
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#fef3c7' }}>
                  Refer & Earn Rewards
                </div>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20, textAlign: 'left', lineHeight: 1.6 }}>
                  {siteSettings?.trialEnabled && (
                    <div style={{ marginBottom: 10 }}>✦ <strong>{siteSettings?.trialPeriod || '1 Month'} Free Trial:</strong> All new business profiles get a free trial.</div>
                  )}
                  <div>✦ <strong>Referral Success:</strong> If your referral purchases any plan within <strong>{siteSettings?.referralPurchaseWindow || 35} days</strong>, your referral is marked successful and you both earn rewards!</div>
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
                      background: "#000",
                      border: "1px solid #b45309",
                      padding: 14,
                      borderRadius: 4,
                      color: "#b45309",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 16,
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
                    display: "inline-block",
                    width: "100%",
                    boxSizing: "border-box",
                    textAlign: "center",
                    textDecoration: "none",
                    background: "#b45309",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: 'uppercase',
                    fontSize: 12,
                    letterSpacing: 1
                  }}
                >
                  Get Started Now
                </Link>
              </div>
            </div>
          </SectionContainer>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#111",
                width: "90%",
                maxWidth: 400,
                borderRadius: 12,
                padding: 32,
                boxSizing: "border-box",
                position: "relative",
                border: "1px solid #333",
              }}
            >
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
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
                  color: "#fff",
                }}
              >
                Share Profile
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#888" }}>
                  Send via Mobile No.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="+971501234567"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 4,
                      border: "1px solid #333",
                      background: "#000",
                      color: "#fff",
                    }}
                  />
                  <button
                    onClick={handleWhatsAppShare}
                    style={{
                      background: "#b45309",
                      color: "#fff",
                      border: "none",
                      padding: "0 20px",
                      borderRadius: 4,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#888",
                    marginBottom: 12,
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
                    color: "#888",
                    marginBottom: 12,
                  }}
                >
                  Scan QR Code
                </div>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    display: "inline-block",
                    borderRadius: 8,
                  }}
                >
                  <QRCode
                    id="profile-qr-dark"
                    value={shareUrl}
                    size={150}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  style={{
                    display: "block",
                    margin: "16px auto 0",
                    background: "transparent",
                    color: "#b45309",
                    border: "1px solid #b45309",
                    padding: "8px 16px",
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
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
            padding: "24px 20px",
            textAlign: "center",
            background: "#0a0a0a",
            borderTop: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fef3c7",
              marginBottom: 4,
            }}
          >
            Powered by VIBE Digital Connect
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Create your own free digital profile today
          </div>
          <Link
            to="/register"
            style={{
              textDecoration: "none",
              background: "#b45309",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 4,
              fontWeight: 700,
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
          background: '#000',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 100,
          boxShadow: '0 -4px 15px rgba(0,0,0,0.8)'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === item.id ? '#fef3c7' : '#666',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {React.cloneElement(item.icon as React.ReactElement, { size: 18, color: activeTab === item.id ? '#fef3c7' : '#666' })}
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{item.id === 'home' ? 'Profile' : item.label}</span>
            </button>
          ))}
        </div>

        <ProfileChatbot profile={profile} />
        <AddToHomeScreen profileName={profile.name} />
      </div>
    </div>
  );
}
