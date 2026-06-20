import { supabase } from "./client";

export interface DeliveryMetrics {
  velocity: number | null;
  cycle_time: number | null;
  flow_efficiency: number | null;
}

export async function getDeliveryMetrics(projectId: string) {
  const { data, error } = await (supabase as any)
    .from("delivery_signals")
    .select("velocity, cycle_time, flow_efficiency")
    .eq("project_id", projectId);

  if (error) throw error;
  return (data ?? []) as DeliveryMetrics[];
}

export default getDeliveryMetrics;
