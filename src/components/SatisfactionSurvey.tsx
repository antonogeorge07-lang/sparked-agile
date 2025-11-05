import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SatisfactionSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  surveyType?: string;
  title?: string;
  description?: string;
}

export const SatisfactionSurvey = ({
  isOpen,
  onClose,
  surveyType = "general",
  title = "How satisfied are you?",
  description = "Your feedback helps us improve"
}: SatisfactionSurveyProps) => {
  const [rating, setRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 && npsScore === null) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("survey_responses").insert({
        user_id: user?.id || null,
        page: location.pathname,
        rating: rating || null,
        nps_score: npsScore,
        feedback_text: feedbackText.trim() || null,
        responses: {
          survey_type: surveyType,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("Thank you for your feedback!");
      setRating(0);
      setNpsScore(null);
      setFeedbackText("");
      onClose();
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Overall Satisfaction</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        (hoveredRating || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* NPS Score */}
            <div className="space-y-2">
              <Label>How likely are you to recommend us? (0-10)</Label>
              <div className="grid grid-cols-11 gap-1">
                {[...Array(11)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNpsScore(i)}
                    className={cn(
                      "h-10 rounded text-sm font-medium transition-colors",
                      npsScore === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Additional Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Comments (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedbackText.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Skip
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
