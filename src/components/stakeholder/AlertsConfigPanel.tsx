import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Target,
  Zap,
  Mail,
  MessageSquare,
  Check,
  Loader2
} from "lucide-react";

interface StakeholderAlert {
  id: string;
  alert_type: string;
  threshold_value: number | null;
  threshold_operator: string | null;
  is_active: boolean;
  notify_email: boolean;
  notify_teams: boolean;
  last_triggered_at: string | null;
}

interface AlertsConfigPanelProps {
  userId: string;
  projectId: string | null;
}

const ALERT_TYPES = [
  { 
    type: 'milestone_slip', 
    label: 'Milestone Slip', 
    icon: Calendar,
    description: 'When a milestone misses its target date',
    hasThreshold: false
  },
  { 
    type: 'roi_threshold', 
    label: 'ROI Below Threshold', 
    icon: Target,
    description: 'When epic ROI falls below target percentage',
    hasThreshold: true,
    unit: '%',
    defaultValue: 10
  },
  { 
    type: 'risk_escalation', 
    label: 'Risk Escalation', 
    icon: AlertTriangle,
    description: 'When a risk is escalated to high/critical',
    hasThreshold: false
  },
  { 
    type: 'budget_overrun', 
    label: 'Budget Overrun', 
    icon: DollarSign,
    description: 'When spending exceeds budget by threshold',
    hasThreshold: true,
    unit: '%',
    defaultValue: 10
  },
  { 
    type: 'velocity_drop', 
    label: 'Velocity Drop', 
    icon: TrendingDown,
    description: 'When sprint velocity drops by threshold',
    hasThreshold: true,
    unit: '%',
    defaultValue: 20
  },
  { 
    type: 'blocker_critical', 
    label: 'Critical Blocker', 
    icon: Zap,
    description: 'When a blocker is marked as critical',
    hasThreshold: false
  },
];

export function AlertsConfigPanel({ userId, projectId }: AlertsConfigPanelProps) {
  const [alerts, setAlerts] = useState<StakeholderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [userId, projectId]);

  const loadAlerts = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('stakeholder_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading alerts:', error);
    } else {
      setAlerts(data || []);
    }

    setLoading(false);
  };

  const addAlert = async (alertType: string) => {
    if (!projectId) return;

    const typeConfig = ALERT_TYPES.find(t => t.type === alertType);
    
    const newAlert = {
      user_id: userId,
      project_id: projectId,
      alert_type: alertType,
      threshold_value: typeConfig?.hasThreshold ? typeConfig.defaultValue : null,
      threshold_operator: typeConfig?.hasThreshold ? 'lt' : null,
      is_active: true,
      notify_email: true,
      notify_teams: false
    };

    const { data, error } = await supabase
      .from('stakeholder_alerts')
      .insert(newAlert)
      .select()
      .single();

    if (error) {
      toast.error('Failed to add alert');
    } else if (data) {
      setAlerts([...alerts, data]);
      toast.success('Alert added');
    }
  };

  const updateAlert = async (alertId: string, updates: Partial<StakeholderAlert>) => {
    const { error } = await supabase
      .from('stakeholder_alerts')
      .update(updates)
      .eq('id', alertId);

    if (error) {
      toast.error('Failed to update alert');
    } else {
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, ...updates } : a));
    }
  };

  const deleteAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('stakeholder_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      toast.error('Failed to delete alert');
    } else {
      setAlerts(alerts.filter(a => a.id !== alertId));
      toast.success('Alert removed');
    }
  };

  const getAlertIcon = (type: string) => {
    const config = ALERT_TYPES.find(t => t.type === type);
    if (config) {
      const Icon = config.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <Bell className="h-5 w-5" />;
  };

  const getAlertConfig = (type: string) => {
    return ALERT_TYPES.find(t => t.type === type);
  };

  const availableAlertTypes = ALERT_TYPES.filter(
    t => !alerts.some(a => a.alert_type === t.type)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!projectId) {
    return (
      <Card className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
        <p className="text-muted-foreground">Choose a project to configure alerts</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Proactive Alerts
              </CardTitle>
              <CardDescription>
                Get notified when key project metrics change
              </CardDescription>
            </div>
            {availableAlertTypes.length > 0 && (
              <Select onValueChange={addAlert}>
                <SelectTrigger className="w-[200px]">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add Alert" />
                </SelectTrigger>
                <SelectContent>
                  {availableAlertTypes.map(type => (
                    <SelectItem key={type.type} value={type.type}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts configured</h3>
              <p className="text-muted-foreground mb-4">
                Add alerts to get notified about important project changes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => {
                const config = getAlertConfig(alert.alert_type);
                
                return (
                  <Card key={alert.id} className={`${!alert.is_active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${alert.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {getAlertIcon(alert.alert_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{config?.label}</h4>
                              {alert.last_triggered_at && (
                                <Badge variant="outline" className="text-xs">
                                  Last triggered: {new Date(alert.last_triggered_at).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {config?.description}
                            </p>

                            {config?.hasThreshold && (
                              <div className="flex items-center gap-2 mb-3">
                                <Label className="text-sm">Threshold:</Label>
                                <Select
                                  value={alert.threshold_operator || 'lt'}
                                  onValueChange={(value) => updateAlert(alert.id, { threshold_operator: value })}
                                >
                                  <SelectTrigger className="w-[100px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lt">Less than</SelectItem>
                                    <SelectItem value="gt">Greater than</SelectItem>
                                    <SelectItem value="eq">Equal to</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  className="w-20 h-8"
                                  value={alert.threshold_value || ''}
                                  onChange={(e) => updateAlert(alert.id, { threshold_value: parseFloat(e.target.value) })}
                                />
                                <span className="text-sm text-muted-foreground">{config.unit}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className={`h-4 w-4 ${alert.notify_email ? 'text-primary' : 'text-muted-foreground'}`} />
                                <Switch
                                  checked={alert.notify_email}
                                  onCheckedChange={(checked) => updateAlert(alert.id, { notify_email: checked })}
                                />
                                <Label className="text-xs">Email</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageSquare className={`h-4 w-4 ${alert.notify_teams ? 'text-primary' : 'text-muted-foreground'}`} />
                                <Switch
                                  checked={alert.notify_teams}
                                  onCheckedChange={(checked) => updateAlert(alert.id, { notify_teams: checked })}
                                />
                                <Label className="text-xs">Teams</Label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={(checked) => updateAlert(alert.id, { is_active: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlert(alert.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">How alerts work</p>
              <p className="text-muted-foreground">
                Alerts are checked automatically when project data changes. When a threshold is crossed, 
                you'll receive a notification via your selected channels with an embedded mini-report 
                showing the relevant context and recommended actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}