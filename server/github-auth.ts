import type { Express } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import createMemoryStore from "memorystore";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { Request } from "express";

declare global {
  namespace Express {
    interface User extends Record<string, any> {}
  }
}

export function setupGithubAuth(app: Express) {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth credentials not configured");
  }

  const MemoryStore = createMemoryStore(session);
  app.use(session({
    secret: process.env.REPL_ID || "github-solana-auth",
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
    `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/github/callback` :
    '/api/auth/github/callback';

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL,
    scope: ['identify'],
    passReqToCallback: true,
  }, async (req: Request, accessToken, refreshToken, profile, done) => {
    try {
      // Dynamically construct the full callback URL
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const fullCallbackURL = `${protocol}://${host}/api/auth/github/callback`;

      // Update the callback URL for this request
      const strategy = passport._strategies['github'] as GitHubStrategy;
      strategy._callbackURL = fullCallbackURL;

      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.githubId, profile.id))
        .limit(1);

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            githubId: profile.id,
            githubUsername: profile.username || '',
          })
          .returning();
      }

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  app.get("/api/auth/github", passport.authenticate("github", { scope: ["user"] }));

  app.get("/api/auth/github/callback",
    passport.authenticate("github", { 
      failureRedirect: "/",
      successRedirect: "/connect-wallet"
    })
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
}
