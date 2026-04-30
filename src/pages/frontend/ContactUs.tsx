import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const { siteSettings } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 text-slate-800">
      <Helmet>
        <title>Contact Us - {siteSettings?.siteName || 'Premium Digital Business Cards'}</title>
        <meta name="description" content="Get in touch with us for support, sales, or partnerships." />
      </Helmet>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">Get in Touch</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Have questions about our premium digital business cards? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-blue-600 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Email us</p>
                  <p className="text-blue-600 font-medium">{siteSettings?.contactEmail || 'support@digitalcards.ai'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-emerald-600 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Call us</p>
                  <p className="font-medium">{siteSettings?.contactPhone || '+1 (555) 123-4567'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-purple-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Visit us</p>
                  <p className="font-medium">{siteSettings?.contactAddress || '123 Innovation Drive, Tech City, 10010'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
              <input 
                required 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                required 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
              <textarea 
                required 
                rows={4} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
                placeholder="How can we help you?"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button 
              disabled={status !== 'idle'}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {status === 'idle' && <><Send size={18} /> Send Message</>}
              {status === 'submitting' && 'Sending...'}
              {status === 'success' && 'Message Sent!'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
