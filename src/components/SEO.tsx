import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ 
  title = "Vibecard.ae | Professional Digital Business Cards", 
  description = "Elevate your professional presence with Vibecard.ae. Create your smart digital business card and network better in the UAE.", 
  keywords = "digital business card, networking UAE, smart business card, professional profile, NFC card Dubai",
  image = "/logo.png",
  url = "https://vibecard.ae",
  type = "website"
}: SEOProps) {
  const siteTitle = (title || "").includes("Vibecard.ae") ? (title || "") : `${title || "Vibecard.ae"} | Vibecard.ae`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
