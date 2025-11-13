import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from "@/components/ScrollReveal";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

export default function Blog() {
  const blogPosts = [
    {
      slug: "ai-transforming-agile-delivery",
      title: "How AI is Transforming Agile Delivery in 2025",
      excerpt: "Discover how AI agile tools are reducing sprint planning from 10 hours to 2, automating retrospectives, and helping teams deliver 40% faster.",
      category: "AI & Agile",
      readTime: "5 min read",
      date: "January 15, 2025",
      keywords: ["AI agile tool", "automated sprint planning", "agile transformation"]
    },
    {
      slug: "automated-sprint-planning-guide",
      title: "The Complete Guide to Automated Sprint Planning",
      excerpt: "Learn how automated sprint planning tools use AI to analyze backlog, estimate velocity, and generate optimal sprint plans in minutes.",
      category: "Sprint Planning",
      readTime: "7 min read",
      date: "January 10, 2025",
      keywords: ["automated sprint planning tool", "sprint planning automation", "AI sprint planning"]
    },
    {
      slug: "agile-backlog-prioritization-ai",
      title: "Agile Backlog Prioritization with AI: A Game Changer",
      excerpt: "Stop wasting hours on backlog refinement. AI-powered backlog prioritization identifies stale items, suggests priorities, and keeps your team focused.",
      category: "Backlog Management",
      readTime: "6 min read",
      date: "January 5, 2025",
      keywords: ["agile backlog prioritization AI", "backlog refinement", "AI prioritization"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <ScrollReveal>
          <header className="text-center mb-12">
            <Badge className="mb-4">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Insights on AI & Agile Delivery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how AI agile tools are transforming sprint planning, backlog prioritization, and team collaboration
            </p>
          </header>
        </ScrollReveal>

        <ScrollRevealList staggerDelay={0.15}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <ScrollRevealItem key={post.slug}>
                <Card className="flex flex-col hover:border-primary/50 transition-colors h-full">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">
                  {post.category}
                </Badge>
                <CardTitle className="text-xl mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-base mb-4">
                  {post.excerpt}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.slice(0, 2).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="ghost" className="gap-2 p-0">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            </ScrollRevealItem>
          ))}
        </div>
        </ScrollRevealList>

        {/* CTA Section */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 text-center">
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Agile Workflow?
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Join teams using AI-powered sprint planning and backlog prioritization
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Start Free Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
