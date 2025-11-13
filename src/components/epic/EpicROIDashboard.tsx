import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, TrendingUp, Calendar, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface ROIData {
  id: string;
  investment_amount: number;
  investment_currency: string;
  returns_amount: number;
  roi_percentage: number;
  payback_period_days: number | null;
  calculation_notes: string | null;
  last_calculated: string;
}

interface EpicROIDashboardProps {
  epicId: string;
}

export function EpicROIDashboard({ epicId }: EpicROIDashboardProps) {
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    investment_amount: '',
    returns_amount: '',
    payback_period_days: '',
    calculation_notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadROI();
  }, [epicId]);

  const loadROI = async () => {
    try {
      const { data, error } = await supabase
        .from('epic_roi_tracking')
        .select('*')
        .eq('epic_id', epicId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setRoiData(data);
        setFormData({
          investment_amount: data.investment_amount.toString(),
          returns_amount: data.returns_amount.toString(),
          payback_period_days: data.payback_period_days?.toString() || '',
          calculation_notes: data.calculation_notes || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading ROI:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.investment_amount) {
      toast({
        title: "Error",
        description: "Investment amount is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        epic_id: epicId,
        investment_amount: parseFloat(formData.investment_amount),
        returns_amount: formData.returns_amount ? parseFloat(formData.returns_amount) : 0,
        payback_period_days: formData.payback_period_days ? parseInt(formData.payback_period_days) : null,
        calculation_notes: formData.calculation_notes || null,
        last_calculated: new Date().toISOString(),
      };

      if (roiData) {
        const { error } = await supabase
          .from('epic_roi_tracking')
          .update(data)
          .eq('id', roiData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('epic_roi_tracking')
          .insert(data);

        if (error) throw error;
      }

      setIsEditing(false);
      await loadROI();

      toast({
        title: "ROI updated",
        description: "ROI calculations have been saved",
      });
    } catch (error: any) {
      console.error('Error saving ROI:', error);
      toast({
        title: "Error",
        description: "Failed to save ROI data",
        variant: "destructive",
      });
    }
  };

  const getROIColor = () => {
    if (!roiData) return 'text-muted-foreground';
    if (roiData.roi_percentage >= 50) return 'text-green-500';
    if (roiData.roi_percentage >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getROILabel = () => {
    if (!roiData) return 'N/A';
    if (roiData.roi_percentage >= 50) return 'Excellent';
    if (roiData.roi_percentage >= 20) return 'Good';
    if (roiData.roi_percentage >= 0) return 'Break Even';
    return 'Negative';
  };

  if (!roiData && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ROI Measurement</CardTitle>
          <CardDescription>
            Calculate and track return on investment for this epic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No ROI data recorded</p>
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Add ROI Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ROI Measurement</CardTitle>
            <CardDescription>
              Track investment and returns for this epic
            </CardDescription>
          </div>
          {!isEditing && roiData && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Investment Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.investment_amount}
                  onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Returns Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.returns_amount}
                  onChange={(e) => setFormData({ ...formData, returns_amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Payback Period (days, optional)</label>
              <Input
                type="number"
                placeholder="e.g., 90"
                value={formData.payback_period_days}
                onChange={(e) => setFormData({ ...formData, payback_period_days: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Calculation Notes (optional)</label>
              <Textarea
                placeholder="Document assumptions, cost breakdown, revenue sources..."
                value={formData.calculation_notes}
                onChange={(e) => setFormData({ ...formData, calculation_notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save ROI Data
              </Button>
              <Button onClick={() => {
                setIsEditing(false);
                if (roiData) {
                  setFormData({
                    investment_amount: roiData.investment_amount.toString(),
                    returns_amount: roiData.returns_amount.toString(),
                    payback_period_days: roiData.payback_period_days?.toString() || '',
                    calculation_notes: roiData.calculation_notes || '',
                  });
                }
              }} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : roiData && (
          <div className="space-y-6">
            {/* ROI Summary */}
            <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-background to-accent/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className={`h-8 w-8 ${getROIColor()}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Return on Investment</p>
                    <p className={`text-3xl font-bold ${getROIColor()}`}>
                      {roiData.roi_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className={`font-semibold ${getROIColor()}`}>{getROILabel()}</p>
                </div>
              </div>

              {roiData.payback_period_days && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Payback period: <strong>{roiData.payback_period_days} days</strong>
                    {roiData.payback_period_days <= 90 ? ' (Fast)' : roiData.payback_period_days <= 180 ? ' (Moderate)' : ' (Long)'}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Investment</p>
                <p className="text-2xl font-bold text-red-500">
                  ${roiData.investment_amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Cost</p>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Returns</p>
                <p className="text-2xl font-bold text-green-500">
                  ${roiData.returns_amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Net Gain</p>
                <p className={`text-2xl font-bold ${roiData.returns_amount - roiData.investment_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${(roiData.returns_amount - roiData.investment_amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Profit/Loss</p>
              </div>
            </div>

            {/* Calculation Notes */}
            {roiData.calculation_notes && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-semibold mb-2">Calculation Notes:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {roiData.calculation_notes}
                </p>
              </div>
            )}

            {/* ROI Insights */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">ROI Insights:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• ROI = ((Returns - Investment) / Investment) × 100</li>
                    <li>• Positive ROI indicates the epic delivered value beyond its cost</li>
                    <li>• Industry average ROI for software projects: 15-30%</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Last updated: {format(new Date(roiData.last_calculated), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
