import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, User, Briefcase, Building2, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export const FeedbackSubmissionForm = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !feedback || rating === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("landing_feedback")
        .insert({
          name,
          role: role || null,
          company: company || null,
          feedback,
          rating,
        });

      if (error) throw error;

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted and will be reviewed shortly.",
      });

      setName("");
      setRole("");
      setCompany("");
      setFeedback("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
        {/* Accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Share Your Experience</h3>
            <p className="text-sm text-muted-foreground">Your honest feedback shapes our product</p>
          </div>
          <Sparkles className="h-4 w-4 text-primary/60 ml-auto animate-pulse" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              required
            />
          </div>

          {/* Role & Company Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Role
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Scrum Master"
                className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
                className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              Rating <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-1.5 p-3 rounded-xl bg-background/30 border border-border/30 w-fit">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-7 w-7 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-muted-foreground/40 hover:text-muted-foreground/60"
                    }`}
                  />
                </motion.button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-muted-foreground">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="flex items-center gap-2 text-sm font-medium">
              Your Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience with SAAI..."
              rows={4}
              className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all duration-300"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Feedback
              </span>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
