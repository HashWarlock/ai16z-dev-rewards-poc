import { TappdClient } from "@phala/dstack-sdk";
import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

export class SolanaService {
  private client: TappdClient;
  private connection: Connection;
  
  constructor() {
    try {
      // Initialize the TappdClient with required configuration for browser
      this.client = new TappdClient({
        endpoint: "https://api.phala.network/dstack",
      });
      
      // Using devnet for testing - change to mainnet-beta for production
      this.connection = new Connection("https://api.devnet.solana.com", "confirmed");
    } catch (error) {
      console.error("Failed to initialize Solana service:", error);
      throw new Error("Failed to initialize Solana connection");
    }
  }

  async deriveWallet(path: string, subject: string): Promise<Keypair> {
    try {
      const derivedKey = await this.client.deriveKey(path, subject);
      const uint8ArrayDerivedKey = derivedKey.asUint8Array();

      // Use Web Crypto API for hashing
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', uint8ArrayDerivedKey);
      const seedArray = new Uint8Array(hashBuffer);
      return Keypair.fromSeed(seedArray.slice(0, 32));
    } catch (error) {
      console.error("Failed to derive wallet:", error);
      throw new Error("Failed to generate Solana wallet");
    }
  }

  // Simulated contract interaction
  async updateGithubToWallet(
    keypair: Keypair,
    githubUsername: string,
    walletAddress: string
  ): Promise<string> {
    if (!githubUsername) {
      throw new Error("GitHub username is required");
    }

    try {
      // Validate wallet address
      const destinationPubkey = new PublicKey(walletAddress);
      
      // This is a simulation of the contract call
      // Replace with actual contract program ID and instruction
      const programId = new PublicKey("11111111111111111111111111111111");
      
      const instruction = SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: destinationPubkey,
        lamports: 0, // Just a simulation, no actual transfer
      });

      const transaction = new Transaction().add(instruction);
      
      // Get the latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = keypair.publicKey;
      
      // Sign and send transaction
      const signature = await this.connection.sendTransaction(transaction, [keypair]);
      
      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }
      
      return signature;
    } catch (error) {
      console.error("Failed to update Github to wallet mapping:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update wallet mapping");
    }
  }
}

export const solanaService = new SolanaService();
