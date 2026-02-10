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
import { Brain, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Users, Zap, Shield, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleViewSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    const responses = await loadSessionResponses(sessionId);
    setSessionResponses(responses);
  };

  const selectedTopicConfig = TOPIC_OPTIONS.find(t => t.value === topicType);

  return (
    <div className="space-y-6">
      {/* Initiate Debate */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Multi-Agent Debate System
          </CardTitle>
          <CardDescription>
            Agents with different perspectives will debate, critique, and validate each other before reaching consensus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Debate Topic Type</label>
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
            {selectedTopicConfig && (
              <p className="text-xs text-muted-foreground">{selectedTopicConfig.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Topic / Question for Debate</label>
            <Textarea
              placeholder="e.g. 'Should we commit to 45 story points this sprint given our team of 5 with one member on holiday?'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleStartDebate} disabled={isDebating || !topic.trim()} className="w-full">
            {isDebating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Agents Debating... ({liveResponses.length} responses)
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Start 3-Agent Debate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live Debate Feed */}
      <AnimatePresence>
        {isDebating && liveResponses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 animate-pulse text-primary" />
                  Live Debate Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {liveResponses.map((resp, i) => (
                      <motion.div
                        key={resp.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{resp.agent_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Round {resp.round_number}</Badge>
                            <Badge variant="secondary" className="text-xs">{resp.response_type}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{resp.content.substring(0, 200)}...</p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Result */}
      <AnimatePresence>
        {currentResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Consensus Reached
                </CardTitle>
                <CardDescription>
                  {currentResult.agentCount} agents debated over {currentResult.roundsCompleted} rounds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm font-bold">{(currentResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={currentResult.confidence * 100} className="h-2" />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Agent Votes</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentResult.votes.map((vote, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background">
                        {voteIcon(vote.vote)}
                        <span className="text-sm">{vote.agent}</span>
                        <Badge variant={voteBadgeVariant(vote.vote)} className="text-xs">
                          {vote.vote.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Final Recommendation</h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {currentResult.recommendation}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Debates */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Previous Debates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleViewSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
                    selectedSession === session.id ? 'border-primary bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium line-clamp-1">{session.topic}</span>
                    <div className="flex items-center gap-2">
                      {session.consensus_confidence != null && (
                        <Badge variant="outline">{(session.consensus_confidence * 100).toFixed(0)}%</Badge>
                      )}
                      <Badge variant={session.status === 'consensus_reached' ? 'default' : 'secondary'}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.created_at).toLocaleDateString()} · {session.topic_type.replace('_', ' ')}
                  </p>
                </button>
              ))}
            </div>

            {/* Session Detail */}
            {selectedSession && sessionResponses.length > 0 && (
              <div className="mt-4 space-y-3">
                <Separator />
                <h4 className="text-sm font-medium">Debate Transcript</h4>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {sessionResponses.map(resp => (
                      <div key={resp.id} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{resp.agent_name}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">R{resp.round_number}</Badge>
                            <Badge variant="secondary" className="text-xs">{resp.response_type}</Badge>
                            {resp.confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                {(resp.confidence_score * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {resp.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
