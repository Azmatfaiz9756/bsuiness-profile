import React from 'react';
import { Globe, Server, CheckCircle, Info, ExternalLink } from 'lucide-react';

export default function AdminDNSHelp() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>Custom Domain Configuration</h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>Guide for mapping custom domains to business profiles (e.g., www.ahmed-associates.com -&gt; dbc.ae/profile/ahmed).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe color="#2563eb" size={20} /> How It Works
          </h3>
          <p style={{ color: '#4b5563', lineHeight: 1.6, margin: '0 0 16px' }}>
            To allow a user to use their own domain name (like <strong>www.their-company.com</strong>) instead of the default DBC profile URL, they need to update the DNS records at their domain registrar (GoDaddy, Namecheap, Cloudflare, etc.). Once the DNS is configured, the DBC platform will recognize the domain and load their specific profile automatically.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server color="#475569" size={18} /> Step 1: DNS Record Setup (For the User)
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#4b5563', margin: '0 0 16px' }}>Provide these instructions to the business owner or their IT department:</p>
            
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', fontSize: 13 }}>Record Type</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', fontSize: 13 }}>Host / Name</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', fontSize: 13 }}>Value / Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 14 }}>CNAME</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 14, fontFamily: 'monospace' }}>www</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 14, fontFamily: 'monospace' }}>proxy.dbc.ae</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>A Record</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontFamily: 'monospace' }}>@ (Root)</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontFamily: 'monospace' }}>76.76.21.21 <span style={{ color: '#6b7280', fontSize: 12 }}>(Example IP)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 12, background: '#eff6ff', padding: 16, borderRadius: 8, color: '#1e40af' }}>
              <Info size={20} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                <strong>Note:</strong> DNS propagation can take anywhere from 15 minutes to 48 hours. Using Cloudflare (Proxied) might require specific SSL configurations on your server (Full / Strict).
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle color="#10b981" size={18} /> Step 2: System Configuration (For the Admin)
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ color: '#4b5563', margin: '0 0 16px' }}>Inside the DBC Admin Panel, you must link the physical domain to the specific profile.</p>
            
            <ol style={{ paddingLeft: 20, margin: 0, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <li>Go to <strong>Profiles</strong> in the sidebar.</li>
              <li>Find the relevant business profile and click <strong>Edit / SEO</strong>.</li>
              <li>Navigate to the <strong>URL / Domain</strong> tab.</li>
              <li>In the "Custom Domain Mapping" field, enter the exact domain (e.g., <code>www.their-company.com</code>).</li>
              <li>Click <strong>Apply Changes</strong>.</li>
            </ol>

            <div style={{ marginTop: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>How the App Routes Custom Domains</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                The web server checks the <code>window.location.hostname</code>. If it doesn't match the main platform domain (e.g., <code>dbc.ae</code>), the application will look up the profile linked to that custom domain in the database and render it full-screen, hiding the main site navigation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
