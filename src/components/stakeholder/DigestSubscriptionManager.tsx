import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Mail, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  Send,
  Check,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DigestSubscription {
  id: string;
  digest_type: string;
  delivery_day: number | null;
  delivery_hour: number;
  include_wins: boolean;
  include_risks: boolean;
  include_recommendations: boolean;
  include_metrics: boolean;
  email_address: string | null;
  is_active: boolean;
  last_sent_at: string | null;
}

interface DigestSubscriptionManagerProps {
  userId: string;
  projectId: string | null;
  userEmail?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function DigestSubscriptionManager({ userId, projectId, userEmail }: DigestSubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<DigestSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [userId, projectId]);

  const loadSubscription = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('digest_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading subscription:', error);
    }

    if (data) {
      setSubscription(data);
    } else {
      // Create default subscription
      setSubscription({
        id: '',
        digest_type: 'weekly',
        delivery_day: 1, // Monday
        delivery_hour: 9,
        include_wins: true,
        include_risks: true,
        include_recommendations: true,
        include_metrics: true,
        email_address: userEmail || null,
        is_active: false,
        last_sent_at: null
      });
    }

    setLoading(false);
  };

  const saveSubscription = async () => {
    if (!projectId || !subscription) return;

    setSaving(true);

    const subscriptionData = {
      user_id: userId,
      project_id: projectId,
      digest_type: subscription.digest_type,
      delivery_day: subscription.delivery_day,
      delivery_hour: subscription.delivery_hour,
      include_wins: subscription.include_wins,
      include_risks: subscription.include_risks,
      include_recommendations: subscription.include_recommendations,
      include_metrics: subscription.include_metrics,
      email_address: subscription.email_address,
      is_active: subscription.is_active
    };

    let error;

    if (subscription.id) {
      const result = await supabase
        .from('digest_subscriptions')
        .update(subscriptionData)
        .eq('id', subscription.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('digest_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();
      error = result.error;
      if (result.data) {
        setSubscription({ ...subscription, id: result.data.id });
      }
    }

    if (error) {
      toast.error('Failed to save digest settings');
    } else {
      toast.success('Digest settings saved');
    }

    setSaving(false);
  };

  const sendTestDigest = async () => {
    if (!projectId || !subscription?.email_address) {
      toast.error('Please save an email address first');
      return;
    }

    setSendingTest(true);

    try {
      const { error } = await supabase.functions.invoke('send-executive-digest', {
        body: {
          userId,
          projectId,
          email: subscription.email_address,
          isTest: true
        }
      });

      if (error) throw error;
      toast.success('Test digest sent to your email');
    } catch (error) {
      console.error('Error sending test digest:', error);
      toast.error('Failed to send test digest');
    }

    setSendingTest(false);
  };

  const updateField = (field: keyof DigestSubscription, value: any) => {
    if (subscription) {
      setSubscription({ ...subscription, [field]: value });
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectId) {
    return (
      <Card className="p-8 text-center">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
        <p className="text-muted-foreground">Choose a project to configure email digests</p>
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
                <Mail className="h-5 w-5 text-primary" />
                Executive Digest Settings
              </CardTitle>
              <CardDescription>
                Receive AI-curated project summaries directly to your inbox
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="digest-active">Enable Digest</Label>
              <Switch
                id="digest-active"
                checked={subscription?.is_active || false}
                onCheckedChange={(checked) => updateField('is_active', checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">Delivery Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={subscription?.email_address || ''}
              onChange={(e) => updateField('email_address', e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={subscription?.digest_type || 'weekly'}
                onValueChange={(value) => updateField('digest_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {subscription?.digest_type === 'weekly' && (
              <div className="space-y-2">
                <Label>Delivery Day</Label>
                <Select
                  value={String(subscription?.delivery_day ?? 1)}
                  onValueChange={(value) => updateField('delivery_day', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <Select
                value={String(subscription?.delivery_hour ?? 9)}
                onValueChange={(value) => updateField('delivery_hour', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Includes */}
          <div className="space-y-4">
            <Label className="text-base">Include in Digest</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Wins</p>
                  <p className="text-xs text-muted-foreground">Achievements & completions</p>
                </div>
                <Switch
                  checked={subscription?.include_wins ?? true}
                  onCheckedChange={(checked) => updateField('include_wins', checked)}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Risks</p>
                  <p className="text-xs text-muted-foreground">Blockers & concerns</p>
                </div>
                <Switch
                  checked={subscription?.include_risks ?? true}
                  onCheckedChange={(checked) => updateField('include_risks', checked)}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">AI Insights</p>
                  <p className="text-xs text-muted-foreground">Recommendations</p>
                </div>
                <Switch
                  checked={subscription?.include_recommendations ?? true}
                  onCheckedChange={(checked) => updateField('include_recommendations', checked)}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Metrics</p>
                  <p className="text-xs text-muted-foreground">Velocity & progress</p>
                </div>
                <Switch
                  checked={subscription?.include_metrics ?? true}
                  onCheckedChange={(checked) => updateField('include_metrics', checked)}
                />
              </div>
            </div>
          </div>

          {/* Last Sent */}
          {subscription?.last_sent_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last digest sent {formatDistanceToNow(new Date(subscription.last_sent_at), { addSuffix: true })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={saveSubscription} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={sendTestDigest}
              disabled={sendingTest || !subscription?.email_address}
            >
              {sendingTest ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Test Digest
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Digest Preview</CardTitle>
          <CardDescription>Example of what your executive digest will look like</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Weekly Executive Digest</p>
                <p className="text-sm text-muted-foreground">Project Status Summary</p>
              </div>
            </div>

            {subscription?.include_wins && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">Wins This Week</span>
                </div>
                <ul className="text-sm text-muted-foreground pl-6 space-y-1">
                  <li>• Sprint velocity increased 15% to 42 story points</li>
                  <li>• 3 epics successfully closed with stakeholder approval</li>
                  <li>• Zero critical blockers for 5 consecutive days</li>
                </ul>
              </div>
            )}

            {subscription?.include_risks && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">Risks & Attention Items</span>
                </div>
                <ul className="text-sm text-muted-foreground pl-6 space-y-1">
                  <li>• Q4 Epic "Payment Integration" at risk - 2 weeks behind</li>
                  <li>• Resource constraint on mobile team (1 dev on leave)</li>
                </ul>
              </div>
            )}

            {subscription?.include_recommendations && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-semibold">AI Recommendations</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Consider reallocating resources from completed epics to accelerate the Payment Integration timeline. 
                  Current velocity suggests 85% probability of meeting Q4 deadline with 1 additional developer.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}