import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Video, Copy, Download } from "lucide-react";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { z } from "zod";

const scriptSchema = z.object({
  prompt: z.string()
    .trim()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be less than 2000 characters"),
  duration: z.string(),
  tone: z.string(),
  style: z.string(),
});

export default function VideoScriptGenerator() {
  useActivityTracking("video_script_generator");
  
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("60");
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("educational");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    // Validate input
    const result = scriptSchema.safeParse({ prompt, duration, tone, style });
    
    if (!result.success) {
      const error = result.error.issues[0];
      toast({
        title: "Validation Error",
        description: error?.message || "Please check your input",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setScript("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-video-script", {
        body: { prompt, duration, tone, style },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before generating another script.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to continue.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data?.script) {
        setScript(data.script);
        toast({
          title: "Script Generated!",
          description: "Your video script is ready",
        });
      }
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate video script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    toast({
      title: "Copied!",
      description: "Script copied to clipboard",
    });
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Script saved to your device",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Video className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Text to Video Script Generator</h1>
            <p className="text-muted-foreground mt-2">
              Create professional video scripts powered by AI
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>
                Describe your video concept and customize the output
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Video Topic or Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: Create a 60-second video explaining how AI is transforming the healthcare industry, focusing on diagnostic tools and patient care..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {prompt.length}/2000 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="90">90 seconds</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="180">3 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="explainer">Explainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateScript} 
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Script</CardTitle>
                {script && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadScript}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                Your production-ready video script will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Crafting your video script...
                  </p>
                </div>
              ) : script ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                    {script}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <Video className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Enter your video details and click generate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tips for Better Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>• Be specific about your target audience and video purpose</li>
              <li>• Include key points or messages you want to convey</li>
              <li>• Mention any specific visual elements or examples you want included</li>
              <li>• Consider your distribution platform (YouTube, TikTok, LinkedIn, etc.)</li>
              <li>• Review and customize the generated script to match your brand voice</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
