import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const integrations = [
  {
    name: "Jira",
    icon: "🎯",
    description: "Bidirectional sync with Jira Cloud and Server",
    features: [
      "Auto-sync sprints & backlog",
      "Real-time status updates",
      "Custom field mapping",
      "Bulk import/export"
    ],
    category: "Project Management",
    popular: true
  },
  {
    name: "GitHub",
    icon: "🐙",
    description: "Connect repositories, PRs, and commits",
    features: [
      "Link commits to tasks",
      "PR status tracking",
      "Branch management",
      "Release automation"
    ],
    category: "Version Control",
    popular: true
  },
  {
    name: "Outlook",
    icon: "📧",
    description: "Calendar integration for ceremonies",
    features: [
      "Auto-schedule standups",
      "Meeting reminders",
      "Calendar sync",
      "Attendee management"
    ],
    category: "Communication",
    popular: false
  },
  {
    name: "Slack",
    icon: "💬",
    description: "Team notifications and updates",
    features: [
      "Channel notifications",
      "Bot commands",
      "Daily digests",
      "Mention alerts"
    ],
    category: "Communication",
    coming_soon: true
  },
  {
    name: "Azure DevOps",
    icon: "☁️",
    description: "Full Azure Boards integration",
    features: [
      "Work item sync",
      "Pipeline triggers",
      "Sprint planning",
      "Dashboard widgets"
    ],
    category: "DevOps",
    coming_soon: true
  },
  {
    name: "Confluence",
    icon: "📚",
    description: "Documentation and wiki sync",
    features: [
      "Page templates",
      "Sprint reports",
      "Auto-documentation",
      "Space management"
    ],
    category: "Documentation",
    coming_soon: true
  }
];

export function IntegrationShowcase() {
  const availableIntegrations = integrations.filter(i => !i.coming_soon);
  const comingSoonIntegrations = integrations.filter(i => i.coming_soon);

  return (
    <section className="py-20 px-4" aria-labelledby="integrations-heading">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Native Integrations
          </Badge>
          <h2 id="integrations-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Connect Your Entire Workflow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with the tools your team already uses. No code required.
          </p>
        </div>

        {/* Available Integrations */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {availableIntegrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    {integration.popular && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Popular
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {integration.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">Coming Soon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {comingSoonIntegrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/50 bg-muted/20"
              >
                <span className="text-2xl opacity-60">{integration.icon}</span>
                <div>
                  <div className="font-medium">{integration.name}</div>
                  <div className="text-xs text-muted-foreground">{integration.category}</div>
                </div>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Soon
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/integrations">
            <Button size="lg" className="group">
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Need a custom integration? <a href="/contact" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
