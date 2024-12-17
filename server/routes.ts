import type { Express } from "express";
import { createServer, type Server } from "http";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import createMemoryStore from "memorystore";
import { PublicKey } from "@solana/web3.js";
import { type SelectUser } from "@db/schema";

export function registerRoutes(app: Express): Server {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error("Discord OAuth credentials not configured");
  }

  // Set up session management
  const MemoryStore = createMemoryStore(session);
  app.use(session({
    secret: process.env.REPL_ID || "discord-solana-auth",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // 24h
    }),
    cookie: {
      secure: app.get("env") === "production"
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const callbackURL = process.env.REPLIT_DOMAINS ? 
    `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/discord/callback` :
    'http://localhost:5000/api/auth/discord/callback';

  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL,
    scope: ['identify']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.discord_id, profile.id))
        .limit(1);

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            discord_id: profile.id,
            discord_username: `${profile.username}#${profile.discriminator}`,
          })
          .returning();
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  // Discord auth routes
  app.get("/api/auth/discord", passport.authenticate("discord"));
  app.get("/api/auth/discord/callback",
    passport.authenticate("discord", { 
      failureRedirect: "/",
      successRedirect: "/connect-wallet"
    })
  );

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }
    res.json(req.user);
  });

  // Update Solana wallet address
  app.post("/api/wallet", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { address } = req.body;
    
    // Validate Solana address
    try {
      new PublicKey(address);
    } catch (err) {
      return res.status(400).send("Invalid Solana address");
    }

    try {
      const [updated] = await db
        .update(users)
        .set({ 
          solanaAddress: address,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id))
        .returning();

      res.json(updated);
    } catch (err) {
      res.status(500).send("Failed to update wallet address");
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}