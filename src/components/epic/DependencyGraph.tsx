import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddDependencyDialog } from "./AddDependencyDialog";

interface Epic {
  id: string;
  title: string;
  status: string;
  priority: string;
  color_hex?: string;
}

interface Dependency {
  id: string;
  epic_id: string;
  depends_on_epic_id: string;
  dependency_type: string;
  status: string;
}

interface DependencyGraphProps {
  currentEpicId: string;
  projectId: string;
}

const CustomNode = ({ data }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'in_progress': return 'border-blue-500 bg-blue-500/10';
      case 'planning': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${getStatusColor(data.status)} min-w-[200px] shadow-lg`}>
      <div className="font-semibold text-sm mb-1">{data.label}</div>
      <div className="flex gap-1">
        <Badge variant="outline" className="text-xs">
          {data.priority}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {data.status}
        </Badge>
      </div>
      {data.isCurrent && (
        <div className="mt-1 text-xs font-medium text-primary">Current Epic</div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function DependencyGraph({ currentEpicId, projectId }: DependencyGraphProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentEpicId, projectId]);

  const loadData = async () => {
    try {
      // Load epics from the same value stream
      const { data: currentEpic } = await supabase
        .from('epics')
        .select('value_stream_id')
        .eq('id', currentEpicId)
        .single();

      if (!currentEpic) return;

      const { data: epicsData, error: epicsError } = await supabase
        .from('epics')
        .select('id, title, status, priority, color_hex')
        .eq('value_stream_id', currentEpic.value_stream_id);

      if (epicsError) throw epicsError;
      setEpics(epicsData || []);

      // Load dependencies
      const { data: depsData, error: depsError } = await supabase
        .from('epic_dependencies')
        .select('*')
        .or(`epic_id.eq.${currentEpicId},depends_on_epic_id.eq.${currentEpicId}`)
        .eq('status', 'active');

      if (depsError) throw depsError;
      setDependencies(depsData || []);

      // Build graph
      buildGraph(epicsData || [], depsData || []);
    } catch (error: any) {
      console.error('Error loading dependency data:', error);
      toast({
        title: "Error",
        description: "Failed to load dependencies",
        variant: "destructive",
      });
    }
  };

  const buildGraph = (epicsData: Epic[], depsData: Dependency[]) => {
    // Get all related epic IDs
    const relatedEpicIds = new Set<string>([currentEpicId]);
    depsData.forEach(dep => {
      relatedEpicIds.add(dep.epic_id);
      relatedEpicIds.add(dep.depends_on_epic_id);
    });

    // Filter epics to only related ones
    const relatedEpics = epicsData.filter(epic => relatedEpicIds.has(epic.id));

    // Create nodes
    const newNodes: Node[] = relatedEpics.map((epic, index) => ({
      id: epic.id,
      type: 'custom',
      data: {
        label: epic.title,
        status: epic.status,
        priority: epic.priority,
        isCurrent: epic.id === currentEpicId,
      },
      position: {
        x: (index % 3) * 300,
        y: Math.floor(index / 3) * 150,
      },
    }));

    // Create edges
    const newEdges: Edge[] = depsData.map(dep => ({
      id: dep.id,
      source: dep.epic_id,
      target: dep.depends_on_epic_id,
      label: dep.dependency_type.replace('_', ' '),
      type: 'smoothstep',
      animated: dep.dependency_type === 'blocks',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: dep.dependency_type === 'blocks' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('epic_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;

      toast({
        title: "Dependency removed",
        description: "Epic dependency has been deleted",
      });

      loadData();
    } catch (error: any) {
      console.error('Error deleting dependency:', error);
      toast({
        title: "Error",
        description: "Failed to delete dependency",
        variant: "destructive",
      });
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent creating duplicate dependencies
      const exists = dependencies.some(
        dep => dep.epic_id === params.source && dep.depends_on_epic_id === params.target
      );
      
      if (exists) {
        toast({
          title: "Dependency exists",
          description: "This dependency already exists",
          variant: "destructive",
        });
        return;
      }

      setShowAddDialog(true);
    },
    [dependencies]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dependency Graph</CardTitle>
              <CardDescription>
                Visualize epic dependencies and relationships
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Dependency
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: '500px' }} className="border rounded-lg bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-background"
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          {dependencies.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-sm">Active Dependencies</h4>
              {dependencies.map(dep => {
                const sourceEpic = epics.find(e => e.id === dep.epic_id);
                const targetEpic = epics.find(e => e.id === dep.depends_on_epic_id);
                
                return (
                  <div key={dep.id} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{sourceEpic?.title || 'Unknown'}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <Badge variant="outline" className="mx-2">{dep.dependency_type}</Badge>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium">{targetEpic?.title || 'Unknown'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDependency(dep.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDependencyDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        currentEpicId={currentEpicId}
        availableEpics={epics.filter(e => e.id !== currentEpicId)}
        onDependencyAdded={loadData}
      />
    </>
  );
}
