import { 
  Home, BarChart3, GitBranch, Target, Briefcase, Sparkles, Presentation, 
  ListFilter, Activity, Calendar, Users, Workflow, Languages, Globe, 
  Video, BookOpen, Shield, Settings, Network, Star, TrendingUp
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuSections = [
  {
    label: "Get Started",
    items: [
      { title: "Quick Start Guide", url: "/quick-start", icon: Star, tour: "quick-start" },
      { title: "Home", url: "/home", icon: Home },
    ]
  },
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: BarChart3, tour: "dashboard" },
    ]
  },
  {
    label: "Epic Management",
    items: [
      { title: "Epics", url: "/epic-management", icon: GitBranch, tour: "epics" },
      { title: "Epic Portfolio", url: "/epic-portfolio", icon: Target },
    ]
  },
  {
    label: "Agile Ceremonies",
    items: [
      { title: "Command Centre", url: "/project-command-centre", icon: Briefcase, tour: "command-centre" },
      { title: "Sprint Planning", url: "/sprint-planning-assistant", icon: Sparkles, tour: "sprint-planning" },
      { title: "Sprint Review", url: "/sprint-review-coordinator", icon: Presentation },
      { title: "Backlog Refinement", url: "/backlog-refinement", icon: ListFilter },
      { title: "Retrospective", url: "/retrospective", icon: Calendar },
      { title: "Daily Standup", url: "/standup", icon: Users },
    ]
  },
  {
    label: "Analytics & Insights",
    items: [
      { title: "Usage Analytics", url: "/usage-analytics", icon: Activity },
      { title: "Flow Metrics", url: "/flow-metrics", icon: TrendingUp },
      { title: "Market Intelligence", url: "/market-intelligence", icon: Globe },
    ]
  },
  {
    label: "Collaboration",
    items: [
      { title: "Workflows", url: "/workflows", icon: Workflow },
      { title: "Ceremony Setup", url: "/ceremony-setup", icon: Calendar },
      { title: "Integrations", url: "/integrations", icon: Network, tour: "integrations" },
    ]
  },
  {
    label: "Content & Tools",
    items: [
      { title: "PolyLinQ Translator", url: "/polylinq", icon: Languages },
      { title: "Video Scripts", url: "/video-script-generator", icon: Video },
      { title: "Social Media", url: "/social-media-generator", icon: Star },
      { title: "User Guide", url: "/user-guide", icon: BookOpen },
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="pt-12">
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            {open && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {section.label}
              </SidebarGroupLabel>
            )}
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
                        {open && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
