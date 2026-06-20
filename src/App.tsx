import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ReferralCapture } from "@/components/ReferralCapture";
import { analytics } from "@/lib/analytics";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ScrollRestoration from "@/components/ScrollRestoration";

// Eager load critical identity & presentation pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load global widgets to reduce initial bundle
const FeedbackWidget = lazy(() => import("@/components/FeedbackWidget").then((m) => ({ default: m.FeedbackWidget })));
const AIAssistant = lazy(() => import("@/components/AIAssistant").then((m) => ({ default: m.AIAssistant })));

// Lazy load non-critical pages for better performance
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
const VelocityTruth = lazy(() => import("./pages/VelocityTruth"));
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
const MyProjects = lazy(() => import("./pages/MyProjects"));
const WorkspaceSettings = lazy(() => import("./pages/WorkspaceSettings"));
const StakeholderPortal = lazy(() => import("./pages/StakeholderPortal"));
const Features = lazy(() => import("./pages/Features"));
const ExternalTasksHub = lazy(() => import("./pages/ExternalTasksHub"));
const TeamHub = lazy(() => import("./pages/TeamHub"));
const DataImport = lazy(() => import("./pages/DataImport"));
const ConnectTools = lazy(() => import("./pages/ConnectTools"));
const Briefing = lazy(() => import("./pages/Briefing"));
const Advanced = lazy(() => import("./pages/Advanced"));
const Trust = lazy(() => import("./pages/Trust"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-sm tracking-wide text-neutral-400 font-mono">SECURING NODE PERIMETER...</p>
    </div>
  </div>
);

// Global Secure Lifecycle Access Guard
const AuthGuard = ({ children, requireNewUser = false }: { children: React.ReactNode; requireNewUser?: boolean }) => {
  const { user, loading, isNewUser } = useRequireAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;

  // Lifecycle Route 1: Fresh signups must consume the User Guide first
  if (isNewUser && !requireNewUser) {
    return <Navigate to="/user-guide" replace />;
  }

  // Lifecycle Route 2: Active users trying to back-route to onboarding are pushed straight into the workspace cockpit
  if (!isNewUser && requireNewUser) {
    return <Navigate to="/velocity-truth" replace />;
  }

  return <>{children}</>;
};

// Global error handler for QueryClient
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const endpoint = Array.isArray(query.queryKey) ? query.queryKey[0] : String(query.queryKey);
      analytics.trackApiError(String(endpoint), 0, error instanceof Error ? error.message : "Unknown query error");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const key = mutation.options.mutationKey ? String(mutation.options.mutationKey) : "unknown_mutation";
      analytics.trackApiError(key, 0, error instanceof Error ? error.message : "Unknown mutation error");
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
              <ReferralCapture />
              <Suspense fallback={null}>
                <FeedbackWidget />
                <AIAssistant />
              </Suspense>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Perimeter Gateway Gates */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />

                  {/* Clean system navigation catch-alls */}
                  <Route path="/home" element={<Navigate to="/briefing" replace />} />
                  <Route path="/quick-start" element={<Navigate to="/connect" replace />} />

                  {/* Isolated User Guide Onboarding Sandbox */}
                  <Route
                    path="/user-guide"
                    element={
                      <AuthGuard requireNewUser={true}>
                        {" "}
                        <UserGuide />{" "}
                      </AuthGuard>
                    }
                  />

                  {/* Secured Velocity, Telemetry & Dashboard Modules */}
                  <Route
                    path="/velocity-truth"
                    element={
                      <AuthGuard>
                        <VelocityTruth />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/flow-metrics"
                    element={
                      <AuthGuard>
                        <FlowMetrics />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <AuthGuard>
                        <Dashboard />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/briefing"
                    element={
                      <AuthGuard>
                        <Briefing />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/advanced"
                    element={
                      <AuthGuard>
                        <Advanced />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/workspace/settings"
                    element={
                      <AuthGuard>
                        <WorkspaceSettings />
                      </AuthGuard>
                    }
                  />

                  {/* Additional Protected Core Modules */}
                  <Route
                    path="/workflows"
                    element={
                      <AuthGuard>
                        <Workflows />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/standup"
                    element={
                      <AuthGuard>
                        <Standup />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/retrospective"
                    element={
                      <AuthGuard>
                        <Retrospective />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/backlog-refinement"
                    element={
                      <AuthGuard>
                        <BacklogRefinement />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/usage-analytics"
                    element={
                      <AuthGuard>
                        <UsageAnalytics />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/value-streams"
                    element={
                      <AuthGuard>
                        <ValueStreams />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/program-increment"
                    element={
                      <AuthGuard>
                        <ProgramIncrement />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/integrations"
                    element={
                      <AuthGuard>
                        <Integrations />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/ceremony-setup"
                    element={
                      <AuthGuard>
                        <CeremonySetup />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/task-management"
                    element={
                      <AuthGuard>
                        <TaskManagement />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/project-workspace"
                    element={
                      <AuthGuard>
                        <ProjectWorkspace />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/sprint-planning-assistant"
                    element={
                      <AuthGuard>
                        <SprintPlanningAssistant />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/sprint-review-coordinator"
                    element={
                      <AuthGuard>
                        <SprintReviewCoordinator />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/project-command-centre"
                    element={
                      <AuthGuard>
                        <ProjectCommandCentre />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/my-projects"
                    element={
                      <AuthGuard>
                        <MyProjects />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/epic-management"
                    element={
                      <AuthGuard>
                        <EpicManagement />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/epic/:id"
                    element={
                      <AuthGuard>
                        <EpicDetail />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/external-tasks"
                    element={
                      <AuthGuard>
                        <ExternalTasksHub />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/team-hub"
                    element={
                      <AuthGuard>
                        <TeamHub />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/import"
                    element={
                      <AuthGuard>
                        <DataImport />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/connect"
                    element={
                      <AuthGuard>
                        <ConnectTools />
                      </AuthGuard>
                    }
                  />

                  {/* Admin Controls */}
                  <Route path="/admin" element={<Navigate to="/platform-owner" replace />} />
                  <Route
                    path="/platform-owner"
                    element={
                      <AuthGuard>
                        <PlatformOwner />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/security-incidents"
                    element={
                      <AuthGuard>
                        <SecurityIncidents />
                      </AuthGuard>
                    }
                  />

                  {/* Optimization Redirects */}
                  <Route path="/project-progress" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/epic-portfolio" element={<Navigate to="/epic-management" replace />} />
                  <Route path="/activity-feed" element={<Navigate to="/external-tasks" replace />} />
                  <Route path="/performance-predictor" element={<Navigate to="/flow-metrics" replace />} />
                  <Route path="/schedule-advisor" element={<Navigate to="/flow-metrics" replace />} />
                  <Route path="/risk-forecaster" element={<Navigate to="/flow-metrics" replace />} />

                  {/* Public Discovery Document Perimeters */}
                  <Route path="/about" element={<About />} />
                  <Route path="/trust" element={<Trust />} />
                  <Route path="/stakeholder-portal" element={<StakeholderPortal />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />

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
