import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CheckCircle, Clock, XCircle, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  target_date: string;
  completion_date: string | null;
  status: string;
  completion_percentage: number;
}

interface EpicMilestonesProps {
  epicId: string;
  onMilestoneUpdate?: () => void;
}

export function EpicMilestones({ epicId, onMilestoneUpdate }: EpicMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMilestones();
  }, [epicId]);

  const loadMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('epic_milestones')
        .select('*')
        .eq('epic_id', epicId)
        .order('target_date', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error: any) {
      console.error('Error loading milestones:', error);
      toast({
        title: "Error",
        description: "Failed to load milestones",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.target_date) {
      toast({
        title: "Error",
        description: "Title and target date are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('epic_milestones')
        .insert({
          epic_id: epicId,
          title: formData.title,
          description: formData.description || null,
          target_date: formData.target_date,
          status: 'pending',
        });

      if (error) throw error;

      setFormData({ title: '', description: '', target_date: '' });
      setIsAdding(false);
      await loadMilestones();
      onMilestoneUpdate?.();

      toast({
        title: "Milestone added",
        description: "New milestone has been created",
      });
    } catch (error: any) {
      console.error('Error adding milestone:', error);
      toast({
        title: "Error",
        description: "Failed to add milestone",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('epic_milestones')
        .update({
          status: 'completed',
          completion_date: new Date().toISOString().split('T')[0],
          completion_percentage: 100,
        })
        .eq('id', milestoneId);

      if (error) throw error;

      await loadMilestones();
      onMilestoneUpdate?.();

      toast({
        title: "Milestone completed",
        description: "Milestone marked as complete",
      });
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      toast({
        title: "Error",
        description: "Failed to complete milestone",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('epic_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      await loadMilestones();
      onMilestoneUpdate?.();

      toast({
        title: "Milestone deleted",
        description: "Milestone has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Epic Milestones</CardTitle>
            <CardDescription>
              Track key milestones and deliverables for this epic
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
            <Input
              placeholder="Milestone title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Target Date</label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Add
              </Button>
              <Button onClick={() => {
                setIsAdding(false);
                setFormData({ title: '', description: '', target_date: '' });
              }} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {milestones.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No milestones yet</p>
            <p className="text-sm mt-2">Add milestones to track key deliverables</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="group p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    {getStatusIcon(milestone.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {getStatusBadge(milestone.status)}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Target: {format(new Date(milestone.target_date), 'MMM d, yyyy')}</span>
                        </div>
                        {milestone.completion_date && (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed: {format(new Date(milestone.completion_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {milestone.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComplete(milestone.id)}
                        className="h-8 px-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(milestone.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
