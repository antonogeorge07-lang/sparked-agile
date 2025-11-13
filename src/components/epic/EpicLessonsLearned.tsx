import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Sparkles, Loader2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  created_at: string;
}

interface EpicLessonsLearnedProps {
  epicId: string;
  projectId: string;
}

export function EpicLessonsLearned({ epicId, projectId }: EpicLessonsLearnedProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Process',
    impact: 'Medium',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLessons();
  }, [epicId, projectId]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons_learned')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error('Error loading lessons:', error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-epic-closure-insights', {
        body: { epicId, type: 'lessons_learned' }
      });

      if (error) throw error;

      if (data?.content) {
        let suggestedLessons = [];
        
        // Parse if array
        if (Array.isArray(data.content)) {
          suggestedLessons = data.content;
        } else if (typeof data.content === 'string') {
          try {
            suggestedLessons = JSON.parse(data.content);
          } catch {
            // If not JSON, create a single lesson from the text
            suggestedLessons = [{
              title: "AI-Generated Insight",
              description: data.content,
              category: "Process",
              impact: "Medium"
            }];
          }
        }

        // Insert AI-generated lessons
        if (suggestedLessons.length > 0) {
          const lessonsToInsert = suggestedLessons.slice(0, 5).map((lesson: any) => ({
            project_id: projectId,
            title: lesson.title,
            description: lesson.description,
            category: lesson.category || 'Process',
            impact: lesson.impact || 'Medium',
          }));

          const { error: insertError } = await supabase
            .from('lessons_learned')
            .insert(lessonsToInsert);

          if (insertError) throw insertError;

          await loadLessons();

          toast({
            title: "Lessons generated",
            description: `${lessonsToInsert.length} AI-suggested lessons have been added`,
          });
        }
      }
    } catch (error: any) {
      console.error('Error generating lessons:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate lessons",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons_learned')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          impact: formData.impact,
        });

      if (error) throw error;

      setFormData({ title: '', description: '', category: 'Process', impact: 'Medium' });
      setIsAdding(false);
      await loadLessons();

      toast({
        title: "Lesson added",
        description: "New lesson learned has been recorded",
      });
    } catch (error: any) {
      console.error('Error adding lesson:', error);
      toast({
        title: "Error",
        description: "Failed to add lesson",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons_learned')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      await loadLessons();

      toast({
        title: "Lesson deleted",
        description: "Lesson has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Process: 'bg-blue-500/10 text-blue-500',
      Technical: 'bg-purple-500/10 text-purple-500',
      Team: 'bg-green-500/10 text-green-500',
      Business: 'bg-yellow-500/10 text-yellow-500',
    };
    return colors[category] || colors.Process;
  };

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lessons Learned</CardTitle>
            <CardDescription>
              Document insights and improvements for future epics
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI Suggest
            </Button>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
            <Input
              placeholder="Lesson title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Describe what was learned and how it can be applied in the future..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 border rounded-md bg-background"
                >
                  <option value="Process">Process</option>
                  <option value="Technical">Technical</option>
                  <option value="Team">Team</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Impact</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full h-9 px-3 border rounded-md bg-background"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Add
              </Button>
              <Button onClick={() => {
                setIsAdding(false);
                setFormData({ title: '', description: '', category: 'Process', impact: 'Medium' });
              }} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {lessons.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No lessons learned yet</p>
            <p className="text-sm mt-2">Document insights from this epic to improve future work</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{lesson.title}</h4>
                    <Badge className={getCategoryColor(lesson.category)}>
                      {lesson.category}
                    </Badge>
                    <Badge variant={getImpactVariant(lesson.impact)}>
                      {lesson.impact} Impact
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(lesson.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lesson.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Recorded {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
