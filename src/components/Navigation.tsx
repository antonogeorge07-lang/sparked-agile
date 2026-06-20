import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Home, Shield, Menu, X, Sparkles, Presentation, ListFilter, Activity, Star, HelpCircle, Briefcase, BookOpen, GitBranch, FolderKanban } from "lucide-react";
import sparkAgileLogo from "@/assets/spark-agile-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useUserRole } from "@/hooks/useUserRole";

export const Navigation = () => {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { activeUsers } = useRealtimePresence(location.pathname);
  const { role } = useUserRole();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile) {
          setUserName(profile.full_name || undefined);
          setAvatarUrl(profile.avatar_url || undefined);
        }
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      document.body?.classList.add('animate-fade-out');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        document.body?.classList.add('animate-fade-out');
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        
        setTimeout(() => {
          document.body?.classList.remove('animate-fade-out');
        }, 100);
      }
    } catch (error) {
      document.body?.classList.remove('animate-fade-out');
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  // High-priority clean telemetry path layout mapping array
  const navItems = [
    { path: "/", label: "Velocity Truth", icon: Activity },
    { path: "/briefing", label: "Briefing", icon: BarChart3 },
    { path: "/my-projects", label: "Workspace", icon: FolderKanban },
    { path: "/connect", label: "Connect", icon: Star, highlight: true },
    { path: "/epic-management", label: "Epics", icon: GitBranch },
    { path: "/project-command-centre", label: "Command Centre", icon: Briefcase },
    { path: "/sprint-planning-assistant", label: "Sprint AI", icon: Sparkles },
    { path: "/sprint-review-coordinator", label: "Review", icon: Presentation },
    { path: "/backlog-refinement", label: "Backlog", icon: ListFilter },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link to="/" className="group flex items-center gap-3 transition-all hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl border border-primary/10 group-hover:border-primary/30 transition-all shadow-sm group-hover:shadow-md">
                <picture>
                  <source srcSet={sparkAgileLogo} type="image/webp" />
                  <img 
                    src={sparkAgileLogo} 
                    alt="Spark-Agile logo"
                    width="40"
                    height="40"
                    className="h-8 w-8 sm:h-9 sm:w-9 object-contain relative z-10"
                  />
                </picture>
              </div>
            </div>
            
            <div className="flex flex-col items-start -space-y-1">
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent group-hover:tracking-wide transition-all">
                Spark-Agile
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                Agile Intelligence
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {user && <div className="mr-1"><ActiveUsers users={activeUsers} currentPage={location.pathname} /></div>}
            
            <div className="flex items-center gap-0.5">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-1.5 text-sm h-8 px-3"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="ml-1 flex items-center gap-0.5">
              <LanguageSwitcher />
              <ThemeToggle />
              {user && <NotificationBell />}
              {user ? (
                <ProfileMenu userEmail={userEmail} userName={userName} avatarUrl={avatarUrl} />
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="h-8 px-3 text-sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-1">
            <span className="hidden sm:inline-flex"><LanguageSwitcher /></span>
            <span className="hidden sm:inline-flex"><ThemeToggle /></span>
            {user && <NotificationBell />}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <nav className="flex flex-col gap-2 mt-8">
                  <div className="text-xs font-medium text-muted-foreground px-3 mb-1">
                    NAVIGATION
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button 
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-10"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  
                  {role === 'admin' && (
                    <>
                      <div className="text-xs font-medium text-muted-foreground px-3 mt-3 mb-1">
                        ADMIN
                      </div>
                      <Link to="/platform-owner" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant={location.pathname === "/platform-owner" ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-10"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Button>
                      </Link>
                      <Link to="/security-incidents" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant={location.pathname === "/security-incidents" ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-10"
                        >
                          <Shield className="h-4 w-4" />
                          Security Incidents
                        </Button>
                      </Link>
                    </>
                  )}

                  <div className="text-xs font-medium text-muted-foreground px-3 mt-3 mb-1">
                    HELP
                  </div>
                  <Link to="/user-guide" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location.pathname === "/user-guide" ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-10"
                    >
                      <HelpCircle className="h-4 w-4" />
                      May I Help You
                    </Button>
                  </Link>

                  <div className="mt-4 pt-4 border-t">
                    {user ? (
                      <ProfileMenu userEmail={userEmail} userName={userName} avatarUrl={avatarUrl} />
                    ) : (
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <BreadcrumbNav />
    </nav>
  );
};