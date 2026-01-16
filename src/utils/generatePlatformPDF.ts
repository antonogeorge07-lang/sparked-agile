import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePlatformOverviewPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('SAAI Platform', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text('AI-Powered Agile & Project Management Ecosystem', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Tagline
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('Self-Contained PM Tools • AI Co-Pilot • Enterprise Security • Zero API Keys Required', pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Section 1: Native PM Ecosystem
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('1. Native PM Ecosystem', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('Works independently without external integrations - fully self-contained project management.', margin, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Feature', 'Description']],
    body: [
      ['Kanban Boards', 'Drag-drop boards with customizable columns, WIP limits, swimlanes'],
      ['Sprint Management', 'Create/start/complete sprints, velocity tracking, burndown charts'],
      ['Backlog Items', 'Stories, tasks, bugs, epics, subtasks with full workflow'],
      ['Comments & Attachments', 'Collaborative discussions and file sharing on any item'],
      ['Activity Tracking', 'Complete audit trail of all changes with timestamps'],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [99, 102, 241] },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 2: AI Co-Pilot
  checkPageBreak(80);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('2. AI Co-Pilot (Full AI Assistant)', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('Powered by advanced AI models - no API keys required from users.', margin, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Capability', 'What It Does']],
    body: [
      ['Generate User Stories', 'Creates well-structured stories from descriptions'],
      ['Suggest Acceptance Criteria', 'Given/When/Then format suggestions'],
      ['Estimate Story Points', 'Uses historical data for Fibonacci estimates'],
      ['Detect Blockers', 'Identifies stalled work and potential issues'],
      ['Forecast Sprints', 'Predicts completion likelihood with risk factors'],
      ['Analyze Backlog', 'Health assessment and prioritization recommendations'],
      ['Balance Workload', 'Identifies over/under-loaded team members'],
      ['Generate Sprint Goals', 'Creates measurable goals from planned items'],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [16, 185, 129] },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 3: Agile Ceremonies
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('3. Agile Ceremonies', margin, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Ceremony', 'AI-Powered Features']],
    body: [
      ['Daily Standup', 'AI-powered summaries, blocker detection, action tracking'],
      ['Sprint Planning', 'Capacity-based recommendations, story point estimation'],
      ['Sprint Review', 'Demo checklists, stakeholder coordination, wrapup emails'],
      ['Retrospective', 'Insights generation, sentiment analysis, lessons learned'],
      ['Backlog Refinement', 'Health analysis, priority balancing, grooming suggestions'],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [245, 158, 11] },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 4: Project Command Centre
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('4. Project Command Centre (PMI-Aligned)', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  const pmiText = [
    '• 5 PMI lifecycle stages: Initiation → Planning → Execution → Monitoring → Closure',
    '• Risk Register & Lessons Learned tracking',
    '• Project insights and progress analytics',
    '• Budget tracking and milestone management',
    '• AI-powered recommendations at each stage',
  ];
  pmiText.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Section 5: Enterprise Integrations
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('5. Enterprise Integrations (Optional)', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('All integrations use encrypted OAuth flows - zero API keys required from users.', margin, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Integration', 'Features']],
    body: [
      ['Jira', 'Sync issues, backlog, sprint data, bidirectional updates'],
      ['GitHub', 'Commits, PRs, issues, activity feed, code insights'],
      ['Slack', 'Channel notifications, ceremony reminders, alerts'],
      ['Microsoft 365', 'Outlook calendar events, Teams channel setup'],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [139, 92, 246] },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 6: Security & Compliance
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('6. Security & Compliance', margin, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Security Feature', 'Implementation']],
    body: [
      ['Row-Level Security', '196+ RLS policies for complete data isolation'],
      ['Encryption', 'AES-256 encryption for all tokens and secrets'],
      ['GDPR Compliance', 'Data export, anonymization, consent tracking'],
      ['Audit Logging', 'Complete activity trails with timestamps'],
      ['Role-Based Access', 'Admin, Member, Platform Owner roles with granular permissions'],
      ['Multi-Tenant', 'Isolated project environments with workspace separation'],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [239, 68, 68] },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section 7: Additional Features
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('7. Additional Capabilities', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  const additionalFeatures = [
    '• Value Streams & Epic Portfolio Management',
    '• Program Increment Planning (SAFe-aligned)',
    '• Flow Metrics & Velocity Tracking',
    '• Interactive Onboarding Tours',
    '• Usage Analytics Dashboard',
    '• Security Incident Management',
    '• Multi-language Support (9 languages)',
    '• Real-time Collaboration Features',
  ];
  additionalFeatures.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Section 8: Languages
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('8. Multi-Language Support', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('English • Spanish • French • German • Portuguese • Chinese • Japanese • Arabic • Korean', margin, yPos);
  yPos += 20;

  // Footer
  checkPageBreak(30);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(99, 102, 241);
  doc.text('SAAI - SM ActiveIntelligence', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('AI-Powered • Self-Contained • Enterprise-Ready', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${today}`, pageWidth / 2, yPos, { align: 'center' });

  // Save the PDF
  doc.save('SAAI-Platform-Overview.pdf');
}
