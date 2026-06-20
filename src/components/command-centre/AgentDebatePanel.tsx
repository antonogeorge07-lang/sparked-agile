import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentDebate, DebateTopicType, DebateResponse } from '@/hooks/useAgentDebate';
import { Brain, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Users, Zap, Shield, Target, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToPowerPoint } from '@/utils/exportToPowerPoint';

interface AgentDebatePanelProps {
  projectId: string;
}

const TOPIC_OPTIONS: { value: DebateTopicType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'sprint_plan', label: 'Sprint Plan', icon: <Target className="h-4 w-4" />, description: 'Strategist, Risk Analyst & Quality Guardian debate your sprint plan' },
  { value: 'backlog_priority', label: 'Backlog Priority', icon: <Zap className="h-4 w-4" />, description: 'Value Maximiser, Tech Architect & User Advocate debate priorities' },
  { value: 'risk_assessment', label: 'Risk Assessment', icon: <Shield className="h-4 w-4" />, description: 'Delivery, Technical & Stakeholder risk analysts debate risks' },
  { value: 'epic_validation', label: 'Epic Validation', icon: <CheckCircle2 className="h-4 w-4" />, description: 'Strategy Auditor, Feasibility Analyst & Impact Validator debate the epic' },
  { value: 'retrospective', label: 'Retrospective', icon: <Users className="h-4 w-4" />, description: 'Pattern Analyst, Action Auditor & Health Assessor debate insights' },
];

const voteIcon = (vote: string) => {
  switch (vote) {
    case 'approve': return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case 'reject': return <XCircle className="h-4 w-4 text-destructive" />;
    case 'conditional_approve': return <AlertTriangle className="h-4 w-4 text-accent-foreground" />;
    default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  }
};

const voteBadgeVariant = (vote: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (vote) {
    case 'approve': return 'default';
    case 'reject': return 'destructive';
    case 'conditional_approve': return 'secondary';
    default: return 'outline';
  }
};

export function AgentDebatePanel({ projectId }: AgentDebatePanelProps) {
  const { isDebating, currentResult, sessions, liveResponses, startDebate, loadSessionResponses } = useAgentDebate(projectId);
  const [topic, setTopic] = useState('');
  const [topicType, setTopicType] = useState<DebateTopicType>('sprint_plan');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionResponses, setSessionResponses] = useState<DebateResponse[]>([]);

  const handleStartDebate = async () => {
    if (!topic.trim()) return;
    await startDebate(topic, topicType);
  };

  const SAMPLE_TOPICS: Record<DebateTopicType, string> = {
    sprint_plan: "Should we commit to 45 story points this sprint given our team of 5 with one member on holiday and 2 high-risk tickets in the backlog?",
    backlog_priority: "Should we prioritise rebuilding the legacy auth module over shipping the new analytics dashboard requested by 3 enterprise customers?",
    risk_assessment: "What are the top delivery, technical and stakeholder risks for launching our payments integration in the next 6 weeks?",
    epic_validation: "Validate this epic: 'Migrate the entire reporting stack to a new warehouse in one quarter with the existing 4-person team.'",
    retrospective: "Last sprint we missed 30% of committed points and had 4 blockers. What patterns should we act on and what concrete changes should we make?",
  };

  const handleTrySample = async () => {
    const sample = SAMPLE_TOPICS[topicType];
    setTopic(sample);
    await startDebate(sample, topicType);
  };

  const handleViewSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    const responses = await loadSessionResponses(sessionId);
    setSessionResponses(responses);
  };

  const selectedTopicConfig = TOPIC_OPTIONS.find(t => t.value === topicType);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Multi-Agent Debate System
          </CardTitle>
          <CardDescription>
            Autonomous agents simulate cross-functional debate to stress-test your plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Debate Focus</label>
            <Select value={topicType} onValueChange={(v) => setTopicType(v as DebateTopicType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPIC_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Topic for Debate</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartDebate} disabled={isDebating || !topic.trim()} className="flex-1">
              {isDebating ? "Agents Analyzing..." : "Start Debate"}
            </Button>
            <Button variant="outline" onClick={handleTrySample} disabled={isDebating}>Try Sample</Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {currentResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Executive Decision Verdict</span>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => exportToPowerPoint({
                      title: `Decision: ${topic.substring(0, 30)}...`,
                      recommendation: currentResult.recommendation,
                      confidence: currentResult.confidence,
                      votes: currentResult.votes
                    })}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to PPT
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Consensus Confidence</span>
                    <span>{(currentResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={currentResult.confidence * 100} />
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {currentResult.recommendation}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}