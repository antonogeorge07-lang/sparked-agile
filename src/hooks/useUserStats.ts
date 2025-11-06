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
      // Get total user count
      const { count: totalUsers, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get users created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentSignups, error: recentError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      // For now, return mock location data since we don't have location info in profiles
      // TODO: Add location field to profiles table or integrate with IP geolocation
      const locations = [
        { location: "United States", count: Math.floor((totalUsers || 0) * 0.4) },
        { location: "United Kingdom", count: Math.floor((totalUsers || 0) * 0.2) },
        { location: "India", count: Math.floor((totalUsers || 0) * 0.15) },
        { location: "Canada", count: Math.floor((totalUsers || 0) * 0.1) },
        { location: "Other", count: Math.floor((totalUsers || 0) * 0.15) },
      ];

      return {
        totalUsers: totalUsers || 0,
        locations: locations.filter(l => l.count > 0),
        recentSignups: recentSignups || 0,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
