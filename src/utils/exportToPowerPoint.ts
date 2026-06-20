import PptxGenJS from "pptxgenjs";

interface DashboardData {
  projectName: string;
  stats: {
    activeProjects: number;
    pendingWorkflows: number;
    completedActionItems: number;
  };
  recentActivity: Array<{
    title: string;
    description: string;
    timestamp: string;
  }>;
  jiraIssues?: Array<{
    key: string;
    summary: string;
    status: string;
    priority: string;
  }>;
  gitCommits?: Array<{
    message: string;
    author: string;
    date: string;
  }>;
}

export const exportDashboardToPowerPoint = async (data: DashboardData) => {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = "SAFe Agile Platform";
  pptx.title = `${data.projectName} - Dashboard Report`;
  pptx.subject = "Project Dashboard Export";

  // Slide 1: Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "0F172A" };
  
  titleSlide.addText("Dashboard Report", {
    x: 1,
    y: 1.5,
    w: 8,
    h: 1,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    align: "center"
  });
  
  titleSlide.addText(data.projectName, {
    x: 1,
    y: 2.8,
    w: 8,
    h: 0.8,
    fontSize: 32,
    color: "9b87f5",
    align: "center"
  });
  
  titleSlide.addText(new Date().toLocaleDateString(), {
    x: 1,
    y: 4,
    w: 8,
    h: 0.5,
    fontSize: 18,
    color: "94A3B8",
    align: "center"
  });

  // Slide 2: Key Metrics Overview
  const metricsSlide = pptx.addSlide();
  metricsSlide.background = { color: "FFFFFF" };
  
  metricsSlide.addText("Key Metrics Overview", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: "1E293B"
  });

  const metrics = [
    { label: "Active Projects", value: data.stats.activeProjects, color: "9b87f5" },
    { label: "Pending Workflows", value: data.stats.pendingWorkflows, color: "F97316" },
    { label: "Completed Action Items", value: data.stats.completedActionItems, color: "22C55E" }
  ];

  metrics.forEach((metric, index) => {
    const xPos = 1 + (index * 2.8);
    
    metricsSlide.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 2,
      w: 2.3,
      h: 2,
      fill: { color: metric.color },
      line: { width: 0 }
    });
    
    metricsSlide.addText(metric.value.toString(), {
      x: xPos,
      y: 2.3,
      w: 2.3,
      h: 0.8,
      fontSize: 48,
      bold: true,
      color: "FFFFFF",
      align: "center"
    });
    
    metricsSlide.addText(metric.label, {
      x: xPos,
      y: 3.2,
      w: 2.3,
      h: 0.5,
      fontSize: 16,
      color: "FFFFFF",
      align: "center"
    });
  });

  // Slide 3: Recent Activity
  if (data.recentActivity.length > 0) {
    const activitySlide = pptx.addSlide();
    activitySlide.background = { color: "FFFFFF" };
    
    activitySlide.addText("Recent Activity", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "1E293B"
    });

    const activities = data.recentActivity.slice(0, 5);
    activities.forEach((activity, index) => {
      const yPos = 1.5 + (index * 0.9);
      
      activitySlide.addText(`• ${activity.title}`, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: "1E293B"
      });
      
      activitySlide.addText(activity.description, {
        x: 0.8,
        y: yPos + 0.35,
        w: 8.7,
        h: 0.3,
        fontSize: 12,
        color: "64748B"
      });
    });
  }

  // Slide 4: JIRA Issues (if available)
  if (data.jiraIssues && data.jiraIssues.length > 0) {
    const jiraSlide = pptx.addSlide();
    jiraSlide.background = { color: "FFFFFF" };
    
    jiraSlide.addText("JIRA Issues", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "1E293B"
    });

    const tableData: any[] = [
      ["Key", "Summary", "Status", "Priority"]
    ];

    data.jiraIssues.slice(0, 8).forEach(issue => {
      tableData.push([
        issue.key,
        issue.summary,
        issue.status,
        issue.priority
      ]);
    });

    jiraSlide.addTable(tableData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      colW: [1.5, 4.5, 1.5, 1.5],
      fontSize: 12,
      border: { type: "solid", pt: 1, color: "CBD5E1" },
      fill: { color: "F8FAFC" },
      color: "1E293B",
      rowH: 0.4
    });
  }

  // Slide 5: Git Commits (if available)
  if (data.gitCommits && data.gitCommits.length > 0) {
    const gitSlide = pptx.addSlide();
    gitSlide.background = { color: "FFFFFF" };
    
    gitSlide.addText("Recent Git Activity", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "1E293B"
    });

    const gitTableData: any[] = [
      ["Commit Message", "Author", "Date"]
    ];

    data.gitCommits.slice(0, 8).forEach(commit => {
      gitTableData.push([
        commit.message,
        commit.author,
        commit.date
      ]);
    });

    gitSlide.addTable(gitTableData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      colW: [5, 2, 2],
      fontSize: 12,
      border: { type: "solid", pt: 1, color: "CBD5E1" },
      fill: { color: "F8FAFC" },
      color: "1E293B",
      rowH: 0.4
    });
  }

  // Generate and download
  const fileName = `${data.projectName.replace(/\s+/g, '_')}_Dashboard_${new Date().toISOString().split('T')[0]}.pptx`;
  await pptx.writeFile({ fileName });
};
