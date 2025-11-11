import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Target, 
  Zap,
  Globe,
  DollarSign,
  Shield,
  CheckCircle2,
  Clock,
  BarChart3,
  Lightbulb,
  Rocket
} from "lucide-react";

export default function InvestorPitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    "overview",
    "problem",
    "solution",
    "market",
    "competitive",
    "business",
    "traction",
    "financials",
    "team",
    "ask"
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              SAAI Investor Pitch Deck
            </span>
          </h1>
          <p className="text-muted-foreground">
            Transforming Agile Project Management with AI
          </p>
        </div>

        <Tabs value={slides[currentSlide]} onValueChange={(value) => setCurrentSlide(slides.indexOf(value))}>
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-8">
            {slides.map((slide, index) => (
              <TabsTrigger key={slide} value={slide} className="text-xs capitalize">
                {index + 1}. {slide}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Slide 1: Company Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Company Overview</Badge>
                  <span className="text-sm text-muted-foreground">Slide 1 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Spark Agile Active Intelligence
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xl text-muted-foreground">
                  The AI-Powered Platform Revolutionizing Agile Project Management
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Mission</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reduce agile overhead by 50% while doubling team productivity through AI automation
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Vision</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Become the global standard for AI-powered agile management across all industries
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Stage</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Seed stage, seeking Series A funding to scale product and expand market reach
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Key Highlights</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">All-in-One AI Platform</p>
                        <p className="text-sm text-muted-foreground">Complete agile ceremony automation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Enterprise Integration</p>
                        <p className="text-sm text-muted-foreground">Native Microsoft, JIRA, GitHub</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Global Ready</p>
                        <p className="text-sm text-muted-foreground">PolyLinQ multilingual support (100+ languages)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Lightning Fast</p>
                        <p className="text-sm text-muted-foreground">2-minute setup, instant ROI</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 2: The Problem */}
          <TabsContent value="problem" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">The Problem</Badge>
                  <span className="text-sm text-muted-foreground">Slide 2 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  Agile Ceremonies Are Killing Productivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Teams spend more time on agile ceremonies than actual development work
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-destructive" />
                        <div>
                          <h3 className="text-2xl font-bold">25-40%</h3>
                          <p className="text-sm text-muted-foreground">Of work time spent on ceremonies</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Sprint planning takes 3-4 hours, retrospectives 2-3 hours, daily standups 15-30 minutes each
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-destructive" />
                        <div>
                          <h3 className="text-2xl font-bold">$50K+</h3>
                          <p className="text-sm text-muted-foreground">Annual cost per team in lost productivity</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        For a 10-person team, ceremonial overhead costs $500K+ annually in developer time
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Critical Pain Points</h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Manual Sprint Planning",
                        description: "Teams waste hours analyzing velocity, estimating story points, and prioritizing backlog items without AI assistance",
                        icon: Target
                      },
                      {
                        title: "Disconnected Tools",
                        description: "JIRA for tasks, Microsoft for meetings, GitHub for code - no unified AI-powered view across the entire workflow",
                        icon: Globe
                      },
                      {
                        title: "Language Barriers",
                        description: "Global teams struggle with communication - 60% report language as a productivity barrier in distributed agile teams",
                        icon: Users
                      },
                      {
                        title: "No Actionable Insights",
                        description: "Retrospectives generate feedback but lack AI-powered analysis to identify patterns and drive real improvement",
                        icon: Lightbulb
                      }
                    ].map((pain, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <pain.icon className="h-6 w-6 text-primary flex-shrink-0" />
                            <div>
                              <h4 className="font-medium mb-1">{pain.title}</h4>
                              <p className="text-sm text-muted-foreground">{pain.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">The Bottom Line</h3>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Existing tools automate tasks, but not agile intelligence.</strong> Teams need AI that understands agile methodology, integrates with enterprise tools, and provides actionable insights - not just another task manager.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 3: The Solution */}
          <TabsContent value="solution" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">The Solution</Badge>
                  <span className="text-sm text-muted-foreground">Slide 3 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  AI-Powered Agile Intelligence Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  SAAI automates every agile ceremony with AI, integrates with enterprise tools, and provides real-time multilingual collaboration
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "AI Sprint Planning Assistant",
                      description: "Analyzes team velocity, generates sprint goals, estimates story points, and creates meeting agendas in minutes",
                      metrics: "3 hours → 30 minutes",
                      icon: Target,
                      color: "text-blue-500"
                    },
                    {
                      title: "Automated Backlog Analysis",
                      description: "AI evaluates backlog health, identifies blockers, suggests prioritization, and flags technical debt automatically",
                      metrics: "Real-time insights",
                      icon: BarChart3,
                      color: "text-green-500"
                    },
                    {
                      title: "Smart Retrospectives",
                      description: "Anonymous feedback collection with AI-powered sentiment analysis and actionable improvement recommendations",
                      metrics: "85% team engagement",
                      icon: Lightbulb,
                      color: "text-yellow-500"
                    },
                    {
                      title: "PolyLinQ Translation",
                      description: "Real-time translation in 100+ languages enabling seamless global team collaboration in agile ceremonies",
                      metrics: "100+ languages",
                      icon: Globe,
                      color: "text-purple-500"
                    },
                    {
                      title: "Project Command Centre",
                      description: "PMI-aligned project management with AI insights, Kanban boards, risk analysis, and lessons learned tracking",
                      metrics: "5 projects included",
                      icon: Rocket,
                      color: "text-red-500"
                    },
                    {
                      title: "Deep Enterprise Integration",
                      description: "Native Microsoft (Outlook, Teams), JIRA, and GitHub integration - all your tools unified in one AI platform",
                      metrics: "One-click setup",
                      icon: Zap,
                      color: "text-orange-500"
                    }
                  ].map((feature, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <feature.icon className={`h-8 w-8 ${feature.color}`} />
                          <Badge variant="outline">{feature.metrics}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-gradient-primary rounded-lg p-8 text-primary-foreground">
                  <h3 className="text-2xl font-bold mb-4">The SAAI Difference</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">50%</div>
                      <p className="text-sm opacity-90">Reduction in ceremony overhead</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">2 min</div>
                      <p className="text-sm opacity-90">Setup time to full productivity</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">100%</div>
                      <p className="text-sm opacity-90">AI-powered agile intelligence</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 4: Market Opportunity */}
          <TabsContent value="market" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Market Opportunity</Badge>
                  <span className="text-sm text-muted-foreground">Slide 4 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  $10B+ Addressable Market
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Massive opportunity at the intersection of AI, agile, and enterprise project management
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-3">
                      <TrendingUp className="h-10 w-10 text-primary" />
                      <h3 className="text-3xl font-bold">$5.8B</h3>
                      <p className="text-sm font-medium">Agile Project Management Software</p>
                      <p className="text-xs text-muted-foreground">Growing at 12.5% CAGR</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-3">
                      <Zap className="h-10 w-10 text-primary" />
                      <h3 className="text-3xl font-bold">$8.2B</h3>
                      <p className="text-sm font-medium">AI in Enterprise Software</p>
                      <p className="text-xs text-muted-foreground">Growing at 45% CAGR</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-3">
                      <Users className="h-10 w-10 text-primary" />
                      <h3 className="text-3xl font-bold">$3.5B</h3>
                      <p className="text-sm font-medium">Team Collaboration Tools</p>
                      <p className="text-xs text-muted-foreground">Growing at 18% CAGR</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Target Market Segments</h3>
                  <div className="space-y-3">
                    {[
                      {
                        segment: "Mid-Market SaaS Companies (100-1000 employees)",
                        tam: "$2.8B",
                        description: "Early adopters of agile, need AI to scale without overhead",
                        priority: "Primary"
                      },
                      {
                        segment: "Enterprise Technology Companies (1000+ employees)",
                        tam: "$4.2B",
                        description: "Multiple agile teams, complex integrations, global distribution",
                        priority: "Primary"
                      },
                      {
                        segment: "Digital Agencies & Consultancies",
                        tam: "$1.5B",
                        description: "Manage multiple client projects, need efficiency and insights",
                        priority: "Secondary"
                      },
                      {
                        segment: "Financial Services & Healthcare",
                        tam: "$1.8B",
                        description: "Agile adoption growing, need compliance and security",
                        priority: "Expansion"
                      }
                    ].map((market, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{market.segment}</h4>
                                <Badge variant={market.priority === "Primary" ? "default" : "outline"}>
                                  {market.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{market.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary">{market.tam}</div>
                              <div className="text-xs text-muted-foreground">TAM</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Market Drivers</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>71% of companies using agile methodology (growing)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Remote/hybrid work accelerating agile tool adoption</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>AI adoption in enterprise at inflection point</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Go-to-Market Strategy</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Product-led growth with freemium model</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Enterprise sales for 100+ employee organizations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Strategic partnerships with Microsoft, Atlassian</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 5: Competitive Analysis */}
          <TabsContent value="competitive" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Competitive Analysis</Badge>
                  <span className="text-sm text-muted-foreground">Slide 5 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  First Complete AI-Powered Agile Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  No competitor offers end-to-end AI automation across all agile ceremonies with enterprise integration
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4 font-semibold">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold bg-primary/10">
                          <div className="font-bold text-primary">SAAI</div>
                        </th>
                        <th className="text-center py-4 px-4 font-semibold">JIRA</th>
                        <th className="text-center py-4 px-4 font-semibold">Monday.com</th>
                        <th className="text-center py-4 px-4 font-semibold">Asana</th>
                        <th className="text-center py-4 px-4 font-semibold">ClickUp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["AI Sprint Planning", true, false, false, false, false],
                        ["AI Backlog Analysis", true, false, false, false, false],
                        ["AI Retrospectives", true, false, false, false, false],
                        ["Real-time Translation (100+ languages)", true, false, false, false, false],
                        ["Native Microsoft Integration", true, "Limited", "Paid", "Paid", "Limited"],
                        ["JIRA Integration", true, "Native", "Limited", "Limited", "Limited"],
                        ["GitHub Integration", true, "Paid", "Limited", "Limited", "Limited"],
                        ["Project Command Centre (PMI-aligned)", true, false, false, false, false],
                        ["Anonymous Feedback", true, false, false, false, false],
                        ["Setup Time", "2 min", "Hours", "Hours", "Hours", "Hours"],
                        ["Free Tier", true, "Limited", "Limited", "Limited", "Limited"]
                      ].map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row[0]}</td>
                          <td className="py-3 px-4 text-center bg-primary/5">
                            {typeof row[1] === 'boolean' ? (
                              row[1] ? (
                                <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )
                            ) : (
                              <span className="font-medium text-primary">{row[1]}</span>
                            )}
                          </td>
                          {row.slice(2).map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-3 px-4 text-center">
                              {typeof cell === 'boolean' ? (
                                cell ? (
                                  <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )
                              ) : (
                                <span className="text-muted-foreground">{cell}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Our Competitive Advantages</h3>
                      <ul className="space-y-3">
                        {[
                          "Only platform with AI across ALL agile ceremonies",
                          "Native enterprise integration (Microsoft + JIRA + GitHub)",
                          "PolyLinQ: Real-time multilingual collaboration",
                          "2-minute setup vs. hours for competitors",
                          "PMI-aligned project management included",
                          "Anonymous retrospectives with AI sentiment analysis"
                        ].map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Market Positioning</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">vs. JIRA/Monday/Asana/ClickUp</h4>
                          <p className="text-sm text-muted-foreground">
                            They're task management tools. We're an AI-powered agile intelligence platform that automates ceremonies and provides insights.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">vs. Point Solutions (Miro, Retrium)</h4>
                          <p className="text-sm text-muted-foreground">
                            They solve one ceremony. We solve all ceremonies with unified AI intelligence and enterprise integration.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Barriers to Entry</h4>
                          <p className="text-sm text-muted-foreground">
                            • Deep agile methodology expertise<br />
                            • Complex enterprise integrations<br />
                            • AI prompt engineering for ceremonies<br />
                            • Network effects from team adoption
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 6: Business Model */}
          <TabsContent value="business" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Business Model</Badge>
                  <span className="text-sm text-muted-foreground">Slide 6 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  Freemium SaaS with Enterprise Expansion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Product-led growth with clear upgrade path from free to enterprise
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <Badge variant="outline">Free Forever</Badge>
                      <div>
                        <div className="text-3xl font-bold mb-1">$0</div>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Up to 5 team members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Basic AI features</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>1 project</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Community support</span>
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground pt-2">
                        Target: Startups, small teams, trial users
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary shadow-lg">
                    <CardContent className="pt-6 space-y-4">
                      <Badge className="bg-primary">Professional</Badge>
                      <div>
                        <div className="text-3xl font-bold mb-1">$29</div>
                        <p className="text-sm text-muted-foreground">per user/month</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Unlimited team members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Full AI capabilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>5 projects</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>All integrations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground pt-2">
                        Target: Growing teams, agencies
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <Badge variant="secondary">Enterprise</Badge>
                      <div>
                        <div className="text-3xl font-bold mb-1">Custom</div>
                        <p className="text-sm text-muted-foreground">contact sales</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Unlimited projects</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>SSO / SAML</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Custom AI training</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Dedicated success manager</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>SLA guarantees</span>
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground pt-2">
                        Target: Large enterprises (100+ users)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Revenue Streams</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Subscription Revenue (Pro)</span>
                          <span className="font-bold">75%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Enterprise Licenses</span>
                          <span className="font-bold">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Professional Services</span>
                          <span className="font-bold">5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Unit Economics</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">CAC (Freemium)</span>
                          <span className="font-bold">$50</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">LTV (Pro user, 3yr)</span>
                          <span className="font-bold">$1,044</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">LTV:CAC Ratio</span>
                          <span className="font-bold text-primary">20:1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gross Margin</span>
                          <span className="font-bold text-primary">85%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
                  <h3 className="font-semibold text-lg mb-4">Growth Metrics & Conversion</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold">15%</div>
                      <p className="text-sm opacity-90">Free → Pro conversion</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">25%</div>
                      <p className="text-sm opacity-90">Pro → Enterprise</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">92%</div>
                      <p className="text-sm opacity-90">Annual retention (Pro)</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">130%</div>
                      <p className="text-sm opacity-90">Net revenue retention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 7: Traction */}
          <TabsContent value="traction" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Traction & Metrics</Badge>
                  <span className="text-sm text-muted-foreground">Slide 7 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  Strong Early Validation & Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Proven product-market fit with rapid user growth and high engagement
                </p>

                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-2">
                      <Users className="h-8 w-8 text-primary" />
                      <div className="text-3xl font-bold">2,500+</div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <Badge variant="outline" className="text-xs">+40% MoM</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-2">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <div className="text-3xl font-bold">350+</div>
                      <p className="text-sm text-muted-foreground">Paying Customers</p>
                      <Badge variant="outline" className="text-xs">15% conversion</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-2">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <div className="text-3xl font-bold">$120K</div>
                      <p className="text-sm text-muted-foreground">ARR</p>
                      <Badge variant="outline" className="text-xs">+60% QoQ</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-2">
                      <Globe className="h-8 w-8 text-primary" />
                      <div className="text-3xl font-bold">45+</div>
                      <p className="text-sm text-muted-foreground">Countries</p>
                      <Badge variant="outline" className="text-xs">Global reach</Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Product Engagement</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Daily Active Users</span>
                          <span className="font-bold">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly Sprint Planning Sessions</span>
                          <span className="font-bold">1,200+</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AI Insights Generated</span>
                          <span className="font-bold">15K+</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg. Time Saved per Sprint</span>
                          <span className="font-bold text-primary">2.5 hours</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Customer Success</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Customer Satisfaction (NPS)</span>
                          <span className="font-bold">72</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Churn Rate (Monthly)</span>
                          <span className="font-bold">2.1%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Support Response Time</span>
                          <span className="font-bold">&lt;2 hours</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Feature Adoption Rate</span>
                          <span className="font-bold text-primary">78%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-primary text-primary-foreground">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Notable Customers</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-background/10 rounded-lg p-4">
                        <p className="font-medium mb-1">TechCorp Solutions</p>
                        <p className="text-sm opacity-90">200 users • Enterprise plan</p>
                        <p className="text-xs opacity-75 mt-2">"Reduced sprint planning from 4 hours to 45 minutes"</p>
                      </div>
                      <div className="bg-background/10 rounded-lg p-4">
                        <p className="font-medium mb-1">Global Digital Agency</p>
                        <p className="text-sm opacity-90">50 users • Professional plan</p>
                        <p className="text-xs opacity-75 mt-2">"PolyLinQ enabled seamless collaboration across 8 countries"</p>
                      </div>
                      <div className="bg-background/10 rounded-lg p-4">
                        <p className="font-medium mb-1">FinTech Startup</p>
                        <p className="text-sm opacity-90">25 users • Professional plan</p>
                        <p className="text-xs opacity-75 mt-2">"AI retrospectives improved team satisfaction by 40%"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Recent Milestones</h3>
                  <div className="space-y-3">
                    {[
                      { date: "Q1 2025", milestone: "Launched Project Command Centre - 40% of users adopted in first month" },
                      { date: "Q4 2024", milestone: "Reached 2,000 active users and $100K ARR milestone" },
                      { date: "Q3 2024", milestone: "Launched PolyLinQ translation - now supporting teams in 45 countries" },
                      { date: "Q2 2024", milestone: "Completed initial product development and beta launch with 100 early adopters" }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <Badge variant="outline" className="flex-shrink-0">{item.date}</Badge>
                        <p className="text-sm">{item.milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 8: Financial Projections */}
          <TabsContent value="financials" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Financial Projections</Badge>
                  <span className="text-sm text-muted-foreground">Slide 8 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  Path to $10M ARR in 3 Years
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Conservative projections based on current growth rates and market penetration
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Metric</th>
                        <th className="text-right py-3 px-4 font-semibold">2025</th>
                        <th className="text-right py-3 px-4 font-semibold">2026</th>
                        <th className="text-right py-3 px-4 font-semibold">2027</th>
                        <th className="text-right py-3 px-4 font-semibold">2028</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Total Users", "5,000", "15,000", "45,000", "120,000"],
                        ["Paying Customers", "750", "2,250", "6,750", "18,000"],
                        ["ARR", "$260K", "$780K", "$2.3M", "$6.2M"],
                        ["MRR", "$22K", "$65K", "$195K", "$520K"],
                        ["Revenue Growth", "117%", "200%", "195%", "170%"]
                      ].map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row[0]}</td>
                          {row.slice(1).map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-3 px-4 text-right font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Key Assumptions</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>15% free-to-paid conversion rate (industry standard)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>40% MoM user growth through year 1, then 25% MoM</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>Average revenue per user: $29/month (Pro tier)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>92% annual retention rate for paying customers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>10% Enterprise adoption by year 3 (higher ARPU)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Use of Funds</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Product Development</span>
                            <span className="font-bold">40%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "40%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Sales & Marketing</span>
                            <span className="font-bold">35%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "35%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Operations & Infrastructure</span>
                            <span className="font-bold">15%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "15%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Customer Success</span>
                            <span className="font-bold">10%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "10%" }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
                  <h3 className="font-semibold text-lg mb-4">Path to Profitability</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-3xl font-bold mb-2">18 months</div>
                      <p className="text-sm opacity-90">Time to profitability from funding</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-2">85%</div>
                      <p className="text-sm opacity-90">Gross margin (SaaS typical)</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-2">$10M+</div>
                      <p className="text-sm opacity-90">Projected ARR by year 3</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 9: Team */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">Team</Badge>
                  <span className="text-sm text-muted-foreground">Slide 9 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  World-Class Team with Deep Domain Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Unique combination of agile expertise, AI engineering, and enterprise software experience
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Founder & CEO</h3>
                          <p className="text-sm text-muted-foreground">15+ years product management</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        • Former Director of Product at Fortune 500 tech company<br />
                        • Certified Scrum Master & PMI-ACP<br />
                        • Led agile transformation for 200+ person engineering org<br />
                        • MBA from top-tier business school
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">CTO</h3>
                          <p className="text-sm text-muted-foreground">AI/ML engineering specialist</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        • 12+ years software engineering experience<br />
                        • Previously Tech Lead at AI startup (acquired)<br />
                        • Expert in LLM prompt engineering & AI systems<br />
                        • MS Computer Science from Stanford
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">VP Product</h3>
                          <p className="text-sm text-muted-foreground">Enterprise SaaS veteran</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        • 10+ years building enterprise collaboration tools<br />
                        • Former PM at Atlassian (JIRA team)<br />
                        • Deep expertise in agile tooling & user experience<br />
                        • Led products from 0 to $50M ARR
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">VP Sales</h3>
                          <p className="text-sm text-muted-foreground">Enterprise sales leader</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        • 15+ years enterprise software sales<br />
                        • Previously VP Sales at project management SaaS<br />
                        • Built sales team from 5 to 50 reps<br />
                        • Track record of $20M+ annual quota achievement
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Advisory Board</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span><strong>AI Research Advisor:</strong> PhD in ML, former Google AI researcher</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span><strong>Agile Expert:</strong> Co-author of SAFe framework, 25+ years consulting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span><strong>Enterprise GTM Advisor:</strong> Former CRO at $500M SaaS company</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Team Growth Plan</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Current: 8 full-time</p>
                          <p className="text-xs text-muted-foreground">3 engineering, 2 product, 1 sales, 1 marketing, 1 operations</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">12 months: 20 people</p>
                          <p className="text-xs text-muted-foreground">+5 engineering, +3 sales, +2 customer success, +2 marketing</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">24 months: 45 people</p>
                          <p className="text-xs text-muted-foreground">Scale sales, expand engineering, build customer success org</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Why This Team Wins</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Domain Expertise</h4>
                      <p className="text-muted-foreground">Combined 50+ years of agile, project management, and enterprise software experience</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Technical Excellence</h4>
                      <p className="text-muted-foreground">Deep AI/ML capabilities with track record of building production AI systems at scale</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Execution Track Record</h4>
                      <p className="text-muted-foreground">Team has collectively built products with $200M+ in revenue and led successful exits</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slide 10: The Ask */}
          <TabsContent value="ask" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-4">The Ask</Badge>
                  <span className="text-sm text-muted-foreground">Slide 10 of 10</span>
                </div>
                <CardTitle className="text-3xl">
                  Raising $2M Series A
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  Funding to scale product development, expand go-to-market, and capture market leadership
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-primary text-primary-foreground">
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <h3 className="text-4xl font-bold mb-2">$2M</h3>
                        <p className="opacity-90">Series A Round</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Current Status</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Bootstrapped to $120K ARR</li>
                            <li>• 2,500+ active users in 45 countries</li>
                            <li>• Proven product-market fit</li>
                            <li>• 40% MoM growth rate</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Investment Terms</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• SAFE with $8M post-money cap</li>
                            <li>• 20% discount for early investors</li>
                            <li>• Pro-rata rights for Series B</li>
                            <li>• Board observer seat available</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg mb-4">Use of Funds Breakdown</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Product Development</p>
                              <p className="text-sm text-muted-foreground">AI capabilities, integrations, mobile</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">$800K</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "40%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Sales & Marketing</p>
                              <p className="text-sm text-muted-foreground">Team growth, lead gen, brand building</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">$700K</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "35%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Operations</p>
                              <p className="text-sm text-muted-foreground">Infrastructure, security, compliance</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">$300K</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "15%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Customer Success</p>
                              <p className="text-sm text-muted-foreground">Support team, onboarding, training</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">$200K</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "10%" }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">18-Month Milestones</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Product Milestones",
                        goals: [
                          "Launch mobile apps (iOS & Android)",
                          "Advanced AI features (predictive analytics, automated decision-making)",
                          "Slack & Microsoft Teams native integrations",
                          "Custom AI model training for enterprise customers"
                        ]
                      },
                      {
                        title: "Business Milestones",
                        goals: [
                          "Reach $1M ARR",
                          "Grow to 10,000+ active users",
                          "Sign 3-5 enterprise customers (1000+ users)",
                          "Achieve profitability or path to profitability"
                        ]
                      },
                      {
                        title: "Market Milestones",
                        goals: [
                          "Become #1 AI-powered agile platform by G2 reviews",
                          "Strategic partnership with Microsoft or Atlassian",
                          "Establish presence in EMEA and APAC markets",
                          "Launch partner/reseller program"
                        ]
                      },
                      {
                        title: "Team Milestones",
                        goals: [
                          "Grow team to 20 people",
                          "Hire VP Engineering and VP Customer Success",
                          "Build out sales team (5+ AEs)",
                          "Establish remote-first culture across 3+ time zones"
                        ]
                      }
                    ].map((milestone, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="pt-6 space-y-3">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          <ul className="space-y-2">
                            {milestone.goals.map((goal, goalIndex) => (
                              <li key={goalIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-primary rounded-lg p-8 text-primary-foreground text-center space-y-4">
                  <Rocket className="h-16 w-16 mx-auto" />
                  <h3 className="text-2xl font-bold">Ready to Transform Agile Management?</h3>
                  <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Join us in building the future of AI-powered agile intelligence. Together, we can eliminate overhead and unlock team potential at scale.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button size="lg" variant="secondary" className="gap-2">
                      Schedule a Meeting
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      Download Full Deck
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Founder & CEO</p>
                      <p className="text-muted-foreground">founder@saai.com</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Website</p>
                      <p className="text-muted-foreground">www.saai.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
