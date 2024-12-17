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
    <div className="min-h-screen flex items-center justify-center bg-[url('/vintage-paper.svg')] bg-repeat p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-zinc-800" style={{ fontFamily: 'Georgia, serif' }}>
            Digital Identity Collection '24
          </h1>
          <Button variant="ghost" onClick={handleLogout} className="text-zinc-800">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* GitHub Trading Card */}
          <div className="transform transition-transform hover:scale-105">
            <div className="relative bg-amber-50 border-4 border-zinc-800 rounded-lg overflow-hidden shadow-xl" 
                 style={{ fontFamily: 'Georgia, serif' }}>
              {/* Vintage-style header */}
              <div className="bg-zinc-800 text-amber-50 py-2 px-4 text-center text-lg font-bold">
                GitHub All-Star
              </div>
              
              {/* Profile section */}
              <div className="p-6">
                <div className="aspect-square w-48 mx-auto mb-4 relative">
                  {user?.github_avatar_url ? (
                    <img 
                      src={user.github_avatar_url}
                      alt={user.github_username || 'GitHub Profile'}
                      className="rounded-lg border-4 border-zinc-800 sepia"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg border-4 border-zinc-800 bg-zinc-100 flex items-center justify-center">
                      <SiGithub className="w-20 h-20 text-zinc-400" />
                    </div>
                  )}
                </div>
                
                {/* Stats section */}
                <div className="space-y-3 text-zinc-800">
                  <div className="text-2xl font-bold text-center mb-4">
                    {user?.github_username || 'Rookie Developer'}
                  </div>
                  <div className="border-t-2 border-b-2 border-zinc-800 py-2 px-4 text-center">
                    <div className="text-sm uppercase tracking-wider">Developer Stats</div>
                    <div className="font-mono mt-1">
                      EST. {user?.github_created_at ? new Date(user.github_created_at).getFullYear() : '2024'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discord Trading Card */}
          {user?.discord_username ? (
            <div className="transform transition-transform hover:scale-105">
              <div className="relative bg-indigo-50 border-4 border-zinc-800 rounded-lg overflow-hidden shadow-xl"
                   style={{ fontFamily: 'Georgia, serif' }}>
                {/* Vintage-style header */}
                <div className="bg-zinc-800 text-indigo-50 py-2 px-4 text-center text-lg font-bold">
                  Discord Legend
                </div>
                
                {/* Profile section */}
                <div className="p-6">
                  <div className="aspect-square w-48 mx-auto mb-4 relative">
                    {user?.discord_avatar_url ? (
                      <img 
                        src={user.discord_avatar_url}
                        alt={user.discord_username}
                        className="rounded-lg border-4 border-zinc-800 sepia"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg border-4 border-zinc-800 bg-zinc-100 flex items-center justify-center">
                        <SiDiscord className="w-20 h-20 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Stats section */}
                  <div className="space-y-3 text-zinc-800">
                    <div className="text-2xl font-bold text-center mb-4">
                      {user?.discord_username}
                    </div>
                    <div className="border-t-2 border-b-2 border-zinc-800 py-2 px-4 text-center">
                      <div className="text-sm uppercase tracking-wider">Community Stats</div>
                      <div className="font-mono mt-1">
                        EST. {user?.discord_created_at ? new Date(user.discord_created_at).getFullYear() : '2024'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <SiDiscord className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-bold">Connect Discord</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your Discord account to complete your collection
                    </p>
                    <Button 
                      size="lg"
                      className="w-full"
                      onClick={() => window.location.href = "/api/auth/discord"}
                    >
                      <SiDiscord className="mr-2 h-5 w-5" />
                      Connect Discord Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
