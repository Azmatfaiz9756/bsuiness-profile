import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const [profiles, setProfiles] = useState([
    { 
      id: 'DBC000000042', 
      slug: 'ahmed-al-rashidi',
      name: 'Ahmed Al Rashidi', 
      title: 'CEO & Founder', 
      company: 'Al Rashidi Intl Corp', 
      plan: 'Business Pro', 
      status: 'Active', 
      views: 4820, 
      franchise: 'Dubai Main', 
      email: 'ahmed@example.com', 
      phone: '+971 50 123 4567', 
      website: 'www.alrashidi.ae', 
      avatar: 'AR', 
      expiry: '2025-04-06', 
      bio: 'Tech entrepreneur with 15+ years of experience in the GCC region. Empowering businesses through digital transformation.', 
      socials: { linkedin: 'ahmed-alrashidi', twitter: 'ahmed_tech', instagram: 'ahmed.dxb', tiktok: '@ahmed_tech', facebook: 'ahmed.alrashidi', youtube: 'AhmedTech' }, 
      services: [{ name: 'IT Consulting', desc: 'Enterprise tech architecture', price: 'AED 500/hr' }, { name: 'Digital Transformation', desc: 'End-to-end digitisation plan', price: 'Custom' }], 
      meetingUrl: 'https://calendly.com/ahmed', 
      gallery: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=400&q=80'],
      bannerVideo: 'https://www.w3schools.com/html/mov_bbb.mp4', 
      videos: ['https://www.youtube.com/embed/tgbNymZ7vqY'],
      bankAccounts: [{ country: 'UAE', bankName: 'Emirates NBD', accountName: 'Ahmed Al Rashidi', accountNumber: '123456789', iban: 'AE120260000000123456789', swift: 'EBNIAEAA' }],
      address: 'Downtown Dubai, UAE',
      mapLink: 'https://maps.google.com/?q=Downtown+Dubai',
      aiPrompt: `Aap Ahmed Al Rashidi ke ek behad muhazzib AI assistant hain. 
Aapko hamesha tehzeeb aur tameez ke sath North Indian Hindustani (Urdu-Hindi mix) mein baat karni hai. 
Aapka lehja (tone) 'Dilli-Lucknow' ki tehzeeb jaisa hona chahiye. 
Sanskrit-heavy words bilkul use na karein. 'Aap', 'Janab', 'Tashreef rakhiye', 'Insha-Allah', 'Masha-Allah' jaise alfaz ka munasib istemal karein.
Context: Ahmed Al Rashidi CEO hain Al Rashidi Intl Corp ke. Woh IT Consulting aur Digital Transformation mein maharat (expertise) rakhte hain.
Unki company Enterprise Architecture aur business digitization mein madad karti hai.
User agar business ke baare mein puche, toh unhe batayein ki hum enterprise solutions provide karte hain jo business ko upgrade karte hain.`,
      seo: { title: 'Ahmed Al Rashidi | Tech Entrepreneur Dubai', desc: 'Connect with Ahmed Al Rashidi, CEO of Al Rashidi Intl Corp. Digital transformation and IT consulting in the UAE.', keywords: 'ahmed al rashidi, it consulting dubai, digital transformation uae' }
    },
    { 
      id: 'DBC000000098', 
      slug: 'sara-khan',
      name: 'Sara Khan', 
      title: 'Brand Director', 
      company: 'Luxe Media Group', 
      plan: 'Premium', 
      status: 'Active', 
      views: 2341, 
      franchise: 'Abu Dhabi', 
      email: 'sara@example.com', 
      phone: '+971 55 987 6543', 
      website: 'www.luxemedia.ae', 
      avatar: 'SK', 
      expiry: '2025-06-12', 
      bio: 'Award-winning creative director specializing in luxury brands, hospitality, and high-end retail across the Middle East.', 
      socials: { linkedin: 'sarakhan', instagram: 'sara.creative' }, 
      services: [{ name: 'Brand Identity', desc: 'Full brand guideline & logo', price: 'AED 15,000' }], 
      meetingUrl: 'https://calendly.com/sarakhan',
      bankAccounts: [{ country: 'UAE', bankName: 'ADCB', accountName: 'Sara Khan', accountNumber: '987654321', iban: 'AE890260000000987654321', swift: 'ADCBAEAA' }],
      address: 'Yas Island, Abu Dhabi',
      mapLink: 'https://maps.google.com/?q=Yas+Island',
      seo: { title: 'Sara Khan | Brand Director Abu Dhabi', desc: 'Creative director specializing in luxury brands and identity.', keywords: 'sara khan, brand director, luxury branding uae' }
    },
    { id: 'DBC000000201', slug: 'mohammed-yusuf', name: 'Mohammed Yusuf', title: 'Software Engineer', company: 'TechNova Solutions', plan: 'Standard', status: 'Trial', views: 89, franchise: '', email: 'm.yusuf@example.com', phone: '+971 52 345 6789', website: 'www.technova.ae', avatar: 'MY', expiry: 'Trial', bio: 'Full-stack developer building scalable cloud solutions and modern web applications.', socials: { linkedin: 'mohammed-yusuf', github: 'myusuf-dev' }, services: [], seo: { title: '', desc: '', keywords: '' } },
    { id: 'DBC000000305', slug: 'omar-farooq', name: 'Omar Farooq', title: 'Managing Director', company: 'Farooq Capital', plan: 'Business Pro', status: 'Active', views: 8920, franchise: 'Dubai Main', email: 'omar@farooqcap.ae', phone: '+971 50 999 8888', website: 'www.farooqcap.ae', avatar: 'OF', expiry: '2026-01-01', bio: 'Strategic investor focusing on real estate and early-stage tech startups in the MENA region.', socials: { linkedin: 'omar-farooq' }, services: [{ name: 'Startup Pitch Review', desc: '1-on-1 virtual pitch review', price: 'AED 1000/hr' }], meetingUrl: 'https://calendly.com/omar-farooq', seo: { title: 'Omar Farooq | Managing Director Farooq Capital', desc: 'Strategic investor focusing on early-stage tech in MENA.', keywords: 'omar farooq, farooq capital, startup investor dubai' } }
  ]);
  
  const [orders, setOrders] = useState([
    { id: 'DBC-ORD-20240089', customer: 'Rania Malik', items: 2, total: 450, status: 'Delivered', date: 'Apr 6' },
    { id: 'DBC-ORD-20240090', customer: 'Khalid Ibrahim', items: 1, total: 220, status: 'Shipped', date: 'Apr 6' }
  ]);

  const [products, setProducts] = useState([
    { id: 'SKU-001', name: 'NFC Business Card — Gold', category: 'NFC Cards', price: 200, stock: 82, status: 'Active', icon: '💳', desc: 'Premium gold finish NFC business card. Tap to share your profile.' },
    { id: 'SKU-002', name: 'NFC Sticker Pack (5pcs)', category: 'Stickers', price: 100, stock: 8, status: 'Active', icon: '📌', desc: 'Versatile NFC stickers. Stick them on phones, laptops, or desks.' },
    { id: 'SKU-003', name: 'Premium Metal Card', category: 'NFC Cards', price: 450, stock: 0, status: 'Out of Stock', icon: '🎩', desc: 'Ultra-durable metal NFC card for executives.' },
    { id: 'SKU-004', name: 'Leather Card Holder', category: 'Accessories', price: 150, stock: 30, status: 'Active', icon: '👜', desc: 'Genuine leather card holder that blocks RFID but allows NFC.' },
    { id: 'SKU-005', name: 'Starter Bundle — Card + Holder', category: 'Bundles', price: 320, stock: 15, status: 'Active', icon: '🎁', desc: 'Get started with our premium card and leather holder.' }
  ]);

  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([
    { id: 'A1', type: 'Home', address: '123 Sheikh Zayed Rd, Dubai, UAE', isDefault: true }
  ]);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Digital Business Card',
    currency: 'AED',
    seoTitle: 'DBC - Digital Business Card',
    seoDesc: 'Create your digital business card and start networking smarter.',
    seoKeywords: 'nfc card, digital business card, networking'
  });

  const [walletBalance, setWalletBalance] = useState(340);
  const [stats, setStats] = useState({ totalViews: 98450, shopRevenue: 42800 });

  return (
    <AppContext.Provider value={{
      user, authLoading, 
      profiles, setProfiles, orders, setOrders, products, setProducts, 
      walletBalance, setWalletBalance, stats, setStats,
      cart, setCart, wishlist, setWishlist, userOrders, setUserOrders,
      addresses, setAddresses, siteSettings, setSiteSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
