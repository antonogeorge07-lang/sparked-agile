import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Twitter, Linkedin, Sparkles, Check, X as XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";

export default function SocialMediaGenerator() {
  const { toast } = useToast();
  const [copiedX, setCopiedX] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  const xPost = `🚀 SAAI is LIVE!

Transform your agile workflow with AI-powered automation:
✅ Sprint planning in minutes
✅ Real-time team collaboration
✅ Automated retrospectives
✅ Smart backlog management

Stop drowning in ceremonies. Start shipping faster.

Try SAAI today 👉 [your-link]

#AgileAI #ScrumMaster #ProductivityTools`;

  const linkedInPost = `🎉 Exciting News: SAAI (Smart Agile Active Intelligence) is Now Live!

After months of development and testing with agile teams worldwide, we're thrilled to announce that SAAI is officially available to transform how you manage your agile workflows.

**What SAAI Does (Doable Impact):**

🎯 Sprint Planning Assistant
• Reduces planning time from hours to minutes
• AI-powered story point estimation
• Automatic sprint goal generation
• Team capacity optimization

📊 Command Centre Dashboard
• Real-time project visibility across all teams
• Automated status updates and reporting
• Risk identification and mitigation tracking
• Integration with GitHub, Jira, and Microsoft Teams

🤖 Intelligent Retrospectives
• AI-generated insights from team feedback
• Action item tracking and follow-up
• Sentiment analysis for team health monitoring
• Automated documentation and export to PowerPoint

🔄 Backlog Management
• Smart prioritization based on business value
• Dependency detection and visualization
• Automated refinement suggestions
• Health scoring for your backlog

**Expected Impact for Your Team:**

⏱️ Time Savings: Reduce ceremony time by 60-70%
📈 Productivity: Ship 40% more features per sprint
🎯 Focus: Let your team focus on building, not administrative tasks
💡 Insights: Data-driven decisions based on AI analysis
🤝 Collaboration: Enhanced team communication and alignment
📊 Transparency: Complete visibility for stakeholders without extra reporting work

**Why Teams Choose SAAI:**

"SAAI transformed our sprint planning from a 4-hour marathon into a 45-minute focused session. Our team can now spend more time building and less time in meetings." - Engineering Manager, Tech Startup

**Security & Compliance:**
✅ Enterprise-grade security
✅ Role-based access control
✅ SOC 2 compliant infrastructure
✅ Data encryption at rest and in transit

**Get Started Today:**

🆓 Free tier available - No credit card required
💼 Business plans starting at [price]
🏢 Enterprise solutions with dedicated support

Ready to revolutionize your agile workflow? Visit [your-link] or comment below to learn more!

#AgileTransformation #ScrumMaster #ProductManagement #AITools #DevOps #SoftwareDevelopment #TeamProductivity #TechLeadership #StartupTools`;

  const copyToClipboard = (text: string, platform: 'x' | 'linkedin') => {
    navigator.clipboard.writeText(text);
    
    if (platform === 'x') {
      setCopiedX(true);
      setTimeout(() => setCopiedX(false), 2000);
    } else {
      setCopiedLinkedIn(true);
      setTimeout(() => setCopiedLinkedIn(false), 2000);
    }
    
    toast({
      title: "Copied!",
      description: `${platform === 'x' ? 'X.com' : 'LinkedIn'} post copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Launch Announcement Posts
            </h1>
            <p className="text-muted-foreground text-lg">
              Copy and customize these posts to announce SAAI's launch
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* X.com Post */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-5 h-5 text-blue-500" />
                    <CardTitle>X.com (Twitter) Post</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(xPost, 'x')}
                    className="gap-2"
                  >
                    {copiedX ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  Optimized for X.com's format - concise and impactful
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={xPost}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>Character count: {xPost.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Post */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <CardTitle>LinkedIn Post</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(linkedInPost, 'linkedin')}
                    className="gap-2"
                  >
                    {copiedLinkedIn ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  Detailed professional post with metrics and testimonials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={linkedInPost}
                  readOnly
                  className="min-h-[600px] font-mono text-sm"
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>Character count: {linkedInPost.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison Section */}
          <Card>
            <CardHeader>
              <CardTitle>SAAI vs Traditional Agile Tools</CardTitle>
              <CardDescription>
                Use this comparison in your posts to highlight SAAI's competitive advantages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">SAAI</th>
                      <th className="text-center p-4 font-semibold">Traditional Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4">AI-Powered Sprint Planning</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Automated Retrospective Insights</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Smart Backlog Prioritization</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Real-Time Team Collaboration</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-muted-foreground">Limited</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Integrated Command Centre</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Automated Ceremony Minutes</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">GitHub & Jira Integration</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Microsoft Teams Integration</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-muted-foreground">Varies</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Sentiment Analysis</td>
                      <td className="text-center p-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <XIcon className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Setup Time</td>
                      <td className="text-center p-4">
                        <span className="text-sm font-semibold text-green-600">Minutes</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-muted-foreground">Days/Weeks</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold mb-2">Copy-Paste Snippet for Posts:</p>
                <p className="text-sm text-muted-foreground italic">
                  "Unlike traditional agile tools, SAAI brings AI-powered intelligence to every ceremony - from automated sprint planning to sentiment-aware retrospectives. What takes hours in other tools, takes minutes with SAAI."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Posting Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">For X.com:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Replace [your-link] with your actual SAAI URL</li>
                  <li>Add relevant hashtags for your industry</li>
                  <li>Consider adding a product screenshot or demo GIF</li>
                  <li>Post during peak hours (8-10 AM or 6-9 PM in your timezone)</li>
                  <li>Engage with replies quickly to boost visibility</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">For LinkedIn:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Replace [your-link] and [price] with actual details</li>
                  <li>Add a professional cover image or product demo video</li>
                  <li>Tag relevant connections and companies</li>
                  <li>Post on weekday mornings (Tuesday-Thursday, 7-9 AM)</li>
                  <li>Respond to comments to increase engagement</li>
                  <li>Consider creating a carousel post with screenshots</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Key Metrics to Highlight:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>60-70% reduction in ceremony time</li>
                  <li>40% increase in feature delivery</li>
                  <li>AI-powered automation for all agile workflows</li>
                  <li>Enterprise-grade security and compliance</li>
                  <li>Free tier available for teams to try</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
