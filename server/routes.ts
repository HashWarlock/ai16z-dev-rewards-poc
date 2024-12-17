import type { Express } from "express";
import { createServer, type Server } from "http";
import { users } from "@db/schema";
import { db } from "@db";
import { eq, and, or } from "drizzle-orm";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import createMemoryStore from "memorystore";
import { type SelectUser } from "@db/schema";

export function registerRoutes(app: Express): Server {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET ||
      !process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("OAuth credentials not configured");
  }

  // Set up session management
  const MemoryStore = createMemoryStore(session);
  app.use(session({
    secret: process.env.REPL_ID || "github-discord-auth",
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

  const baseUrl = process.env.REPLIT_DOMAINS ? 
    `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` :
    'http://localhost:5000';

  // GitHub Strategy
  passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${baseUrl}/api/auth/github/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this GitHub ID
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.github_id, profile.id))
        .limit(1);

      if (user) {
        return done(null, user);
      }

      // Create new user with GitHub details
      [user] = await db
        .insert(users)
        .values({
          github_id: profile.id,
          github_username: profile.username,
        })
        .returning();

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  // Discord Strategy
  passport.use('discord', new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${baseUrl}/api/auth/discord/callback`,
    scope: ['identify']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Discord ID
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.discord_id, profile.id))
        .limit(1);

      if (user) {
        return done(null, user);
      }

      // If user is authenticated with GitHub, link Discord account
      if (done.req?.user) {
        [user] = await db
          .update(users)
          .set({
            discord_id: profile.id,
            discord_username: `${profile.username}#${profile.discriminator}`,
            updated_at: new Date()
          })
          .where(eq(users.id, done.req.user.id))
          .returning();
        return done(null, user);
      }

      // Create new user with Discord details
      [user] = await db
        .insert(users)
        .values({
          discord_id: profile.id,
          discord_username: `${profile.username}#${profile.discriminator}`,
        })
        .returning();

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  // Auth routes
  app.get("/api/auth/github", passport.authenticate("github"));
  app.get("/api/auth/github/callback",
    passport.authenticate("github", { 
      failureRedirect: "/",
      successRedirect: "/link-discord"
    })
  );

  app.get("/api/auth/discord", passport.authenticate("discord"));
  app.get("/api/auth/discord/callback",
    passport.authenticate("discord", { 
      failureRedirect: "/",
      successRedirect: "/dashboard"
    })
  );

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }
    res.json(req.user);
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