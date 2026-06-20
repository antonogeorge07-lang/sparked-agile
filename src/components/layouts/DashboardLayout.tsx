import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import { ReconnectBanner } from "@/components/ReconnectBanner";
import sparkAgileLogo from "@/assets/spark-agile-logo.png";
import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Sonoma-style translucent chrome header */}
          <header className="sticky top-0 z-40 h-14 material-chrome border-b border-border/60">
            <div className="flex h-full items-center justify-between px-3 sm:px-5">
              {/* Left: Sidebar toggle + Logo */}
              <div className="flex items-center gap-2">
                <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-foreground/[0.06] transition-colors flex items-center justify-center text-foreground/70 hover:text-foreground">
                  <Menu className="h-[16px] w-[16px]" strokeWidth={1.8} />
                </SidebarTrigger>

                <Link
                  to="/home"
                  className="group flex items-center gap-2 px-1.5 py-1 rounded-md transition-all duration-200 ease-apple hover:bg-foreground/[0.04]"
                >
                  <img
                    src={sparkAgileLogo}
                    alt="Spark-Agile logo"
                    className="h-6 w-6 object-contain"
                  />
                  <span className="hidden sm:inline-block font-semibold text-[15px] tracking-[-0.015em] text-foreground">
                    Spark-Agile
                  </span>
                </Link>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] h-8 px-2.5 rounded-md font-normal"
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                >
                  <Search className="h-[14px] w-[14px]" strokeWidth={1.8} />
                  <span className="text-[12px]">Search</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ⌘K
                  </kbd>
                </Button>
                <span className="hidden sm:inline-flex"><LanguageSwitcher /></span>
                <NotificationBell />
                <span className="hidden sm:inline-flex"><ThemeToggle /></span>
                <ProfileMenu />
              </div>
            </div>
          </header>

          <GlobalSearchDialog />
          <ReconnectBanner />

          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
