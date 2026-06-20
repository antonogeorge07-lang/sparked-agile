import { useEffect, useState } from "react";
import { Bug, Lightbulb, MessageSquare, AlertCircle, Quote, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Feedback {
  id: string;
  feedback_type: string;
  message: string;
  page?: string;
  status?: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  bug: { 
    icon: <Bug className="h-4 w-4" />, 
    label: "Bug Report",
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400"
  },
  improvement: { 
    icon: <Lightbulb className="h-4 w-4" />, 
    label: "Improvement",
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400"
  },
  suggestion: { 
    icon: <MessageSquare className="h-4 w-4" />, 
    label: "Suggestion",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400"
  },
  other: { 
    icon: <AlertCircle className="h-4 w-4" />, 
    label: "Feedback",
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400"
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  resolved: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  new: { label: "Under Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

export const FeedbackDisplay = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      <div className="flex items-center justify-center py-16">
        <motion.div
          className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground">
          Be the first to share your experience with Spark-Agile!
        </p>
      </div>
    );
  }

  const selectedFeedback = feedbackList[selectedIndex];
  const config = typeConfig[selectedFeedback?.feedback_type] || typeConfig.other;
  const statusCfg = statusConfig[selectedFeedback?.status || "new"];

  return (
    <div className="space-y-6">
      {/* Feedback Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {feedbackList.map((item, index) => {
          const itemConfig = typeConfig[item.feedback_type] || typeConfig.other;
          const isSelected = index === selectedIndex;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                flex items-center gap-2 border
                ${isSelected 
                  ? 'bg-gradient-to-r ' + itemConfig.color + ' shadow-lg' 
                  : 'bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:border-border'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {itemConfig.icon}
              <span>#{index + 1}</span>
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-current opacity-30"
                  layoutId="feedbackHighlight"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Feedback Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFeedback.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Glow effect */}
          <div className={`absolute -inset-2 bg-gradient-to-r ${config.color} rounded-3xl blur-xl opacity-30`} />
          
          {/* Card */}
          <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
            {/* Decorative quote */}
            <Quote className="absolute top-6 right-6 h-16 w-16 text-muted-foreground/5" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Badge 
                variant="outline" 
                className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${config.color}`}
              >
                {config.icon}
                {config.label}
              </Badge>
              
              {selectedFeedback.status && (
                <Badge variant="outline" className={statusCfg.className}>
                  {statusCfg.label}
                </Badge>
              )}
            </div>
            
            {/* Message */}
            <blockquote className="relative text-lg md:text-xl leading-relaxed text-foreground mb-6 pl-4 border-l-2 border-primary/30">
              "{selectedFeedback.message}"
            </blockquote>
            
            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/30">
              {selectedFeedback.page && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/30">
                  Page: <code className="text-xs">{selectedFeedback.page}</code>
                </span>
              )}
              <span className="flex items-center gap-2 ml-auto">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(selectedFeedback.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="flex justify-center gap-1.5 pt-4">
        {feedbackList.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === selectedIndex 
                ? 'w-6 bg-primary' 
                : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};
