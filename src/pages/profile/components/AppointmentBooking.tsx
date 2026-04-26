import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AppointmentBooking({ profile }: { profile: any }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableTimes = ['10:00 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const bookAppointment = async () => {
    if (!date || !time || !name || !email) return alert('Please fill all fields');
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        profileId: profile.id,
        ownerId: profile.ownerId || null,
        date,
        time,
        customerName: name,
        customerEmail: email,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (e) {
      alert('Failed to book appointment.');
      console.error(e);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ background: '#ecfdf5', padding: 24, borderRadius: 16, textAlign: 'center', border: '1px solid #a7f3d0' }}>
        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px', color: '#065f46', fontSize: 18 }}>Appointment Confirmed</h3>
        <p style={{ margin: 0, color: '#047857', fontSize: 14 }}>Watch your email for the meeting link.</p>
        <button onClick={() => setSuccess(false)} style={{ marginTop: 16, padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Book Another</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 20, borderRadius: 16 }}>
       <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CalendarIcon size={18} color="#2563eb" /> Book an Appointment</div>
       
       <div style={{ marginBottom: 12 }}>
         <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Select Date</label>
         <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', boxSizing: 'border-box' }} min={new Date().toISOString().split('T')[0]} />
       </div>

       {date && (
         <div style={{ marginBottom: 16 }}>
           <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Select Time</label>
           <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
             {availableTimes.map(t => (
               <button 
                 key={t} onClick={() => setTime(t)}
                 style={{ padding: '8px 12px', background: time === t ? '#2563eb' : '#f3f4f6', color: time === t ? '#fff' : '#1e293b', border: `1px solid ${time === t ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
               >{t}</button>
             ))}
           </div>
         </div>
       )}

       <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12, boxSizing: 'border-box' }} />
       <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 16, boxSizing: 'border-box' }} />
       
       <button onClick={bookAppointment} disabled={loading} style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
         {loading ? 'Booking...' : 'Confirm Appointment'}
       </button>
    </div>
  );
}
