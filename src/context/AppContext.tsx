import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
      slug: 'real-estate-pro',
      name: 'Azmat Faiz', 
      title: 'Luxury Real Estate Broker', 
      company: 'Dubai Premier Estates', 
      profession: 'Real Estate Agent',
      template: 'executive',
      plan: 'Enterprise', 
      status: 'Active', 
      featured: true,
      views: 12420, 
      franchise: 'Dubai Main', 
      email: 'azmatfaiz9756@gmail.com', 
      phone: '+971 50 111 2233', 
      website: 'www.dubaipremier.ae', 
      avatar: 'AF', 
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      expiry: '2027-04-06', 
      bio: 'Award-winning real estate broker specializing in luxury properties in Dubai. Helping investors find their perfect home or high-yield investment properties.', 
      socials: { linkedin: 'azmat-realestate', twitter: 'azmat_dxb', instagram: 'azmat_properties' }, 
      services: [
        { name: 'Property Consultation', desc: '1-on-1 virtual property consultation.', price: 'Free', priceType: 'Fixed' },
        { name: 'Luxury Villa Tour', desc: 'Guided tour of off-plan or ready villas.', price: 'Free', priceType: 'Fixed' }
      ],
      products: [],
      jobOpenings: [
        { title: 'Property Consultant (Commission Basis)', type: 'Full-time', location: 'Dubai, UAE', salary: 'Commission Only', description: 'Seeking aggressive property consultants to join our leading brokerage team.', link: '' }
      ],
      meetingUrl: 'https://calendly.com/azmat-realestate', 
      gallery: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ],
      propertyListings: [
        { id: 1, title: '5BR Luxury Villa in Palm Jumeirah', price: 'AED 25,000,000', location: 'Palm Jumeirah, Dubai', beds: 5, baths: 6, sqft: 7500, image: 'https://images.unsplash.com/photo-1613490908653-b0df91bdf1d0?auto=format&fit=crop&w=800&q=80' },
        { id: 2, title: 'Ultra-Modern Penthouse', price: 'AED 15,500,000', location: 'Downtown Dubai', beds: 4, baths: 5, sqft: 4200, image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80' }
      ],
      videos: [],
      bankAccounts: [{ country: 'UAE', bankName: 'Emirates NBD', accountName: 'Azmat Faiz', accountNumber: '123456789', iban: 'AE120260000000123456789', swift: 'EBNIAEAA' }],
      address: 'Business Bay, Dubai, UAE',
      mapLink: 'https://maps.google.com/?q=Business+Bay+Dubai',
      seo: { title: 'Azmat Faiz | Luxury Real Estate Broker Dubai', desc: 'Find your dream home with top real estate broker.', keywords: 'real estate dubai, luxury villas uae' }
    },
    { 
      id: 'DBC000000043', 
      slug: 'dr-sarah-medical',
      name: 'Dr. Sarah Ahmed', 
      title: 'Senior Cardiologist', 
      company: 'Dubai Health Clinic', 
      profession: 'Doctor',
      template: 'minimal',
      plan: 'Enterprise', 
      status: 'Active', 
      featured: true,
      views: 12420, 
      franchise: 'Dubai Main', 
      email: 'dr.sarah@example.com', 
      phone: '+971 50 111 2233', 
      website: 'www.drsarah.ae', 
      avatar: 'SA', 
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1551076805-e1869045e55b?auto=format&fit=crop&w=1200&q=80',
      expiry: '2027-04-06', 
      bio: 'Board-certified cardiologist with over 15 years of experience in diagnosing and treating cardiovascular diseases. Dedicated to patient-centered care and advanced heart health research.', 
      socials: { linkedin: 'drsarahahmed', twitter: 'drsarah_heart', youtube: 'HeartHealthDXB' }, 
      services: [
        { name: 'Initial Consultation', desc: 'Comprehensive heart checkup and ecg.', price: 'AED 800', priceType: 'Fixed' },
        { name: 'Follow-up Check', desc: 'Post-treatment consultation.', price: 'AED 400', priceType: 'Fixed' }
      ],
      products: [],
      jobOpenings: [
        { title: 'Registered Nurse', type: 'Full-time', location: 'Dubai, UAE', salary: 'AED 8,000 - 10,000', description: 'Seeking a compassionate registered nurse for the cardiology department.', link: '' }
      ],
      meetingUrl: 'https://calendly.com/dr-sarah-cardio', 
      gallery: ['https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'],
      videos: [],
      bankAccounts: [{ country: 'UAE', bankName: 'Emirates NBD', accountName: 'Dr Sarah Ahmed', accountNumber: '123456789', iban: 'AE120260000000123456789', swift: 'EBNIAEAA' }],
      address: 'Healthcare City, Dubai, UAE',
      mapLink: 'https://maps.google.com/?q=Dubai+Healthcare+City',
      seo: { title: 'Dr. Sarah Ahmed | Senior Cardiologist in Dubai', desc: 'Expert cardiology services in Dubai. Book a consultation.', keywords: 'cardiologist dubai, heart specialist uae, dr sarah ahmed' }
    },
    { 
      id: 'DBC000000098', 
      slug: 'sam-plumbing',
      name: 'Samir Plumber', 
      title: 'Master Plumber', 
      company: 'QuickFix Plumbing Services', 
      profession: 'Plumber',
      template: 'classic',
      plan: 'Pro', 
      status: 'Active', 
      featured: true,
      views: 8941, 
      franchise: 'Abu Dhabi', 
      email: 'service@quickfixplumbing.ae', 
      phone: '+971 55 999 8888', 
      website: 'www.quickfixplumbing.ae', 
      avatar: 'SP', 
      photoUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cb5b2b2?auto=format&fit=crop&w=1200&q=80',
      expiry: '2026-06-12', 
      bio: '24/7 reliable plumbing services across Abu Dhabi. From emergency leak repairs to complete bathroom pipe installations, we get the job done right the first time.', 
      socials: { facebook: 'quickfixplumbing', whatsapp: '971559998888' }, 
      services: [
        { name: 'Pipe Leak Repair', desc: 'Emergency fix for burst or leaking pipes.', price: 'AED 250', priceType: 'Hourly' },
        { name: 'Water Heater Installation', desc: 'Secure installation of new water heaters.', price: 'AED 600', priceType: 'Fixed' }
      ], 
      products: [],
      jobOpenings: [
        { title: 'Apprentice Plumber', type: 'Full-time', location: 'Abu Dhabi', salary: 'AED 3,000', description: 'Looking for a hard-working apprentice to learn trade skills on the job.', link: '' }
      ],
      meetingUrl: '',
      bankAccounts: [],
      address: 'Mussafah, Abu Dhabi',
      mapLink: 'https://maps.google.com/?q=Mussafah',
      seo: { title: 'QuickFix Plumbing Abu Dhabi', desc: '24/7 emergency plumbers in Abu Dhabi.', keywords: 'plumber abu dhabi, plumbing repair, water heater fix' }
    },
    { 
      id: 'DBC000000201', 
      slug: 'omar-legal', 
      name: 'Omar Al Fayed', 
      title: 'Managing Partner', 
      company: 'Al Fayed Legal Consultancies', 
      profession: 'Lawyer',
      template: 'executive',
      plan: 'Business Pro', 
      status: 'Active', 
      featured: true,
      views: 3180, 
      franchise: '', 
      email: 'omar@alfayedlaw.ae', 
      phone: '+971 52 444 5555', 
      website: 'www.alfayedlaw.ae', 
      avatar: 'OF', 
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80',
      expiry: '2028-01-01', 
      bio: 'Corporate lawyer with a focus on mergers, acquisitions, and commercial litigation in the UAE region. Protecting your business interests with unyielding precision.', 
      socials: { linkedin: 'omar-alfayed', twitter: 'alfayedlaw' }, 
      services: [
        { name: 'Corporate Structuring', desc: 'Setup and structuring of LLCs and Free Zone companies.', price: 'Custom', priceType: 'Call for Price' },
        { name: 'Contract Review', desc: 'Detailed commercial agreement review.', price: 'AED 1500', priceType: 'Fixed' }
      ], 
      products: [],
      jobOpenings: [
        { title: 'Junior Associate', type: 'Full-time', location: 'Dubai, UAE', salary: '', description: 'Must have UAE bar pass and 2 years corporate law experience.', link: '' }
      ],
      meetingUrl: 'https://calendly.com/omar-law',
      seo: { title: 'Omar Al Fayed | Corporate Lawyer UAE', desc: 'Expert corporate legal consultancies in the UAE.', keywords: 'lawyer dubai, UAE corporate law, litigation expert' } 
    },
    { 
      id: 'DBC000000305', 
      slug: 'tech-guru', 
      name: 'Elena Rostova', 
      title: 'CEO & Founder', 
      company: 'TechGuru Digital', 
      profession: 'Standard (Corporate)',
      template: 'classic',
      plan: 'Enterprise', 
      status: 'Active', 
      featured: false,
      views: 7420, 
      franchise: 'Dubai Main', 
      email: 'elena@techguru.ae', 
      phone: '+971 50 123 9999', 
      website: 'www.techguru.ae', 
      avatar: 'ER', 
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      expiry: '2026-01-01', 
      bio: 'Leading digital transformation agency specializing in AI and cloud solutions.', 
      socials: { linkedin: 'elena-rostova', github: 'elenar_dev' }, 
      services: [
        { name: 'Digital Strategy', desc: 'Complete enterprise overhaul.', price: 'AED 5000', priceType: 'Fixed' }
      ], 
      products: [
        { name: 'E-Book: Cloud Mastery', description: 'PDF guide for migrating enterprise architecture to the cloud.', price: 'AED 99', image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=400&q=80', link: '' },
        { name: '1 Hour Mentorship Video', description: 'Recorded session on managing agile teams.', price: 'AED 150', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', link: '' }
      ],
      jobOpenings: [],
      meetingUrl: 'https://calendly.com/elena', 
      seo: { title: 'Elena Rostova | TechGuru Digital', desc: 'Tech CEO and digital transformation specialist.', keywords: 'tech ceo dubai, digital transformation, cloud architecture' } 
    }
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
    seoKeywords: 'nfc card, digital business card, networking',
    trialPeriod: '1 Month',
    referralPurchaseWindow: 35,
    referrerReward: 50,
    refereeReward: 50,
    referralNormalUserReward: 1,
    referralProfileOwnerReward: 5,
    referralDirectCommission: 20,
    plans: [
      { id: 'basic', name: 'Basic', price: 'Free', popular: false, badge: 'BASIC' },
      { id: 'pro', name: 'Pro', price: '$19', popular: true, badge: 'MOST POPULAR' },
      { id: 'premium', name: 'Premium', price: '$49', popular: false, badge: 'PREMIUM' },
      { id: 'enterprise', name: 'Enterprise', price: '$199', popular: false, badge: 'ENTERPRISE' }
    ]
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'system'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => {
      console.error("Error fetching site settings:", error);
    });
    return () => unsub();
  }, []);

  const [shopBanners, setShopBanners] = useState([
    { id: 1, title: 'Mega Sale on NFC Cards', desc: 'Up to 50% Off on all Premium Models', background: 'gradient', colorStart: '#2563eb', colorEnd: '#1e3a8a', imageUrl: '', imageType: 'icon', icon: '💳', font: 'sans', animation: 'spring' },
    { id: 2, title: 'New Arrival: Metal Cards', desc: 'Sleek, Durable, Unforgettable', background: 'gradient', colorStart: '#1e293b', colorEnd: '#000000', imageUrl: '', imageType: 'icon', icon: '🎩', font: 'serif', animation: 'fade' },
    { id: 3, title: 'Buy 1 Get 1 Free', desc: 'On all NFC Sticker Packs this week', background: 'gradient', colorStart: '#f59e0b', colorEnd: '#b45309', imageUrl: '', imageType: 'icon', icon: '📌', font: 'mono', animation: 'bounce' }
  ]);

  const [walletBalance, setWalletBalance] = useState(340);
  const [stats, setStats] = useState({ totalViews: 98450, shopRevenue: 42800 });

  const [jobOpenings, setJobOpenings] = useState<any[]>([
    { id: 1, profileId: 'DBC000000042', title: 'Senior IT Consultant', description: 'Looking for a senior consultant with 5+ years experience.', requirements: 'B.Tech/MCA, 5+ yrs exp.', salary: 'AED 15,000 - 20,000/mo', type: 'Full-time', status: 'Open' }
  ]);

  return (
    <AppContext.Provider value={{
      user, authLoading, 
      isLoginModalOpen, setIsLoginModalOpen,
      profiles, setProfiles, orders, setOrders, products, setProducts, 
      walletBalance, setWalletBalance, stats, setStats,
      cart, setCart, wishlist, setWishlist, userOrders, setUserOrders,
      addresses, setAddresses, siteSettings, setSiteSettings,
      shopBanners, setShopBanners,
      jobOpenings, setJobOpenings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
