import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";
import { Fragment } from "react";

// Route configuration with labels and parent paths
const routeConfig: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Home" },
  "/home": { label: "Home" },
  "/dashboard": { label: "Dashboard", parent: "/" },
  "/epic-management": { label: "Epic Management", parent: "/" },
  "/epic-portfolio": { label: "Epic Portfolio", parent: "/" },
  "/epic-detail": { label: "Epic Detail", parent: "/epic-management" },
  "/project-command-centre": { label: "Command Centre", parent: "/" },
  "/project-workspace": { label: "Project Workspace", parent: "/project-command-centre" },
  "/sprint-planning-assistant": { label: "Sprint Planning", parent: "/" },
  "/sprint-review-coordinator": { label: "Sprint Review", parent: "/" },
  "/backlog-refinement": { label: "Backlog Refinement", parent: "/" },
  "/retrospective": { label: "Retrospective", parent: "/" },
  "/standup": { label: "Daily Standup", parent: "/" },
  "/usage-analytics": { label: "Usage Analytics", parent: "/" },
  "/flow-metrics": { label: "Flow Metrics", parent: "/usage-analytics" },
  "/polylinq": { label: "PolyLinQ", parent: "/" },
  "/value-streams": { label: "Value Streams", parent: "/" },
  "/program-increment": { label: "Program Increment", parent: "/" },
  "/task-management": { label: "Task Management", parent: "/" },
  "/workflows": { label: "Workflows", parent: "/" },
  "/integrations": { label: "Integrations", parent: "/" },
  "/ceremony-setup": { label: "Ceremony Setup", parent: "/" },
  "/feature-demo": { label: "Feature Demo", parent: "/" },
  "/user-guide": { label: "User Guide", parent: "/" },
  "/admin": { label: "Admin", parent: "/" },
  "/market-intelligence": { label: "Market Intelligence", parent: "/" },
  "/subscription": { label: "Subscription", parent: "/" },
  "/security-incidents": { label: "Security Incidents", parent: "/" },
  "/project-progress": { label: "Project Progress", parent: "/project-command-centre" },
  "/social-media-generator": { label: "Social Media", parent: "/" },
  "/video-script-generator": { label: "Video Scripts", parent: "/" },
  "/investor-pitch-deck": { label: "Pitch Deck", parent: "/" },
  "/about": { label: "About", parent: "/" },
  "/contact": { label: "Contact", parent: "/" },
  "/faq": { label: "FAQ", parent: "/" },
  "/blog": { label: "Blog", parent: "/" },
};

export const BreadcrumbNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't show breadcrumbs on landing page or auth
  if (currentPath === "/" || currentPath === "/auth" || currentPath === "/landing") {
    return null;
  }

  // Build breadcrumb trail
  const buildBreadcrumbTrail = (path: string): string[] => {
    const trail: string[] = [];
    let currentPathSegment = path;

    // Handle dynamic routes (e.g., /epic-detail/123 -> /epic-detail)
    const basePath = "/" + currentPathSegment.split("/")[1];
    
    while (currentPathSegment && currentPathSegment !== "/" && routeConfig[currentPathSegment]) {
      trail.unshift(currentPathSegment);
      const parent = routeConfig[currentPathSegment]?.parent;
      if (!parent) break;
      currentPathSegment = parent;
    }

    // If the trail doesn't start with home and we're not on home, add home
    if (trail.length > 0 && trail[0] !== "/" && trail[0] !== "/home") {
      trail.unshift("/");
    }

    return trail;
  };

  // Get base path for dynamic routes
  const basePath = "/" + currentPath.split("/").filter(Boolean)[0];
  const pathToUse = routeConfig[currentPath] ? currentPath : basePath;
  const breadcrumbTrail = buildBreadcrumbTrail(pathToUse);

  // If no valid trail, don't render
  if (breadcrumbTrail.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbTrail.map((path, index) => {
              const isLast = index === breadcrumbTrail.length - 1;
              const config = routeConfig[path];
              const isHome = path === "/" || path === "/home";

              return (
                <Fragment key={path}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-medium">
                        {isHome && <Home className="h-3.5 w-3.5" />}
                        {config?.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link 
                          to={path} 
                          className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors"
                        >
                          {isHome && <Home className="h-3.5 w-3.5" />}
                          {config?.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                  )}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};
