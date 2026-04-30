import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from "express";
import path from "path";
import Stripe from "stripe";

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = 3000;
  
  app.use(express.json());

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
        success_url: `${req.protocol}://${req.get('host')}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}`,
        cancel_url: `${req.protocol}://${req.get('host')}/dashboard?payment_canceled=true`,
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
        success_url: `${req.protocol}://${req.get("host")}/wallet?payment_success=true&session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
        cancel_url: `${req.protocol}://${req.get("host")}/wallet?payment_canceled=true`,
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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/shop?shop_payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/shop?shop_payment_canceled=true`,
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

  // Google Gemini AI Endpoint
  app.post("/api/gemini/generateContent", async (req, res) => {
    try {
      // Dynamic import because @google/genai is only used for this endpoint
      const { GoogleGenAI } = await import("@google/genai");
      let clientApiKey = req.headers.authorization?.split(' ')[1];
      let apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      // Remove any surrounding quotes, background comments, and whitespace
      if (apiKey) {
        apiKey = apiKey.split('#')[0].replace(/^["']|["']$/g, '').trim();
      }
      
      if (!apiKey) {
        console.error("[Gemini] API Key is empty or missing in environment variables.");
        return res.status(500).json({ error: "Gemini API key not configured on server." });
      }

      console.log(`[Gemini] Using API Key starting with: ${apiKey.substring(0, 5)}...`);
      const ai = new GoogleGenAI({ apiKey });
      const { model, contents, config } = req.body;
      console.log(`[Gemini] GenerateContent called. Requested model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      // Return specific fields so client code correctly sees text and functionCalls
      res.json({
        text: response.text,
        functionCalls: response.functionCalls,
        candidates: response.candidates
      });
    } catch (error: any) {
      console.error("Gemini proxy error:", error);
      let errorMsg = error.message || "Failed to generate AI response";
      // Try to parse the JSON error from Google to make it cleaner
      try {
        if (errorMsg.includes('{') && errorMsg.includes('}')) {
          const jsonMatch = errorMsg.match(/\{.*\}/s);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error && parsed.error.message) {
              errorMsg = parsed.error.message;
            } else if (parsed.message) {
              errorMsg = parsed.message;
            }
          }
        }
      } catch (e) {
        // keep original if parsing fails
      }
      res.status(500).json({ error: errorMsg });
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
