import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, CheckCircle, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface CeremonyTemplate {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
  defaultTime: string; // HH:MM format
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'bi-weekly';
  icon: any;
}

const ceremonyTemplates: CeremonyTemplate[] = [
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    duration: 15,
    description: 'Quick 15-minute daily sync to discuss progress, plans, and blockers',
    defaultTime: '09:00',
    isRecurring: true,
    recurrenceType: 'daily',
    icon: Users,
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    duration: 120,
    description: '2-hour session to plan the upcoming sprint',
    defaultTime: '10:00',
    isRecurring: true,
    recurrenceType: 'bi-weekly',
    icon: Calendar,
  },
  {
    id: 'sprint-retrospective',
    name: 'Sprint Retrospective',
    duration: 90,
    description: '90-minute session to reflect on the past sprint',
    defaultTime: '14:00',
    isRecurring: true,
    recurrenceType: 'bi-weekly',
    icon: Clock,
  },
  {
    id: 'pi-planning',
    name: 'PI Planning',
    duration: 480,
    description: 'Full-day Program Increment planning session',
    defaultTime: '09:00',
    isRecurring: false,
    icon: Calendar,
  },
];

export default function CeremonySetup() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<string>("");
  const [selectedCeremony, setSelectedCeremony] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const clientId = "YOUR_MICROSOFT_CLIENT_ID"; // This will be replaced with actual env var

  useEffect(() => {
    checkAuth();
    handleOAuthCallback();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check Microsoft connection via secure database storage (not localStorage)
    const { data: tokenData } = await supabase
      .from('user_microsoft_token_status')
      .select('is_valid, expires_at')
      .maybeSingle();

    if (tokenData?.is_valid && tokenData.expires_at && new Date(tokenData.expires_at) > new Date()) {
      setIsConnected(true);
      // Token is retrieved via decrypt-token edge function when needed
    }
  };

  const handleOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      try {
        // Token is securely stored in database by get-microsoft-token edge function
        const { data, error } = await supabase.functions.invoke('get-microsoft-token', {
          body: {
            code,
            redirectUri: window.location.origin + '/ceremony-setup',
          },
        });

        if (error) throw error;

        // Token is now encrypted and stored in database - no localStorage needed
        setIsConnected(true);

        // Clean up URL
        window.history.replaceState({}, document.title, '/ceremony-setup');

        toast({
          title: "Connected!",
          description: "Successfully connected to Microsoft Outlook",
        });
      } catch (error: any) {
        console.error('OAuth error:', error);
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const connectToOutlook = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/ceremony-setup');
    const scope = encodeURIComponent('https://graph.microsoft.com/Calendars.ReadWrite offline_access');
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
    
    window.location.href = authUrl;
  };

  const createCeremony = async () => {
    if (!selectedCeremony || !startDate || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please select a ceremony and start date",
        variant: "destructive",
      });
      return;
    }

    const template = ceremonyTemplates.find(t => t.id === selectedCeremony);
    if (!template) return;

    setIsCreating(true);

    try {
      const attendeeList = attendees.split(',').map(e => e.trim()).filter(Boolean);
      
      const startDateTime = new Date(startDate + 'T' + template.defaultTime + ':00Z').toISOString();
      const endDateTime = new Date(
        new Date(startDateTime).getTime() + template.duration * 60000
      ).toISOString();

      let recurrencePattern;
      let recurrenceRange;

      if (template.isRecurring) {
        if (template.recurrenceType === 'daily') {
          recurrencePattern = {
            type: 'daily',
            interval: 1,
          };
        } else if (template.recurrenceType === 'weekly') {
          recurrencePattern = {
            type: 'weekly',
            interval: 1,
            daysOfWeek: [new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })],
          };
        } else if (template.recurrenceType === 'bi-weekly') {
          recurrencePattern = {
            type: 'weekly',
            interval: 2,
            daysOfWeek: [new Date(startDate).toLocaleDateString('en-US', { weekday: 'long' })],
          };
        }

        recurrenceRange = {
          type: 'noEnd',
          startDate: startDate,
        };
      }

      const { data, error } = await supabase.functions.invoke('create-outlook-event', {
        body: {
          accessToken,
          subject: template.name,
          startDateTime,
          endDateTime,
          attendees: attendeeList,
          body: template.description,
          isRecurring: template.isRecurring,
          recurrencePattern,
          recurrenceRange,
        },
      });

      if (error) throw error;

      toast({
        title: "Ceremony Created!",
        description: `${template.name} has been added to your Outlook calendar`,
      });

      // Reset form
      setSelectedCeremony(null);
      setStartDate("");
      setAttendees("");

    } catch (error: any) {
      console.error('Error creating ceremony:', error);
      toast({
        title: "Failed to Create Ceremony",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Ceremony Setup - SAAI</title>
        <meta name="description" content="Configure and schedule your agile ceremonies including standups, retrospectives, and sprint reviews." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <BackButton className="mb-4" />
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Ceremony Setup
            </h1>
            <p className="text-muted-foreground">
              One-click setup for all your Agile ceremonies in Outlook
            </p>
          </div>

          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Connect to Microsoft Outlook
                </CardTitle>
                <CardDescription>
                  Connect your Microsoft account to start scheduling ceremonies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={connectToOutlook} className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Connect Outlook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Microsoft Outlook</CardTitle>
                      <CardDescription>Connected and ready to schedule</CardDescription>
                    </div>
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select a Ceremony</CardTitle>
                  <CardDescription>Choose from pre-configured ceremony templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ceremonyTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedCeremony === template.id
                            ? 'ring-2 ring-primary bg-accent'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedCeremony(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <template.icon className="w-5 h-5 text-primary mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{template.duration} minutes</span>
                                {template.isRecurring && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{template.recurrenceType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedCeremony && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Details</CardTitle>
                    <CardDescription>Configure when and who should attend</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
                      <Textarea
                        id="attendees"
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                        placeholder="john@example.com, jane@example.com"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={createCeremony}
                      disabled={isCreating}
                      className="w-full gap-2"
                    >
                      {isCreating ? (
                        "Creating..."
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Create Ceremony
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
