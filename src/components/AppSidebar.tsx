import { 
  Home, BarChart3, GitBranch, Target, Briefcase, Sparkles, Presentation, 
  ListFilter, Activity, Calendar, Users, Workflow, 
  BookOpen, Shield, Settings, Network, Star, TrendingUp, FolderKanban, Crown,
  ChevronDown, ChevronRight, LucideIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  tour?: string;
  ownerOnly?: boolean;
}

interface MenuSection {
  label: string;
  defaultOpen: boolean;
  adminOnly?: boolean;
  items: MenuItem[];
}

// Simplified menu structure with 4 main groups
const menuSections: MenuSection[] = [
  {
    label: "Get Started",
    defaultOpen: true,
    items: [
      { title: "Home", url: "/home", icon: Home },
      { title: "Quick Start", url: "/quick-start", icon: Star, tour: "quick-start" },
      { title: "My Workspace", url: "/my-projects", icon: FolderKanban },
    ]
  },
  {
    label: "Plan & Track",
    defaultOpen: true,
    items: [
      { title: "Dashboard", url: "/dashboard", icon: BarChart3, tour: "dashboard" },
      { title: "Command Centre", url: "/project-command-centre", icon: Briefcase, tour: "command-centre" },
      { title: "Epics", url: "/epic-management", icon: GitBranch, tour: "epics" },
      { title: "Sprint Planning", url: "/sprint-planning-assistant", icon: Sparkles, tour: "sprint-planning" },
    ]
  },
  {
    label: "Ceremonies",
    defaultOpen: false,
    items: [
      { title: "Daily Standup", url: "/standup", icon: Users },
      { title: "Sprint Review", url: "/sprint-review-coordinator", icon: Presentation },
      { title: "Retrospective", url: "/retrospective", icon: Calendar },
      { title: "Backlog Refinement", url: "/backlog-refinement", icon: ListFilter },
    ]
  },
  {
    label: "Insights & Tools",
    defaultOpen: false,
    items: [
      { title: "Flow Metrics", url: "/flow-metrics", icon: TrendingUp },
      { title: "Workflows", url: "/workflows", icon: Workflow },
      { title: "Integrations", url: "/integrations", icon: Network, tour: "integrations" },
      { title: "Ceremony Setup", url: "/ceremony-setup", icon: Calendar },
    ]
  },
  {
    label: "Help",
    defaultOpen: false,
    items: [
      { title: "User Guide", url: "/user-guide", icon: BookOpen },
    ]
  },
  {
    label: "Admin",
    adminOnly: true,
    defaultOpen: false,
    items: [
      { title: "Platform Owner", url: "/platform-owner", icon: Crown, ownerOnly: true },
      { title: "Admin Panel", url: "/admin", icon: Settings },
      { title: "Security", url: "/security-incidents", icon: Shield },
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const PLATFORM_OWNER_EMAIL = 'antono.george07@gmail.com';

  React.useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  // Initialize expanded sections based on current route
  React.useEffect(() => {
    const currentPath = location.pathname;
    const newExpanded: Record<string, boolean> = {};
    
    menuSections.forEach(section => {
      const hasActiveItem = section.items.some(item => item.url === currentPath);
      newExpanded[section.label] = hasActiveItem || section.defaultOpen;
    });
    
    setExpandedSections(newExpanded);
  }, [location.pathname]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Filter menu sections based on user role and email
  const getFilteredSections = () => {
    if (loading) return [];
    
    const publicItems = ['/quick-start', '/home', '/user-guide'];
    
    return menuSections
      .filter(section => {
        if (section.adminOnly) {
          return role === 'admin';
        }
        return true;
      })
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          // Platform Owner exclusive
          if (item.ownerOnly) {
            return userEmail?.toLowerCase() === PLATFORM_OWNER_EMAIL;
          }
          // Admin-only features
          if (item.url === '/admin' || item.url === '/security-incidents') {
            return role === 'admin';
          }
          // Public items available to all users
          if (publicItems.includes(item.url)) {
            return true;
          }
          // Features available to approved users
          return role === 'admin' || role === 'member';
        })
      }))
      .filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent className="flex items-center justify-center pt-12">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-12">
        {filteredSections.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <p>Please sign in to access features.</p>
            <a href="/auth" className="mt-2 text-xs text-primary hover:underline block">
              Sign In
            </a>
          </div>
        )}
        
        {filteredSections.map((section) => (
          <SidebarGroup key={section.label}>
            {open ? (
              <Collapsible
                open={expandedSections[section.label]}
                onOpenChange={() => toggleSection(section.label)}
              >
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                    <span>{section.label}</span>
                    {expandedSections[section.label] ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive(item.url)}
                            tooltip={!open ? item.title : undefined}
                          >
                            <Link 
                              to={item.url}
                              data-tour={item.tour}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                ${isActive(item.url) 
                                  ? 'bg-primary/10 text-primary font-medium' 
                                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                }
                              `}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="text-sm">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <Link 
                          to={item.url}
                          data-tour={item.tour}
                          className={`
                            flex items-center justify-center p-2 rounded-lg transition-colors
                            ${isActive(item.url) 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            }
                          `}
                        >
                          <item.icon className="h-4 w-4" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
