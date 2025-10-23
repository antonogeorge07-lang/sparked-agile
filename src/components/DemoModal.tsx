import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset video when modal closes
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isOpen]);

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

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">See SM ActiveIntelligence in Action</DialogTitle>
          <DialogDescription>
            See how AI streamlines your entire agile workflow with intelligent automation
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative bg-muted">
          <div className="relative aspect-video">
            {/* Placeholder thumbnail */}
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <img 
                src="/demo-thumbnail.jpg" 
                alt="Demo Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="text-center space-y-4 p-8">
                  <Play className="w-20 h-20 mx-auto text-white" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Interactive Demo Coming Soon</h3>
                    <p className="text-white/90 text-lg max-w-2xl">
                      We're preparing a comprehensive walkthrough of SM ActiveIntelligence's powerful features.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={onClose}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Start Free Trial Instead
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">What you'll see:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI-powered sprint planning and retrospectives</li>
                <li>• Automated standup summaries with action items</li>
                <li>• Real-time collaboration and presence indicators</li>
                <li>• Integration with Jira, GitHub, and Microsoft Teams</li>
                <li>• SAFe 6.0 program increment planning</li>
              </ul>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
