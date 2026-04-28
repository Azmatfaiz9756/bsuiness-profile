import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { Download, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profiles } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsSnap, aptsSnap] = await Promise.all([
          getDocs(collection(db, 'leads')),
          getDocs(collection(db, 'appointments'))
        ]);
        setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAppointments(aptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProfileName = (profileId: string) => {
    return profiles.find((p: any) => p.id === profileId)?.name || profileId;
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Profile Owner,Name,Email,Phone,Date/Time,Message/Details\n";
    
    leads.forEach(l => {
      const row = [
        "Lead Submission",
        `"${getProfileName(l.profileId)}"`,
        `"${l.name || ''}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleString() : ''}"`,
        `"${l.message || ''}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    appointments.forEach(a => {
      const row = [
        "Appointment",
        `"${getProfileName(a.profileId)}"`,
        `"${a.name || ''}"`,
        `"${a.email || ''}"`,
        `"${a.phone || ''}"`,
        `"${a.date} ${a.time}"`,
        `"${a.notes || ''}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `All_Leads_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div className="p-8">Loading leads data...</div>;

  const combined = [
    ...leads.map(l => ({ ...l, type: 'Lead' })),
    ...appointments.map(a => ({ ...a, type: 'Appointment' }))
  ].sort((a,b) => {
    const d1 = a.createdAt?.seconds || Date.now();
    const d2 = b.createdAt?.seconds || Date.now();
    return d2 - d1;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Global Leads & Contacts</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>All contacts gathered across all profiles in the system.</p>
        </div>
        <div>
          <button onClick={exportToCSV} className="topbar-btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={16} /> Export to Excel / CSV
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">TOTAL CONTACTS</div>
          <div className="stat-value">{combined.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">LEAD SUBMISSIONS</div>
          <div className="stat-value">{leads.length}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">APPOINTMENTS</div>
          <div className="stat-value">{appointments.length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>PROFILE OWNER</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>CONTACT NAME</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>CONTACT DETAILS</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: 12, fontWeight: 600 }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {combined.slice(0, 100).map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px' }}>
                     <span style={{ 
                       padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                       background: item.type === 'Appointment' ? '#eff6ff' : '#f0fdf4',
                       color: item.type === 'Appointment' ? '#1d4ed8' : '#15803d'
                     }}>
                       {item.type}
                     </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, fontWeight: 600 }}>{getProfileName(item.profileId)}</td>
                  <td style={{ padding: '16px', fontSize: 14, color: '#334155' }}>{item.name}</td>
                  <td style={{ padding: '16px', fontSize: 13, color: '#64748b' }}>
                    <div>{item.email}</div>
                    <div>{item.phone}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: 13, color: '#64748b', maxWidth: 200, WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.message || item.notes || (item.date ? `${item.date} ${item.time}` : '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {combined.length > 100 && <div style={{ padding: 12, textAlign: 'center', fontSize: 13, color: '#64748b' }}>Showing only latest 100 entries. Export to view all.</div>}
        </div>
      </div>
    </>
  );
}
