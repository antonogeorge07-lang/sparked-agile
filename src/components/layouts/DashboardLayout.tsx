import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { SidebarTour } from "@/components/SidebarTour";
import saaiLogo from "@/assets/saai-logo.png";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the sidebar tour
    const tourCompleted = localStorage.getItem("sidebar_tour_completed");
    if (!tourCompleted) {
      // Delay to ensure sidebar is fully rendered
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem("sidebar_tour_completed", "true");
    setShowTour(false);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarTour isActive={showTour} onComplete={handleTourComplete} />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Fixed Header */}
          <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
              {/* Left: Logo + Sidebar Toggle */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-muted rounded-lg p-2">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                
                <Link to="/home" className="flex items-center gap-2">
                  <img 
                    src={saaiLogo} 
                    alt="SAAI Logo" 
                    className="h-8 w-auto"
                  />
                  <span className="font-bold text-lg hidden sm:inline-block">SAAI</span>
                </Link>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <NotificationBell />
                <ThemeToggle />
                <ProfileMenu />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
