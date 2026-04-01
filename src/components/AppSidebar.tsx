import { 
  Home, BarChart3, GitBranch, Target, Briefcase, Sparkles, Presentation, 
  ListFilter, Activity, Calendar, Users, Workflow, MessageCircle,
  BookOpen, Shield, Settings, Network, Star, TrendingUp, FolderKanban, Crown,
  ChevronDown, ChevronRight, LucideIcon, ExternalLink, Upload, Zap
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  titleKey: string;
  url: string;
  icon: LucideIcon;
  tour?: string;
  ownerOnly?: boolean;
}

interface MenuSection {
  labelKey: string;
  defaultOpen: boolean;
  adminOnly?: boolean;
  items: MenuItem[];
}

// Streamlined menu: Core daily-use → Ceremonies → Advanced (collapsed)
const menuSections: MenuSection[] = [
  {
    labelKey: "sidebar.getStarted",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.home", url: "/home", icon: Home },
      { titleKey: "sidebar.quickStart", url: "/quick-start", icon: Star, tour: "quick-start" },
      { titleKey: "sidebar.connectTools", url: "/connect", icon: Zap },
      { titleKey: "sidebar.myWorkspace", url: "/my-projects", icon: FolderKanban },
      { titleKey: "sidebar.importData", url: "/import", icon: Upload },
    ]
  },
  {
    labelKey: "sidebar.planAndTrack",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.dashboard", url: "/dashboard", icon: BarChart3, tour: "dashboard" },
      { titleKey: "sidebar.commandCentre", url: "/project-command-centre", icon: Briefcase, tour: "command-centre" },
      { titleKey: "sidebar.sprintPlanning", url: "/sprint-planning-assistant", icon: Sparkles, tour: "sprint-planning" },
      { titleKey: "sidebar.teamHub", url: "/team-hub", icon: MessageCircle },
      { titleKey: "sidebar.activityFeed", url: "/activity-feed", icon: Activity },
    ]
  },
  {
    labelKey: "sidebar.ceremonies",
    defaultOpen: false,
    items: [
      { titleKey: "sidebar.dailyStandup", url: "/standup", icon: Users },
      { titleKey: "sidebar.sprintReview", url: "/sprint-review-coordinator", icon: Presentation },
      { titleKey: "sidebar.retrospective", url: "/retrospective", icon: Calendar },
      { titleKey: "sidebar.backlogRefinement", url: "/backlog-refinement", icon: ListFilter },
    ]
  },
  {
    labelKey: "sidebar.advanced",
    defaultOpen: false,
    items: [
      { titleKey: "sidebar.epics", url: "/epic-management", icon: GitBranch, tour: "epics" },
      { titleKey: "sidebar.externalTasks", url: "/external-tasks", icon: ExternalLink },
      { titleKey: "sidebar.flowMetrics", url: "/flow-metrics", icon: TrendingUp },
      { titleKey: "sidebar.workflows", url: "/workflows", icon: Workflow },
      { titleKey: "sidebar.integrations", url: "/integrations", icon: Network, tour: "integrations" },
    ]
  },
  {
    labelKey: "sidebar.help",
    defaultOpen: false,
    items: [
      { titleKey: "sidebar.userGuide", url: "/user-guide", icon: BookOpen },
    ]
  },
  {
    labelKey: "sidebar.admin",
    adminOnly: true,
    defaultOpen: false,
    items: [
      { titleKey: "sidebar.platformOwner", url: "/platform-owner", icon: Crown, ownerOnly: true },
      { titleKey: "sidebar.security", url: "/security-incidents", icon: Shield },
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const { t } = useTranslation();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const PLATFORM_OWNER_EMAIL = 'Antono.George1@outlook.com';

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
      newExpanded[section.labelKey] = hasActiveItem || section.defaultOpen;
    });
    
    setExpandedSections(newExpanded);
  }, [location.pathname]);

  const toggleSection = (labelKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [labelKey]: !prev[labelKey]
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
          if (item.url === '/security-incidents') {
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
          <div className="text-muted-foreground text-sm">{t('common.loading')}</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-12">
        {filteredSections.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <p>{t('common.signInRequired')}</p>
            <a href="/auth" className="mt-2 text-xs text-primary hover:underline block">
              {t('common.signInLink')}
            </a>
          </div>
        )}
        
        {filteredSections.map((section) => (
          <SidebarGroup key={section.labelKey}>
            {open ? (
              <Collapsible
                open={expandedSections[section.labelKey]}
                onOpenChange={() => toggleSection(section.labelKey)}
              >
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                    <span>{t(section.labelKey)}</span>
                    {expandedSections[section.labelKey] ? (
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
                        <SidebarMenuItem key={item.titleKey}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive(item.url)}
                            tooltip={!open ? t(item.titleKey) : undefined}
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
                              <span className="text-sm">{t(item.titleKey)}</span>
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
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        tooltip={t(item.titleKey)}
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
