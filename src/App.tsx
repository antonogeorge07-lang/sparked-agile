import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { analytics } from "@/lib/analytics";
// Lazy load global widgets to reduce initial bundle
const FeedbackWidget = lazy(() => import("@/components/FeedbackWidget").then(m => ({ default: m.FeedbackWidget })));
const AIAssistant = lazy(() => import("@/components/AIAssistant").then(m => ({ default: m.AIAssistant })));
import ScrollRestoration from "@/components/ScrollRestoration";
// Eager load critical pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const Admin = lazy(() => import("./pages/Admin"));
const PlatformOwner = lazy(() => import("./pages/PlatformOwner"));
const SecurityIncidents = lazy(() => import("./pages/SecurityIncidents"));
const Workflows = lazy(() => import("./pages/Workflows"));
const ProjectCommandCentre = lazy(() => import("./pages/ProjectCommandCentre"));
const Standup = lazy(() => import("./pages/Standup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Retrospective = lazy(() => import("./pages/Retrospective"));
const BacklogRefinement = lazy(() => import("./pages/BacklogRefinement"));
const UsageAnalytics = lazy(() => import("./pages/UsageAnalytics"));
const ValueStreams = lazy(() => import("./pages/ValueStreams"));
const ProgramIncrement = lazy(() => import("./pages/ProgramIncrement"));
const FlowMetrics = lazy(() => import("./pages/FlowMetrics"));
const Integrations = lazy(() => import("./pages/Integrations"));
const ProjectProgress = lazy(() => import("./pages/ProjectProgress"));
const CeremonySetup = lazy(() => import("./pages/CeremonySetup"));
const TaskManagement = lazy(() => import("./pages/TaskManagement"));
const ProjectWorkspace = lazy(() => import("./pages/ProjectWorkspace"));
const SprintPlanningAssistant = lazy(() => import("./pages/SprintPlanningAssistant"));
const SprintReviewCoordinator = lazy(() => import("./pages/SprintReviewCoordinator"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const UserGuide = lazy(() => import("./pages/UserGuide"));

const About = lazy(() => import("./pages/About"));
const EpicManagement = lazy(() => import("./pages/EpicManagement"));
const EpicDetail = lazy(() => import("./pages/EpicDetail"));
const EpicPortfolio = lazy(() => import("./pages/EpicPortfolio"));
const QuickStart = lazy(() => import("./pages/QuickStart"));
const MyProjects = lazy(() => import("./pages/MyProjects"));
const WorkspaceSettings = lazy(() => import("./pages/WorkspaceSettings"));


const StakeholderPortal = lazy(() => import("./pages/StakeholderPortal"));
const Features = lazy(() => import("./pages/Features"));
const VisualDemo = lazy(() => import("./pages/VisualDemo"));
const PerformancePredictor = lazy(() => import("./pages/PerformancePredictor"));
const ScheduleAdvisor = lazy(() => import("./pages/ScheduleAdvisor"));
const RiskForecaster = lazy(() => import("./pages/RiskForecaster"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Global error handler for QueryClient - tracks all failed queries/mutations
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const endpoint = Array.isArray(query.queryKey) ? query.queryKey[0] : String(query.queryKey);
      analytics.trackApiError(
        String(endpoint),
        0,
        error instanceof Error ? error.message : 'Unknown query error'
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const key = mutation.options.mutationKey
        ? String(mutation.options.mutationKey)
        : 'unknown_mutation';
      analytics.trackApiError(
        key,
        0,
        error instanceof Error ? error.message : 'Unknown mutation error'
      );
    },
  }),
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnalyticsProvider>
              <ScrollRestoration />
              <Suspense fallback={null}>
                <FeedbackWidget />
                <AIAssistant />
              </Suspense>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/quick-start" element={<QuickStart />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/platform-owner" element={<PlatformOwner />} />
                  <Route path="/security-incidents" element={<SecurityIncidents />} />
                  <Route path="/admin/incidents" element={<SecurityIncidents />} />
                  <Route path="/my-projects" element={<MyProjects />} />
                  <Route path="/workspace/settings" element={<WorkspaceSettings />} />
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
                  <Route path="/task-management" element={<TaskManagement />} />
                  <Route path="/project-workspace" element={<ProjectWorkspace />} />
                  <Route path="/sprint-planning-assistant" element={<SprintPlanningAssistant />} />
                  <Route path="/sprint-review-coordinator" element={<SprintReviewCoordinator />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/user-guide" element={<UserGuide />} />
                  <Route path="/project-command-centre" element={<ProjectCommandCentre />} />
                  <Route path="/feature-demo" element={<FeatureDemo />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/epic-management" element={<EpicManagement />} />
                  <Route path="/epic/:id" element={<EpicDetail />} />
                  <Route path="/epic-portfolio" element={<EpicPortfolio />} />
                  <Route path="/onboarding-guide" element={<OnboardingGuide />} />
                  <Route path="/stakeholder-portal" element={<StakeholderPortal />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/visual-demo" element={<VisualDemo />} />
                  <Route path="/performance-predictor" element={<PerformancePredictor />} />
                  <Route path="/schedule-advisor" element={<ScheduleAdvisor />} />
                  <Route path="/risk-forecaster" element={<RiskForecaster />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
export default App;
