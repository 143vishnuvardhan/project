import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cropsure.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS analysis_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    diseaseName TEXT,
    confidence TEXT,
    symptoms TEXT,
    treatment TEXT,
    fertilizerRecommendation TEXT,
    preventionTips TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    secret: "cropsure-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true if using https
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
      req.session.userId = info.lastInsertRowid as number;
      res.json({ success: true, user: { id: info.lastInsertRowid, email } });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.userId) {
      const user: any = db.prepare("SELECT id, email FROM users WHERE id = ?").get(req.session.userId);
      res.json({ user });
    } else {
      res.json({ user: null });
    }
  });

  // API Routes (Protected)
  app.get("/api/history", requireAuth, (req: any, res) => {
    const history = db.prepare("SELECT * FROM analysis_history WHERE userId = ? ORDER BY timestamp DESC LIMIT 20").all(req.session.userId);
    res.json(history.map((item: any) => ({
      ...item,
      symptoms: JSON.parse(item.symptoms),
      preventionTips: JSON.parse(item.preventionTips)
    })));
  });

  app.post("/api/history", requireAuth, (req: any, res) => {
    const { diseaseName, confidence, symptoms, treatment, fertilizerRecommendation, preventionTips } = req.body;
    const info = db.prepare(`
      INSERT INTO analysis_history 
      (userId, diseaseName, confidence, symptoms, treatment, fertilizerRecommendation, preventionTips) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.session.userId,
      diseaseName, 
      confidence, 
      JSON.stringify(symptoms), 
      treatment, 
      fertilizerRecommendation, 
      JSON.stringify(preventionTips)
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/history/:id", requireAuth, (req: any, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM analysis_history WHERE id = ? AND userId = ?").run(id, req.session.userId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
