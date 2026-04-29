import 'dotenv/config';
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
      if (process.env.STRIPE_SECRET_KEY) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2026-04-22.dahlia',
        });
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
