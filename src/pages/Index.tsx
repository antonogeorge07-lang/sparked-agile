import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Your AI-Powered Scrum Master
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your agile workflow with intelligent automation powered by SAFe 6.0. From daily standups to program increments, let AI handle the routine so you can focus on delivering value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See SM ActiveIntelligence in Action</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch how our platform streamlines your entire agile workflow with AI-powered automation
              </p>
            </div>
            
            <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-2">
              <div className="relative aspect-video bg-muted">
                {/* Placeholder for video - replace src with actual demo video */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={togglePlay}
                      className="rounded-full w-12 h-12"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={toggleMute}
                      className="rounded-full w-12 h-12"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Play button when not playing */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      onClick={togglePlay}
                      className="rounded-full w-20 h-20 bg-primary/90 hover:bg-primary shadow-elevated"
                    >
                      <Play className="w-10 h-10 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Experience the power of AI-driven agile management with built-in voice guidance
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-elevated">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Sprint Process?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Join teams using AI to automate their agile ceremonies and focus on what matters most - delivering value.
              </p>
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate("/standup")}>
                Start Your First Standup
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
