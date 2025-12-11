import { useEffect, useState } from "react";
import { Bug, Lightbulb, MessageSquare, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: string;
  feedback_type: string;
  message: string;
  page?: string;
  status?: string;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  improvement: <Lightbulb className="h-4 w-4" />,
  suggestion: <MessageSquare className="h-4 w-4" />,
  other: <AlertCircle className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  bug: "Bug Report",
  improvement: "Improvement",
  suggestion: "Suggestion",
  other: "Feedback",
};

const statusColors: Record<string, string> = {
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  new: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const FeedbackDisplay = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("user_feedback")
        .select("id, feedback_type, message, page, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

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
        {feedbackList.map((item, index) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className="px-3 py-2 text-xs rounded-full border border-border bg-card hover:bg-accent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex items-center gap-1.5"
          >
            {typeIcons[item.feedback_type] || typeIcons.other}
            <span>#{index + 1}</span>
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
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="flex items-center gap-1.5">
                {typeIcons[item.feedback_type] || typeIcons.other}
                {typeLabels[item.feedback_type] || "Feedback"}
              </Badge>
              {item.status && (
                <Badge variant="outline" className={statusColors[item.status] || ""}>
                  {item.status === "resolved" ? "Resolved" : item.status === "new" ? "Under Review" : item.status}
                </Badge>
              )}
            </div>
            
            <p className="text-foreground text-lg leading-relaxed mb-4">
              "{item.message}"
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
              {item.page && (
                <span>Page: {item.page}</span>
              )}
              <span>
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
