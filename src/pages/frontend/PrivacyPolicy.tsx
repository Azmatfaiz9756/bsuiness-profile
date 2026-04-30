import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-slate-800">
      <Helmet>
        <title>Privacy Policy - Premium Digital Business Cards</title>
        <meta name="description" content="Privacy Policy for our Premium Digital Business Card platform." />
      </Helmet>
      
      <h1 className="text-4xl font-black mb-8 text-slate-900">Privacy Policy</h1>
      <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">1. Introduction</h2>
          <p>Welcome to our platform ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">2. The Data We Collect About You</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, title.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> details necessary for processing payments.</li>
            <li><strong>Profile Data:</strong> info related to your digital business card profiles.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">3. How We Use Your Personal Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-slate-900">5. Your Legal Rights</h2>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data. You have the right to request access, correction, erasure, restriction, transfer, or to object to processing. To exercise any of these rights, please contact us.</p>
        </section>
      </div>
    </div>
  );
}
