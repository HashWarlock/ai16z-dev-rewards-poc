import type { Express } from "express";
import { createServer, type Server } from "http";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { setupGithubAuth } from "./github-auth";
import { PublicKey } from "@solana/web3.js";

export function registerRoutes(app: Express): Server {
  setupGithubAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
