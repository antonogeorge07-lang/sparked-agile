import { 
  Home, BarChart3, GitBranch, Target, Briefcase, Sparkles, Presentation, 
  ListFilter, Activity, Calendar, Users, Workflow, 
  BookOpen, Shield, Settings, Network, Star, TrendingUp, FolderKanban, Crown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
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
      { title: "My Workspace", url: "/my-projects", icon: FolderKanban },
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
      { title: "Flow Metrics", url: "/flow-metrics", icon: TrendingUp },
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
    label: "Help & Resources",
    items: [
      { title: "User Guide", url: "/user-guide", icon: BookOpen },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Platform Owner", url: "/platform-owner", icon: Crown },
      { title: "Admin Panel", url: "/admin", icon: Settings },
      { title: "Security Incidents", url: "/security-incidents", icon: Shield },
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();

  // Filter menu sections based on user role
  const getFilteredSections = () => {
    if (loading) return [];
    
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Admin-only features
        if (item.url === '/admin' || item.url === '/security-incidents') {
          return role === 'admin';
        }
        // Features available to approved users (admin or member)
        return role === 'admin' || role === 'member';
      })
    })).filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Debug logging
  console.log('Sidebar - Role:', role, 'Loading:', loading, 'Sections:', filteredSections.length);

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
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="pt-12">
        {filteredSections.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <p>No menu items available.</p>
            <p className="mt-2 text-xs">Role: {role || 'none'}</p>
          </div>
        )}
        {filteredSections.map((section) => (
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
