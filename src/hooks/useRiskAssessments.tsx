import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RiskAssessment {
  id: string;
  condition: string;
  risk_level: string;
  risk_score: number;
  description: string | null;
  assessed_at: string;
  created_at: string;
}

export function useRiskAssessments() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['risk-assessments', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('assessed_at', { ascending: false });

      if (error) throw error;
      return data as RiskAssessment[];
    },
    enabled: !!session?.user?.id,
  });

  const calculateRiskMutation = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-risk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits.');
        }
        throw new Error(errorData.error || 'Failed to calculate risk');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast.success(data.message || 'Risk assessment completed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const calculateRisk = async () => {
    setIsCalculating(true);
    try {
      await calculateRiskMutation.mutateAsync();
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    assessments,
    isLoading,
    isCalculating: isCalculating || calculateRiskMutation.isPending,
    calculateRisk,
  };
}
