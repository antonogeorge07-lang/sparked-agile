import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Target, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface ImpactMetric {
  id: string;
  metric_name: string;
  metric_type: string;
  baseline_value: number | null;
  target_value: number | null;
  current_value: number | null;
  measurement_date: string;
  measurement_unit: string | null;
  notes: string | null;
}

interface EpicImpactTrackingProps {
  epicId: string;
}

export function EpicImpactTracking({ epicId }: EpicImpactTrackingProps) {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    metric_name: '',
    metric_type: 'kpi',
    baseline_value: '',
    target_value: '',
    current_value: '',
    measurement_unit: '',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, [epicId]);

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('epic_impact_metrics')
        .select('*')
        .eq('epic_id', epicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error: any) {
      console.error('Error loading metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load impact metrics",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    if (!formData.metric_name || !formData.metric_type) {
      toast({
        title: "Error",
        description: "Metric name and type are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('epic_impact_metrics')
        .insert({
          epic_id: epicId,
          metric_name: formData.metric_name,
          metric_type: formData.metric_type,
          baseline_value: formData.baseline_value ? parseFloat(formData.baseline_value) : null,
          target_value: formData.target_value ? parseFloat(formData.target_value) : null,
          current_value: formData.current_value ? parseFloat(formData.current_value) : null,
          measurement_unit: formData.measurement_unit || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      setFormData({
        metric_name: '',
        metric_type: 'kpi',
        baseline_value: '',
        target_value: '',
        current_value: '',
        measurement_unit: '',
        notes: '',
      });
      setIsAdding(false);
      await loadMetrics();

      toast({
        title: "Metric added",
        description: "Impact metric has been created",
      });
    } catch (error: any) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('epic_impact_metrics')
        .update({
          current_value: formData.current_value ? parseFloat(formData.current_value) : null,
          measurement_date: new Date().toISOString().split('T')[0],
          notes: formData.notes || null,
        })
        .eq('id', metricId);

      if (error) throw error;

      setEditingId(null);
      setFormData({
        metric_name: '',
        metric_type: 'kpi',
        baseline_value: '',
        target_value: '',
        current_value: '',
        measurement_unit: '',
        notes: '',
      });
      await loadMetrics();

      toast({
        title: "Metric updated",
        description: "Impact metric has been saved",
      });
    } catch (error: any) {
      console.error('Error updating metric:', error);
      toast({
        title: "Error",
        description: "Failed to update metric",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('epic_impact_metrics')
        .delete()
        .eq('id', metricId);

      if (error) throw error;

      await loadMetrics();

      toast({
        title: "Metric deleted",
        description: "Impact metric has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting metric:', error);
      toast({
        title: "Error",
        description: "Failed to delete metric",
        variant: "destructive",
      });
    }
  };

  const startEdit = (metric: ImpactMetric) => {
    setEditingId(metric.id);
    setFormData({
      metric_name: metric.metric_name,
      metric_type: metric.metric_type,
      baseline_value: metric.baseline_value?.toString() || '',
      target_value: metric.target_value?.toString() || '',
      current_value: metric.current_value?.toString() || '',
      measurement_unit: metric.measurement_unit || '',
      notes: metric.notes || '',
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      metric_name: '',
      metric_type: 'kpi',
      baseline_value: '',
      target_value: '',
      current_value: '',
      measurement_unit: '',
      notes: '',
    });
  };

  const getMetricTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      kpi: 'bg-blue-500/10 text-blue-500',
      user_engagement: 'bg-purple-500/10 text-purple-500',
      revenue: 'bg-green-500/10 text-green-500',
      efficiency: 'bg-yellow-500/10 text-yellow-500',
      quality: 'bg-pink-500/10 text-pink-500',
      other: 'bg-gray-500/10 text-gray-500',
    };
    return colors[type] || colors.other;
  };

  const getPerformanceIndicator = (metric: ImpactMetric) => {
    if (metric.current_value === null || metric.target_value === null) return null;

    const percentOfTarget = (metric.current_value / metric.target_value) * 100;
    
    if (percentOfTarget >= 100) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (percentOfTarget >= 70) {
      return <Target className="h-4 w-4 text-yellow-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Impact Tracking</CardTitle>
            <CardDescription>
              Measure post-delivery value and business outcomes
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="mr-2 h-4 w-4" />
            Add Metric
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isAdding || editingId) && (
          <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Metric Name</label>
                <Input
                  placeholder="e.g., User adoption rate"
                  value={formData.metric_name}
                  onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                  disabled={editingId !== null}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  value={formData.metric_type}
                  onChange={(e) => setFormData({ ...formData, metric_type: e.target.value })}
                  className="w-full h-9 px-3 border rounded-md bg-background"
                  disabled={editingId !== null}
                >
                  <option value="kpi">KPI</option>
                  <option value="user_engagement">User Engagement</option>
                  <option value="revenue">Revenue</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="quality">Quality</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Baseline</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.baseline_value}
                  onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })}
                  disabled={editingId !== null}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  disabled={editingId !== null}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Unit (optional)</label>
              <Input
                placeholder="e.g., %, users, $"
                value={formData.measurement_unit}
                onChange={(e) => setFormData({ ...formData, measurement_unit: e.target.value })}
                disabled={editingId !== null}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <Textarea
                placeholder="Additional context or observations..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update' : 'Add'}
              </Button>
              <Button onClick={cancelEdit} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {metrics.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No impact metrics yet</p>
            <p className="text-sm mt-2">Add metrics to track post-delivery business value</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="group p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{metric.metric_name}</h4>
                      <Badge className={getMetricTypeBadge(metric.metric_type)}>
                        {metric.metric_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {metric.notes && (
                      <p className="text-sm text-muted-foreground">{metric.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {getPerformanceIndicator(metric)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(metric)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(metric.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Baseline</p>
                    <p className="font-semibold">
                      {metric.baseline_value !== null ? metric.baseline_value : '-'}
                      {metric.measurement_unit && ` ${metric.measurement_unit}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Target</p>
                    <p className="font-semibold">
                      {metric.target_value !== null ? metric.target_value : '-'}
                      {metric.measurement_unit && ` ${metric.measurement_unit}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Current</p>
                    <p className="font-semibold text-primary">
                      {metric.current_value !== null ? metric.current_value : '-'}
                      {metric.measurement_unit && ` ${metric.measurement_unit}`}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Last measured: {format(new Date(metric.measurement_date), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
