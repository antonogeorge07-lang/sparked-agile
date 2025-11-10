import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

export default function AITransformingAgileDelivery() {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Blog post URL copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">AI & Agile</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How AI is Transforming Agile Delivery in 2025
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>January 15, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-xl text-muted-foreground">
            AI agile tools are revolutionizing how teams plan sprints, prioritize backlogs, and deliver value. Here's how they're helping teams deliver 40% faster.
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          <h2>The Sprint Planning Problem</h2>
          <p>
            Traditional sprint planning takes 4-10 hours for most agile teams. Product owners struggle to prioritize backlogs, 
            developers debate story points endlessly, and everyone leaves exhausted. The result? Teams spend more time planning 
            than actually delivering.
          </p>

          <h2>Enter AI Agile Tools</h2>
          <p>
            Modern <strong>AI agile tools</strong> are changing this completely. By analyzing historical velocity, backlog health, 
            and team capacity, these tools can:
          </p>
          <ul>
            <li><strong>Automate sprint planning</strong> in minutes instead of hours</li>
            <li><strong>Prioritize backlogs intelligently</strong> using AI-powered analysis</li>
            <li><strong>Generate velocity-based estimates</strong> that actually reflect team capacity</li>
            <li><strong>Identify stale items</strong> that are blocking progress</li>
          </ul>

          <h2>Real Results: 80% Time Savings</h2>
          <p>
            Teams using <strong>automated sprint planning tools</strong> report dramatic improvements:
          </p>
          <ul>
            <li><strong>Sprint planning reduced from 10 hours to 2 hours</strong> (80% time savings)</li>
            <li><strong>40% faster delivery</strong> by focusing on execution over planning</li>
            <li><strong>Better sprint predictability</strong> with AI-powered capacity planning</li>
            <li><strong>Fewer failed sprints</strong> thanks to intelligent workload balancing</li>
          </ul>

          <h2>Beyond Sprint Planning: AI-Powered Retrospectives</h2>
          <p>
            The transformation doesn't stop at planning. <strong>AI agile tools</strong> are also revolutionizing retrospectives by:
          </p>
          <ul>
            <li>Collecting anonymous feedback automatically</li>
            <li>Identifying patterns and themes across multiple sprints</li>
            <li>Generating actionable insights from team sentiment</li>
            <li>Tracking improvement over time</li>
          </ul>

          <h2>Integration with Your Existing Tools</h2>
          <p>
            The best <strong>automated sprint planning tools</strong> don't replace your workflow—they enhance it. 
            With seamless JIRA and GitHub integration, these tools:
          </p>
          <ul>
            <li>Sync backlog items automatically</li>
            <li>Update issue statuses in real-time</li>
            <li>Pull historical data for accurate forecasting</li>
            <li>Keep your team working in familiar tools</li>
          </ul>

          <h2>The Future of Agile is AI-Powered</h2>
          <p>
            As AI continues to evolve, <strong>agile backlog prioritization AI</strong> and automated planning will become 
            table stakes for high-performing teams. The question isn't whether to adopt these tools—it's how quickly you can 
            start benefiting from them.
          </p>

          <h2>Getting Started</h2>
          <p>
            Ready to transform your agile workflow? Modern AI agile tools offer free tiers that let you experience the benefits 
            without any commitment. Most teams see results in their first sprint.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-2xl font-bold mb-2">Try SAAI Free Today</h3>
          <p className="text-muted-foreground mb-4">
            Experience AI-powered sprint planning and backlog prioritization. Reduce planning time by 80% and deliver 40% faster.
          </p>
          <Link to="/auth">
            <Button size="lg">
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Share Section */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">Share this article:</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=How%20AI%20is%20Transforming%20Agile%20Delivery`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                Share on X
              </Button>
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                Share on LinkedIn
              </Button>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
