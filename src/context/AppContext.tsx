import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

export const AppContext = createContext<any>(null);

const SUPER_ADMINS = ['azmatfaiz9756@gmail.com', 'admin@example.com'];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('CRITICAL FIRESTORE ERROR: ', JSON.stringify(errInfo));
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [usersCount, setUsersCount] = useState(0);
  
  const [joinNotifications, setJoinNotifications] = useState<any[]>([]);

  useEffect(() => {
    const userEmail = user?.email?.toLowerCase() || '';
    if (user && SUPER_ADMINS.some(admin => admin.toLowerCase() === userEmail)) {
      const q = query(collection(db, 'join_notifications'), orderBy('createdAt', 'desc'), limit(20));
      const unsub = onSnapshot(q, (snapshot) => {
        setJoinNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'join_notifications'));

      // Also get total users count for admin
      import('firebase/firestore').then(({ getDocs, collection }) => {
        getDocs(collection(db, 'users'))
          .then(snap => setUsersCount(snap.size))
          .catch(err => handleFirestoreError(err, OperationType.LIST, 'users (count)'));
          
        getDocs(collection(db, 'profiles'))
          .then(snap => setProfilesCount(snap.size))
          .catch(err => handleFirestoreError(err, OperationType.LIST, 'profiles (count)'));
      });

      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    // Fetch active profiles for context
    import('firebase/firestore').then(({ limit, query, collection, where, onSnapshot }) => {
      const q = query(collection(db, 'profiles'), where('status', '==', 'Active'), limit(24));
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProfiles(items);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'profiles (active)'));
      return unsub;
    });
  }, []);
  
  const [orders, setOrders] = useState([
    { id: 'DBC-ORD-20240089', customer: 'Rania Malik', items: 2, total: 450, status: 'Delivered', date: 'Apr 6' },
    { id: 'DBC-ORD-20240090', customer: 'Khalid Ibrahim', items: 1, total: 220, status: 'Shipped', date: 'Apr 6' }
  ]);

  const [products, setProducts] = useState([
    { id: 'SKU-001', name: 'NFC Business Card — Gold', category: 'NFC Cards', type: 'Physical', price: 200, stock: 82, status: 'Active', icon: '💳', desc: 'Premium gold finish NFC business card. Tap to share your profile.', country: 'Global' },
    { id: 'SKU-002', name: 'NFC Sticker Pack (5pcs)', category: 'Stickers', type: 'Physical', price: 100, stock: 8, status: 'Active', icon: '📌', desc: 'Versatile NFC stickers. Stick them on phones, laptops, or desks.', country: 'Global' },
    { id: 'SKU-003', name: 'Premium Metal Card', category: 'NFC Cards', type: 'Physical', price: 450, stock: 0, status: 'Out of Stock', icon: '🎩', desc: 'Ultra-durable metal NFC card for executives.', country: 'Global' },
    { id: 'SKU-004', name: 'Leather Card Holder', category: 'Accessories', type: 'Physical', price: 150, stock: 30, status: 'Active', icon: '👜', desc: 'Genuine leather card holder that blocks RFID but allows NFC.', country: 'Global' },
    { id: 'SKU-005', name: 'Starter Bundle — Card + Holder', category: 'Bundles', type: 'Physical', price: 320, stock: 15, status: 'Active', icon: '🎁', desc: 'Get started with our premium card and leather holder.', country: 'Global' },
    { id: 'SKU-IND-1', name: 'India Exclusive NFC Wood Card', category: 'NFC Cards', type: 'Physical', price: 999, stock: 50, status: 'Active', icon: '🌲', desc: 'Handcrafted wooden NFC card exclusive to India.', country: 'India' },
    { id: 'SKU-UAE-1', name: 'UAE VIP Platinum Card', category: 'NFC Cards', type: 'Physical', price: 800, stock: 20, status: 'Active', icon: '👑', desc: 'Exclusive Platinum NFC card for UAE residents.', country: 'UAE' },
    { id: 'SKU-DIG-1', name: 'Digital Profile Pro - Annual', category: 'Digital Subscription', type: 'Digital', price: 199, stock: 9999, status: 'Active', icon: '🌐', desc: '1 year premium digital profile subscription with custom domain routing.', country: 'Global' },
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
    trialEnabled: false,
    trialPeriod: '1 Month',
    trialMonths: 1,
    trialPlans: ['Pro'],
    marqueeEnabled: false,
    marqueeText: '🔥 FLASH SALE: GET 50% OFF ON ALL NFC CARDS THIS WEEK! 🚀 REGISTER NOW TO CLAIM YOUR DIGITAL BUSINESS CARD! ✨',
    marqueeBgColor: '#2563eb',
    marqueeTextColor: '#ffffff',
    marqueeSpeed: 20,
    referralPurchaseWindow: 35,
    referrerReward: 50,
    refereeReward: 50,
    referralNormalUserReward: 1,
    referralProfileOwnerReward: 5,
    referralDirectCommission: 20,
    countryReferrals: {
      'Global': { currency: 'USD', normalUserReward: 1, profileOwnerReward: 5, directCommission: 20, welcomeBonus: 10 },
      'India': { currency: 'INR', normalUserReward: 50, profileOwnerReward: 250, directCommission: 1000, welcomeBonus: 500 },
      'UAE': { currency: 'AED', normalUserReward: 5, profileOwnerReward: 25, directCommission: 100, welcomeBonus: 50 }
    },
    countryPlans: {
      'Global': [
        { id: 'basic', name: 'Basic', price: 'Free', originalPrice: '', discount: 0, popular: false, badge: 'BASIC', features: ['Digital Profile Page', 'NFC Card Connectivity', '5 Business Services', 'Basic QR Code', 'Standard Support'] },
        { id: 'pro', name: 'Pro', price: '$19', originalPrice: '$38', discount: 50, popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot Integration', 'Lead Management System', 'Lead Capture Form', 'Referral Program', 'WhatsApp Integration', 'Digital Business Card', 'Appointment Booking', 'Advanced Analytics', 'Custom Branding'] },
        { id: 'premium', name: 'Premium', price: '$49', originalPrice: '$98', discount: 50, popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain Mapping', 'Custom Templates', 'E-commerce Shop', 'Analytics Dashboard', 'Premium Themes', 'SEO Tools', 'Team/Staff Management (2 Seats)', 'VIP Support', 'API Access'] },
        { id: 'enterprise', name: 'Enterprise', price: '$199', originalPrice: '$398', discount: 50, popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate White-labeling', 'Advanced Admin Dashboard', 'Custom Domain Link', 'Dedicated Account Manager', 'Custom Integrations', 'Bulk Export Tools', 'Priority Development', 'All Premium Features'] }
      ],
      'India': [
        { id: 'basic', name: 'Basic', price: 'Free', originalPrice: '', discount: 0, popular: false, badge: 'BASIC', features: ['Digital Profile Page', 'NFC Card Connectivity', '5 Business Services', 'Basic QR Code', 'Standard Support'] },
        { id: 'pro', name: 'Pro', price: '₹999', originalPrice: '₹1998', discount: 50, popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot Integration', 'Lead Management System', 'Lead Capture Form', 'Referral Program', 'WhatsApp Integration', 'Digital Business Card', 'Appointment Booking', 'Advanced Analytics', 'Custom Branding'] },
        { id: 'premium', name: 'Premium', price: '₹2499', originalPrice: '₹4998', discount: 50, popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain Mapping', 'Custom Templates', 'E-commerce Shop', 'Analytics Dashboard', 'Premium Themes', 'SEO Tools', 'Team/Staff Management (2 Seats)', 'VIP Support', 'API Access'] },
        { id: 'enterprise', name: 'Enterprise', price: '₹9999', originalPrice: '₹19998', discount: 50, popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate White-labeling', 'Advanced Admin Dashboard', 'Custom Domain Link', 'Dedicated Account Manager', 'Custom Integrations', 'Bulk Export Tools', 'Priority Development', 'All Premium Features'] }
      ],
      'UAE': [
        { id: 'basic', name: 'Basic', price: 'Free', originalPrice: '', discount: 0, popular: false, badge: 'BASIC', features: ['Digital Profile Page', 'NFC Card Connectivity', '5 Business Services', 'Basic QR Code', 'Standard Support'] },
        { id: 'pro', name: 'Pro', price: 'AED 69', originalPrice: 'AED 138', discount: 50, popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot Integration', 'Lead Management System', 'Lead Capture Form', 'Referral Program', 'WhatsApp Integration', 'Digital Business Card', 'Appointment Booking', 'Advanced Analytics', 'Custom Branding'] },
        { id: 'premium', name: 'Premium', price: 'AED 179', originalPrice: 'AED 358', discount: 50, popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain Mapping', 'Custom Templates', 'E-commerce Shop', 'Analytics Dashboard', 'Premium Themes', 'SEO Tools', 'Team/Staff Management (2 Seats)', 'VIP Support', 'API Access'] },
        { id: 'enterprise', name: 'Enterprise', price: 'AED 699', originalPrice: 'AED 1398', discount: 50, popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate White-labeling', 'Advanced Admin Dashboard', 'Custom Domain Link', 'Dedicated Account Manager', 'Custom Integrations', 'Bulk Export Tools', 'Priority Development', 'All Premium Features'] }
      ]
    },
    plans: [
      { id: 'basic', name: 'Basic', price: 'Free', originalPrice: '', discount: 0, popular: false, badge: 'BASIC', features: ['Digital Profile Page', 'NFC Card Connectivity', '5 Business Services', 'Basic QR Code', 'Standard Support'] },
      { id: 'pro', name: 'Pro', price: '$19', originalPrice: '$38', discount: 50, popular: true, badge: 'MOST POPULAR', features: ['Unlimited Services', 'AI Chatbot Integration', 'Lead Management System', 'Lead Capture Form', 'Referral Program', 'WhatsApp Integration', 'Digital Business Card', 'Appointment Booking', 'Advanced Analytics', 'Custom Branding'] },
      { id: 'premium', name: 'Premium', price: '$49', originalPrice: '$98', discount: 50, popular: false, badge: 'PREMIUM', features: ['Everything in Pro', 'External Booking Links', 'Custom Domain Mapping', 'Custom Templates', 'E-commerce Shop', 'Analytics Dashboard', 'Premium Themes', 'SEO Tools', 'Team/Staff Management (2 Seats)', 'VIP Support', 'API Access'] },
      { id: 'enterprise', name: 'Enterprise', price: '$199', originalPrice: '$398', discount: 50, popular: false, badge: 'ENTERPRISE', features: ['Team Management (10 Seats)', 'Corporate White-labeling', 'Advanced Admin Dashboard', 'Custom Domain Link', 'Dedicated Account Manager', 'Custom Integrations', 'Bulk Export Tools', 'Priority Development', 'All Premium Features'] }
    ],
    bannerColor: '#2563eb',
    trialHeadline: 'HURRY UP! GET 1 MONTH FREE TRIAL ON PRO VERSION',
    trialBtnText: 'CLAIM NOW',
    promotionSlides: [
      { id: 'trial', headline: 'HURRY UP! GET 1 MONTH FREE TRIAL ON PRO VERSION', btnText: 'CLAIM NOW', link: '/plans', color: '#2563eb' },
      { id: 'bonus', headline: 'WELCOME BONUS! JOIN NOW & GET 10 AED IN YOUR WALLET', btnText: 'JOIN NOW', link: '/', color: '#059669' }
    ]
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'system'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteSettings(prev => {
          const merged = { ...prev, ...data };
          
          if (data.countryPlans) {
            const newCountryPlans = { ...prev.countryPlans };
            Object.keys(data.countryPlans).forEach(country => {
              if (Array.isArray(data.countryPlans[country])) {
                newCountryPlans[country] = data.countryPlans[country].map((plan: any, idx: number) => {
                  const hardcodedPlan = (prev.countryPlans && prev.countryPlans[country]) ? prev.countryPlans[country][idx] : (prev.countryPlans && prev.countryPlans['Global'] ? prev.countryPlans['Global'][idx] : null);
                  if (hardcodedPlan && plan.features && (!plan.features.length || plan.features.length < 5) && hardcodedPlan.features?.length > 5) {
                    return { ...plan, features: hardcodedPlan.features };
                  }
                  return { ...plan, features: plan.features || [] };
                });
              }
            });
            merged.countryPlans = newCountryPlans;
          }
          
          if (data.plans && Array.isArray(data.plans)) {
            merged.plans = data.plans.map((plan: any, idx: number) => {
              const hardcodedPlan = prev.plans?.[idx];
              if (hardcodedPlan && plan.features && (!plan.features.length || plan.features.length < 5) && hardcodedPlan.features?.length > 5) {
                return { ...plan, features: hardcodedPlan.features };
              }
              return { ...plan, features: plan.features || [] };
            });
          }

          if (data.promotionSlides && !Array.isArray(data.promotionSlides)) {
            merged.promotionSlides = prev.promotionSlides;
          }

          if (data.trialPlans && !Array.isArray(data.trialPlans)) {
            merged.trialPlans = prev.trialPlans;
          }

          return merged;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/system');
    });
    return () => unsub();
  }, []);

  const [shopBanners, setShopBanners] = useState([
    { id: 1, title: 'Mega Sale on NFC Cards', desc: 'Up to 50% Off on all Premium Models', background: 'gradient', colorStart: '#2563eb', colorEnd: '#1e3a8a', imageUrl: '', imageType: 'icon', icon: '💳', font: 'sans', animation: 'spring' },
    { id: 2, title: 'New Arrival: Metal Cards', desc: 'Sleek, Durable, Unforgettable', background: 'gradient', colorStart: '#1e293b', colorEnd: '#000000', imageUrl: '', imageType: 'icon', icon: '🎩', font: 'serif', animation: 'fade' },
    { id: 3, title: 'Buy 1 Get 1 Free', desc: 'On all NFC Sticker Packs this week', background: 'gradient', colorStart: '#f59e0b', colorEnd: '#b45309', imageUrl: '', imageType: 'icon', icon: '📌', font: 'mono', animation: 'bounce' }
  ]);

  const [walletBalance, setWalletBalance] = useState(0);
  
  // Sync wallet balance with firestore
  useEffect(() => {
    if (user) {
      const unsubWallet = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists() && typeof docSnap.data().walletBalance === 'number') {
          setWalletBalance(docSnap.data().walletBalance);
        } else if (!docSnap.exists() && walletBalance > 0) {
           // write context balance
           import('firebase/firestore').then(({ setDoc }) => {
              setDoc(doc(db, 'users', user.uid), { walletBalance }, { merge: true });
           });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));
      return () => unsubWallet();
    } else {
      setWalletBalance(0);
    }
  }, [user]);

  const [stats, setStats] = useState({ totalViews: 98450, shopRevenue: 42800 });

  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('dbc_country') || 'UAE');

  useEffect(() => {
    const map: Record<string, string> = {
      'India': 'INR',
      'UAE': 'AED',
      'Global': 'USD'
    };
    setSiteSettings(prev => ({
      ...prev,
      currency: map[selectedCountry] || 'USD'
    }));
  }, [selectedCountry]);

  const [jobOpenings, setJobOpenings] = useState<any[]>([
    { id: 1, profileId: 'DBC000000042', title: 'Senior IT Consultant', description: 'Looking for a senior consultant with 5+ years experience.', requirements: 'B.Tech/MCA, 5+ yrs exp.', salary: 'AED 15,000 - 20,000/mo', type: 'Full-time', status: 'Open' }
  ]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      
      if (u) {
        // Fetch current user's profile
        onSnapshot(doc(db, 'profiles', u.uid), (snap) => {
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() });
          } else {
            setProfile(null);
          }
        });

        const userEmail = u.email?.toLowerCase() || '';
        const isAdmin = SUPER_ADMINS.some(admin => admin.toLowerCase() === userEmail);

        // Record join in Firestore for all methods (Gmail, Phone)
        import('firebase/firestore').then(async ({ doc, getDoc, setDoc, addDoc, collection, serverTimestamp }) => {
          const userDocRef = doc(db, 'users', u.uid);
          
          try {
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
              const initialData = {
                id: u.uid,
                email: u.email || '',
                phone: u.phoneNumber || '',
                displayName: u.displayName || u.phoneNumber || 'New User',
                name: u.displayName || u.phoneNumber || 'User',
                photoURL: u.photoURL || '',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                walletBalance: 0,
                totalEarned: 0,
                totalSpent: 0,
                plan: 'Free',
                role: 'Owner',
                isSuperAdmin: isAdmin
              };
              await setDoc(userDocRef, initialData);

              await addDoc(collection(db, 'join_notifications'), {
                userId: u.uid,
                userName: u.displayName || u.phoneNumber || 'New User',
                userEmail: u.email || u.phoneNumber || '',
                createdAt: serverTimestamp(),
                plan: 'Free'
              }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'join_notifications'));
              
              setUsersCount(prev => prev + 1);
            } else {
              const updateData = { 
                lastLogin: serverTimestamp(),
                // Sync email/phone if missing
                ...(u.email && !userDoc.data()?.email ? { email: u.email } : {}),
                ...(u.phoneNumber && !userDoc.data()?.phone ? { phone: u.phoneNumber } : {})
              };
              // Note: We don't update isSuperAdmin here to avoid permissions issues if user is not yet recognized as admin
              await setDoc(userDocRef, updateData, { merge: true });
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`);
          }
        });

        const hasGottenBonus = localStorage.getItem(`dbc_bonus_${u.uid}`);
        if (!hasGottenBonus) {
           // Find user's profile to check plan
           const userProfile = profiles.find((p: any) => p.ownerId === u.uid || p.userId === u.uid || p.email === u.email);
           
           if (userProfile?.plan === 'Enterprise' || userProfile?.plan === 'Enterprise Sub') {
             // Enterprise users don't get welcome bonus
             localStorage.setItem(`dbc_bonus_${u.uid}`, 'true'); // Mark as "processed"
             return;
           }

           const region = localStorage.getItem('dbc_country') || 'UAE';
           const config = siteSettings?.countryReferrals?.[region] || siteSettings?.countryReferrals?.['Global'];
           if (config && config.welcomeBonus) {
             setWalletBalance(prev => prev + Number(config.welcomeBonus));
             localStorage.setItem(`dbc_bonus_${u.uid}`, 'true');
             // No blocking alert for faster experience
           }
        }
      }
    });
    return () => unsub();
  }, [siteSettings, profiles]);

  return (
    <AppContext.Provider value={{
      user, authLoading, 
      isLoginModalOpen, setIsLoginModalOpen,
      profiles, setProfiles, profile, setProfile, orders, setOrders, products, setProducts, 
      walletBalance, setWalletBalance, stats, setStats,
      cart, setCart, wishlist, setWishlist, userOrders, setUserOrders,
      addresses, setAddresses, siteSettings, setSiteSettings,
      shopBanners, setShopBanners,
      jobOpenings, setJobOpenings,
      selectedCountry, setSelectedCountry,
      joinNotifications, usersCount, profilesCount, setProfilesCount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
