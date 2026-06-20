import { 
  Home, BarChart3, GitBranch, Target, Briefcase, Sparkles, Presentation, 
  ListFilter, Activity, Calendar, Users, Workflow, MessageCircle,
  BookOpen, Shield, Settings, Network, Star, TrendingUp, FolderKanban, Crown,
  ChevronDown, ChevronRight, LucideIcon, ExternalLink, Upload, Zap, Mail, Layers
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useUIMode } from "@/hooks/useUIMode";
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

// Apple-perfect menu: one promise, six items, everything else behind /advanced.
const menuSections: MenuSection[] = [
  {
    labelKey: "sidebar.today",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.briefing", url: "/briefing", icon: Mail, tour: "briefing" },
      { titleKey: "sidebar.truth", url: "/velocity-truth", icon: Activity },
      { titleKey: "sidebar.connectTools", url: "/connect", icon: Zap, tour: "integrations" },
    ],
  },
  {
    labelKey: "sidebar.work",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.myWorkspace", url: "/my-projects", icon: FolderKanban },
      { titleKey: "sidebar.teamHub", url: "/team-hub", icon: MessageCircle },
      { titleKey: "sidebar.advanced", url: "/advanced", icon: Layers },
    ],
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


// Apple-mode (simple) sections — the briefing is the product.
const simpleSections: MenuSection[] = [
  {
    labelKey: "sidebar.today",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.briefing", url: "/briefing", icon: Mail, tour: "briefing" },
      { titleKey: "sidebar.connectTools", url: "/connect", icon: Zap, tour: "integrations" },
    ],
  },
  {
    labelKey: "sidebar.more",
    defaultOpen: true,
    items: [
      { titleKey: "sidebar.advanced", url: "/advanced", icon: Layers },
      { titleKey: "sidebar.settings", url: "/workspace/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const { isSimple } = useUIMode();
  const activeSections = isSimple ? simpleSections : menuSections;
  const { t } = useTranslation();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isPlatformOwner, setIsPlatformOwner] = React.useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      if (user) {
        const { data } = await supabase.rpc('is_platform_owner', { user_id: user.id });
        setIsPlatformOwner(Boolean(data));
      } else {
        setIsPlatformOwner(false);
      }
    };
    init();
  }, []);

  // Initialize expanded sections based on current route
  React.useEffect(() => {
    const currentPath = location.pathname;
    const newExpanded: Record<string, boolean> = {};
    
    activeSections.forEach(section => {
      const hasActiveItem = section.items.some(item => item.url === currentPath);
      newExpanded[section.labelKey] = hasActiveItem || section.defaultOpen;
    });
    
    setExpandedSections(newExpanded);
  }, [location.pathname, activeSections]);

  const toggleSection = (labelKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [labelKey]: !prev[labelKey]
    }));
  };

  // Filter menu sections based on user role and email
  const getFilteredSections = () => {
    if (loading) return [];
    
    const publicItems = ['/dashboard', '/user-guide', '/briefing', '/advanced', '/connect', '/velocity-truth', '/my-projects', '/team-hub', '/workspace/settings'];
    
    return activeSections
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
            return isPlatformOwner;
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
    <Sidebar collapsible="icon" className="border-r border-border/60 material-chrome">
      <SidebarContent className="pt-14 pb-4">
        {filteredSections.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <p>{t('common.signInRequired')}</p>
            <a href="/auth" className="mt-2 text-xs text-primary hover:underline block">
              {t('common.signInLink')}
            </a>
          </div>
        )}

        {filteredSections.map((section) => (
          <SidebarGroup key={section.labelKey} className="px-2">
            {open ? (
              <Collapsible
                open={expandedSections[section.labelKey]}
                onOpenChange={() => toggleSection(section.labelKey)}
              >
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-[0.08em] px-3 py-1.5 rounded-md hover:text-foreground transition-colors cursor-pointer">
                    <span>{t(section.labelKey)}</span>
                    {expandedSections[section.labelKey] ? (
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    ) : (
                      <ChevronRight className="h-3 w-3 opacity-60" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {section.items.map((item) => {
                        const active = isActive(item.url);
                        return (
                          <SidebarMenuItem key={item.titleKey}>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              tooltip={!open ? t(item.titleKey) : undefined}
                            >
                              <Link
                                to={item.url}
                                data-tour={item.tour}
                                className={`
                                  group relative flex items-center gap-2.5 px-3 py-1.5 rounded-md
                                  transition-all duration-200 ease-apple
                                  ${active
                                    ? 'bg-foreground/[0.06] text-foreground font-medium'
                                    : 'text-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground'
                                  }
                                `}
                              >
                                {active && (
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
                                )}
                                <item.icon className={`h-[15px] w-[15px] shrink-0 transition-colors ${active ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground/85'}`} strokeWidth={active ? 2.2 : 1.8} />
                                <span className="text-[13px] tracking-[-0.01em]">{t(item.titleKey)}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.titleKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={t(item.titleKey)}
                        >
                          <Link
                            to={item.url}
                            data-tour={item.tour}
                            className={`
                              relative flex items-center justify-center p-2 rounded-md
                              transition-all duration-200 ease-apple
                              ${active
                                ? 'bg-foreground/[0.06] text-primary'
                                : 'text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground'
                              }
                            `}
                          >
                            <item.icon className="h-[16px] w-[16px]" strokeWidth={active ? 2.2 : 1.8} />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
