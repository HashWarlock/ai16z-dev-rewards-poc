import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiDiscord } from "react-icons/si";
import { useGithubAuth } from "../hooks/use-github-auth";

export default function LinkDiscord() {
  const { user, logout } = useGithubAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
              Link Discord Account
            </h1>
            <Button variant="ghost" onClick={() => logout()}>Logout</Button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              GitHub Account: <span className="font-medium text-foreground">{user?.github_username}</span>
            </p>
          </div>

          <Button 
            size="lg"
            className="w-full"
            onClick={() => window.location.href = "/api/auth/discord"}
          >
            <SiDiscord className="mr-2 h-5 w-5" />
            Connect Discord Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
