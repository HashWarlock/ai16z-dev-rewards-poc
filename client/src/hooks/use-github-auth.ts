import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SelectUser } from "@db/schema";

export function useGithubAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<SelectUser>({
    queryKey: ["/api/user"],
    retry: false
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    }
  });

  return {
    user,
    isLoading,
    error,
    logout: logoutMutation.mutate
  };
}
