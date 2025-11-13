import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Shield, Bot, User, Plus, Filter } from "lucide-react";
import { format } from "date-fns";

interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  detected_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  assigned_bot: boolean;
  bot_status: string | null;
  affected_systems: string[];
  detection_method: string | null;
  created_by: string | null;
  updated_at: string;
}

export default function SecurityIncidents() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can access security incidents.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    if (!roleLoading && role === 'admin') {
      checkAdminAndFetchIncidents();
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    if (incidents.length > 0) {
      applyFilters();
    }
  }, [incidents, filterStatus, filterSeverity, searchQuery]);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('security-incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_incidents'
        },
        (payload) => {
          console.log('Incident update:', payload);
          if (payload.eventType === 'INSERT') {
            setIncidents(prev => [payload.new as SecurityIncident, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents(prev => prev.map(inc => 
              inc.id === payload.new.id ? payload.new as SecurityIncident : inc
            ));
          } else if (payload.eventType === 'DELETE') {
            setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdminAndFetchIncidents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .rpc('is_admin', { user_id: user.id });

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "Only admins can access security incidents.",
          variant: "destructive",
        });
        navigate("/home");
        return;
      }

      setIsAdmin(true);
      await fetchIncidents();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/home");
    }
  };

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "Failed to load security incidents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    if (filterStatus !== "all") {
      filtered = filtered.filter(inc => inc.status === filterStatus);
    }

    if (filterSeverity !== "all") {
      filtered = filtered.filter(inc => inc.severity === filterSeverity);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inc =>
        inc.title.toLowerCase().includes(query) ||
        inc.description.toLowerCase().includes(query) ||
        inc.incident_type.toLowerCase().includes(query)
      );
    }

    setFilteredIncidents(filtered);
  };

  const assignBot = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .update({
          assigned_bot: true,
          bot_status: 'analyzing',
          status: 'investigating',
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;

      toast({
        title: "Bot Assigned",
        description: "AI bot is now analyzing and resolving the incident.",
      });
    } catch (error) {
      console.error("Error assigning bot:", error);
      toast({
        title: "Error",
        description: "Failed to assign bot to incident.",
        variant: "destructive",
      });
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('security_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Incident status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update incident status.",
        variant: "destructive",
      });
    }
  };

  const createIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('security_incidents')
        .insert({
          incident_type: formData.get('incident_type') as string,
          severity: formData.get('severity') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          detection_method: formData.get('detection_method') as string,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Incident Created",
        description: "New security incident has been logged.",
      });
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating incident:", error);
      toast({
        title: "Error",
        description: "Failed to create incident.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV-1': return 'bg-red-500';
      case 'SEV-2': return 'bg-orange-500';
      case 'SEV-3': return 'bg-yellow-500';
      case 'SEV-4': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'investigating': return 'bg-yellow-500';
      case 'contained': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton fallbackPath="/admin" />
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Security Incidents</h1>
            <p className="text-muted-foreground">Monitor and manage security incidents with real-time updates</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Security Incident</DialogTitle>
                <DialogDescription>
                  Document a new security incident for investigation
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createIncident} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="Brief incident title" />
                </div>
                <div>
                  <Label htmlFor="incident_type">Incident Type</Label>
                  <Input id="incident_type" name="incident_type" required placeholder="e.g., unauthorized_access, injection_attack" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select name="severity" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEV-1">SEV-1 (Critical)</SelectItem>
                        <SelectItem value="SEV-2">SEV-2 (High)</SelectItem>
                        <SelectItem value="SEV-3">SEV-3 (Medium)</SelectItem>
                        <SelectItem value="SEV-4">SEV-4 (Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="detection_method">Detection Method</Label>
                    <Input id="detection_method" name="detection_method" placeholder="How was it detected?" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required rows={5} placeholder="Detailed incident description" />
                </div>
                <Button type="submit" className="w-full">Create Incident</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="contained">Contained</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="SEV-1">SEV-1 (Critical)</SelectItem>
                    <SelectItem value="SEV-2">SEV-2 (High)</SelectItem>
                    <SelectItem value="SEV-3">SEV-3 (Medium)</SelectItem>
                    <SelectItem value="SEV-4">SEV-4 (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterSeverity("all");
                    setSearchQuery("");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No incidents found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        {incident.assigned_bot && (
                          <Badge variant="outline" className="gap-1">
                            <Bot className="w-3 h-3" />
                            {incident.bot_status || 'Bot Assigned'}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {incident.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {incident.incident_type} • Detected {format(new Date(incident.detected_at), 'PPp')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{incident.description}</p>
                  
                  {incident.affected_systems && incident.affected_systems.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-xs text-muted-foreground">Affected Systems</Label>
                      <div className="flex gap-2 mt-1">
                        {incident.affected_systems.map((system, idx) => (
                          <Badge key={idx} variant="secondary">{system}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {!incident.assigned_bot && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignBot(incident.id)}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Assign AI Bot
                      </Button>
                    )}
                    
                    {incident.status !== 'resolved' && incident.status !== 'closed' && (
                      <>
                        {incident.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                          >
                            Start Investigation
                          </Button>
                        )}
                        {incident.status === 'investigating' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateIncidentStatus(incident.id, 'contained')}
                          >
                            Mark Contained
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    
                    {incident.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateIncidentStatus(incident.id, 'closed')}
                      >
                        Close Incident
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}