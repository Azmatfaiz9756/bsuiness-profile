import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-slate-800">
      <Helmet>
        <title>Terms & Conditions - VIBE Digital Connect</title>
        <meta name="description" content="Terms and Conditions of use for our Premium Digital Business Card platform." />
      </Helmet>
      
      <h1 className="text-4xl font-black mb-8 text-slate-900">Terms & Conditions</h1>
      <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">1. Acceptance of Terms</h2>
          <p>By accessing and using our platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">2. Description of Service</h2>
          <p>We provide a platform for creating, hosting, and managing premium digital business cards. Features and services may be updated, modified, or removed at our discretion.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">3. User Conduct</h2>
          <p>You agree to use our services responsibly and legally. You must not:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the service for any illegal purpose.</li>
            <li>Post or transmit any material that is offensive, defamatory, or infringes on the rights of others.</li>
            <li>Attempt to hack, destabilize, or adapt our platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">4. Subscriptions and Payments</h2>
          <p>Certain features may require a paid subscription. All billing is handled securely. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the site. Refund policies are outlined separately on the billing page.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">5. Limitation of Liability</h2>
          <p>In no event shall we be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
        </section>
      </div>
    </div>
  );
}
