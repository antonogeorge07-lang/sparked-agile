import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import saaiLogo from "@/assets/saai-logo.png";
import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Fixed Header */}
          <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
              {/* Left: Logo + Sidebar Toggle */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-muted rounded-lg p-2">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                
                <Link to="/home" className="group flex items-center gap-2 transition-all hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary opacity-15 blur-lg rounded-full group-hover:opacity-25 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-1.5 rounded-lg border border-primary/10 group-hover:border-primary/30 transition-all">
                      <img 
                        src={saaiLogo} 
                        alt="SAAI Logo" 
                        className="h-6 w-6 object-contain relative z-10"
                      />
                    </div>
                  </div>
                  <span className="font-bold text-lg hidden sm:inline-block bg-gradient-primary bg-clip-text text-transparent">SAAI</span>
                </Link>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 text-muted-foreground h-8 px-3"
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="text-xs">Search</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                    ⌘K
                  </kbd>
                </Button>
                <LanguageSwitcher />
                <NotificationBell />
                <ThemeToggle />
                <ProfileMenu />
              </div>
            </div>
          </header>

          <GlobalSearchDialog />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
