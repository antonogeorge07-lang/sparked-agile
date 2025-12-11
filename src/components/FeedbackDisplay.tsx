import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          Be the first to share your experience with SAAI!
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={feedbackList[0]?.id} className="w-full">
      <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent justify-center mb-6">
        {feedbackList.map((item) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className="px-4 py-2 text-sm rounded-full border border-border bg-card hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            {item.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {feedbackList.map((item) => (
        <TabsContent
          key={item.id}
          value={item.id}
          className="mt-0 animate-in fade-in-50 duration-300"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <Quote className="h-6 w-6 text-muted-foreground mb-3" />
            
            <p className="text-foreground text-lg leading-relaxed mb-6">
              {item.feedback}
            </p>
            
            <div className="border-t border-border pt-4">
              <p className="font-semibold text-foreground">{item.name}</p>
              {item.role && (
                <p className="text-sm text-muted-foreground">{item.role}</p>
              )}
              {item.company && (
                <p className="text-sm text-muted-foreground">{item.company}</p>
              )}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
