import { useQuery } from "@tanstack/react-query";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("opportunity_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface LeadUsage {
  plan: string;
  daily_limit: number | null;
  viewed_today: number;
  remaining: number | null;
  limit_reached: boolean;
}

export interface LeadsResponse {
  leads: any[];
  usage: LeadUsage;
  message?: string;
}

export function useLeads() {
  return useQuery<LeadsResponse>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads", {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });
}

export function useAllLeads() {
  return useQuery<LeadsResponse>({
    queryKey: ["/api/leads/all"],
    queryFn: async () => {
      const res = await fetch("/api/leads/all", {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch all leads");
      return res.json();
    },
  });
}

export function useLeadUsage() {
  return useQuery<LeadUsage>({
    queryKey: ["/api/leads/usage"],
    queryFn: async () => {
      const res = await fetch("/api/leads/usage", {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export interface Suggestion {
  name: string;
  url: string;
  desc: string;
  type: string;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  skill: string;
  location: string | null;
  message: string;
}

export function useLeadSuggestions(skill?: string, country?: string, city?: string, enabled = false) {
  const params = new URLSearchParams();
  if (skill) params.set("skill", skill);
  if (country && country !== "All Countries") params.set("country", country);
  if (city) params.set("city", city);
  return useQuery<SuggestionsResponse>({
    queryKey: ["/api/leads/suggestions", skill, country, city],
    queryFn: async () => {
      const res = await fetch(`/api/leads/suggestions?${params.toString()}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json();
    },
    enabled,
  });
}
