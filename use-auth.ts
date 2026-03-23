import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { 
  AuthResponse, 
  FreelancerProfile, 
  LoginRequest, 
  RegisterRequest 
} from "@workspace/api-client-react";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("opportunity_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useAuthMe() {
  return useQuery<FreelancerProfile>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("opportunity_token");
        }
        throw new Error("Not authenticated");
      }
      return res.json();
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(error.error || "Login failed");
      }
      
      const payload: AuthResponse = await res.json();
      localStorage.setItem("opportunity_token", payload.token);
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(error.error || "Registration failed");
      }
      
      const payload: AuthResponse = await res.json();
      localStorage.setItem("opportunity_token", payload.token);
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { ...getAuthHeaders() }
      });
      localStorage.removeItem("opportunity_token");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
    },
  });
}
