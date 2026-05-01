import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const sampleProfiles = [
  {
    id: "demo_tech_ceo",
    name: "Alex Sterling",
    title: "Chief Executive Officer",
    company: "Nexus Innovations",
    email: "alex.sterling@nexus.demo",
    phone: "+1 (555) 123-4567",
    website: "https://nexus-innovations.demo",
    bio: "Visionary tech leader with 15+ years experience building scalable enterprise software solutions and driving digital transformation for globally recognized brands.",
    location: "San Francisco, CA",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com"
    },
    themeColor: "#2563eb",
    template: "executive",
    services: [
      { id: "s1", title: "Technology Consulting", description: "Strategic advisory for digital transformation.", price: 1500, active: true },
      { id: "s2", title: "Executive Coaching", description: "1-on-1 mentorship for emerging tech leaders.", price: 800, active: true }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256",
    coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400",
    themeStyle: "dark",
    fontFamily: "Inter"
  },
  {
    id: "demo_creative",
    name: "Mia Rossi",
    title: "Creative Director",
    company: "Studio Aura",
    email: "hello@studioaura.demo",
    phone: "+1 (555) 987-6543",
    website: "https://studioaura.demo",
    bio: "Award-winning creative director specializing in brand identity, typography, and immersive digital experiences that captivate and convert.",
    location: "Milan, Italy",
    socialLinks: {
      instagram: "https://instagram.com",
      behance: "https://behance.net",
      dribbble: "https://dribbble.com"
    },
    themeColor: "#ec4899",
    template: "minimal",
    services: [
      { id: "s1", title: "Brand Identity Design", description: "Complete visual identity systems.", price: 3500, active: true },
      { id: "s2", title: "UI/UX Design", description: "User-centric interface design for web & mobile.", price: 2800, active: true }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400",
    themeStyle: "light",
    fontFamily: "Space Grotesk"
  },
  {
    id: "demo_realtor",
    name: "James Chen",
    title: "Luxury Real Estate Partner",
    company: "Chen Estates Group",
    email: "james@chenestates.demo",
    phone: "+1 (555) 234-5678",
    website: "https://chenestates.demo",
    bio: "Top 1% producer dedicated to connecting extraordinary clients with exceptional properties in the world's most desirable neighborhoods.",
    location: "New York, NY",
    socialLinks: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com"
    },
    themeColor: "#b45309",
    template: "classic",
    services: [
      { id: "s1", title: "Property Valuation", description: "Comprehensive market analysis and pricing strategy.", price: 0, active: true },
      { id: "s2", title: "VIP Buyer Representation", description: "Exclusive property tours and acquisition support.", price: 0, active: true }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256",
    coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200&h=400",
    themeStyle: "light",
    fontFamily: "Playfair Display"
  },
  {
    id: "demo_fitness",
    name: "Sarah Jenkins",
    title: "Elite Fitness Coach",
    company: "Peak Performance",
    email: "coachsarah@peak.demo",
    phone: "+1 (555) 345-6789",
    website: "https://peakperformance.demo",
    bio: "Certified strength and conditioning specialist helping high performers build resilience, optimize health, and achieve peak physical condition.",
    location: "Austin, TX",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com"
    },
    themeColor: "#ef4444",
    template: "minimal",
    services: [
      { id: "s1", title: "12-Week Transformation", description: "Custom nutrition and training protocol.", price: 1200, active: true },
      { id: "s2", title: "Virtual Coaching", description: "Weekly check-ins and form analysis.", price: 300, active: true }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256&h=256",
    coverUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200&h=400",
    themeStyle: "dark",
    fontFamily: "Outfit"
  },
  {
    id: "demo_chef",
    name: "Diego Alvarez",
    title: "Executive Chef",
    company: "Culinary Alchemy",
    email: "chef@culinaryalchemy.demo",
    phone: "+1 (555) 456-7890",
    website: "https://culinaryalchemy.demo",
    bio: "Michelin-trained chef bringing avant-garde techniques and global flavors to exclusive private dining experiences and curated events.",
    location: "Miami, FL",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      facebook: "https://facebook.com"
    },
    themeColor: "#f59e0b",
    template: "classic",
    services: [
      { id: "s1", title: "Private Dining Experience", description: "Custom 7-course tasting menu for up to 12 guests.", price: 2500, active: true },
      { id: "s2", title: "Culinary Masterclass", description: "Interactive cooking workshop at your home.", price: 800, active: true }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=256&h=256",
    coverUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200&h=400",
    themeStyle: "light",
    fontFamily: "Inter"
  }
];

export default function SeedDemo() {
  const [status, setStatus] = useState("Idle");
  const navigate = useNavigate();

  const handleSeed = async () => {
    setStatus("Seeding profiles...");
    try {
      for (const profile of sampleProfiles) {
        await setDoc(doc(db, 'profiles', profile.id), {
          ...profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setStatus(`Saved ${profile.name}...`);
      }
      setStatus("Demo profiles saved successfully!");
      
      // Auto redirect to the first profile after 2 seconds
      setTimeout(() => {
        navigate('/profile/demo_tech_ceo');
      }, 2000);
      
    } catch (e: any) {
      console.error(e);
      setStatus("Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Seed Demo Profiles</h1>
        <p className="text-slate-500 mb-8 border-b pb-8">Click the button below to generate 5 full-featured sample profiles in the database.</p>
        
        <button 
          onClick={handleSeed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mb-4"
        >
          Generate 5 Sample Profiles
        </button>
        
        {status && <div className="text-sm font-medium text-slate-600 bg-slate-100 p-4 rounded-lg">{status}</div>}
      </div>
    </div>
  );
}
