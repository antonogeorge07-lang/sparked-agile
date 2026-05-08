import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const DemoModeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const createDemoProject = async () => {
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to try demo mode");
        navigate("/auth");
        return;
      }

      // Get user's workspace - required for RLS policies
      const {
        data: workspace,
        error: workspaceError
      } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).single();
      if (workspaceError || !workspace) {
        toast.error("Please ensure you have a workspace created first.");
        return;
      }

      // Create demo project
      const {
        data: project,
        error: projectError
      } = await supabase.from("projects").insert({
        name: "Demo Project - E-commerce Platform",
        description: "Sample project showcasing Spark-Agile features with realistic data",
        user_id: user.id,
        workspace_id: workspace.id
      }).select().single();
      if (projectError) throw projectError;

      // Add user as project member
      await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: user.id,
        role: "owner"
      });

      // Create demo team members
      const demoTeamMembers = [{
        name: "Sarah Chen",
        email: "sarah@demo.com",
        role: "Scrum Master"
      }, {
        name: "Michael Rodriguez",
        email: "michael@demo.com",
        role: "Developer"
      }, {
        name: "Emily Watson",
        email: "emily@demo.com",
        role: "Product Owner"
      }, {
        name: "James Kim",
        email: "james@demo.com",
        role: "Developer"
      }, {
        name: "Lisa Anderson",
        email: "lisa@demo.com",
        role: "QA Engineer"
      }];
      await supabase.from("team_members").insert(demoTeamMembers.map(member => ({
        ...member,
        project_id: project.id
      })));

      // Create demo standup updates
      const {
        data: teamMembers
      } = await supabase.from("team_members").select("id").eq("project_id", project.id).limit(3);
      if (teamMembers) {
        await supabase.from("standup_updates").insert([{
          project_id: project.id,
          team_member_id: teamMembers[0].id,
          yesterday: "Completed user authentication module and integrated with backend API",
          today: "Working on payment gateway integration with Stripe",
          blockers: "Waiting for API keys from the product team"
        }, {
          project_id: project.id,
          team_member_id: teamMembers[1].id,
          yesterday: "Fixed critical bugs in shopping cart functionality",
          today: "Implementing product recommendation engine",
          blockers: null
        }, {
          project_id: project.id,
          team_member_id: teamMembers[2].id,
          yesterday: "Reviewed and approved PRs from the team",
          today: "Sprint planning preparation and backlog refinement",
          blockers: null
        }]);
      }

      // Create demo action items
      await supabase.from("action_items").insert([{
        project_id: project.id,
        title: "Set up CI/CD pipeline",
        description: "Configure automated testing and deployment workflow",
        status: "in_progress",
        priority: "high"
      }, {
        project_id: project.id,
        title: "Update API documentation",
        description: "Document new endpoints for mobile app integration",
        status: "open",
        priority: "medium"
      }, {
        project_id: project.id,
        title: "Performance optimization",
        description: "Improve page load time for product catalog",
        status: "completed",
        priority: "high"
      }]);

      // Create demo value stream
      const {
        data: valueStream
      } = await supabase.from("value_streams").insert({
        project_id: project.id,
        name: "Customer Experience",
        description: "End-to-end customer journey from discovery to purchase"
      }).select().single();

      // Create demo epic
      if (valueStream) {
        await supabase.from("epics").insert({
          value_stream_id: valueStream.id,
          title: "Mobile App Launch",
          description: "Develop and launch iOS and Android applications",
          status: "in_progress",
          priority: "high",
          business_value: 85
        });
      }

      // Create demo flow metrics
      const today = new Date();
      const flowMetricsData = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        flowMetricsData.push({
          project_id: project.id,
          metric_date: date.toISOString().split('T')[0],
          work_in_progress: Math.floor(Math.random() * 10) + 5,
          cycle_time_avg: (Math.random() * 5 + 2).toFixed(2),
          lead_time_avg: (Math.random() * 8 + 3).toFixed(2),
          throughput: Math.floor(Math.random() * 8) + 2
        });
      }
      await supabase.from("flow_metrics").insert(flowMetricsData);
      localStorage.setItem("demo_mode", "true");
      localStorage.setItem("workspace_setup_completed", "true");
      toast.success("🎉 Demo project created! Explore all features with realistic data.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Demo creation error:", error);
      toast.error(`Failed to create demo project: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };
  return <>
      <Button 
        variant="outline" 
        size="lg" 
        onClick={() => setIsOpen(true)}
        className="gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base w-full sm:w-auto border-2 hover:bg-muted/50"
      >
        <Play className="h-4 w-4 sm:h-5 sm:w-5" />
        {t('landing.hero.tryDemo', 'Try Demo Mode')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Try Demo Mode
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Experience Spark-Agile instantly with a fully populated sample project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-semibold">What's Included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  ✅ Sample project with realistic e-commerce data
                </li>
                <li className="flex items-center gap-2">
                  ✅ 5 team members with standup updates
                </li>
                <li className="flex items-center gap-2">
                  ✅ Action items, epics, and value streams
                </li>
                <li className="flex items-center gap-2">
                  ✅ 7 days of flow metrics and analytics
                </li>
                <li className="flex items-center gap-2">
                  ✅ Full access to all platform features
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-primary font-medium">
                💡 Pro Tip: You can convert this to a real project later or create a new one anytime
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Not Now
            </Button>
            <Button onClick={createDemoProject} disabled={isLoading} className="gap-2">
              {isLoading ? <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Demo...
                </> : <>
                  <Sparkles className="h-4 w-4" />
                  Create Demo Project
                </>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};