import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Loader2,
  Search,
  Calendar
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MarketAnalysis {
  analysis: string;
  relatedQuestions: string[];
  sources: any[];
  timestamp: string;
}

export default function MarketIntelligence() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<MarketAnalysis | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketAnalysis | null>(null);
  const [customQuery, setCustomQuery] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (userRole?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "Admin access required for market intelligence",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const performResearch = async (query: string, type: string) => {
    setResearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-research', {
        body: {
          researchQuery: query,
          analysisType: type
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Research failed');
      }

      return data as MarketAnalysis;
    } catch (error: any) {
      console.error('Research error:', error);
      toast({
        title: "Research Failed",
        description: error.message || "Failed to complete market research",
        variant: "destructive",
      });
      return null;
    } finally {
      setResearching(false);
    }
  };

  const analyzeCompetition = async () => {
    const query = `Analyze the current competitive landscape for AI-powered agile project management tools in 2025. 
    Compare features, pricing, and market positioning of tools like Jira Software, Monday.com, Linear, 
    Asana, ClickUp, and Azure DevOps. Focus on:
    1. AI/automation capabilities in project management
    2. Agile ceremony facilitation features
    3. Integration ecosystems
    4. Market gaps and opportunities
    5. Pricing strategies
    Provide specific, recent data with citations.`;
    
    const result = await performResearch(query, 'competitive');
    if (result) setCompetitiveAnalysis(result);
  };

  const analyzeMarketTrends = async () => {
    const query = `What are the latest trends and innovations in project management software for 2025? 
    Focus on:
    1. AI and automation trends
    2. Remote/hybrid work collaboration features
    3. Integration platform strategies
    4. Pricing and business model evolution
    5. User experience innovations
    6. Emerging market demands and pain points
    Provide recent data with specific examples and citations.`;
    
    const result = await performResearch(query, 'trends');
    if (result) setMarketTrends(result);
  };

  const performCustomResearch = async () => {
    if (!customQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a research query",
        variant: "destructive",
      });
      return;
    }

    const result = await performResearch(customQuery, 'custom');
    if (result) {
      toast({
        title: "Research Complete",
        description: "Custom market research analysis completed",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Market Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time competitive analysis and strategic insights for SAAI
          </p>
        </div>

        {/* Current Position Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Weekly Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">102</div>
              <p className="text-xs text-muted-foreground mt-1">
                345 pageviews • 3.38 pages/visit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8.6 min</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average session duration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                Bounce Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">64%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-orange-500">↑ Needs improvement</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">Strong</div>
              <p className="text-xs text-muted-foreground mt-1">
                All critical issues resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SAAI Strengths */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              SAAI Current Strengths
            </CardTitle>
            <CardDescription>
              What makes SAAI competitive in the market today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Core Features
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>AI Assistant (Omair):</strong> Contextual project management guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Agile Ceremonies:</strong> Automated standup, sprint planning, retros, sprint reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>SAFe Framework:</strong> Value streams, ARTs, Program Increments, OKRs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Integration Hub:</strong> JIRA, GitHub, Microsoft 365 connectivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Command Centre:</strong> Visual project management with drag-and-drop</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Technical Advantages
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Security:</strong> Comprehensive RLS policies, input validation, rate limiting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Real-time:</strong> Live collaboration and presence indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Analytics:</strong> Usage tracking and actionable insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Scalable:</strong> Cloud-native architecture (Lovable Cloud/Supabase)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Responsive:</strong> Mobile-optimized (50%+ mobile traffic)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Research Tabs */}
        <Tabs defaultValue="research" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="research">AI Research</TabsTrigger>
            <TabsTrigger value="opportunities">2-Week Roadmap</TabsTrigger>
            <TabsTrigger value="strategy">Strategic Recommendations</TabsTrigger>
          </TabsList>

          {/* AI Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Competitive Analysis
                  </CardTitle>
                  <CardDescription>
                    Compare SAAI against market leaders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={analyzeCompetition}
                    disabled={researching}
                    className="w-full"
                  >
                    {researching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze Competition
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Trends 2025
                  </CardTitle>
                  <CardDescription>
                    Latest innovations and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={analyzeMarketTrends}
                    disabled={researching}
                    className="w-full"
                  >
                    {researching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Research Trends
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Custom Research */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Custom Market Research
                </CardTitle>
                <CardDescription>
                  Ask any market intelligence question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., What are the pricing strategies of top agile tools? How are competitors using AI?"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={performCustomResearch}
                  disabled={researching || !customQuery.trim()}
                >
                  {researching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run Research
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Research Results */}
            {competitiveAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Competitive Analysis Results</span>
                    <Badge variant="outline">{new Date(competitiveAnalysis.timestamp).toLocaleString()}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {competitiveAnalysis.analysis}
                      </pre>
                    </div>
                  </ScrollArea>
                  {competitiveAnalysis.relatedQuestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Related Questions:</h4>
                      <ul className="space-y-1">
                        {competitiveAnalysis.relatedQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {marketTrends && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Market Trends Analysis</span>
                    <Badge variant="outline">{new Date(marketTrends.timestamp).toLocaleString()}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {marketTrends.analysis}
                      </pre>
                    </div>
                  </ScrollArea>
                  {marketTrends.relatedQuestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Related Questions:</h4>
                      <ul className="space-y-1">
                        {marketTrends.relatedQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 2-Week Roadmap Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Priority Features for Next 2 Weeks
                </CardTitle>
                <CardDescription>
                  Based on current analytics (64% bounce rate, 8.6min sessions) and market gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Week 1 */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Badge>Week 1</Badge>
                      User Retention & Onboarding
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">Interactive Product Tour</h4>
                          <p className="text-sm text-muted-foreground">Reduce bounce rate with guided onboarding. Show value in first 60 seconds.</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">High Impact</Badge>
                            <Badge variant="outline">3-4 days</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Zap className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">AI Demo Mode Improvements</h4>
                          <p className="text-sm text-muted-foreground">Enhance chat-demo with better examples, faster responses, and sample projects</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">High Impact</Badge>
                            <Badge variant="outline">2-3 days</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">Quick Start Templates</h4>
                          <p className="text-sm text-muted-foreground">Pre-built project templates for common use cases (Scrum team, SAFe ART, Kanban)</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">Medium Impact</Badge>
                            <Badge variant="outline">2 days</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Week 2 */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Badge>Week 2</Badge>
                      Competitive Differentiation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">AI Sprint Health Analyzer</h4>
                          <p className="text-sm text-muted-foreground">Unique feature: AI analyzes sprint velocity, burndown, and suggests optimizations</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">Differentiator</Badge>
                            <Badge variant="outline">3-4 days</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">Team Performance Dashboard</h4>
                          <p className="text-sm text-muted-foreground">Visual insights: velocity trends, cycle time, team capacity utilization</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">High Value</Badge>
                            <Badge variant="outline">3 days</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">Smart Meeting Summaries</h4>
                          <p className="text-sm text-muted-foreground">Auto-generate meeting minutes, action items, and decisions from ceremony data</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="mr-2">AI-Powered</Badge>
                            <Badge variant="outline">2-3 days</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Wins (1-2 days each)
                </CardTitle>
                <CardDescription>
                  Low-effort, high-impact improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                    <span>Add pricing page with clear tiers (Free, Pro, Enterprise)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                    <span>Video demo on landing page (30-60 seconds showing key features)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                    <span>Social proof: testimonials or case study section</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                    <span>Improve CTA visibility and clarity throughout site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                    <span>SEO optimization for target keywords ("AI project management", "Agile automation")</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                  How to position SAAI for market success
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg">1. Positioning Strategy</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Position SAAI as "The AI-Native Agile Platform" - not just another PM tool with AI bolted on.
                  </p>
                  <ul className="space-y-2 text-sm pl-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Target Niche:</strong> Enterprise agile teams (50+ people) using SAFe framework</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Key Differentiator:</strong> AI-powered ceremony facilitation + SAFe compliance out of the box</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span><strong>Value Proposition:</strong> "Reduce ceremony overhead by 50%, increase team velocity by 30%"</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 text-lg">2. Feature Prioritization</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 text-green-700 dark:text-green-400">High Priority</h4>
                      <p className="text-sm">Onboarding, AI enhancements, team analytics</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 text-yellow-700 dark:text-yellow-400">Medium Priority</h4>
                      <p className="text-sm">Mobile app, advanced integrations, custom workflows</p>
                    </div>
                    <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                      <h4 className="font-medium text-sm mb-1 text-gray-700 dark:text-gray-400">Low Priority</h4>
                      <p className="text-sm">Customization options, white-labeling, on-premise</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 text-lg">3. Go-to-Market Tactics</h3>
                  <ul className="space-y-2 text-sm pl-4">
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span><strong>Content Marketing:</strong> Blog about "AI in Agile", "SAFe best practices", "Team velocity optimization"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span><strong>Partnerships:</strong> Integrate with Slack, Teams for ceremony notifications and summaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span><strong>Free Tier:</strong> Generous free plan (up to 10 users) to drive adoption and word-of-mouth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span><strong>Case Studies:</strong> Document ROI with early adopters (time saved, velocity increase)</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 text-lg">4. Competitive Advantages to Leverage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Shield className="h-5 w-5 text-blue-500 mb-2" />
                      <h4 className="font-medium mb-1">Security-First</h4>
                      <p className="text-xs text-muted-foreground">Enterprise-grade security already implemented. Emphasize this in sales materials.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-500 mb-2" />
                      <h4 className="font-medium mb-1">AI Native</h4>
                      <p className="text-xs text-muted-foreground">Built with AI from day one, not retrofitted. More intelligent automation.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Users className="h-5 w-5 text-green-500 mb-2" />
                      <h4 className="font-medium mb-1">SAFe Ready</h4>
                      <p className="text-xs text-muted-foreground">Out-of-box SAFe support. Competitors charge extra or don't support it.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-500 mb-2" />
                      <h4 className="font-medium mb-1">Real-time Insights</h4>
                      <p className="text-xs text-muted-foreground">Live collaboration and instant analytics. Better than batch-processed tools.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}