import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { Settings, X, Save, Edit3, Globe, Shield, Link as LinkIcon, Search } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminProfiles() {
  const { profiles: staticProfiles, setProfiles: setStaticProfiles } = useAppContext();
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editTab, setEditTab] = useState('seo');
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    const fetchDbProfiles = async () => {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isDb: true }));
        setDbProfiles(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDbProfiles();
  }, [editingProfile]);

  const allProfiles = useMemo(() => {
    const combined = [...staticProfiles];
    dbProfiles.forEach(dbp => {
      if (!combined.find(p => p.email === dbp.email || p.id === dbp.id)) {
        combined.push(dbp);
      }
    });
    return combined;
  }, [staticProfiles, dbProfiles]);

  const handleEditClick = (profile: any) => {
    setFormData({ ...profile, seo: profile.seo || { title: '', desc: '', keywords: '' } });
    setEditingProfile(profile);
    setEditTab('seo'); // Default to SEO tab per user request
  };

  const handleSave = async () => {
    try {
      if (formData.isDb) {
        // Save to Firebase
        const docRef = doc(db, 'profiles', formData.ownerId || formData.id);
        const dataToSave = { ...formData };
        delete dataToSave.isDb;
        await updateDoc(docRef, dataToSave);
      } else {
        // Save to Static
        setStaticProfiles(staticProfiles.map((p: any) => p.id === formData.id ? formData : p));
      }
      alert('Profile updated securely for optimal SEO ranking!');
      setEditingProfile(null);
    } catch(e) {
      console.error(e);
      alert('Failed to save profile. Ensure you have permissions.');
    }
  };

  const handleSeoChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{fontSize: 20, fontWeight: 800}}>Profile Management (Registered Users)</h2>
          <p style={{fontSize: 13, color: 'var(--text3)', marginTop: 4}}>Manage SEO and details for users who registered.</p>
        </div>
      </div>

      <div className="filters">
        <div className="search-bar" style={{width: 240}}>
           <span style={{color: 'var(--text3)'}}>🔍</span>
           <input type="text" placeholder="Search profiles..." />
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>DBC Code</th>
              <th>Slug / URL</th>
              <th>Plan</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allProfiles.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#ffffff'}}>
                      {p.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 600, color: 'var(--text)'}}>{p.name}</div>
                      <div style={{fontSize: 11, color: 'var(--text3)'}}>{p.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{color: 'var(--gold)', fontFamily: 'monospace', fontSize: 12}}>{p.id}</td>
                <td>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>/{p.slug || p.id.toLowerCase()}</span>
                </td>
                <td>
                     <span className={`badge ${p.plan === 'Business Pro' ? 'badge-gold' : p.plan === 'Premium' ? 'badge-blue' : 'badge-gray'}`}>
                       {p.plan}
                     </span>
                </td>
                <td>{p.views}</td>
                <td style={{display: 'flex', gap: 6}}>
                  <button onClick={() => handleEditClick(p)} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={14} /> Edit / SEO</button>
                  <Link to={`/profile/${p.slug || p.id}`} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> Live View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: '#fff', width: 700, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#111827' }}>Edit Profile: {editingProfile.name}</h3>
              <button onClick={() => setEditingProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
               <button onClick={() => setEditTab('basic')} style={{ padding: '12px 16px', background: editTab === 'basic' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'basic' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'basic' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Basic Info</button>
               <button onClick={() => setEditTab('contact')} style={{ padding: '12px 16px', background: editTab === 'contact' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'contact' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'contact' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Contact & Address</button>
               <button onClick={() => setEditTab('socials')} style={{ padding: '12px 16px', background: editTab === 'socials' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'socials' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'socials' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Socials</button>
               <button onClick={() => setEditTab('business')} style={{ padding: '12px 16px', background: editTab === 'business' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'business' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'business' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Business / Services</button>
               <button onClick={() => setEditTab('media')} style={{ padding: '12px 16px', background: editTab === 'media' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'media' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'media' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Media</button>
               <button onClick={() => setEditTab('bank')} style={{ padding: '12px 16px', background: editTab === 'bank' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'bank' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'bank' ? '#2563eb' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Bank Details</button>
               <button onClick={() => setEditTab('seo')} style={{ padding: '12px 16px', background: editTab === 'seo' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'seo' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'seo' ? '#2563eb' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Search size={16} /> SEO</button>
               <button onClick={() => setEditTab('domain')} style={{ padding: '12px 16px', background: editTab === 'domain' ? '#fff' : '#f9fafb', border: 'none', borderBottom: editTab === 'domain' ? '2px solid #2563eb' : '2px solid transparent', fontWeight: 600, color: editTab === 'domain' ? '#2563eb' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Globe size={16} /> Domain</button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
               {editTab === 'basic' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Full Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Job Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Company / Organization</label><input type="text" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                     <div>
                       <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Profession / Skill Theme</label>
                       <select value={formData.profession || ''} onChange={e => setFormData({...formData, profession: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, background: '#fff' }}>
                         <option value="">Standard (Corporate)</option>
                         <option value="Welder">Welder</option>
                         <option value="Doctor">Doctor / Medical</option>
                         <option value="Carpenter">Carpenter</option>
                         <option value="AC Technician">AC Technician</option>
                         <option value="Electrician">Electrician</option>
                         <option value="Plumber">Plumber</option>
                         <option value="Mechanic">Auto Mechanic</option>
                         <option value="Engineer">Engineer</option>
                         <option value="Lawyer">Lawyer / Legal</option>
                         <option value="Chef">Chef / Culinary</option>
                       </select>
                     </div>
                   </div>
                   <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Bio</label><textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit' }} /></div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Total Visits (Profile Views)</label><input type="number" value={formData.views || 0} onChange={e => setFormData({...formData, views: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Demo Followers (Adds to actual)</label><input type="number" value={formData.fakeFollowers || 0} onChange={e => setFormData({...formData, fakeFollowers: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                   </div>
                 </div>
               )}

               {editTab === 'contact' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Email Address</label><input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                     <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Phone Number</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                   </div>
                   <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Website URL</label><input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="https://..." /></div>
                   <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Physical Address</label><input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} /></div>
                   <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Google Maps Link</label><input type="text" value={formData.mapLink || ''} onChange={e => setFormData({...formData, mapLink: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="https://maps.google.com/?q=..." /></div>
                 </div>
               )}

               {editTab === 'socials' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'github'].map(network => (
                     <div key={network}>
                       <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151', textTransform: 'capitalize' }}>{network}</label>
                       <input type="text" value={formData.socials?.[network] || ''} onChange={e => setFormData({...formData, socials: {...(formData.socials || {}), [network]: e.target.value}})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder={`${network} username...`} />
                     </div>
                   ))}
                 </div>
               )}

               {editTab === 'business' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Meeting Link (Calendly, etc)</label><input type="text" value={formData.meetingUrl || ''} onChange={e => setFormData({...formData, meetingUrl: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="https://calendly.com/..." /></div>
                   <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 16 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                       <h4 style={{ margin: 0, fontSize: 14 }}>Services / Products</h4>
                       <button onClick={() => setFormData({...formData, services: [...(formData.services || []), { name: '', desc: '', price: '', priceType: 'Fixed' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Service</button>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       {(formData.services || []).map((service: any, index: number) => (
                         <div key={index} style={{ border: '1px solid #d1d5db', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                           <button onClick={() => {
                             const newServices = [...formData.services];
                             newServices.splice(index, 1);
                             setFormData({...formData, services: newServices});
                           }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                           <input type="text" placeholder="Service Name" value={service.name} onChange={e => { const s = [...formData.services]; s[index].name = e.target.value; setFormData({...formData, services: s}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                           <div style={{ display: 'flex', gap: 8 }}>
                             <select value={service.priceType || 'Fixed'} onChange={e => { const s = [...formData.services]; s[index].priceType = e.target.value; setFormData({...formData, services: s}); }} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4, width: '130px', background: '#fff' }}>
                               <option value="Fixed">Fixed Price</option>
                               <option value="Hourly">Hourly Rate</option>
                               <option value="Call for Price">Call for Price</option>
                               <option value="Custom">Custom</option>
                             </select>
                             {(!service.priceType || service.priceType === 'Fixed' || service.priceType === 'Hourly') && (
                               <input type="text" placeholder={service.priceType === 'Hourly' ? "Rate (e.g. AED 150/hr)" : "Price (e.g. AED 500)"} value={service.price} onChange={e => { const s = [...formData.services]; s[index].price = e.target.value; setFormData({...formData, services: s}); }} style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                             )}
                           </div>
                           <textarea placeholder="Description" value={service.desc} onChange={e => { const s = [...formData.services]; s[index].desc = e.target.value; setFormData({...formData, services: s}); }} rows={2} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4, fontFamily: 'inherit' }} />
                         </div>
                       ))}
                       {(!formData.services || formData.services.length === 0) && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20 }}>No services added yet.</div>}
                     </div>
                   </div>
                 </div>
               )}

               {editTab === 'media' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div>
                     <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Banner Video (Background)</label>
                     <input type="text" value={formData.bannerVideo || ''} onChange={e => setFormData({...formData, bannerVideo: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="URL to .mp4 file" />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Youtube Promo Videos</label>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {(formData.videos || []).map((v: string, index: number) => (
                         <div key={index} style={{ display: 'flex', gap: 8 }}>
                           <input type="text" value={v} onChange={e => { const vids = [...formData.videos]; vids[index] = e.target.value; setFormData({...formData, videos: vids}); }} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="Youtube Embed URL" />
                           <button onClick={() => { const vids = [...formData.videos]; vids.splice(index, 1); setFormData({...formData, videos: vids}); }} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
                         </div>
                       ))}
                       <button onClick={() => setFormData({...formData, videos: [...(formData.videos || []), '']})} style={{ padding: '10px', background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#4b5563' }}>+ Add Video Link</button>
                     </div>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Image Gallery Links</label>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {(formData.gallery || []).map((imgUrl: string, index: number) => (
                         <div key={index} style={{ display: 'flex', gap: 8 }}>
                           <input type="text" value={imgUrl} onChange={e => { const g = [...formData.gallery]; g[index] = e.target.value; setFormData({...formData, gallery: g}); }} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} placeholder="Image URL..." />
                           <button onClick={() => { const g = [...formData.gallery]; g.splice(index, 1); setFormData({...formData, gallery: g}); }} style={{ padding: '0 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Remove</button>
                         </div>
                       ))}
                       <button onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} style={{ padding: '10px', background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#4b5563' }}>+ Add Image Link</button>
                     </div>
                   </div>
                 </div>
               )}

               {editTab === 'bank' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                     <label style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>Bank Accounts</label>
                     <button onClick={() => setFormData({...formData, bankAccounts: [...(formData.bankAccounts || []), { country: 'UAE', bankName: '', accountName: '', accountNumber: '', iban: '', swift: '' }]})} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Account</button>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                     {(formData.bankAccounts || []).map((account: any, index: number) => (
                       <div key={index} style={{ border: '1px solid #d1d5db', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                         <button onClick={() => {
                           const accounts = [...formData.bankAccounts];
                           accounts.splice(index, 1);
                           setFormData({...formData, bankAccounts: accounts});
                         }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                         
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                           <input type="text" placeholder="Country (e.g. UAE)" value={account.country} onChange={e => { const a = [...formData.bankAccounts]; a[index].country = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                           <input type="text" placeholder="Bank Name" value={account.bankName} onChange={e => { const a = [...formData.bankAccounts]; a[index].bankName = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                         </div>
                         <input type="text" placeholder="Account Holder Name" value={account.accountName} onChange={e => { const a = [...formData.bankAccounts]; a[index].accountName = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                         
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                           <input type="text" placeholder="Account Number" value={account.accountNumber || ''} onChange={e => { const a = [...formData.bankAccounts]; a[index].accountNumber = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                           <input type="text" placeholder="IBAN" value={account.iban} onChange={e => { const a = [...formData.bankAccounts]; a[index].iban = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                         </div>
                         <input type="text" placeholder="SWIFT / BIC / Sort Code" value={account.swift} onChange={e => { const a = [...formData.bankAccounts]; a[index].swift = e.target.value; setFormData({...formData, bankAccounts: a}); }} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
                       </div>
                     ))}
                     {(!formData.bankAccounts || formData.bankAccounts.length === 0) && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20 }}>No bank accounts added yet.</div>}
                   </div>
                 </div>
               )}

               {editTab === 'seo' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, border: '1px solid #bfdbfe' }}>
                     <h4 style={{ margin: '0 0 8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Profile-Level SEO Configuration</h4>
                     <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', lineHeight: 1.5 }}>Customize how this specific business profile appears on Google, LinkedIn, and WhatsApp. Accurate keyword targeting directly improves their page ranking.</p>
                   </div>
                   
                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Meta Title (Google Title)</label>
                     <input type="text" placeholder="{Profile Name} | {Company Name}" value={formData.seo.title} onChange={e => handleSeoChange('title', e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }} />
                     <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                       <span>Keep under 60 characters for best display.</span>
                       <span style={{ color: (formData.seo.title?.length || 0) > 60 ? '#ef4444' : '#10b981' }}>{formData.seo.title?.length || 0}/60</span>
                     </div>
                   </div>

                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Meta Description</label>
                     <textarea placeholder="Write an engaging summary containing their main services..." value={formData.seo.desc} onChange={e => handleSeoChange('desc', e.target.value)} rows={3} style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit', fontSize: 15 }} />
                     <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                       <span>Appears below title in search results. Target 150-160 chars.</span>
                       <span style={{ color: (formData.seo.desc?.length || 0) > 160 ? '#ef4444' : '#10b981' }}>{formData.seo.desc?.length || 0}/160</span>
                     </div>
                   </div>

                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Target Keywords</label>
                     <input type="text" placeholder="e.g. real estate agent dubai, luxury properties, ahmed ali" value={formData.seo.keywords} onChange={e => handleSeoChange('keywords', e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }} />
                     <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Comma-separated keywords for local indexing.</div>
                   </div>
                 </div>
               )}

               {editTab === 'domain' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Custom Profile Slug</label>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                       <span style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRight: 'none', padding: '12px 16px', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, color: '#6b7280', fontWeight: 600 }}>dbc.ae/profile/</span>
                       <input type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} style={{ flex: 1, padding: 12, border: '1px solid #d1d5db', borderTopRightRadius: 8, borderBottomRightRadius: 8, fontSize: 15 }} />
                     </div>
                     <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>This creates a clean, readable URL which Google loves (e.g., dbc.ae/profile/ahmed-al-rashidi).</p>
                   </div>
                   
                   <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
                   
                   <div>
                     <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}><LinkIcon size={16} /> Custom Domain Mapping</label>
                     <input type="text" placeholder="e.g. www.ahmed-associates.com" value={formData.customDomain || ''} onChange={e => setFormData({...formData, customDomain: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }} />
                     <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Map a custom domain directly to this profile. Requires CNAME record pointing to proxy.dbc.ae.</p>
                   </div>
                 </div>
               )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f9fafb' }}>
               <button onClick={() => setEditingProfile(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
               <button onClick={handleSave} style={{ padding: '10px 20px', border: 'none', background: '#111827', color: '#fff', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><Save size={18} /> Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
