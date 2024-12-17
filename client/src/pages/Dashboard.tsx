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

          <div className="space-y-6">
            {/* GitHub Card */}
            <div className="p-6 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <SiGithub className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GitHub Profile</h3>
                  <p className="text-sm text-muted-foreground">Connected Account</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                  <span className="text-sm font-medium">Username</span>
                  <span className="text-sm">{user?.github_username}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                  <span className="text-sm font-medium">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Discord Card */}
            <div className="p-6 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <SiDiscord className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Discord Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.discord_username ? 'Connected Account' : 'Not Connected'}
                  </p>
                </div>
              </div>
              
              {user?.discord_username ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Username</span>
                    <span className="text-sm">{user?.discord_username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Connected
                    </span>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => window.location.href = "/api/auth/discord"}
                >
                  <SiDiscord className="mr-2 h-5 w-5" />
                  Connect Discord Account
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
