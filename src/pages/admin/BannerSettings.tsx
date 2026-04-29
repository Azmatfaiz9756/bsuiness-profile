import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Video, Type } from 'lucide-react';
import { motion } from 'motion/react';

export default function BannerSettings() {
  const { shopBanners, setShopBanners } = useAppContext();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const animations = ['none', 'fade', 'spring', 'bounce', 'slide'];
  const fonts = ['sans', 'serif', 'mono'];

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setEditForm({ ...banner });
  };

  const handleSave = () => {
    if (editingId) {
      setShopBanners(shopBanners.map((b: any) => b.id === editingId ? { ...editForm, id: editingId } : b));
      setEditingId(null);
    } else {
      const newBanner = { ...editForm, id: Date.now() };
      setShopBanners([...shopBanners, newBanner]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number) => {
    if(confirm('Delete banner?')) {
      setShopBanners(shopBanners.filter((b: any) => b.id !== id));
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      title: 'New Banner',
      desc: 'Description goes here',
      background: 'gradient',
      colorStart: '#3b82f6',
      colorEnd: '#1e3a8a',
      imageUrl: '',
      imageType: 'icon',
      icon: '✨',
      font: 'sans',
      animation: 'fade'
    });
  };

  const renderBannerPreview = (banner: any) => {
    const bgStyle = banner.background === 'gradient'
      ? { background: `linear-gradient(to right, ${banner.colorStart}, ${banner.colorEnd})` }
      : { backgroundImage: `url(${banner.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      
    const fontClass = banner.font === 'serif' ? 'font-serif' : banner.font === 'mono' ? 'font-mono' : 'font-sans';

    return (
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-md flex items-center justify-between p-6 md:p-8" style={bgStyle}>
        <div className={`z-10 mix-blend-plus-lighter text-white max-w-sm ${fontClass}`}>
          <h2 className="text-3xl md:text-4xl font-black mb-2">{banner.title}</h2>
          <p className="text-lg opacity-90">{banner.desc}</p>
        </div>
        <div className="z-10 text-[80px] drop-shadow-xl text-white">
          {banner.imageType === 'icon' ? banner.icon : (
            banner.imageType === 'image' && banner.imageUrl ? (
              <img src={banner.imageUrl} alt={banner.title} className="w-32 h-32 object-contain" />
            ) : null
          )}
        </div>
        {banner.background === 'image' && <div className="absolute inset-0 bg-black/40" />}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shop Banners</h1>
          <p className="text-sm text-slate-500">Manage storefront slider banners, animations, and typography</p>
        </div>
        <button onClick={startAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div className="space-y-8">
        {isAdding && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg mb-4">Add New Banner</h3>
            <BannerForm editForm={editForm} setEditForm={setEditForm} fonts={fonts} animations={animations} />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Save</button>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
               <h4 className="font-bold text-slate-500 mb-4 text-sm uppercase">Live Preview</h4>
               {renderBannerPreview(editForm)}
            </div>
          </div>
        )}

        {shopBanners.map((banner: any) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {editingId === banner.id ? (
              <div>
                <h3 className="font-bold text-lg mb-4">Edit Banner</h3>
                <BannerForm editForm={editForm} setEditForm={setEditForm} fonts={fonts} animations={animations} />
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Save Changes</button>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100">
                   <h4 className="font-bold text-slate-500 mb-4 text-sm uppercase">Live Preview</h4>
                   {renderBannerPreview(editForm)}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-slate-700">Banner #{banner.id}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </div>
                </div>
                {renderBannerPreview(banner)}
                <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                  <span>Type: {banner.background}</span>
                  <span>Anim: {banner.animation}</span>
                  <span>Font: {banner.font}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        {shopBanners.length === 0 && !isAdding && (
          <div className="text-center py-12 text-slate-500">No banners added. Click "Add Banner" to create one.</div>
        )}
      </div>
    </div>
  );
}

function BannerForm({ editForm, setEditForm, fonts, animations }: { editForm: any, setEditForm: any, fonts: string[], animations: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
        <input type="text" className="w-full border border-slate-300 rounded-lg p-2" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
        <input type="text" className="w-full border border-slate-300 rounded-lg p-2" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} />
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Background Type</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.background} onChange={e => setEditForm({...editForm, background: e.target.value})}>
          <option value="gradient">Gradient Colors</option>
          <option value="image">Image/GIF URL</option>
        </select>
      </div>

      {editForm.background === 'gradient' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Color Start</label>
            <div className="flex gap-2">
              <input type="color" className="w-10 h-10 p-1 bg-white border border-slate-200 rounded cursor-pointer" value={editForm.colorStart} onChange={e => setEditForm({...editForm, colorStart: e.target.value})} />
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm" value={editForm.colorStart} onChange={e => setEditForm({...editForm, colorStart: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Color End</label>
            <div className="flex gap-2">
              <input type="color" className="w-10 h-10 p-1 bg-white border border-slate-200 rounded cursor-pointer" value={editForm.colorEnd} onChange={e => setEditForm({...editForm, colorEnd: e.target.value})} />
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm" value={editForm.colorEnd} onChange={e => setEditForm({...editForm, colorEnd: e.target.value})} />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Background Image/GIF URL</label>
          <input type="text" className="w-full border border-slate-300 rounded-lg p-2" placeholder="https://..." value={editForm.imageUrl} onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} />
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Font Family</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.font} onChange={e => setEditForm({...editForm, font: e.target.value})}>
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Motion Animation</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.animation} onChange={e => setEditForm({...editForm, animation: e.target.value})}>
          {animations.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Overlay Image Type</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.imageType} onChange={e => setEditForm({...editForm, imageType: e.target.value})}>
          <option value="none">None</option>
          <option value="icon">Emoji Icon</option>
          <option value="image">Image/GIF URL</option>
        </select>
      </div>

      {editForm.imageType === 'icon' && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Emoji Icon</label>
          <input type="text" className="w-full border border-slate-300 rounded-lg p-2 text-2xl" maxLength={2} value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} />
        </div>
      )}
      
      {editForm.imageType === 'image' && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Overlay Image URL</label>
          <input type="text" className="w-full border border-slate-300 rounded-lg p-2" placeholder="https://..." value={editForm.imageUrl} onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} />
        </div>
      )}
    </div>
  );
}
