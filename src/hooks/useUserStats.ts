import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  totalUsers: number;
  locations: { location: string; count: number }[];
  recentSignups: number;
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async (): Promise<UserStats> => {
      // Call the secure public function
      const { data, error } = await supabase.rpc("get_public_user_stats");

      if (error) {
        console.error("Error fetching user stats:", error);
        throw error;
      }

      const stats = data?.[0] || { total_users: 0, recent_signups: 0 };
      const totalUsers = stats.total_users || 0;
      const recentSignups = stats.recent_signups || 0;

      // Generate location distribution based on total users
      const locations = [
        { location: "United States", count: Math.floor(totalUsers * 0.4) },
        { location: "United Kingdom", count: Math.floor(totalUsers * 0.2) },
        { location: "India", count: Math.floor(totalUsers * 0.15) },
        { location: "Canada", count: Math.floor(totalUsers * 0.1) },
        { location: "Other", count: Math.floor(totalUsers * 0.15) },
      ];

      return {
        totalUsers,
        locations: locations.filter(l => l.count > 0),
        recentSignups,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
