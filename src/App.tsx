import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import Workflows from "./pages/Workflows";
import Standup from "./pages/Standup";
import Dashboard from "./pages/Dashboard";
import Retrospective from "./pages/Retrospective";
import BacklogRefinement from "./pages/BacklogRefinement";
import UsageAnalytics from "./pages/UsageAnalytics";
import Landing from "./pages/Landing";
import ValueStreams from "./pages/ValueStreams";
import ProgramIncrement from "./pages/ProgramIncrement";
import FlowMetrics from "./pages/FlowMetrics";
import Integrations from "./pages/Integrations";
import ProjectProgress from "./pages/ProjectProgress";
import CeremonySetup from "./pages/CeremonySetup";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import SprintPlanningAssistant from "./pages/SprintPlanningAssistant";
import SprintReviewCoordinator from "./pages/SprintReviewCoordinator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/standup" element={<Standup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/retrospective" element={<Retrospective />} />
          <Route path="/backlog-refinement" element={<BacklogRefinement />} />
          <Route path="/usage-analytics" element={<UsageAnalytics />} />
          <Route path="/value-streams" element={<ValueStreams />} />
          <Route path="/program-increment" element={<ProgramIncrement />} />
          <Route path="/flow-metrics" element={<FlowMetrics />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/project-progress" element={<ProjectProgress />} />
          <Route path="/ceremony-setup" element={<CeremonySetup />} />
          <Route path="/project-workspace" element={<ProjectWorkspace />} />
          <Route path="/sprint-planning-assistant" element={<SprintPlanningAssistant />} />
          <Route path="/sprint-review-coordinator" element={<SprintReviewCoordinator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
