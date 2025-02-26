import express from "express";
import cors from "cors";
import helmet from "helmet";
import { RateLimiterMemory } from "rate-limiter-flexible";
import Stripe from "stripe";
import sgMail from "@sendgrid/mail";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 1, // Per second
});

// Middleware
app.use(cors());
app.use(morgan());
app.use(helmet());
app.use(express.json());
app.use(express.static(join(__dirname, "../dist")));
app.use("/assets", express.static(join(__dirname, "../dist/assets")));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: "Too many requests" });
  }
});

// Payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // $99.00
      currency: "usd",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Email notification endpoint
app.post("/api/notify", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sgMail.send({
      to,
      from: "notifications@ipblocker.com",
      subject,
      text,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoints
app.get("/api/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const [users, websites, visits] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("websites").select("count"),
      supabase.from("visits").select("count"),
    ]);

    res.json({
      totalUsers: users.data.length,
      totalWebsites: websites.data[0].count,
      totalVisits: visits.data[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3013;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
