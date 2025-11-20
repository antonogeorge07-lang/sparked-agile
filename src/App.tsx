import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { AIAssistant } from "@/components/AIAssistant";
import ScrollRestoration from "@/components/ScrollRestoration";
import Lenis from '@studio-freight/lenis';
// Eager load critical pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const Admin = lazy(() => import("./pages/Admin"));
const SecurityIncidents = lazy(() => import("./pages/SecurityIncidents"));
const Subscription = lazy(() => import("./pages/Subscription"));
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
const VideoScriptGenerator = lazy(() => import("./pages/VideoScriptGenerator"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const PolyLinQ = lazy(() => import("./pages/PolyLinQ"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const SocialMediaGenerator = lazy(() => import("./pages/SocialMediaGenerator"));
const FeatureDemo = lazy(() => import("./pages/FeatureDemo"));
const Blog = lazy(() => import("./pages/Blog"));
const AITransformingAgileDelivery = lazy(() => import("./pages/blog/AITransformingAgileDelivery"));
const AutomatedSprintPlanningGuide = lazy(() => import("./pages/blog/AutomatedSprintPlanningGuide"));
const AgileBacklogPrioritizationAI = lazy(() => import("./pages/blog/AgileBacklogPrioritizationAI"));
const About = lazy(() => import("./pages/About"));
const InvestorPitchDeck = lazy(() => import("./pages/InvestorPitchDeck"));
const EpicManagement = lazy(() => import("./pages/EpicManagement"));
const EpicDetail = lazy(() => import("./pages/EpicDetail"));
const EpicPortfolio = lazy(() => import("./pages/EpicPortfolio"));
const QuickStart = lazy(() => import("./pages/QuickStart"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Only enable Lenis on larger screens to avoid scroll issues on mobile
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return;

    // Initialize Lenis with custom scroll container
    const scrollContainer = document.querySelector('#root-scroll-container');
    if (!scrollContainer) return;

    const lenis = new Lenis({
      wrapper: scrollContainer as HTMLElement,
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    });

    // Dispatch custom event on scroll
    lenis.on('scroll', (e: any) => {
      window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: e }));
    });

    // Animation frame loop
    let animationFrame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Add ResizeObserver with debouncing to reduce overhead
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => lenis.resize());
    });
    resizeObserver.observe(scrollContainer);

    // Listen for image loads
    const handleContentLoad = () => {
      lenis.resize();
    };
    window.addEventListener('load', handleContentLoad);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
      resizeObserver.disconnect();
      window.removeEventListener('load', handleContentLoad);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnalyticsProvider>
              <ScrollRestoration />
              <PerformanceMonitor />
              <FeedbackWidget />
              <AIAssistant />
              <div id="root-scroll-container">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/home" element={<Index />} />
                    <Route path="/quick-start" element={<QuickStart />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/incidents" element={<SecurityIncidents />} />
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
                    <Route path="/task-management" element={<TaskManagement />} />
                    <Route path="/project-workspace" element={<ProjectWorkspace />} />
                    <Route path="/sprint-planning-assistant" element={<SprintPlanningAssistant />} />
                    <Route path="/sprint-review-coordinator" element={<SprintReviewCoordinator />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/video-script-generator" element={<VideoScriptGenerator />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/user-guide" element={<UserGuide />} />
                    <Route path="/polylinq" element={<PolyLinQ />} />
                    <Route path="/project-command-centre" element={<ProjectCommandCentre />} />
                    <Route path="/market-intelligence" element={<MarketIntelligence />} />
                    <Route path="/social-media-generator" element={<SocialMediaGenerator />} />
                    <Route path="/feature-demo" element={<FeatureDemo />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/ai-transforming-agile-delivery" element={<AITransformingAgileDelivery />} />
                    <Route path="/blog/automated-sprint-planning-guide" element={<AutomatedSprintPlanningGuide />} />
                    <Route path="/blog/agile-backlog-prioritization-ai" element={<AgileBacklogPrioritizationAI />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/investor-pitch" element={<InvestorPitchDeck />} />
                    <Route path="/epic-management" element={<EpicManagement />} />
                    <Route path="/epic/:id" element={<EpicDetail />} />
                    <Route path="/epic-portfolio" element={<EpicPortfolio />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </AnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
