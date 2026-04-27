import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

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
