import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Plus, Search, Trash2, ExternalLink, QrCode, Download, Link as LinkIcon, Save, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';

const AdminCards: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardSerial, setNewCardSerial] = useState('');
  const [editingCard, setEditingCard] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchCards();
    fetchProfiles();
  }, []);

  const fetchCards = async () => {
    try {
      const q = query(collection(db, 'cards'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const cardList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(cardList);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const q = query(collection(db, 'profiles'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const profileList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setProfiles(profileList);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleAddCard = async () => {
    if (!newCardSerial) return toast.error('Please enter a serial number');
    
    // Check if serial already exists
    const existing = cards.find(c => c.serial === newCardSerial);
    if (existing) return toast.error('Serial number already exists');

    try {
      const baseUrl = window.location.origin;
      const dynamicUrl = `${baseUrl}/q/${newCardSerial}`;
      
      await addDoc(collection(db, 'cards'), {
        serial: newCardSerial,
        dynamicUrl,
        status: 'Stock',
        createdAt: serverTimestamp(),
        profileId: null
      });

      toast.success('Card added to stock');
      setNewCardSerial('');
      setShowAddModal(false);
      fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    }
  };

  const handleUpdateLink = async (cardId: string, profileId: string) => {
    try {
      await updateDoc(doc(db, 'cards', cardId), {
        profileId: profileId,
        status: profileId ? 'Active' : 'Stock',
        updatedAt: serverTimestamp()
      });
      toast.success('Linked successfully');
      fetchCards();
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update link');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await deleteDoc(doc(db, 'cards', id));
      toast.success('Card deleted');
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete');
    }
  };

  const generateBulk = async () => {
    const count = parseInt(prompt('How many cards to generate?', '10') || '0');
    if (count <= 0) return;
    
    setLoading(true);
    try {
      const prefix = 'VIBE' + Math.random().toString(36).substring(7).toUpperCase();
      for(let i=1; i<=count; i++) {
        const serial = `${prefix}-${i.toString().padStart(3, '0')}`;
        const baseUrl = window.location.origin;
        await addDoc(collection(db, 'cards'), {
          serial,
          dynamicUrl: `${baseUrl}/q/${serial}`,
          status: 'Stock',
          createdAt: serverTimestamp(),
          profileId: null
        });
      }
      toast.success(`Generated ${count} cards`);
      fetchCards();
    } catch (error) {
      toast.error('Bulk generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (serial: string) => {
    const svg = document.getElementById(`qr-${serial}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const logoImg = new Image();
    
    const triggerDownload = () => {
      if (!ctx) return;
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${serial}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.onload = () => {
      const qrSize = img.width;
      const padding = 60;
      canvas.width = qrSize + (padding * 2);
      canvas.height = qrSize + 160;
      
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
        
        ctx.fillStyle = "black";
        ctx.font = "bold 28px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`SERIAL: ${serial}`, canvas.width / 2, canvas.height - 40);
        
        ctx.font = "500 16px Inter, Arial, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("VIBE DIGITAL CONNECT", canvas.width / 2, padding / 2 + 10);
        
        triggerDownload();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const filteredCards = cards.filter(c => 
    c.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.profileId && c.profileId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>NFC Card Inventory</h1>
          <p style={{ color: '#64748b' }}>Generate dynamic QR codes and link them to user profiles later.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={generateBulk}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
          >
            <RefreshCw size={18} /> Bulk Generate
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus size={20} /> Add Card
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input 
            type="text"
            placeholder="Search serial or profile ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '14px 48px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
          />
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th className="pb-4 pt-2 font-bold text-slate-500 uppercase text-xs tracking-wider px-4">Serial / QR</th>
                <th className="pb-4 pt-2 font-bold text-slate-500 uppercase text-xs tracking-wider px-4">Dynamic Link</th>
                <th className="pb-4 pt-2 font-bold text-slate-500 uppercase text-xs tracking-wider px-4">Assigned Profile</th>
                <th className="pb-4 pt-2 font-bold text-slate-500 uppercase text-xs tracking-wider px-4">Status</th>
                <th className="pb-4 pt-2 font-bold text-slate-500 uppercase text-xs tracking-wider px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm relative group">
                        <div className="relative">
                          <QRCode 
                            id={`qr-${card.serial}`}
                            value={card.dynamicUrl} 
                            size={60}
                            level="H"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{card.serial}</div>
                        <div className="text-[10px] text-slate-400 font-mono">PRINT READY</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline cursor-pointer" onClick={() => window.open(card.dynamicUrl, '_blank')}>
                      <LinkIcon size={14} /> /q/{card.serial}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <select 
                      value={card.profileId || ''}
                      onChange={(e) => handleUpdateLink(card.id, e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                    >
                      <option value="">-- Assign Profile --</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      card.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      card.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {card.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => downloadQR(card.serial)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download for Print"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-black mb-2">Add New Card</h2>
            <p className="text-slate-500 mb-6 font-medium">Create a new unique serial for an NFC card.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Serial Number</label>
                <input 
                  type="text"
                  placeholder="e.g. VIBE-001"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all text-lg font-bold"
                  value={newCardSerial}
                  onChange={(e) => setNewCardSerial(e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCard}
                  className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-100 transition-all"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCards;
