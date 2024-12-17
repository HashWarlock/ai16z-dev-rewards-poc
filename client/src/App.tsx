import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import ConnectWallet from "./pages/ConnectWallet";
import { useDiscordAuth } from "./hooks/use-discord-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiDiscord } from "react-icons/si";

function App() {
  const { user, isLoading } = useDiscordAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
              Connect Discord to Solana
            </h1>
            <p className="text-muted-foreground mb-6">
              Link your Discord account with your Solana wallet address for tip.cc bot payouts
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.location.href = "/api/auth/discord"}
            >
              <SiDiscord className="mr-2 h-5 w-5" />
              Sign in with Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/connect-wallet" component={ConnectWallet} />
        <Route path="/" component={ConnectWallet} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
