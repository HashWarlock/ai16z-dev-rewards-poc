import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useGithubAuth } from "../hooks/use-github-auth";
import { validateSolanaAddress } from "../lib/validate-solana";

const walletSchema = z.object({
  address: z.string().refine(validateSolanaAddress, {
    message: "Invalid Solana wallet address"
  })
});

export default function ConnectWallet() {
  const { user, logout } = useGithubAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      address: user?.solanaAddress || ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your Solana wallet has been linked to your GitHub account."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  async function onSubmit(data: z.infer<typeof walletSchema>) {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data.address);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
              Connect Solana Wallet
            </h1>
            <Button variant="ghost" onClick={() => logout()}>Logout</Button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              GitHub Account: <span className="font-medium text-foreground">{user?.githubUsername}</span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solana Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Solana wallet address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Connecting...
                  </div>
                ) : 'Connect Wallet'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
