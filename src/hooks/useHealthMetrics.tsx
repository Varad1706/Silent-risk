import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface HealthMetric {
  id: string;
  user_id: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  temperature: number | null;
  stress_level: number | null;
  hydration: number | null;
  energy_level: number | null;
  steps: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  recorded_at: string;
  created_at: string;
}

export function useHealthMetrics(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["health-metrics", user?.id, days],
    queryFn: async () => {
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data as HealthMetric[];
    },
    enabled: !!user,
  });
}

export function useLatestMetric() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["latest-metric", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as HealthMetric | null;
    },
    enabled: !!user,
  });
}

export function useAddHealthMetric() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metric: Omit<HealthMetric, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("health_metrics")
        .insert({ ...metric, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["latest-metric"] });
    },
  });
}
