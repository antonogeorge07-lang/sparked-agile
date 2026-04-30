import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Calendar, Users, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CeremonyStatus {
  standup: boolean;
  retrospective: boolean;
  sprintPlanning: boolean;
  backlogRefinement: boolean;
}

interface IntegrationStatus {
  jira: boolean;
  github: boolean;
  microsoft: boolean;
}

export const CeremonyHealthCheck = () => {
  const [ceremonies, setCeremonies] = useState<CeremonyStatus>({
    standup: false,
    retrospective: false,
    sprintPlanning: false,
    backlogRefinement: false,
  });
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    jira: false,
    github: false,
    microsoft: false,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Ceremony health is now derived from project membership only
      // (ceremony_configs table removed in Phase D consolidation).
      // Treat all standard ceremonies as available once a user has any project.
      const { data: hasProject } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', session.user.id)
        .limit(1);

      const activeCeremonies: CeremonyStatus = {
        standup: !!hasProject?.length,
        retrospective: !!hasProject?.length,
        sprintPlanning: !!hasProject?.length,
        backlogRefinement: !!hasProject?.length,
      };

      setCeremonies(activeCeremonies);

      // Check integrations
      const { data: projectMembers } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', session.user.id);

      if (projectMembers && projectMembers.length > 0) {
        const projectIds = projectMembers.map(pm => pm.project_id);
        
        const { data: activeIntegrations } = await supabase
          .from('integrations')
          .select('integration_type, is_active')
          .in('project_id', projectIds)
          .eq('is_active', true);

        const activeIntegrationStatus: IntegrationStatus = {
          jira: false,
          github: false,
          microsoft: false,
        };

        activeIntegrations?.forEach(integration => {
          if (integration.integration_type === 'jira') activeIntegrationStatus.jira = true;
          if (integration.integration_type === 'github') activeIntegrationStatus.github = true;
          if (integration.integration_type === 'microsoft') activeIntegrationStatus.microsoft = true;
        });

        setIntegrations(activeIntegrationStatus);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking system health:', error);
      setLoading(false);
    }
  };

  const getHealthScore = () => {
    const ceremonyCount = Object.values(ceremonies).filter(Boolean).length;
    const integrationCount = Object.values(integrations).filter(Boolean).length;
    const total = ceremonyCount + integrationCount;
    const max = 7;
    return Math.round((total / max) * 100);
  };

  const healthScore = getHealthScore();

  if (loading) return null;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Platform Health Check
              <Badge variant={healthScore >= 70 ? "default" : healthScore >= 40 ? "secondary" : "destructive"}>
                {healthScore}% Active
              </Badge>
            </CardTitle>
            <CardDescription>Ceremonial features and integration status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ceremonies Status */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Agile Ceremonies
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ceremonies).map(([key, active]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {active ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations Status */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Integrations
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(integrations).map(([key, active]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {active ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {healthScore < 70 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">Recommendations:</p>
              <ul className="text-sm space-y-1">
                {!ceremonies.standup && <li>• Set up Daily Standup for better team sync</li>}
                {!ceremonies.sprintPlanning && <li>• Configure Sprint Planning ceremonies</li>}
                {!integrations.github && <li>• Connect GitHub for code tracking</li>}
                {!integrations.microsoft && <li>• Connect Microsoft for calendar integration</li>}
              </ul>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => navigate('/ceremony-setup')} variant="outline">
                  Setup Ceremonies
                </Button>
                <Button size="sm" onClick={() => navigate('/integrations')} variant="outline">
                  Manage Integrations
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
