import React, { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
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

export default function ClassicModern({
  profile,
  onExit,
}: {
  profile: any;
  onExit: () => void;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

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
  const hasPayments = (profile.paymentLinks && profile.paymentLinks.length > 0) || (profile.bankAccounts && profile.bankAccounts.length > 0);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Contact2 size={20} />, show: true },
    { id: 'services', label: 'Services', icon: <Sparkles size={20} />, show: profile.services && profile.services.length > 0 },
    { id: 'shop', label: 'Store', icon: <ShoppingBag size={20} />, show: profile.products && profile.products.length > 0 },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} />, show: true },
    { id: 'inquiry', label: 'Inquiry', icon: <Mail size={20} />, show: true }
  ].filter(item => item.show);

  const SectionContainer = ({ icon, title, children, id }: any) => {
    return (
      <div id={id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>
          {icon}
          {title}
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nTITLE:${profile.title}\nORG:${profile.company}\nTEL:${profile.phone}\nEMAIL:${profile.email}\nURL:${profile.website}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = () => {
    if (!sharePhone) return alert("Enter a mobile number");
    window.open(
      `https://wa.me/${sharePhone}?text=Check out my digital profile: ${window.location.href}`,
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
        paddingBottom: 60,
        fontFamily: "Inter, sans-serif",
      }}
    >
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
      <div
        className="shell"
        style={{
          background: "#fff",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <button
            onClick={onExit}
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "#1a1a2e",
              border: "none",
              padding: "6px 12px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ← Exit Preview
          </button>
          <div
            style={{
              background: "#dbeafe",
              color: "#1e40af",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 20,
              fontWeight: 700,
            }}
          >
            {profile.plan.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            background: profile.bannerVideo || profile.bannerUrl
              ? "#000"
              : "linear-gradient(135deg,#1a1a2e,#1a56db)",
            height: 180,
            position: "relative",
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            overflow: "hidden",
          }}
        >
          {profile.bannerUrl && !profile.bannerVideo && (
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
          {profile.bannerVideo && (
            <video
              autoPlay
              loop
              muted
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
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: "#dbeafe",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "#1e40af",
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
              profile.plan === "Enterprise") && (
              <span style={{ color: "#38bdf8", fontSize: "18px" }}>✓</span>
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
              {profile.socials.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socials.linkedin}`}
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
              {profile.socials.twitter && (
                <a
                  href={`https://twitter.com/${profile.socials.twitter}`}
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
              {profile.socials.instagram && (
                <a
                  href={`https://instagram.com/${profile.socials.instagram}`}
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
              {profile.socials.tiktok && (
                <a
                  href={`https://tiktok.com/${profile.socials.tiktok}`}
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
              {profile.socials.facebook && (
                <a
                  href={`https://facebook.com/${profile.socials.facebook}`}
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
              {profile.socials.youtube && (
                <a
                  href={`https://youtube.com/${profile.socials.youtube}`}
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
              {profile.socials.github && (
                <a
                  href={`https://github.com/${profile.socials.github}`}
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
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <UserPlus size={18} /> Save Contact
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                flex: 1,
                background: "#f3f4f6",
                color: "#1f2937",
                border: "none",
                padding: "12px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Send size={16} /> Share Profile
            </button>
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
            {profile.customButtons &&
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
          {activeTab === 'wallet' && (
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
                    DBC MEMBER ID
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
          {activeTab === 'home' && (
            <>
              {profile.address && (
                <div style={{ marginBottom: 12 }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(profile.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: "100%",
                      background: "#16a34a",
                      color: "#fff",
                      padding: "14px",
                      borderRadius: 12,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      textDecoration: "none",
                      boxShadow: "0 4px 12px rgba(22,163,74,0.2)",
                      fontSize: 14
                    }}
                  >
                    <MapPin size={18} /> Get Directions
                  </a>
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={handleSave}
                  style={{
                    width: "100%",
                    background: "#2563eb",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 14,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  }}
                >
                  <UserPlus size={18} /> Exchange Contact
                </button>
              </div>
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
                      Call Mobile
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.phone}
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
                  href={`https://wa.me/${profile.whatsapp}`}
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
                      WhatsApp
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      +{profile.whatsapp}
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
              {profile.address && profile.mapLink && (
                <a
                  href={profile.mapLink}
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
                      Directions
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {profile.address}
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
                              `${h.open} - ${h.close}`
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
          </>
          )}

          {activeTab === 'services' && hasServices && (
            <SectionContainer title="Services" icon={<Sparkles size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profile.services && profile.services.length > 0 ? (
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

              {profile.gallery && profile.gallery.length > 0 && (
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
                      {[...profile.gallery, ...profile.gallery].map(
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
                  {profile.videos &&
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

              {profile.team && profile.team.length > 0 && (
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
                    {profile.team.map((member: any, i: number) => (
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
                    {profile.testimonials.map((test: any, i: number) => (
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
          )}

          {activeTab === 'inquiry' && (
            <SectionContainer title="Send Inquiry" icon={<Mail size={18} />}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                padding: 20,
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                Send an Inquiry
              </div>
              <input
                type="text"
                placeholder="Your Name"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  marginBottom: 12,
                  boxSizing: "border-box",
                }}
              />
              <input
                type="email"
                placeholder="Your Email"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  marginBottom: 12,
                  boxSizing: "border-box",
                }}
              />
              <textarea
                placeholder="Message"
                rows={4}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  marginBottom: 16,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              ></textarea>
              <button
                onClick={() => alert("Message Sent!")}
                style={{
                  width: "100%",
                  background: "#1a1a2e",
                  color: "#fff",
                  border: "none",
                  padding: 12,
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </SectionContainer>
          )}

          {activeTab === 'wallet' && (
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

              {profile.bankAccounts && profile.bankAccounts.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1f2937",
                      marginBottom: 10,
                      textAlign: "left",
                    }}
                  >
                    Bank Details
                  </div>
                  {profile.bankAccounts.map((acc: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {acc.bankName}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#1a56db",
                            fontWeight: 600,
                          }}
                        >
                          {acc.country}
                        </span>
                      </div>
                      {acc.accountNumber && (
                        <div
                          style={{
                            fontSize: 14,
                            color: "#4b5563",
                            fontFamily: "monospace",
                            marginBottom: 4,
                          }}
                        >
                          A/C: {acc.accountNumber}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 14,
                          color: "#4b5563",
                          fontFamily: "monospace",
                          marginBottom: 4,
                        }}
                      >
                        IBAN: {acc.iban}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        SWIFT: {acc.swift} • Name: {acc.accountName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          </SectionContainer>
          )}

          {activeTab === 'shop' && hasProducts && (
            <SectionContainer title="Store" icon={<ShoppingBag size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profile.products && profile.products.length > 0 ? (
                profile.products.map((prod: any, i: number) => (
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

          {activeTab === 'home' && hasFaqs && (
            <SectionContainer title="FAQs" icon={<MessageSquare size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profile.faqs.map((faq: any, i: number) => (
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

          {activeTab === 'wallet' && hasPayments && (
            <SectionContainer title="Payments" icon={<Wallet size={18} />}>
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
                      {profile.paymentLinks.map((link: any, i: number) => (
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

                {profile.bankAccounts && profile.bankAccounts.length > 0 && (
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
                      {profile.bankAccounts.map((acc: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            background: "#f8fafc",
                            padding: 16,
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#1f2937",
                            }}
                          >
                            {acc.bankName} - {acc.country}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#4b5563",
                              marginTop: 4,
                            }}
                          >
                            Account: {acc.accountName}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#1f2937",
                              marginTop: 8,
                              background: "#e2e8f0",
                              padding: "6px 10px",
                              borderRadius: 6,
                            }}
                          >
                            {acc.accountNumber}
                          </div>
                          {acc.iban && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#4b5563",
                                marginTop: 8,
                              }}
                            >
                              <strong>IBAN:</strong> {acc.iban}
                            </div>
                          )}
                          {acc.swift && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#4b5563",
                                marginTop: 4,
                              }}
                            >
                              <strong>SWIFT:</strong> {acc.swift}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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

          {activeTab === 'home' && (
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
                <div style={{ marginBottom: 8 }}>• <strong>1 Month Free Trial:</strong> All new business profiles get a full month free trial to explore all features.</div>
                <div>• <strong>Referral Success:</strong> If your referral purchases any plan within <strong>35 days</strong> of signing up, your referral is marked successful and you both earn rewards!</div>
              </div>
              <div
                style={{
                  background: "#fff",
                  color: "#1e40af",
                  padding: 12,
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                businessprofile.webdevelop.ae/ref/{profile.id ? profile.id.slice(-6).toUpperCase() : "LINK"}
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

          {hasTestimonials && (
            <SectionContainer title="Reviews" icon={<MessageSquare size={18} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {profile.testimonials.map((test: any, i: number) => (
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
          background: '#fff', 
          borderTop: '1px solid #e5e7eb', 
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '12px 0 24px 0',
          zIndex: 1000,
          boxShadow: '0 -10px 25px rgba(0,0,0,0.08)'
        }}>
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              style={{ 
                background: 'none', 
                border: 'none', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 4, 
                color: activeTab === item.id ? '#1a1a2e' : '#94a3b8',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <div style={{ transform: activeTab === item.id ? 'scale(1.1) translateY(-3px)' : 'none', transition: 'all 0.2s' }}>{item.icon}</div>
              <span style={{ fontSize: 10, fontWeight: activeTab === item.id ? 800 : 500 }}>{item.label}</span>
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
                    href={`https://wa.me/?text=Check out this profile: ${window.location.href}`}
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
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
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
                    href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out this profile!`}
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
                    href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
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
                    value={window.location.href}
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

        <div
          style={{
            marginTop: 40,
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
            Powered by Digital Business Cards
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            Create your own free digital profile today
          </div>
          <Link
            to="/register"
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
      </div>
    </div>
  </div>
);
}
