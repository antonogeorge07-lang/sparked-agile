import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Feedback {
  id: string;
  name: string;
  role?: string;
  company?: string;
  feedback: string;
  rating: number;
  created_at: string;
}

export const FeedbackDisplay = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("landing_feedback_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "landing_feedback",
          filter: "is_approved=eq.true",
        },
        () => {
          fetchFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_feedback")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading feedback...</p>
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Be the first to share your experience with SM ActiveIntelligence!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedbackList.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex gap-1 mb-2">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <Quote className="h-8 w-8 text-muted-foreground mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{item.feedback}</p>
            <div>
              <p className="font-semibold">{item.name}</p>
              {item.role && <p className="text-sm text-muted-foreground">{item.role}</p>}
              {item.company && (
                <p className="text-sm text-muted-foreground">{item.company}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
