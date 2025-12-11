import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Webhook, 
  Settings2, 
  FileJson, 
  Key, 
  Zap, 
  Shield,
  ExternalLink,
  BookOpen,
  Terminal,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

// Live API endpoints - these are actual edge functions
const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/functions/v1/api-projects",
    description: "Retrieve all projects for authenticated user"
  },
  {
    method: "POST",
    endpoint: "/functions/v1/api-tasks",
    description: "Create a new task in a project"
  },
  {
    method: "GET",
    endpoint: "/functions/v1/api-epics/:id",
    description: "Get epic details with features and milestones"
  },
  {
    method: "PUT",
    endpoint: "/functions/v1/api-integrations",
    description: "Update integration configuration"
  },
  {
    method: "POST",
    endpoint: "/functions/v1/api-webhooks",
    description: "Register webhook endpoints for events"
  }
];

// Actual webhook events triggered by database changes
const webhookEvents = [
  { event: "projects.insert", description: "Fired when a new project is created" },
  { event: "project_tasks.update", description: "Fired when a task status changes" },
  { event: "epics.update", description: "Fired when an epic is updated" },
  { event: "project_tasks.insert", description: "Fired when a new task is created" },
  { event: "projects.delete", description: "Fired when a project is deleted" }
];

const advancedConfigs = [
  {
    title: "Custom Workflows",
    icon: RefreshCw,
    description: "Define custom task stages, transitions, and automation rules"
  },
  {
    title: "Role-Based Access",
    icon: Shield,
    description: "Configure granular permissions for teams and projects"
  },
  {
    title: "API Rate Limits",
    icon: Zap,
    description: "Tiered limits: 100/min free, 1000/min pro, unlimited enterprise"
  },
  {
    title: "Webhook Signing",
    icon: Key,
    description: "HMAC-SHA256 signatures for secure webhook verification"
  }
];

export function DevelopersSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30" aria-labelledby="developers-heading">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Code2 className="h-3 w-3 mr-1" />
            For Developers
          </Badge>
          <h2 id="developers-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Build Powerful Integrations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive APIs, real-time webhooks, and flexible configurations to extend SAAI's capabilities
          </p>
        </div>

        {/* Two Column Grid - API & Webhooks */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* API Documentation */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileJson className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">REST API</CardTitle>
              </div>
              <CardDescription>
                RESTful endpoints with JSON responses and OAuth 2.0 authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiEndpoints.map((api, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge 
                    variant="secondary" 
                    className={`font-mono text-xs shrink-0 ${
                      api.method === "GET" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      api.method === "POST" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {api.method}
                  </Badge>
                  <div className="min-w-0">
                    <code className="text-xs font-mono text-foreground block truncate">{api.endpoint}</code>
                    <span className="text-xs text-muted-foreground">{api.description}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4 group">
                <BookOpen className="h-4 w-4 mr-2" />
                View Full Documentation
                <ExternalLink className="h-3 w-3 ml-2 opacity-50 group-hover:opacity-100" />
              </Button>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Webhook className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Webhooks</CardTitle>
              </div>
              <CardDescription>
                Real-time event notifications with retry logic and delivery logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhookEvents.map((webhook, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Zap className="h-3 w-3 mt-1 text-primary shrink-0" />
                  <div className="min-w-0">
                    <code className="text-xs font-mono text-foreground block">{webhook.event}</code>
                    <span className="text-xs text-muted-foreground">{webhook.description}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4 group">
                <Terminal className="h-4 w-4 mr-2" />
                Webhook Setup Guide
                <ExternalLink className="h-3 w-3 ml-2 opacity-50 group-hover:opacity-100" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Link to Integrations */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground mb-4">Looking for pre-built integrations with Jira, GitHub, and more?</p>
          <Link to="/integrations">
            <Button variant="outline" className="group">
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Advanced Configurations */}
        <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Advanced Configurations</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade customization options</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advancedConfigs.map((config, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <config.icon className="h-5 w-5 text-primary mb-3" />
                <h4 className="font-medium text-foreground mb-1">{config.title}</h4>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/30">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Key className="h-3 w-3 mr-1" />
              Authentication Guide
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Terminal className="h-3 w-3 mr-1" />
              SDKs & Libraries
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Shield className="h-3 w-3 mr-1" />
              Security Best Practices
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Zap className="h-3 w-3 mr-1" />
              Rate Limiting
            </Badge>
          </div>
        </div>

      </div>
    </section>
  );
}
