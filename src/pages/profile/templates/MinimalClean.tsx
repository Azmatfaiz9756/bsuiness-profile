import React, { useState } from "react";
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
  Bird
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

export default function MinimalClean({
  profile,
  onExit,
}: {
  profile: any;
  onExit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePhone, setSharePhone] = useState("");

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
      style={{
        background: "#fafafa",
        minHeight: "100vh",
        paddingBottom: 60,
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
        style={{
          background: "#fff",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <div
            style={{
              color: "#09090b",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #e4e4e7",
              background: "#fff",
            }}
          >
            {profile.plan.toUpperCase()}
          </div>
        </div>
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
            {profile.bannerVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              >
                <source src={profile.bannerVideo} type="video/mp4" />
              </video>
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
              profile.plan === "Enterprise") && (
              <span style={{ display: "inline-flex", marginLeft: 4 }}>
                <img 
                  src="https://api.iconify.design/game-icons:eagle-emblem.svg?color=%231da1f2" 
                  alt="Verified" 
                  width={24} 
                  height={24} 
                  style={{ transform: "scaleX(-1)" }} 
                />
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
             <span style={{ fontSize: 12, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 1 }}>{profile.views || 0} Visits</span>
          </div>

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
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setActiveTab('inquiry')}
                style={{
                  flex: 1,
                  background: "#09090b",
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
                }}
              >
                <UserPlus size={16} /> Exchange Contact
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  flex: 1,
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
                <Send size={16} /> Share
              </button>
            </div>
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
              <Share2 size={16} /> Refer & Earn Rewards
            </Link>
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1 }}>Address</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#27272a" }}>
                      {profile.address}
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
                  <MapPin size={18} /> Get Directions
                </a>
              </>
            )}
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                padding: "14px",
                borderRadius: 999,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 15,
                boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
              }}
            >
              <UserPlus size={18} /> Save Contact
            </button>
          </div>
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
              Contact
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
                  <Phone size={20} /> {profile.phone}
                </span>
                <span style={{ color: "#a1a1aa" }}>
                  <ArrowUpRight size={16} />
                </span>
              </a>
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
              {profile.address && profile.mapLink && (
                <a
                  href={profile.mapLink}
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
                    <MapPin size={20} /> {profile.address}
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
                    {profile.documentButtonText || "Business Document"}
                  </span>
                  <span style={{ color: "#a1a1aa" }}>
                    <ArrowDownToLine size={16} />
                  </span>
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
                  href={`https://linkedin.com/in/${profile.socials.linkedin}`}
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
                  href={`https://twitter.com/${profile.socials.twitter}`}
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
                  href={`https://instagram.com/${profile.socials.instagram}`}
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
                  href={`https://tiktok.com/${profile.socials.tiktok}`}
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
                  href={`https://facebook.com/${profile.socials.facebook}`}
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
                  href={`https://youtube.com/${profile.socials.youtube}`}
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
            </div>
          </div>

          {profile.hours && Object.keys(profile.hours).length > 0 && (
            <AccordionItem id="hours" title="Business Hours">
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
                        {day}
                      </span>
                      <span style={{ color: h.closed ? "#ef4444" : "#52525b" }}>
                        {h.closed ? "Closed" : `${h.open} - ${h.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {profile.services && profile.services.length > 0 && (
            <AccordionItem id="services" title="Services">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {profile.services.map((svc: any, i: number) => (
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

          {profile.products && profile.products.length > 0 && (
            <AccordionItem id="shop" title="Products">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {profile.products.map((prod: any, i: number) => (
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
                          href={`https://wa.me/${profile.phone?.replace(/[^0-9]/g, "")}?text=Hi, I would like to order: ${prod.name}`}
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
                          Order on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {((profile.gallery && profile.gallery.length > 0) ||
            (profile.videos && profile.videos.length > 0)) && (
            <AccordionItem id="media" title="Media">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ overflow: "hidden", paddingBottom: 16 }}>
                  <div className="gallery-slider-minimal">
                    {profile.gallery &&
                      [...profile.gallery, ...profile.gallery].map(
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

          {profile.testimonials && profile.testimonials.length > 0 && (
            <AccordionItem id="reviews" title="Reviews">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {profile.testimonials.map((test: any, i: number) => (
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

          {profile.bankAccounts && profile.bankAccounts.length > 0 && (
            <AccordionItem id="payments" title="Bank Accounts">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    border: "1px solid #e4e4e7",
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#09090b",
                      marginBottom: 16,
                    }}
                  >
                    Bank Transfers
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
                            paddingBottom:
                              i !== profile.bankAccounts.length - 1 ? 16 : 0,
                            borderBottom:
                              i !== profile.bankAccounts.length - 1
                                ? "1px solid #e4e4e7"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#09090b",
                            }}
                          >
                            {acc.bankName}
                          </div>
                          <div style={{ fontSize: 13, color: "#a1a1aa" }}>
                            {acc.country}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#52525b",
                              marginTop: 8,
                            }}
                          >
                            Account:{" "}
                            <span style={{ fontWeight: 600, color: "#09090b" }}>
                              {acc.accountName}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#09090b",
                              marginTop: 4,
                            }}
                          >
                            {acc.accountNumber}
                          </div>
                          {acc.iban && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#52525b",
                                marginTop: 4,
                              }}
                            >
                              IBAN:{" "}
                              <span
                                style={{ fontWeight: 600, color: "#09090b" }}
                              >
                                {acc.iban}
                              </span>
                            </div>
                          )}
                          {acc.swift && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#52525b",
                                marginTop: 4,
                              }}
                            >
                              SWIFT:{" "}
                              <span
                                style={{ fontWeight: 600, color: "#09090b" }}
                              >
                                {acc.swift}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </AccordionItem>
          )}

          {profile.faqs && profile.faqs.length > 0 && (
            <AccordionItem id="faq" title="FAQ">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {profile.faqs.map((faq: any, i: number) => (
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

          <AccordionItem id="inquiry" title="Inquiry">
            <div
              style={{
                border: "1px solid #e4e4e7",
                padding: 24,
                borderRadius: 16,
              }}
            >
              <input
                type="text"
                placeholder="Name"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  border: "none",
                  borderBottom: "1px solid #e4e4e7",
                  marginBottom: 12,
                  outline: "none",
                  fontSize: 15,
                  background: "transparent",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                style={{
                  width: "100%",
                  padding: "12px 0",
                  border: "none",
                  borderBottom: "1px solid #e4e4e7",
                  marginBottom: 12,
                  outline: "none",
                  fontSize: 15,
                  background: "transparent",
                }}
              />
              <textarea
                placeholder="Message"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  border: "none",
                  borderBottom: "1px solid #e4e4e7",
                  marginBottom: 24,
                  outline: "none",
                  fontSize: 15,
                  fontFamily: "inherit",
                  resize: "vertical",
                  background: "transparent",
                }}
              ></textarea>
              <button
                onClick={() => alert("Sent!")}
                style={{
                  width: "100%",
                  background: "#09090b",
                  color: "#fff",
                  border: "none",
                  padding: 14,
                  borderRadius: 999,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                Send Message
              </button>
            </div>
          </AccordionItem>

          <AccordionItem id="platform" title="Platform Details">
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
                  Platform ID
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
                  <span
                    style={{
                      background: "#e4e4e7",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "#52525b",
                    }}
                  >
                    Verified
                  </span>
                </div>
              </div>

              <div>
                {profile.bankAccounts && profile.bankAccounts.length > 0 && (
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
                  {profile.bankAccounts &&
                    profile.bankAccounts.map((acc: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #e4e4e7",
                          padding: 16,
                          borderRadius: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#09090b",
                            }}
                          >
                            {acc.bankName}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "#52525b",
                              fontWeight: 500,
                            }}
                          >
                            {acc.country}
                          </span>
                        </div>
                        {acc.accountNumber && (
                          <div
                            style={{
                              fontSize: 14,
                              color: "#52525b",
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
                            color: "#52525b",
                            fontFamily: "monospace",
                            marginBottom: 4,
                          }}
                        >
                          IBAN: {acc.iban}
                        </div>
                        <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                          SWIFT: {acc.swift} • Name: {acc.accountName}
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
                      <div style={{ marginBottom: 8 }}>• <strong>1 Month Free Trial:</strong> All new business profiles get a full month free trial.</div>
                      <div>• <strong>Referral Success:</strong> If your referral purchases within <strong>35 days</strong>, both of you earn rewards!</div>
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e4e4e7",
                        padding: 12,
                        borderRadius: 8,
                        fontFamily: "monospace",
                        color: "#09090b",
                        textAlign: "center",
                        fontWeight: 600,
                        marginBottom: 12,
                        wordBreak: "break-all",
                      }}
                    >
                      {window.location.origin}/plans?ref={profile.id || ""}
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
            </div>
          </AccordionItem>
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
                    value={window.location.href}
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
            marginTop: 40,
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
            Powered by Digital Business Cards
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

        <ProfileChatbot profile={profile} />
      </div>
    </div>
  );
}
