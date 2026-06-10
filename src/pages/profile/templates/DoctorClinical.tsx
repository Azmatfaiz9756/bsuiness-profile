import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Download,
  MessageCircle,
  Stethoscope,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Heart,
  Share2,
  X,
  Languages,
  CheckCircle,
  Activity,
  Briefcase,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
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

export default function DoctorClinical({
  profile,
  onExit,
}: {
  profile: any;
  onExit?: () => void;
}) {
  const t = useTranslation(profile.isRtl);
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<string | null>('about');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const bannerVideoSource = profile.bannerVideo || profile.bannerVideoUrl || profile.videoUrl;
  const bannerImgSource = profile.bannerUrl || profile.coverImage || profile.bannerImage || profile.backgroundImage;
  const youtubeVideoId = bannerVideoSource ? getYoutubeVideoId(bannerVideoSource) : null;

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

  // Fallbacks for Doctor specific fields with mock placeholder values to ensure gorgeous presentation on select
  const medicalSpecialty = profile.medicalSpecialty || profile.title || "General Surgery Specialist";
  const medicalCredentials = profile.medicalCredentials || "M.D., F.A.C.S (Board Certified)";
  const hospitalAffiliations = profile.hospitalAffiliations || "City General Hospital & Medical Center";
  const doctorAbout = profile.doctorAbout || profile.bio || "With over 12 years of specialized clinical experience, Dr. Sophia Carter is dedicated to providing high-quality personal medical care. Specializes in advanced minimally invasive therapies, laparoscopic procedures, and precision general surgery with top-tier recovery rates.";
  const doctorEducation = profile.doctorEducation || "M.D. in General Surgery - Harvard Medical School\nResidency - Mayo Clinic Department of Surgery";
  const doctorLicense = profile.doctorLicense || "DHCC-Lic-98246";
  const doctorSpecialtiesList = profile.doctorSpecialtiesList 
    ? (typeof profile.doctorSpecialtiesList === 'string' ? profile.doctorSpecialtiesList.split(',').map((s: string) => s.trim()) : profile.doctorSpecialtiesList)
    : ["Abdominal Surgery", "Laparoscopic Therapy", "Trauma & Emergency Care", "Endoscopic Evaluation", "Surgical Oncology"];

  const hasSpecialDoctorHours = profile.hours || profile.businessHours;

  const handleSaveContact = () => {
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Dr. ${profile.name || ''}\nTITLE:${medicalSpecialty} | ${medicalCredentials}\nORG:${profile.company || hospitalAffiliations}\nTEL;TYPE=CELL:${profile.phone || ''}\nEMAIL:${profile.email || ''}\nURL:${window.location.href}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dr_${String(profile.name || 'doctor').replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayLabel = (day: string) => {
    const labels: Record<string, string> = {
      Monday: t.Monday || "Monday",
      Tuesday: t.Tuesday || "Tuesday",
      Wednesday: t.Wednesday || "Wednesday",
      Thursday: t.Thursday || "Thursday",
      Friday: t.Friday || "Friday",
      Saturday: t.Saturday || "Saturday",
      Sunday: t.Sunday || "Sunday"
    };
    return labels[day] || day;
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-32 flex justify-center"
      style={{ direction: profile.isRtl ? 'rtl' : 'ltr' }}
    >
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col min-h-screen">
        
        {/* Curved Header Banner consistent with the Dr. Sophia Carter mockup card */}
        <div className="relative h-64 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 flex flex-col justify-end overflow-hidden">
          
          {youtubeVideoId ? (
            <div 
              onClick={toggleAudio}
              className="absolute inset-0 overflow-hidden cursor-pointer z-0"
            >
              <div className="absolute top-[50%] left-[50%] w-[240%] h-[240%] -translate-x-[50%] -translate-y-[50%] pointer-events-none">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&enablejsapi=1&playlist=${youtubeVideoId}`}
                  allow="autoplay; encrypted-media"
                ></iframe>
              </div>
              
              {/* Mute toggle indicator badge */}
              <div className="absolute bottom-20 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center z-10 backdrop-blur-sm shadow border border-white/20">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </div>
            </div>
          ) : bannerVideoSource ? (
            <div 
              onClick={() => setIsMuted(prev => !prev)}
              className="absolute inset-0 overflow-hidden cursor-pointer z-0"
            >
              <video
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              >
                <source src={bannerVideoSource} type="video/mp4" />
              </video>

              {/* Mute toggle indicator badge */}
              <div className="absolute bottom-20 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center z-10 backdrop-blur-sm shadow border border-white/20">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </div>
            </div>
          ) : bannerImgSource ? (
            <img 
              src={bannerImgSource} 
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              alt="Banner background"
              referrerPolicy="no-referrer"
            />
          ) : (
            /* Sweeper curves fallback default */
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 Q50,50 100,0 T200,0 Z" fill="white" />
              </svg>
            </div>
          )}
          
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            {onExit && (
              <button 
                onClick={onExit}
                className="bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors uppercase"
              >
                ← Exit Preview
              </button>
            )}
          </div>

          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/35 transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* SVG Custom Doctor Curve design overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 z-10">
            <svg viewBox="0 0 1440 320" className="w-full h-full text-white fill-current translate-y-1">
              <path d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,234.7C1120,245,1280,235,1360,229.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
        </div>

        {/* Doctor Identity & Avatar Grid - Overlaying the Curve */}
        <div className="px-6 -mt-16 relative z-20 flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
              {profile.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Stethoscope size={48} />
                </div>
              )}
            </div>
            
            {/* Clinical Green Stethoscope/Cross emblem badge */}
            <div className="absolute bottom-1 right-1 bg-teal-500 text-white rounded-full p-2 border-2 border-white shadow-md flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile.name ? `Dr. ${profile.name}` : "Dr. Sophia Carter"}
              </h2>
              {profile.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-teal-600 font-bold uppercase tracking-wider text-xs mt-1">
              {medicalSpecialty}
            </p>
            <p className="text-slate-400 font-medium text-xs mt-0.5">
              {medicalCredentials}
            </p>
            {profile.company && (
              <p className="text-slate-500 font-semibold text-xs mt-1 bg-slate-100 rounded-full py-0.5 px-3 inline-block">
                📍 {hospitalAffiliations}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="px-4 mt-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'about' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Stethoscope size={14} />
              <span>{t.aboutMe || "About Dr."}</span>
            </button>
            <button
              onClick={() => setActiveTab('timing')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'timing' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={14} />
              <span>{t.businessHours || "Hours"}</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'booking' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar size={14} />
              <span>{t.bookMeeting || "Booking"}</span>
            </button>
          </div>
        </div>

        {/* Quick Contact Buttons Rail styled beautifully in medical rounded accents */}
        <div className="px-6 mt-6 grid grid-cols-4 gap-3 text-center">
          <a
            href={`tel:${profile.phone || '999'}`}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Phone size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.call || "Call"}</span>
          </a>

          <a
            href={`mailto:${profile.email || 'info@hospital.com'}`}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Mail size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.email || "Email"}</span>
          </a>

          <a
            href={profile.addressLink || `https://maps.google.com/?q=${profile.address || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MapPin size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.location || "Location"}</span>
          </a>

          <a
            href={`https://wa.me/${(profile.whatsapp || '').replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MessageCircle size={18} className="fill-current text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">WhatsApp</span>
          </a>
        </div>

        {/* Tab Contents */}
        <div className="px-6 mt-8 flex-1">
          
          {/* TAB 1: ABOUT DR. */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Doctor Statement */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/10 rounded-full translate-x-8 -translate-y-8"></div>
                <h4 className="m-0 text-sm font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Activity size={16} className="text-teal-600" />
                  <span>Clinical Profile</span>
                </h4>
                <p className="m-0 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {doctorAbout}
                </p>
                {doctorLicense && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical License No</span>
                    <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg">{doctorLicense}</span>
                  </div>
                )}
              </div>

              {/* Specializations list */}
              <div>
                <h4 className="m-0 text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <Briefcase size={14} className="text-blue-600" />
                  <span>Area of Expertise</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctorSpecialtiesList.map((spec, i) => (
                    <span 
                      key={i} 
                      className="bg-blue-50/60 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education & Qualifications */}
              <div className="border border-slate-200/80 rounded-3xl p-5">
                <h4 className="m-0 text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GraduationCap size={18} className="text-blue-600" />
                  <span>Education & Credentials</span>
                </h4>
                <div className="flex flex-col gap-3">
                  {doctorEducation.split('\n').filter(Boolean).map((qual, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Award size={14} className="text-indigo-600" />
                      </div>
                      <p className="m-0 text-xs text-slate-600 font-semibold leading-normal">{qual}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio & Links section */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div>
                  <h4 className="m-0 text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Professional Channels</h4>
                  <div className="flex items-center gap-3">
                    {profile.socialLinks.map((link: any, index: number) => {
                      const getSocialIcon = (platformName: string) => {
                        const low = platformName.toLowerCase();
                        if (low.includes('linkedin')) return <FaLinkedin size={18} />;
                        if (low.includes('twitter') || low.includes('x.com')) return <FaTwitter size={18} />;
                        if (low.includes('instagram')) return <FaInstagram size={18} />;
                        if (low.includes('facebook')) return <FaFacebook size={18} />;
                        if (low.includes('youtube')) return <FaYoutube size={18} />;
                        return <Activity size={18} />;
                      };
                      return (
                        <a 
                          key={index} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all shadow-sm"
                        >
                          {getSocialIcon(link.name)}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMINGS & HOURS */}
          {activeTab === 'timing' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="m-0 text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <span>Clinic Weekly Schedule</span>
                  </h4>
                  <span className="text-[10px] font-black bg-teal-50 border border-teal-100 text-teal-600 rounded-lg py-0.5 px-2 uppercase tracking-wider block">Timing Status</span>
                </div>

                {hasSpecialDoctorHours ? (
                  <div className="flex flex-col gap-2.5">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const lower = day.toLowerCase();
                      const h = profile.hours ? (profile.hours[lower] || profile.hours[day]) : (profile.businessHours ? (profile.businessHours[lower] || profile.businessHours[day]) : null);
                      const isClosed = !h || h.closed;
                      return (
                        <div key={day} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200/70 last:border-0">
                          <span className="text-xs font-bold text-slate-600">{getDayLabel(day)}</span>
                          {isClosed ? (
                            <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Closed</span>
                          ) : (
                            <span className="text-xs font-black text-slate-800 font-mono bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                              {h.open || '09:00'} - {h.close || '18:00'}
                              {h.split && ` (${h.open2 || '16:00'} - ${h.close2 || '21:00'})`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs font-semibold text-slate-400">
                    Clinic hours not specified. Contact directly for availability.
                  </div>
                )}
              </div>

              {profile.address && (
                <div className="border border-slate-200 rounded-3xl p-5">
                  <h4 className="m-0 text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" />
                    <span>Clinic Address</span>
                  </h4>
                  <p className="m-0 text-xs text-slate-600 font-semibold leading-relaxed mb-3">
                    {profile.address}
                  </p>
                  <a
                    href={profile.addressLink || `https://maps.google.com/?q=${profile.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Get Directions via Google Maps</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKING & APPOINTMENT */}
          {activeTab === 'booking' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
                <h4 className="m-0 text-base font-black uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Book Consultation</span>
                </h4>
                <p className="m-0 text-xs text-blue-100 font-medium leading-relaxed">
                  Select your preferred slot & submit details. Dr's assistant will verify is slot available within minutes.
                </p>
              </div>

              {/* Built in scheduler */}
              <div className="shadow-lg border border-slate-100 p-0.5 rounded-3xl bg-white overflow-hidden">
                <AppointmentBooking profile={profile} />
              </div>
            </div>
          )}
        </div>

        {/* Lead captures or Chatbots if enabled */}
        {profile.enableLeadCapture && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <LeadCapture profile={profile} />
          </div>
        )}

        {/* Home Banner Save Floating action drawer */}
        <div className="fixed bottom-0 left-0 right-0 bg-transparent flex justify-center pointer-events-none z-40 pb-6 px-4">
          <div className="w-full max-w-md pointer-events-auto bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                ⚕️
              </div>
              <div>
                <p className="m-0 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">CONNECT WITH DR.</p>
                <p className="m-0 text-xs font-black text-slate-800 mt-1">{profile.name || "Sophia Carter"}</p>
              </div>
            </div>
            
            <button
              onClick={handleSaveContact}
              className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Download size={14} />
              <span>{t.saveContact || "Save Contact"}</span>
            </button>
          </div>
        </div>

        {/* PWA Prompt is handled globally, but keep template structure tidy */}
        <AddToHomeScreen profileName={profile.name || "Dr. Sophia Carter"} />

        {/* Share Modal Backdrop */}
        <AnimatePresence>
          {showShareModal && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-12 relative flex flex-col gap-6"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="text-center">
                  <h3 className="m-0 text-lg font-black text-slate-900 tracking-tight">Share Doctor Profile</h3>
                  <p className="m-0 text-xs text-slate-500 mt-1 font-semibold">Copy doctor's premium NFC clinic card profile link</p>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-center justify-between gap-3 font-mono text-xs text-slate-700">
                  <span className="truncate">{window.location.href}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Copied successfully!");
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check Dr. " + (profile.name || "Sophia Carter") + "'s official digital business card: " + window.location.href)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp size={16} />
                    WhatsApp
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent("Dr. " + (profile.name || "Sophia Carter") + " Clinical Profile")}&body=${encodeURIComponent("View doctor digital business card: " + window.location.href)}`}
                    className="py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    Email Link
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
