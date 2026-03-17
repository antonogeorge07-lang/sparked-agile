import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2, Edit2, Save, X, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  effort_estimate: number | null;
  display_order: number;
}

interface FeatureBreakdownPanelProps {
  epicId: string;
  features: Feature[];
  onFeaturesChange: () => void;
  jiraEpicKey?: string | null;
  projectId?: string | null;
}

function SortableFeatureItem({ feature, onEdit, onDelete }: { 
  feature: Feature; 
  onEdit: (feature: Feature) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500';
      case 'backlog': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing pt-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-sm">{feature.title}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(feature)}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(feature.id)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {feature.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {feature.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getPriorityColor(feature.priority)} className="text-xs">
            {feature.priority}
          </Badge>
          <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
            {feature.status.replace('_', ' ')}
          </Badge>
          {feature.effort_estimate && (
            <span className="text-xs text-muted-foreground">
              {feature.effort_estimate} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeatureBreakdownPanel({ epicId, features: initialFeatures, onFeaturesChange, jiraEpicKey, projectId }: FeatureBreakdownPanelProps) {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [isAdding, setIsAdding] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    effort_estimate: '',
  });
  const { toast } = useToast();

  const handleJiraSync = async () => {
    if (!jiraEpicKey) {
      toast({
        title: "Jira Epic Key not set",
        description: "Edit the epic and set the Jira Epic Key first (e.g. PROJ-123)",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-jira-features', {
        body: { epicId, projectId },
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: "Sync issue",
          description: data.error || "Could not sync features from Jira",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Jira Sync Complete",
        description: `${data.created} created, ${data.updated} updated from ${data.total} Jira issues`,
      });

      onFeaturesChange();
    } catch (error: any) {
      console.error('Jira sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync features from Jira",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = features.findIndex((f) => f.id === active.id);
      const newIndex = features.findIndex((f) => f.id === over.id);

      const newFeatures = arrayMove(features, oldIndex, newIndex);
      setFeatures(newFeatures);

      // Update display_order in database
      try {
        const updates = newFeatures.map((feature, index) => ({
          id: feature.id,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('features')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast({
          title: "Order updated",
          description: "Feature order has been saved",
        });
      } catch (error: any) {
        console.error('Error updating order:', error);
        toast({
          title: "Error",
          description: "Failed to update feature order",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddFeature = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Feature title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('features')
        .insert({
          epic_id: epicId,
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          effort_estimate: formData.effort_estimate ? parseInt(formData.effort_estimate) : null,
          status: 'backlog',
          display_order: features.length,
        })
        .select()
        .single();

      if (error) throw error;

      setFeatures([...features, data]);
      setFormData({ title: '', description: '', priority: 'medium', effort_estimate: '' });
      setIsAdding(false);
      onFeaturesChange();

      toast({
        title: "Feature added",
        description: "New feature has been created",
      });
    } catch (error: any) {
      console.error('Error adding feature:', error);
      toast({
        title: "Error",
        description: "Failed to add feature",
        variant: "destructive",
      });
    }
  };

  const handleEditFeature = async () => {
    if (!editingFeature || !formData.title.trim()) return;

    try {
      const { error } = await supabase
        .from('features')
        .update({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          effort_estimate: formData.effort_estimate ? parseInt(formData.effort_estimate) : null,
        })
        .eq('id', editingFeature.id);

      if (error) throw error;

      setFeatures(features.map(f => 
        f.id === editingFeature.id 
          ? { 
              ...f, 
              title: formData.title, 
              description: formData.description || null,
              priority: formData.priority,
              effort_estimate: formData.effort_estimate ? parseInt(formData.effort_estimate) : null,
            }
          : f
      ));
      setEditingFeature(null);
      setFormData({ title: '', description: '', priority: 'medium', effort_estimate: '' });
      onFeaturesChange();

      toast({
        title: "Feature updated",
        description: "Feature has been saved",
      });
    } catch (error: any) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeature = async (id: string) => {
    try {
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFeatures(features.filter(f => f.id !== id));
      onFeaturesChange();

      toast({
        title: "Feature deleted",
        description: "Feature has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting feature:', error);
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      });
    }
  };

  const startEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description || '',
      priority: feature.priority,
      effort_estimate: feature.effort_estimate?.toString() || '',
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingFeature(null);
    setIsAdding(false);
    setFormData({ title: '', description: '', priority: 'medium', effort_estimate: '' });
  };

   return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Feature Breakdown</CardTitle>
            <CardDescription>
              Create and organise features/stories for this epic
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleJiraSync}
              disabled={isSyncing || isAdding || editingFeature !== null}
            >
              {isSyncing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />Sync from Jira</>
              )}
            </Button>
            <Button
              onClick={() => setIsAdding(true)}
              disabled={isAdding || editingFeature !== null}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>
        {jiraEpicKey && (
          <p className="text-xs text-muted-foreground mt-1">
            Linked to Jira: <span className="font-mono font-medium">{jiraEpicKey}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {(isAdding || editingFeature) && (
          <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
            <Input
              placeholder="Feature title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-9 px-3 border rounded-md bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Story Points</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.effort_estimate}
                  onChange={(e) => setFormData({ ...formData, effort_estimate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingFeature ? handleEditFeature : handleAddFeature} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {editingFeature ? 'Save' : 'Add'}
              </Button>
              <Button onClick={cancelEdit} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {features.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No features yet. Create your first feature to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={features.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {features.map((feature) => (
                  <SortableFeatureItem
                    key={feature.id}
                    feature={feature}
                    onEdit={startEdit}
                    onDelete={handleDeleteFeature}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
