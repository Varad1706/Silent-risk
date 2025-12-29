import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface Alert {
  id: string;
  user_id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  created_at: string;
}

export function useAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["alerts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!user,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useCreateAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<Alert, "id" | "user_id" | "is_read" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("alerts")
        .insert({ ...alert, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
