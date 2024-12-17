import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiGithub, SiDiscord } from "react-icons/si";
import { useGithubAuth } from "../hooks/use-github-auth";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useGithubAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
              Linked Accounts
            </h1>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <SiGithub className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.github_username}</p>
                <p className="text-xs text-muted-foreground">GitHub Account</p>
              </div>
            </div>

            {user?.discord_username ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <SiDiscord className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.discord_username}</p>
                  <p className="text-xs text-muted-foreground">Discord Account</p>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/api/auth/discord"}
              >
                <SiDiscord className="mr-2 h-5 w-5" />
                Link Discord Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
