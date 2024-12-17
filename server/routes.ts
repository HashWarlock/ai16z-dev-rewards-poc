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

  // Use REPLIT_DOMAINS for OAuth callbacks as it contains the correct domain
  const baseUrl = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  // GitHub Strategy
  passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${baseUrl}/api/auth/github/callback`,
    scope: ['user']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.github_id, profile.id))
        .limit(1);

      const userData = {
        github_id: profile.id,
        github_username: profile.username,
        github_avatar_url: profile._json.avatar_url,
        github_created_at: new Date(profile._json.created_at)
      };

      if (user) {
        // Update existing user with latest GitHub info
        [user] = await db
          .update(users)
          .set(userData)
          .where(eq(users.id, user.id))
          .returning();
      } else {
        // Create new user
        [user] = await db
          .insert(users)
          .values(userData)
          .returning();
      }

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
    scope: ['identify'],
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const discordData = {
        discord_id: profile.id,
        discord_username: profile.username,
        discord_avatar_url: profile.avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
          : null,
        discord_created_at: new Date(Number(BigInt(profile.id) >> 22n) + 1420070400000),
        updated_at: new Date()
      };

      // If user is already logged in with GitHub, link the Discord account
      if (req.user) {
        const [updatedUser] = await db
          .update(users)
          .set(discordData)
          .where(eq(users.id, req.user.id))
          .returning();
        return done(null, updatedUser);
      }

      // Check if user exists with this Discord ID
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.discord_id, profile.id))
        .limit(1);

      if (user) {
        // Update existing user with latest Discord info
        [user] = await db
          .update(users)
          .set(discordData)
          .where(eq(users.id, user.id))
          .returning();
      } else {
        // Create new user
        [user] = await db
          .insert(users)
          .values(discordData)
          .returning();
      }

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
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to clear session" });
        }
        res.json({ success: true });
      });
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