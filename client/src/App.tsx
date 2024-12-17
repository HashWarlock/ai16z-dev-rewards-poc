import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useGithubAuth } from "./hooks/use-github-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiGithub } from "react-icons/si";
import LinkDiscord from "./pages/LinkDiscord";
import Dashboard from "./pages/Dashboard";

function App() {
  const { user, isLoading } = useGithubAuth();

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
              Link GitHub to Discord
            </h1>
            <p className="text-muted-foreground mb-6">
              Connect your GitHub account to get started
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.location.href = "/api/auth/github"}
            >
              <SiGithub className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/link-discord" component={LinkDiscord} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={Dashboard} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
