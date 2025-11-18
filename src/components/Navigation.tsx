import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Home, Shield, Menu, X, Sparkles, Presentation, ListFilter, Activity, Star, HelpCircle, LayoutDashboard, Users, Workflow, Languages, Briefcase, BookOpen, GitBranch } from "lucide-react";
import saaiLogo from "@/assets/saai-logo.png";
import saaiLogoOptimized from "@/assets/saai-logo-optimized.webp";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export const Navigation = () => {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { activeUsers } = useRealtimePresence(location.pathname);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await checkAdminStatus(session.user.id);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
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
    }
  };
  
  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/quick-start", label: "Quick Start", icon: Star, highlight: true },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/epic-management", label: "Epics", icon: GitBranch },
    { path: "/epic-portfolio", label: "Epic Portfolio", icon: Target },
    { path: "/project-command-centre", label: "Command Centre", icon: Briefcase },
    { path: "/sprint-planning-assistant", label: "Sprint AI", icon: Sparkles },
    { path: "/sprint-review-coordinator", label: "Review", icon: Presentation },
    { path: "/backlog-refinement", label: "Backlog", icon: ListFilter },
    { path: "/usage-analytics", label: "Analytics", icon: Activity },
    { path: "/polylinq", label: "PolyLinQ", icon: Languages },
    { path: "/feature-demo", label: "Feature Demo", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <picture>
              <source srcSet={saaiLogoOptimized} type="image/webp" />
              <img 
                src={saaiLogo} 
                alt="SAAI - Agile Active Intelligence logo"
                width="32"
                height="32"
                className="h-7 w-7 object-contain"
              />
            </picture>
            <span className="text-lg font-semibold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              SAAI
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {user && <div className="mr-1"><ActiveUsers users={activeUsers} currentPage={location.pathname} /></div>}
            
            {/* Primary nav items - show only first 4 */}
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

            {/* Utility items */}
            <div className="ml-1 flex items-center gap-0.5">
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
          <div className="flex lg:hidden items-center gap-1.5">
            <ThemeToggle />
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
                  
                  {isAdmin && (
                    <>
                      <div className="text-xs font-medium text-muted-foreground px-3 mt-3 mb-1">
                        ADMIN
                      </div>
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant={location.pathname === "/admin" ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-10"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
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
