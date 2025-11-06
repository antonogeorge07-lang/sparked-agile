import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  created_at: string;
}

interface LessonsLearnedProps {
  projectId: string | null;
}

export function LessonsLearned({ projectId }: LessonsLearnedProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadLessons();
    }
  }, [projectId]);

  const loadLessons = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("lessons_learned")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error("Error loading lessons:", error);
      toast.error("Failed to load lessons learned");
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-accent/10 text-accent border-accent/20";
      case "Medium":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (!projectId) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a project to view lessons learned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lessons Learned</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-2">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading lessons...</p>
            </CardContent>
          </Card>
        ) : lessons.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No lessons documented yet</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Document First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          lessons.map((lesson) => (
            <Card key={lesson.id} className="border-2 hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">{lesson.title}</CardTitle>
                  <Badge variant="outline" className={getImpactColor(lesson.impact)}>
                    {lesson.impact} Impact
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{lesson.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Badge variant="secondary">{lesson.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(lesson.created_at), "MMM dd, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}