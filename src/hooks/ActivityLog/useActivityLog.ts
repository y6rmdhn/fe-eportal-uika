import admin from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";

export interface ActivityTypeOption {
  value: string;
  label: string;
  category: string;
  action: string;
  color: string;
}

export interface ActivityStats {
  total: number;
  total_crud: number;
  today: number;
  create: number;
  update: number;
  delete: number;
  trend: { date: string; label: string; total: number }[];
  top_actors: { actor_id: string; email: string; total: number }[];
}

export const useActivityLogTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log-types"],
    queryFn: async () => {
      const res = await admin.getActivityLogTypes();
      return (res.data?.data ?? []) as ActivityTypeOption[];
    },
    // Daftar tipe praktis statis — tidak perlu sering di-refetch.
    staleTime: 1000 * 60 * 30,
  });
  return { types: data ?? [], isLoadingTypes: isLoading };
};

export const useActivityLogStats = (days = 7) => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log-stats", days],
    queryFn: async () => {
      const res = await admin.getActivityLogStats(days);
      return res.data?.data as ActivityStats;
    },
  });
  return { stats: data, isLoadingStats: isLoading };
};
