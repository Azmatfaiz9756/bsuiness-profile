import dotenv from 'dotenv';
dotenv.config({ override: true });
import { GoogleGenAI } from "@google/genai";
import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import Stripe from "stripe";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

// ... (rest of the imports if any)

// Initialize Firebase for server-side profile fetching
const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = parseInt(process.env.PORT || "3000", 10);
  
  app.use(compression());
  app.use(cors());

  // Static assets caching (1 year)
  app.use(express.static(path.join(process.cwd(), 'dist'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }));

  // Redirect www to non-www
  app.use((req, res, next) => {
    const host = req.get('x-forwarded-host') || req.get('host') || '';
    if (host.startsWith('www.')) {
      const nonWwwHost = host.slice(4);
      const protocol = req.get('x-forwarded-proto') || req.protocol;
      return res.redirect(301, `${protocol}://${nonWwwHost}${req.url}`);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global request logger to debug routing on custom domains
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API Request] ${req.method} ${req.path} - Host: ${req.get('host')} - Origin: ${req.get('origin')}`);
    }
    next();
  });

  // Stripe setup
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      // Trying common variations of stripe secret key
      const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY || process.env.stripe_secret_key || process.env.SK || process.env.sk || process.env.STRIPE_SK;
      if (secretKey) {
        stripeClient = new Stripe(secretKey, {
          apiVersion: '2025-02-24.acacia' as any, // latest API version
        });
        console.log("[Stripe] Successfully initialized Stripe client.");
      } else {
        console.warn("[Stripe] Stripe secret key NOT found in environment! Checked STRIPE_SECRET_KEY, SK, etc.");
        // Log available env keys that contain 'STRIPE' or 'SK' to help debug (without logging values)
        const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('stripe') || k.toLowerCase() === 'sk');
        console.warn("[Stripe] Found these matching env keys instead (if any):", envKeys);
      }
    }
    return stripeClient;
  }

  // Admin ENV settings update
  app.post("/api/admin/env", express.json({ limit: '50mb' }), async (req, res) => {
    try {
      const fs = await import('fs');
      const { STRIPE_SECRET_KEY, GEMINI_API_KEY } = req.body;
      
      let envVars: Record<string, string> = {};
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
          const [key, ...val] = line.split('=');
          if (key && val.length > 0) envVars[key.trim()] = val.join('=').trim();
        });
      }
      
      if (STRIPE_SECRET_KEY) {
        envVars['STRIPE_SECRET_KEY'] = `"${STRIPE_SECRET_KEY}"`;
        process.env.STRIPE_SECRET_KEY = STRIPE_SECRET_KEY;
        stripeClient = null; // force reload stripe client
      }
      if (GEMINI_API_KEY) {
        envVars['GEMINI_API_KEY'] = `"${GEMINI_API_KEY}"`;
        process.env.GEMINI_API_KEY = GEMINI_API_KEY;
        envVars['VITE_GEMINI_API_KEY'] = `"${GEMINI_API_KEY}"`;
        process.env.VITE_GEMINI_API_KEY = GEMINI_API_KEY;
      }

      const newEnvContent = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
      fs.writeFileSync(envPath, newEnvContent);
      console.log("[Admin] Updated server .env context.");
      
      res.json({ success: true, message: "Environment updated successfully!" });
    } catch (e: any) {
      console.error("[Admin API] Failed to update env", e);
      res.status(500).json({ error: e.message || "Failed to update env" });
    }
  });

  // CRM Proxy and Key Management
  const CRM_KEYS_FILE = path.resolve(process.cwd(), 'crm-keys.json');

  app.post("/api/crm/save", express.json({ limit: '50mb' }), async (req, res) => {
    try {
      const fs = await import('fs');
      const { profileId, crmProvider, zohoToken, zohoOrgId, crmEndpoint, crmSecret } = req.body;
      let keys: any = {};
      if (fs.existsSync(CRM_KEYS_FILE)) {
        keys = JSON.parse(fs.readFileSync(CRM_KEYS_FILE, 'utf8'));
      }
      keys[profileId] = { crmProvider, zohoToken, zohoOrgId, crmEndpoint, crmSecret };
      fs.writeFileSync(CRM_KEYS_FILE, JSON.stringify(keys, null, 2));
      res.json({ success: true });
    } catch (e: any) {
      console.error("Failed to save CRM keys", e);
      res.status(500).json({ error: "Failed to save CRM keys" });
    }
  });

  app.get("/api/crm/stock/:profileId", async (req, res) => {
    try {
      const fs = await import('fs');
      const { profileId } = req.params;
      if (!fs.existsSync(CRM_KEYS_FILE)) return res.json({ stock: "" });
      
      const keys = JSON.parse(fs.readFileSync(CRM_KEYS_FILE, 'utf8'));
      const profileKeys = keys[profileId];
      if (!profileKeys || !profileKeys.crmProvider) return res.json({ stock: "" });

      const { crmProvider, zohoToken, zohoOrgId, crmEndpoint, crmSecret } = profileKeys;
      let stockData = "";

      if (crmProvider === 'Zoho' && zohoToken && zohoOrgId) {
        const resp = await fetch(`https://inventory.zoho.com/api/v1/items?organization_id=${zohoOrgId}`, {
          headers: { 'Authorization': `Zoho-oauthtoken ${zohoToken}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          const items = data.items?.map((it: any) => `${it.name}: ${it.available_stock} in stock - ${it.rate}`).join('\n');
          stockData = items || 'No items found in Zoho.';
        }
      } else if ((crmProvider === 'Vyapar' || crmProvider === 'Tally') && crmEndpoint) {
        const resp = await fetch(crmEndpoint, {
          headers: { 'Authorization': `Bearer ${crmSecret || ''}` }
        });
        if (resp.ok) {
          stockData = await resp.text();
        }
      }
      res.json({ stock: stockData });
    } catch (e: any) {
      console.error("CRM proxy error", e);
      res.status(500).json({ error: "Failed to fetch stock from CRM" });
    }
  });

  // Create Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      const { planName, price, uid } = req.body;
      
      // Basic price parsing (assuming AED 100/mo format or just a number)
      let unitAmount = 0;
      if (price) {
        const matches = price.toString().match(/\d+/g);
        if (matches) {
          unitAmount = parseInt(matches.join('')) * 100; // Convert to cents/fils
        }
      }

      if (unitAmount <= 0) {
        return res.status(400).json({ error: "Invalid price" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'aed',
              product_data: {
                name: `DBC ${planName} Plan`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}`,
        cancel_url: `${baseUrl}/dashboard?payment_canceled=true`,
        metadata: {
          uid: uid,
          plan: planName
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment session" });
    }
  });

  // Create Wallet Dashboard Checkout Session
  app.post("/api/create-wallet-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      const { amount, uid } = req.body;

      if (!amount || amount < 10) {
        return res.status(400).json({ error: "Invalid top-up amount" });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "aed",
              product_data: {
                name: "Digital Wallet Top-up",
                description: `Adding ${amount} AED to user wallet`,
                images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=200"],
              },
              unit_amount: Math.round(amount * 100), // convert to smallest currency unit (cents/fils)
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/wallet?payment_success=true&session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
        cancel_url: `${baseUrl}/wallet?payment_canceled=true`,
        metadata: {
          uid: uid,
          type: "wallet_topup",
          amount: amount.toString()
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Wallet Stripe error:", error);
      res.status(500).json({ error: error.message || "Failed to create wallet payment session" });
    }
  });

  // Create Shop Checkout Session
  app.post("/api/create-shop-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      const { items, profileId, uid } = req.body;
      
      const lineItems = items.map((item: any) => {
        let unitAmount = 0;
        if (item.product.price) {
          const matches = item.product.price.toString().match(/\d+/g);
          if (matches) {
            unitAmount = parseInt(matches.join('')) * 100;
          }
        }
        return {
          price_data: {
            currency: 'aed',
            product_data: {
              name: item.product.name,
              description: item.product.description || undefined,
            },
            unit_amount: unitAmount > 0 ? unitAmount : 100, // fallback 1 AED
          },
          quantity: item.qty || 1,
        };
      });

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/shop?shop_payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/shop?shop_payment_canceled=true`,
        metadata: {
          uid: uid || 'guest',
          profileId: profileId
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Shop Error:", error);
      res.status(500).json({ error: error.message || "Failed to create shop payment session" });
    }
  });

  // Verify Checkout Session
  app.post("/api/verify-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe configuration missing" });
      }
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        res.json({ verified: true, session });
      } else {
        res.json({ verified: false, status: session.payment_status });
      }
    } catch (e: any) {
      console.error("Stripe verification failed", e);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Google Gemini AI Endpoint
  app.post(["/api/gemini/generateContent", "/api/gemini/generateContent/"], async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[Gemini Proxy][${requestId}] Handling request for ${req.path}`);
    
    try {
      let clientApiKey = req.headers.authorization?.split(' ')[1];
      if (clientApiKey) clientApiKey = clientApiKey.split('#')[0].replace(/^["']|["']$/g, '').trim();
      
      const serverKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split('#')[0].replace(/^["']|["']$/g, '').trim() : undefined;
      const viteKey = process.env.VITE_GEMINI_API_KEY ? process.env.VITE_GEMINI_API_KEY.split('#')[0].replace(/^["']|["']$/g, '').trim() : undefined;
      
      const isPlaceholder = (k?: string) => !k || k.includes('AIzaSy...') || k === 'MY_GEMINI_API_KEY';
      
      let apiKey = clientApiKey;
      if (isPlaceholder(apiKey)) apiKey = serverKey;
      if (isPlaceholder(apiKey)) apiKey = viteKey;
      
      if (!apiKey || isPlaceholder(apiKey)) {
        console.error(`[Gemini Proxy][${requestId}] No valid API Key found.`);
        return res.status(400).json({ error: "Gemini API key not configured on server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config, systemInstruction: topLevelSysInst, tools } = req.body;
      
      const systemInstruction = topLevelSysInst || config?.systemInstruction;
      const generationConfig = { ...config };
      if (generationConfig.systemInstruction) delete generationConfig.systemInstruction;

      const modelMapping: Record<string, string> = {
        'gemini-1.5-flash': 'gemini-3-flash-preview',
        'gemini-1.5-pro': 'gemini-3.1-pro-preview',
        'gemini-3-flash-preview': 'gemini-3-flash-preview',
        'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview'
      };
      
      let targetModelName = model || "gemini-3-flash-preview";
      if (modelMapping[targetModelName]) {
        targetModelName = modelMapping[targetModelName];
      }
      
      try {
        console.log(`[Gemini Proxy][${requestId}] Calling model: ${targetModelName}`);
        
        const response = await ai.models.generateContent({
          model: targetModelName,
          contents: contents,
          config: {
            ...generationConfig,
            systemInstruction: systemInstruction,
            maxOutputTokens: 2048,
            temperature: 0.2,
            tools: tools
          }
        });
        
        const responseText = response.text || "";
        const functionCalls = response.functionCalls || [];

        console.log(`[Gemini Proxy][${requestId}] Success. Text length: ${responseText.length}, FunctionCalls: ${functionCalls.length}`);
        return res.json({ 
          text: responseText,
          functionCalls: functionCalls,
          candidates: response.candidates || []
        });
      } catch (err: any) {
        console.warn(`[Gemini Proxy][${requestId}] Model ${targetModelName} failed: ${err.message}`);
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            ...generationConfig,
            systemInstruction: systemInstruction,
            maxOutputTokens: 2048,
            temperature: 0.2,
            tools: tools
          }
        });
        return res.json({ 
          text: fallbackResponse.text,
          functionCalls: fallbackResponse.functionCalls || []
        });
      }
    } catch (error: any) {
      console.error(`[Gemini Proxy][${requestId}] Error:`, error);
      // Clean up error message for frontend
      let msg = error.message || "AI Error";
      if (msg.includes("models/") && msg.includes("not found")) {
        msg = "Model not found or API key restricted. Falling back...";
      }
      res.status(500).json({ error: msg });
    }
  });

  // Email API setup
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, type, data } = req.body;
    
    // In a real production app, you would use actual SMTP credentials from process.env
    // For now, I'll log the email and provide a clear structure for real integration
    console.log(`[EMAIL SERVICE] Sending ${type} email to ${to}: ${subject}`);
    
    try {
      // Simulate real email sending logic
      // Note: In a real app, you would use nodemailer here with your SMTP keys
      
      let htmlContent = "";
      if (type === 'welcome') {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h1 style="color: #2563eb;">Welcome to DBC Network!</h1>
            <p>Aadaab ${data.name}!</p>
            <p>Your digital business profile is now live. You can now share your professional identity with the world.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Your Profile Link:</strong><br/>
              <a href="${data.profileUrl}">${data.profileUrl}</a>
            </div>
            <p>Tehzeeb aur tameez ke sath, business upgrade karein!</p>
          </div>
        `;
      } else if (type === 'ad') {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #2563eb;">Special Announcement</h2>
            <p>${data.message}</p>
            <a href="${data.ctaLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">Learn More</a>
          </div>
        `;
      }

      res.json({ success: true, message: `Email (${type}) simulated successfully to ${to}` });
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Stock Proxy for bypassing CORS/Google blocks
  app.get("/api/proxy/stock", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).send("URL required");

    try {
      console.log(`[Stock Proxy] Fetching: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv,text/plain,*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Upstream error: ${response.status}`);
      }
      
      const text = await response.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    } catch (e: any) {
      console.error(`[Stock Proxy] Error:`, e.message);
      res.status(500).send("Failed to fetch stock data");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true
    }));
    
    app.get('*', async (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      let html = fs.readFileSync(indexPath, 'utf8');
      
      const protocol = req.get('x-forwarded-proto') || req.protocol;
      const host = req.get('x-forwarded-host') || req.get('host') || 'vibecard.ae';
      const baseUrl = `${protocol}://${host}`;
      
      const urlPath = req.path;
      const isProfile = urlPath.startsWith('/profile/');
      
      let title = "Vibecard | Digital Business Card";
      let description = "Elevated networking via smart digital business cards. Check my digital business Vibecard.";
      let image = `${baseUrl}/logo.png`;
      
      if (isProfile) {
        try {
          const profileIdOrSlug = urlPath.split('/profile/')[1]?.split('/')[0];
          if (profileIdOrSlug) {
            let profileData: any = null;
            
            // 1. Try fetching by ID
            const profileDoc = await getDoc(doc(db, "profiles", profileIdOrSlug));
            if (profileDoc.exists()) {
              profileData = profileDoc.data();
            } else {
              // 2. Try fetching by slug
              const q = query(collection(db, "profiles"), where("slug", "==", profileIdOrSlug));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                profileData = querySnapshot.docs[0].data();
              }
            }
            
            if (profileData) {
              const name = profileData.name || "A Professional";
              const titleTag = profileData.title || profileData.position || "Digital Portfolio";
              const bio = profileData.bio || profileData.description || "Digital Connect professional profile.";
              
              title = `${name} | ${titleTag} - Vibecard`;
              description = `${bio.substring(0, 160)}${bio.length > 160 ? '...' : ''} Check my digital business Vibecard by Digital Connect.`;
              
              const rawImage = profileData.photoUrl || profileData.avatarUrl;
              image = rawImage ? (rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage}`) : `${baseUrl}/logo.png`;
            }
          }
        } catch (e) {
          console.error("Error fetching profile for meta tags:", e);
        }
      }
      
      // Replace placeholders
      html = html.replace(/<title>.*?<\/title>/g, `<title>${title}</title>`)
                 .replace(/<meta name="description" content=".*?" \/>/g, `<meta name="description" content="${description}" />`)
                 .replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${title}" />`)
                 .replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${description}" />`)
                 .replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${image}" />`)
                 .replace(/<meta name="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${title}" />`)
                 .replace(/<meta name="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${description}" />`)
                 .replace(/<meta name="twitter:image" content=".*?" \/>/g, `<meta name="twitter:image" content="${image}" />`);
      
      res.send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
