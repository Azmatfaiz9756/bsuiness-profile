import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAppContext } from "../../../context/AppContext";
import {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Github,
  PhoneCall,
  Mail,
  Globe,
  MapPin,
  FileDown,
  CalendarDays,
  CreditCard,
  Wallet,
  ShoppingBag,
  Send,
  Link as LinkIcon,
  Sparkles,
  Contact2,
  Video,
  MessageSquare,
  Download,
  FileText,
  Link2,
  MessageCircle,
  Calendar,
  UserPlus,
  Share2,
  X,
  Users,
  Bird,
  Briefcase,
  Volume2,
  VolumeX,
  Building,
  BadgeCheck
} from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaGithub,
  FaWhatsapp,
} from "react-icons/fa";

import AppointmentBooking from "../components/AppointmentBooking";
import LeadCapture from "../components/LeadCapture";
import ProfileChatbot from "../components/ProfileChatbot";
import AddToHomeScreen from "../../../components/AddToHomeScreen";

export default function ClassicModern({
  profile,
  onExit,
}: {
  profile: any;
  onExit?: () => void;
}) {
  const { jobOpenings, siteSettings, user, profiles, setIsLoginModalOpen } = useAppContext();
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const isOwner = user?.uid === profile.uid;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`${tabId}-section`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followerInfo, setFollowerInfo] = useState({ name: '', phone: '', email: '' });
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const shareUrl = user ? `${window.location.origin}${window.location.pathname}?ref=${user.uid}` : window.location.href.split('?')[0];
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectInfo, setConnectInfo] = useState({ name: '', phone: '', whatsapp: '', company: '' });
  const [connectLoading, setConnectLoading] = useState(false);

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

  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(profile.bannerVideoUrl);

  const profileJobs = jobOpenings?.filter((j: any) => j.profileId === profile.id && j.status === 'Open') || [];

  const getTheme = () => {
    switch(profile.profession) {
      case 'Welder': return { bg: 'linear-gradient(135deg, #ea580c, #7c2d12)', icon: '🔥', primary: '#ea580c' };
      case 'Doctor': return { bg: 'linear-gradient(135deg, #0ea5e9, #0369a1)', icon: '⚕️', primary: '#0ea5e9' };
      case 'Carpenter': return { bg: 'linear-gradient(135deg, #d97706, #78350f)', icon: '🪚', primary: '#d97706' };
      case 'AC Technician': return { bg: 'linear-gradient(135deg, #38bdf8, #0284c7)', icon: '❄️', primary: '#0284c7' };
      case 'Electrician': return { bg: 'linear-gradient(135deg, #eab308, #854d0e)', icon: '⚡', primary: '#eab308' };
      case 'Plumber': return { bg: 'linear-gradient(135deg, #06b6d4, #164e63)', icon: '💧', primary: '#06b6d4' };
      case 'Mechanic': return { bg: 'linear-gradient(135deg, #64748b, #334155)', icon: '🔧', primary: '#475569' };
      case 'Engineer': return { bg: 'linear-gradient(135deg, #3b82f6, #1e3a8a)', icon: '📐', primary: '#2563eb' };
      case 'Lawyer': return { bg: 'linear-gradient(135deg, #1e293b, #0f172a)', icon: '⚖️', primary: '#1e293b' };
      case 'Chef': return { bg: 'linear-gradient(135deg, #ef4444, #7f1d1d)', icon: '👨‍🍳', primary: '#ef4444' };
      case 'Real Estate Agent': return { bg: 'linear-gradient(135deg, #0f766e, #115e59)', icon: '🏢', primary: '#0d9488' };
      default: return { bg: 'linear-gradient(135deg, #1a1a2e, #1a56db)', icon: '', primary: '#1e3a8a' };
    }
  };

  const themeVars = getTheme();

  const handleFollow = async () => {
    if (!followerInfo.email) return alert("Please provide your email to follow.");
    setFollowLoading(true);
    try {
      await addDoc(collection(db, 'followers'), {
        profileId: profile.id,
        ...followerInfo,
        createdAt: serverTimestamp()
      });
      setIsFollowed(true);
      setTimeout(() => setShowFollowModal(false), 2000);
    } catch (e) {
      alert("Error following business. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRatingSubmit = (rating: number) => {
    setUserRating(rating);
    setIsRatingSubmitted(true);
    // Simulation of API call
    console.log("Rating submitted:", rating);
  };

  const hasServices = profile.services && profile.services.length > 0;
  const hasProducts = profile.products && profile.products.length > 0;
  const hasTestimonials = profile.testimonials && profile.testimonials.length > 0;
  const hasFaqs = profile.faqs && profile.faqs.length > 0;
  const hasPayments = (profile.paymentLinks && profile.paymentLinks.length > 0) || (profile.bankAccounts && profile.bankAccounts.length > 0) || profile.bankName;

  const navItems = [
    { id: 'home', label: 'Home', icon: <Contact2 size={20} />, show: true },
    { id: 'services', label: 'Services', icon: <Sparkles size={20} />, show: profile.services && profile.services.length > 0 },
    { id: 'shop', label: 'Store', icon: <ShoppingBag size={20} />, show: profile.products && profile.products.length > 0 },
    { id: 'bank', label: 'Bank', icon: <Building size={20} />, show: hasPayments },
    { id: 'jobs', label: 'Hiring', icon: <Briefcase size={20} />, show: profileJobs.length > 0 },
    { id: 'inquiry', label: 'Inquiry', icon: <Mail size={20} />, show: true }
  ].filter(item => item.show);

  const SectionContainer = ({ icon, title, children, id }: any) => {
    return (
      <div id={id ? `${id}-section` : undefined} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700, color: themeVars.primary }}>
          {icon}
          {title}
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    setShowConnectModal(true);
  };

  const processVcfDownload = () => {
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

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInfo.name || !connectInfo.phone) return alert("Please provide your name and calling number.");
    
    setConnectLoading(true);
    try {
      // Ensure we have a valid profile ID
      const targetProfileId = profile.id;
      if (!targetProfileId) throw new Error("Profile ID missing");

      await addDoc(collection(db, 'leads'), {
        profileId: targetProfileId,
        ownerId: profile.ownerId || profile.userId, // Save ownerId to help with filtering
        ...connectInfo,
        email: '',
        message: 'Exchanged contact via profile "Connect" button.',
        source: 'Contact Form',
        createdAt: serverTimestamp()
      });
      
      processVcfDownload();
      setShowConnectModal(false);
      alert("Success! Contact saved and your info shared with the profile owner.");
    } catch (e: any) {
      console.error("Lead saving error:", e);
      alert("Error saving contact: " + (e.message || "Unknown error"));
    } finally {
      setConnectLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!sharePhone) return alert("Enter a mobile number");
    window.open(
      `https://wa.me/${sharePhone}?text=Check out my digital profile: ${shareUrl}`,
      "_blank",
    );
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
    <div
      style={{
        background: "#f0f2f5",
        minHeight: "100vh",
        paddingBottom: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes floatEffect {
            0% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
            50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
            100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          }
          .floating-icon {
            position: absolute;
            animation: floatEffect 6s ease-in-out infinite;
            z-index: 0;
            pointer-events: none;
            color: ${themeVars.primary};
          }
          .gallery-slider {
            display: flex;
            gap: 10px;
            width: max-content;
            animation: gallery-slide 20s linear infinite;
          }
          .gallery-slider:hover {
            animation-play-state: paused;
          }
          @keyframes gallery-slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div
        className="shell"
        style={{
          background: "#fff",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
          overflowX: "hidden",
        }}
      >
        {/* Animated Background Icons based on Profession */}
        {themeVars.icon && (
          <>
            <div className="floating-icon" style={{ top: '10%', left: '5%', fontSize: '40px', animationDelay: '0s' }}>{themeVars.icon}</div>
            <div className="floating-icon" style={{ top: '40%', right: '10%', fontSize: '60px', animationDelay: '2s' }}>{themeVars.icon}</div>
            <div className="floating-icon" style={{ top: '70%', left: '15%', fontSize: '50px', animationDelay: '4s' }}>{themeVars.icon}</div>
            <div className="floating-icon" style={{ top: '85%', right: '5%', fontSize: '30px', animationDelay: '1s' }}>{themeVars.icon}</div>
          </>
        )}
        <div
          style={{
            background: profile.bannerVideo || profile.bannerUrl
              ? "#000"
              : themeVars.bg,
            height: 220,
            position: "relative",
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            overflow: "hidden",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {themeVars.icon && (!profile.bannerVideo && !profile.bannerUrl) && (
             <div style={{ position: 'absolute', fontSize: '100px', opacity: 0.1, right: -10, bottom: -20, transform: 'rotate(-15deg)' }}>
                {themeVars.icon}
             </div>
          )}
          {videoId ? (
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
          ) : profile.bannerUrl && !profile.bannerVideo && (
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
          {profile.bannerVideo && !videoId && (
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
          )}
  
          {profile.logoUrl && (
            <div style={{ position: 'absolute', zIndex: 5, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={profile.logoUrl} style={{ maxWidth: 80, maxHeight: 80, objectFit: 'contain' }} alt="Logo" />
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: -50,
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              background: "#fff",
              borderRadius: "50%",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              border: `3px solid ${themeVars.primary}`
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: themeVars.primary,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                overflow: 'hidden'
              }}
            >
              {profile.photoUrl ? (
                 <img src={profile.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={profile.name} />
              ) : (
                profile.avatar
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "16px 20px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "#1a1a2e",
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#1D9BF0"/>
                  <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "#1a56db",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {profile.title}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {profile.company}
          </div>
          
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
             <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.4)" }}></span>
             <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{profile.views || 0} Visits</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => !isRatingSubmitted && handleRatingSubmit(star)}
                    style={{ 
                      color: (star <= (userRating || 4)) ? '#f59e0b' : '#d1d5db',
                      fontSize: 24,
                      cursor: isRatingSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {isRatingSubmitted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Thank you for your rating!</span>
                  <button 
                    onClick={() => setIsRatingSubmitted(false)}
                    style={{ background: 'none', border: 'none', color: '#1a56db', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: '#6b7280' }}>Click a star to rate {profile.name}</span>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginLeft: 6 }}>
              {userRating ? `${userRating}.0` : '4.8'} (24)
            </span>
          </div>

          {profile.bio && (
            <div
              style={{
                fontSize: 13,
                color: "#4b5563",
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              {profile.bio}
            </div>
          )}

          {profile.announcement && (
            <div
              style={{
                marginTop: 16,
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                display: "inline-block",
              }}
            >
              🎁 {profile.announcement}
            </div>
          )}

          {profile.socials && (
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              {profile?.socials?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile?.socials?.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#0a66c2",
                  }}
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {profile?.socials?.twitter && (
                <a
                  href={`https://twitter.com/${profile?.socials?.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#1da1f2",
                  }}
                >
                  <FaTwitter size={18} />
                </a>
              )}
              {profile?.socials?.instagram && (
                <a
                  href={`https://instagram.com/${profile?.socials?.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#E1306C",
                  }}
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {profile?.socials?.tiktok && (
                <a
                  href={`https://tiktok.com/${profile?.socials?.tiktok}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#000000",
                  }}
                >
                  <FaTiktok size={18} />
                </a>
              )}
              {profile?.socials?.facebook && (
                <a
                  href={`https://facebook.com/${profile?.socials?.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#1877f2",
                  }}
                >
                  <FaFacebook size={18} />
                </a>
              )}
              {profile?.socials?.youtube && (
                <a
                  href={`https://youtube.com/${profile?.socials?.youtube}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#ff0000",
                  }}
                >
                  <FaYoutube size={18} />
                </a>
              )}
              {profile?.socials?.github && (
                <a
                  href={`https://github.com/${profile?.socials?.github}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#333333",
                  }}
                >
                  <FaGithub size={18} />
                </a>
              )}
              {Array.isArray(profile?.socialLinks) && profile.socialLinks.map((link: any, i: number) => (
                <a
                  key={`sl-${i}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  title={link.label}
                  style={{
                    width: 36,
                    height: 36,
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    color: "#4b5563",
                  }}
                >
                  <Link2 size={18} />
                </a>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 12
            }}
          >
            {profile.quickPayAmount > 0 && (
              <button
                onClick={() => {
                  const paymentLink = profile.paymentLinks?.[0]?.url;
                  if (paymentLink) {
                    window.open(paymentLink, '_blank');
                  } else {
                    setActiveTab('payments');
                    // Scroll to payments section if needed
                    const el = document.getElementById('payments-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#fff",
                  padding: "18px",
                  borderRadius: 20,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontSize: 18,
                  boxShadow: "0 12px 24px -6px rgba(5,150,105,0.4)",
                  border: "none",
                  animation: "pulse-green 2s infinite"
                }}
              >
                <Wallet size={24} /> PAY {profile.quickPayCurrency || 'AED'} {profile.quickPayAmount}
              </button>
            )}
            
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSave()}
                style={{
                  flex: 1,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  height: 52,
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.3)",
                  minWidth: '140px'
                }}
              >
                <UserPlus size={18} /> Exchange
              </button>
              <button
                onClick={() => processVcfDownload()}
                style={{
                  flex: 1,
                  background: themeVars.primary,
                  color: "#fff",
                  border: "none",
                  height: 52,
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  boxShadow: `0 10px 20px -5px ${themeVars.primary}40`,
                  minWidth: '140px'
                }}
              >
                <Download size={18} /> Save Contact
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                  height: 52,
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  minWidth: '140px'
                }}
              >
                <Send size={16} /> Share
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes pulse-green {
              0% { transform: scale(1); box-shadow: 0 12px 24px -6px rgba(5,150,105,0.4); }
              50% { transform: scale(1.02); box-shadow: 0 16px 32px -4px rgba(5,150,105,0.6); }
              100% { transform: scale(1); box-shadow: 0 12px 24px -6px rgba(5,150,105,0.4); }
            }
          `}</style>

          <div style={{ padding: "0 20px", marginTop: 12 }}>
            <button
              onClick={() => setShowFollowModal(true)}
              disabled={isFollowed}
              style={{
                width: "100%",
                background: isFollowed ? "#ecfdf5" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: isFollowed ? "#059669" : "#fff",
                border: isFollowed ? "1px solid #10b981" : "none",
                padding: "16px",
                borderRadius: 16,
                fontWeight: 800,
                cursor: isFollowed ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                boxShadow: isFollowed ? "none" : "0 8px 20px rgba(37,99,235,0.2)",
                transition: "all 0.3s ease"
              }}
            >
              <Users size={20} /> {isFollowed ? "Following Business" : "Follow Business Updates"}
            </button>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Get one-click WhatsApp & Push notifications
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 12,
            }}
          >
            {profile.meetingUrl && (
              <a
                href={profile.meetingUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#000",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <Calendar size={18} /> Book a Meeting
              </a>
            )}
            {!profile.plan?.includes("Enterprise") && !profile.hideReferral && (
              <Link
                to="/referrals"
                style={{
                  background: "#1a56db",
                  color: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <Share2 size={18} /> Refer & Earn Rewards
              </Link>
            )}
            {profile.documentUrl && (
              <a
                href={profile.documentUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  padding: 14,
                  borderRadius: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <FileText size={18} />{" "}
                {profile.documentButtonText || "Download Document"}
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
                    background: btn.isPrimary ? "#2563eb" : "#f8fafc",
                    border: btn.isPrimary ? "none" : "1px solid #e2e8f0",
                    color: btn.isPrimary ? "#fff" : "#334155",
                    padding: 14,
                    borderRadius: 12,
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

        {/* Main Content Area */}
        <div style={{ padding: '0 20px', marginTop: 10 }}>
          {(activeTab === 'wallet' || activeTab === 'bank') && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 20, color: "#1e40af" }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#1e40af",
                      letterSpacing: 1,
                    }}
                  >
                    PROFILE ID
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1e3a8a",
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '20px', paddingBottom: 100 }}>
          <div id="home-section">
            <SectionContainer
              title="Contact & Location"
              icon={<PhoneCall size={18} />}
            >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}
                    >
                      Call {profile.name2 ? (profile.name?.split(' ')[0] || 'Primary') : 'Mobile'}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.phone}
                    </div>
                  </div>
                </a>
              )}
              {profile.phone2 && (
                <a
                  href={`tel:${profile.phone2}`}
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}
                    >
                      Call {profile.name2?.split(' ')[0] || 'Secondary'}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.phone2}
                    </div>
                  </div>
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#fee2e2",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dc2626",
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}
                    >
                      Email
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.email}
                    </div>
                  </div>
                </a>
              )}
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${String(profile.whatsapp || profile.socials?.whatsapp || '').replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      WhatsApp {profile.name2 ? (profile.name?.split(' ')[0] || 'Primary') : ''}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      +{profile.whatsapp}
                    </div>
                  </div>
                </a>
              )}
              {profile.whatsapp2 && (
                <a
                  href={`https://wa.me/${String(profile.whatsapp2 || '').replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      WhatsApp {profile.name2?.split(' ')[0] || 'Secondary'}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      +{profile.whatsapp2}
                    </div>
                  </div>
                </a>
              )}
              {profile.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#e0e7ff",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4f46e5",
                    }}
                  >
                    <Globe size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      Website
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.website}
                    </div>
                  </div>
                </a>
              )}
              {(profile.address || profile.mapLink || profile.address_street) && (
                <a
                  href={profile.mapLink || '#'}
                  onClick={(e) => !profile.mapLink && e.preventDefault()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#fef3c7",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#d97706",
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      Address
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
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
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1e3a8a",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <PhoneCall size={16} /> Business Hours
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
                            color: "#4b5563",
                            paddingBottom: 8,
                            borderBottom:
                              day !== "Sunday" ? "1px dashed #e2e8f0" : "none",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{day}</span>
                          <span>
                            {h.closed ? (
                              <span style={{ color: "#ef4444" }}>Closed</span>
                            ) : (
                              <>
                                {h.open} - {h.close}
                                {h.split && h.open2 && h.close2 && (
                                  <><br/><span style={{ fontSize: 11, color: '#9ca3af' }}>&amp;</span> {h.open2} - {h.close2}</>
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
        </div>

        {(activeTab === 'home' || activeTab === 'services') && hasServices && (
          <div id="services-section">
            <SectionContainer title="Services" icon={<Sparkles size={18} />} id="services">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.isArray(profile?.services) && profile.services.length > 0 ? (
                profile.services.map((svc: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {svc.name}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}
                    >
                      {svc.desc}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a56db",
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
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "#6b7280",
                    fontSize: 14,
                  }}
                >
                  No services listed.
                </div>
              )}

              {profile?.gallery && profile.gallery.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1f2937",
                      marginBottom: 10,
                      textAlign: "left",
                    }}
                  >
                    Projects & Media
                  </div>
                  <div style={{ overflow: "hidden", paddingBottom: 10 }}>
                    <div className="gallery-slider">
                      {Array.isArray(profile?.gallery) && [...profile.gallery, ...profile.gallery].map(
                        (img: string, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              height: 160,
                              width: 240,
                              flexShrink: 0,
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "#f3f4f6",
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
                  {Array.isArray(profile?.videos) &&
                    profile.videos.map((vid: string, idx: number) => (
                      <div
                        key={"v" + idx}
                        style={{
                          position: "relative",
                          paddingBottom: "56.25%",
                          height: 0,
                          overflow: "hidden",
                          borderRadius: 12,
                          background: "#f3f4f6",
                          marginBottom: 10,
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

              {profile?.team && profile.team.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: 16,
                      color: "#1f2937",
                    }}
                  >
                    Our Team
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {Array.isArray(profile?.team) && profile.team.map((member: any, i: number) => (
                      <div
                        key={`tm-${i}`}
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          padding: 12,
                          borderRadius: 12,
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: "#dbeafe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1a56db",
                              fontWeight: "bold",
                            }}
                          >
                            {member.name?.[0]}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "#111827",
                            }}
                          >
                            {member.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {member.role}
                          </div>
                          {member.desc && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#4b5563",
                                marginTop: 4,
                              }}
                            >
                              {member.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.testimonials && profile.testimonials.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: 16,
                      color: "#1f2937",
                    }}
                  >
                    Testimonials
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {Array.isArray(profile?.testimonials) && profile.testimonials.map((test: any, i: number) => (
                      <div
                        key={`ts-${i}`}
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          padding: 16,
                          borderRadius: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "#4b5563",
                            marginBottom: 10,
                          }}
                        >
                          "{test.quote}"
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {test.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          {test.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionContainer>
        </div>
        )}

        {(activeTab === 'home' || activeTab === 'jobs') && profileJobs.length > 0 && (
          <div id="jobs-section">
            <SectionContainer title="Career Opportunities" icon={<Briefcase size={18} />} id="jobs">
              {applyingJob ? (
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: themeVars.primary }}>Apply for {applyingJob.title}</h3>
                    <button onClick={() => setApplyingJob(null)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Back to Jobs</button>
                  </div>
                  <input type="text" placeholder="Full Name" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 12, boxSizing: "border-box" }} />
                  <input type="email" placeholder="Email Address" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 12, boxSizing: "border-box" }} />
                  <input type="text" placeholder="Phone Number" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 12, boxSizing: "border-box" }} />
                  <textarea placeholder="Tell us about your experience..." rows={4} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 16, fontFamily: "inherit", boxSizing: "border-box" }}></textarea>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#475569' }}>Upload Resume / CV / Portofolio Link</label>
                  <input type="text" placeholder="Google Drive / Dropbox Link to Resume" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 20, boxSizing: "border-box" }} />
                  
                  <button onClick={() => { alert("Application submitted successfully!"); setApplyingJob(null); }} style={{ width: '100%', background: themeVars.primary, color: '#fff', padding: 14, borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    Submit Application
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Array.isArray(profileJobs) && profileJobs.map((job: any) => (
                    <div key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{job.title}</h4>
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 20 }}>{job.type}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, display: 'flex', gap: 12 }}>
                        <span>💰 {job.salary}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#475569', marginBottom: 12, lineHeight: 1.5 }}>
                        {job.description}
                      </p>
                      <button onClick={() => setApplyingJob(job)} style={{ background: themeVars.primary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionContainer>
          </div>
          )}



          {(activeTab === 'wallet' || (activeTab === 'bank' && isOwner)) && (
            <SectionContainer title="Wallet" icon={<Wallet size={18} />}>
            <>
              <div
                style={{
                  background: "#1a1a2e",
                  padding: 24,
                  borderRadius: 16,
                  color: "#fff",
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
                <div style={{ fontSize: 40, fontWeight: 900 }}>AED 340</div>
                <button
                  style={{
                    width: "100%",
                    background: "#1a56db",
                    color: "#fff",
                    border: "none",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Top Up
                </button>
              </div>
            </>
          </SectionContainer>
          )}

          {(activeTab === 'home' || activeTab === 'shop') && hasProducts && (
            <>
              {activeTab === 'shop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ 
                    background: '#fff', 
                    borderRadius: 24, 
                    overflow: 'hidden', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                  }}>
                    {profile.storeMarquee && (
                      <div style={{ background: '#2563eb', color: '#fff', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                         <div style={{ animation: 'marquee 15s linear infinite', display: 'inline-block', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                           🚀 {profile.storeMarquee} &nbsp; &nbsp; &nbsp; 🚀 {profile.storeMarquee} &nbsp; &nbsp; &nbsp; 🚀 {profile.storeMarquee}
                         </div>
                      </div>
                    )}
                    {profile.storeBannerUrl && (
                      <div style={{ position: 'relative', height: 180, width: '100%' }}>
                        <img src={profile.storeBannerUrl} alt="Store Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                      </div>
                    )}
                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #e5e7eb', background: '#f8fafc', marginTop: profile.storeBannerUrl ? -30 : 0, position: 'relative', zIndex: 10, borderRadius: profile.storeBannerUrl ? '24px 24px 0 0' : 0 }}>
                      {profile.storeCompanyLogo && (
                        <img src={profile.storeCompanyLogo} alt="Logo" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', background: '#fff', border: '3px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      )}
                      <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{profile.storeCompanyName || profile.company || `${profile.name}'s Shop`}</h2>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Verified Online Storefront</p>
                      </div>
                    </div>
                    
                    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, background: '#f8fafc' }}>
                      {profile.products.map((prod: any, i: number) => (
                        <div key={`shop-${i}`} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          {prod.image && (
                            <img src={prod.image} alt={prod.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderBottom: '1px solid #f1f5f9' }} />
                          )}
                          <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>{prod.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.description}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                              <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb' }}>{prod.price}</div>
                            </div>
                            <a href={prod.link || `https://wa.me/${profile.phone?.replace(/[^0-9]/g, "")}?text=Hi, I would like to order: ${prod.name}`} target="_blank" rel="noreferrer" style={{ display: 'block', background: prod.link ? '#0f172a' : '#25D366', color: '#fff', textAlign: 'center', padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: 'none', marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {prod.link ? 'Buy Now' : 'WhatsApp'}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'home' && (
                <SectionContainer title="Store Highlights" icon={<ShoppingBag size={18} />}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Array.isArray(profile?.products) && profile.products.length > 0 ? (
                      profile.products.slice(0, 3).map((prod: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 16,
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
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#1f2937",
                              }}
                            >
                              {prod.name}
                            </div>
                            <div
                              style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}
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
                                  color: "#1a56db",
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
                                    background: "#1a1a2e",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 16px",
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
                                  href={`https://wa.me/${profile.phone?.replace(/[^0-9]/g, "")}?text=Hi, I would like to order: ${prod.name}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    background: "#25D366",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                  }}
                                >
                                  Order via WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: 20,
                          color: "#6b7280",
                          fontSize: 14,
                        }}
                      >
                        No products in the store yet.
                      </div>
                    )}
                  </div>
                </SectionContainer>
              )}
            </>
          )}

          {activeTab === 'home' && hasFaqs && (
            <SectionContainer title="FAQs" icon={<MessageSquare size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.isArray(profile?.faqs) && profile.faqs.map((faq: any, i: number) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1e3a8a",
                      marginBottom: 8,
                    }}
                  >
                    Q: {faq.question}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#4b5563",
                      lineHeight: 1.5,
                    }}
                  >
                    A: {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </SectionContainer>
          )}

          {(activeTab === 'home' || activeTab === 'bank' || activeTab === 'wallet') && hasPayments && (
            <SectionContainer id="bank-section" title="Bank Details" icon={<Building size={18} />}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {profile.paymentLinks && profile.paymentLinks.length > 0 && (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1e3a8a",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Direct Payment Links
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {Array.isArray(profile?.paymentLinks) && profile.paymentLinks.map((link: any, i: number) => (
                        <div
                          key={`pl-${i}`}
                          style={{
                            border: "1px solid #f3f4f6",
                            padding: 12,
                            borderRadius: 12,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>
                            {link.platform}
                          </div>
                          {link.qrCodeUrl ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <a
                                href={link.qrCodeUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#f3f4f6",
                                  color: "#1f2937",
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  fontSize: 13,
                                  textDecoration: "none",
                                  fontWeight: 600,
                                }}
                              >
                                Show QR
                              </a>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#1a56db",
                                  color: "#fff",
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  fontSize: 13,
                                  textDecoration: "none",
                                  fontWeight: 600,
                                }}
                              >
                                Pay Now
                              </a>
                            </div>
                          ) : (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: "#1a56db",
                                color: "#fff",
                                padding: "6px 16px",
                                borderRadius: 8,
                                fontSize: 13,
                                textDecoration: "none",
                                fontWeight: 600,
                              }}
                            >
                              Pay Now
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.bankAccounts && profile.bankAccounts.length > 0 ? (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1e3a8a",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Bank Details
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {Array.isArray(profile?.bankAccounts) && profile.bankAccounts.map((acc: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            background: "#ffffff",
                            padding: 20,
                            borderRadius: 20,
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#1e3a8a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                              marginBottom: 16,
                              borderBottom: "1px solid #f1f5f9",
                              paddingBottom: 12
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Building size={20} className="text-blue-600" />
                              {acc.bankName}
                            </div>
                            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>{acc.country || 'UAE'}</span>
                          </div>
                          
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Account Name</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{acc.accountName}</div>
                          </div>

                          <div style={{ marginBottom: 16 }}>
                             <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Account Number</div>
                             <div 
                               onClick={() => {
                                 navigator.clipboard.writeText(acc.accountNumber);
                                 alert("Account Number copied!");
                               }}
                               style={{ 
                                 fontSize: 16, 
                                 fontWeight: 800, 
                                 color: "#2563eb", 
                                 background: "#f8fafc", 
                                 padding: "12px", 
                                 borderRadius: 8, 
                                 textAlign: "center",
                                 fontFamily: "monospace",
                                 cursor: "pointer",
                                 border: "1px solid #e2e8f0"
                               }}
                             >
                               {acc.accountNumber}
                             </div>
                          </div>

                          {acc.iban && (
                            <div style={{ marginBottom: 16 }}>
                               <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>IBAN</div>
                               <div 
                                 onClick={() => {
                                   navigator.clipboard.writeText(acc.iban);
                                   alert("IBAN copied!");
                                 }}
                                 style={{ 
                                   fontSize: 13, 
                                   fontWeight: 700, 
                                   color: "#1e293b", 
                                   wordBreak: "break-all",
                                   background: "#f8fafc",
                                   padding: "12px",
                                   borderRadius: 8,
                                   fontFamily: "monospace",
                                   cursor: "pointer",
                                   border: "1px solid #e2e8f0"
                                 }}
                               >
                                 {acc.iban}
                               </div>
                            </div>
                          )}

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>SWIFT/BIC</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{acc.swiftCode || acc.swift || 'N/A'}</div>
                            </div>
                            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>IFSC/Routing</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{acc.ifscCode || acc.routing || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 20,
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    No banking details provided
                  </div>
                )}
                {!profile.paymentLinks?.length &&
                  !profile.bankAccounts?.length && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#6b7280",
                        fontSize: 14,
                      }}
                    >
                      No payment methods available.
                    </div>
                  )}
              </div>
            </SectionContainer>
          )}

          {activeTab === 'home' && !profile.plan?.includes("Enterprise") && !profile.hideReferral && (
            <SectionContainer title="Referral Program" icon={<LinkIcon size={18} />}>
            <div
              style={{
                background: "#1a56db",
                padding: 24,
                borderRadius: 16,
                color: "#fff",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                Refer & Earn Rewards
              </div>
              <div style={{ fontSize: 13, color: "#dbeafe", marginBottom: 16, textAlign: 'left', lineHeight: 1.5 }}>
                {siteSettings?.trialEnabled && (
                  <div style={{ marginBottom: 8 }}>• <strong>{siteSettings?.trialPeriod || '1 Month'} Free Trial:</strong> All new business profiles get a free trial to explore all features.</div>
                )}
                <div>• <strong>Referral Success:</strong> If your referral purchases any plan within <strong>{siteSettings?.referralPurchaseWindow || 35} days</strong> of signing up, your referral is marked successful and you both earn rewards!</div>
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
                    color: "#1e40af",
                    border: "1px solid #1e40af",
                    padding: 12,
                    borderRadius: 8,
                    fontWeight: 700,
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
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#1e3a8a",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Get Started Now
              </Link>
            </div>
          </SectionContainer>
          )}

          {activeTab === 'home' && hasTestimonials && (
            <SectionContainer title="Reviews" icon={<MessageSquare size={18} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.isArray(profile.testimonials) && profile.testimonials.map((test: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      padding: 16,
                      borderRadius: 16,
                    }}
                  >
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <span
                          key={i}
                          style={{ color: "#fbbf24", fontSize: 14 }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#4b5563",
                        fontStyle: "italic",
                        marginBottom: 12,
                      }}
                    >
                      "{test.quote}"
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {test.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {test.role}
                    </div>
                  </div>
                ))}
              </div>
            </SectionContainer>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          background: '#0f172a', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '8px 10px',
          height: 56,
          zIndex: 1000,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          borderRadius: '28px 28px 0 0'
        }}>
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleTabChange(item.id)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 6, 
                color: activeTab === item.id ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
                flex: 1,
                padding: '4px 0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabGlow"
                  style={{
                    position: 'absolute',
                    top: -12,
                    width: '35%',
                    height: 4,
                    background: '#60a5fa',
                    boxShadow: '0 0 20px #60a5fa',
                    borderRadius: '0 0 6px 6px'
                  }}
                />
              )}
              <div style={{ 
                transform: activeTab === item.id ? 'translateY(-2px) scale(1.2)' : 'none',
                opacity: activeTab === item.id ? 1 : 0.6,
                transition: 'all 0.3s'
              }}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
              </div>
              <span style={{ 
                fontSize: 10, 
                fontWeight: activeTab === item.id ? 900 : 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: activeTab === item.id ? 1 : 0.6
              }}>{item.label}</span>
            </button>
          ))}
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
              background: "rgba(0,0,0,0.6)",
              zIndex: 1000,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: "100%",
                maxWidth: 480,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 32,
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "#f3f4f6",
                  border: "none",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 16,
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
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#4b5563" }}
                >
                  Send via Mobile No.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="e.g. +971501234567"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                    }}
                  />
                  <button
                    onClick={handleWhatsAppShare}
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "0 20px",
                      borderRadius: 8,
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
                    color: "#4b5563",
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

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#4b5563",
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
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <QRCode
                    id="profile-qr"
                    value={shareUrl}
                    size={150}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  style={{
                    display: "block",
                    margin: "12px auto 0",
                    background: "transparent",
                    color: "#1a56db",
                    border: "none",
                    fontWeight: 600,
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

        {/* Follow Modal */}
        {showFollowModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                background: "#fff",
                width: "100%",
                maxWidth: 400,
                borderRadius: 32,
                padding: 32,
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
               <button 
                onClick={() => setShowFollowModal(false)}
                style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
              
              {isFollowed ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ width: 80, height: 80, background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                     <Sparkles size={40} />
                   </div>
                   <h3 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900, color: '#0f172a' }}>Dhanaywad!</h3>
                   <p style={{ margin: 0, fontSize: 15, color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>You are now following {profile.name}. Aapko updates aur offers milte rahenge!</p>
                   <button 
                    onClick={() => setShowFollowModal(false)}
                    style={{ marginTop: 32, width: '100%', padding: 16, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width: 56, height: 56, background: '#eff6ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#2563eb' }}>
                    <Users size={28} />
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Follow {profile.name}</h3>
                  <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>Paaiye best deals, naye products aur announcements seedhe apne WhatsApp ya phone par.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={followerInfo.name}
                        onChange={e => setFollowerInfo({...followerInfo, name: e.target.value})}
                        style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 14, outline: 'none', fontSize: 14, width: '100%', background: '#f8fafc', transition: 'all 0.2s' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>WhatsApp Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 971501234567" 
                        value={followerInfo.phone}
                        onChange={e => setFollowerInfo({...followerInfo, phone: e.target.value})}
                        style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 14, outline: 'none', fontSize: 14, width: '100%', background: '#f8fafc' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="you@email.com" 
                        value={followerInfo.email}
                        onChange={e => setFollowerInfo({...followerInfo, email: e.target.value})}
                        style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 14, outline: 'none', fontSize: 14, width: '100%', background: '#f8fafc' }}
                      />
                    </div>

                    <button 
                      onClick={handleFollow}
                      disabled={followLoading || !followerInfo.email}
                      style={{ 
                        marginTop: 12,
                        padding: 18, 
                        background: '#2563eb', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 18, 
                        fontWeight: 800, 
                        fontSize: 15,
                        cursor: (followLoading || !followerInfo.email) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 12px 30px rgba(37,99,235,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        transition: 'all 0.2s',
                        opacity: (followLoading || !followerInfo.email) ? 0.6 : 1
                      }}
                    >
                      {followLoading ? "Sending..." : "Follow Business Now"} <Send size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                       <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#25d366' }}></span>
                       <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                         Safe & Secure • No Spam
                       </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 24,
            textAlign: "center",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: 4,
            }}
          >
            Powered by VIBE Digital Connect
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            Create your own free digital profile today
          </div>
          <Link
            to="/plans"
            style={{
              textDecoration: "none",
              background: "#0f172a",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            Get My Free Card
          </Link>
        </div>

        <ProfileChatbot profile={profile} />
        <AddToHomeScreen profileName={profile.name} />

        {/* Connect Modal */}
        <AnimatePresence>
          {showConnectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.8)",
                backdropFilter: "blur(8px)",
                zIndex: 2000,
                display: "flex",
                alignItems: "flex-end",
                padding: 0
              }}
              onClick={() => setShowConnectModal(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  background: "#fff",
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                  padding: "32px 24px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: '0 -20px 50px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }}></div>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 8, padding: 0 }}>Exchange Contact</h3>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6, padding: 0 }}>Fill in your details to save <strong>{profile.name}</strong> to your contacts and help them reach back to you.</p>
                
                <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#1e293b", textTransform: 'uppercase', letterSpacing: 2 }}>Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={connectInfo.name}
                      onChange={e => setConnectInfo({...connectInfo, name: e.target.value})}
                      placeholder="Your Name" 
                      style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 16, outline: 'none', borderBottom: '2px solid #e2e8f0' }} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#1e293b", textTransform: 'uppercase', letterSpacing: 2 }}>Calling No.</label>
                      <input 
                        type="tel" 
                        required
                        value={connectInfo.phone}
                        onChange={e => setConnectInfo({...connectInfo, phone: e.target.value})}
                        placeholder="+971..." 
                        style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 16, outline: 'none', borderBottom: '2px solid #e2e8f0' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 900, color: "#1e293b", textTransform: 'uppercase', letterSpacing: 2 }}>WhatsApp</label>
                      <input 
                        type="tel" 
                        value={connectInfo.whatsapp}
                        onChange={e => setConnectInfo({...connectInfo, whatsapp: e.target.value})}
                        placeholder="+971..." 
                        style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 16, outline: 'none', borderBottom: '2px solid #e2e8f0' }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, color: "#1e293b", textTransform: 'uppercase', letterSpacing: 2 }}>Company Name</label>
                    <input 
                      type="text" 
                      value={connectInfo.company}
                      onChange={e => setConnectInfo({...connectInfo, company: e.target.value})}
                      placeholder="Organization Name" 
                      style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 16, outline: 'none', borderBottom: '2px solid #e2e8f0' }} 
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={connectLoading}
                    style={{ 
                      marginTop: 12,
                      width: '100%', 
                      padding: '20px', 
                      background: 'linear-gradient(to right, #2563eb, #1d4ed8)', 
                      color: '#fff', 
                      borderRadius: 20, 
                      border: 'none', 
                      fontSize: 14, 
                      fontWeight: 900, 
                      textTransform: 'uppercase', 
                      letterSpacing: 2,
                      boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10
                    }}
                  >
                    {connectLoading ? 'Processing...' : 'Exchange Contact'} <Contact2 size={20} />
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    style={{ width: '100%', padding: '16px', background: 'transparent', color: '#64748b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, border: 'none' }}
                  >
                    Maybe Later
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);
}
