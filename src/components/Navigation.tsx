import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Home, Shield, Menu, X, Sparkles, Presentation, ListFilter, Activity, Star, HelpCircle, LayoutDashboard, Users, Workflow, Languages, Briefcase } from "lucide-react";
import sparkAgileLogo from "@/assets/spark-agile-logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
          .single();
        
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
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/project-command-centre", label: "Command Centre", icon: Briefcase },
    { path: "/sprint-planning-assistant", label: "Sprint AI", icon: Sparkles },
    { path: "/sprint-review-coordinator", label: "Review", icon: Presentation },
    { path: "/backlog-refinement", label: "Backlog", icon: ListFilter },
    { path: "/usage-analytics", label: "Analytics", icon: Activity },
    { path: "/polylinq", label: "PolyLinQ", icon: Languages },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={sparkAgileLogo} 
              alt="SPARK-AGILE" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {user && <ActiveUsers users={activeUsers} currentPage={location.pathname} />}
            
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link to="/admin">
                  <Button 
                    variant={location.pathname === "/admin" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link to="/user-guide">
                <Button 
                  variant={location.pathname === "/user-guide" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                  title="User Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                  May I Help You
                </Button>
              </Link>

              <ThemeToggle />
              
              {user && <NotificationBell />}
              
              {user ? (
                <ProfileMenu userEmail={userEmail} userName={userName} avatarUrl={avatarUrl} />
              ) : (
                <Link to="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="pb-4 border-b">
                      <ActiveUsers users={activeUsers} currentPage={location.pathname} variant="full" />
                    </div>
                  )}
                  
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant={location.pathname === "/admin" ? "default" : "ghost"}
                        className="w-full justify-start gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}

                  <Link to="/user-guide" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location.pathname === "/user-guide" ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      May I Help You
                    </Button>
                  </Link>

                  <div className="pt-4 border-t">
                    {user ? (
                      <ProfileMenu userEmail={userEmail} userName={userName} avatarUrl={avatarUrl} />
                    ) : (
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
