import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Target,
  DollarSign,
  Calendar,
  Users,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApprovalRequest {
  id: string;
  project_id: string;
  epic_id: string | null;
  requester_id: string;
  request_type: string;
  title: string;
  description: string | null;
  current_value: any;
  proposed_value: any;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  projects?: { name: string };
  epics?: { title: string };
}

interface ApprovalRequestsListProps {
  userId: string;
  projectId: string | null;
}

export function ApprovalRequestsList({ userId, projectId }: ApprovalRequestsListProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [userId, projectId]);

  const loadRequests = async () => {
    setLoading(true);
    
    let query = supabase
      .from('approval_requests')
      .select(`
        *,
        projects(name),
        epics(title)
      `)
      .eq('approver_id', userId)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading approval requests:', error);
      toast.error('Failed to load approval requests');
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  const handleApprove = async (request: ApprovalRequest) => {
    setProcessing(true);
    
    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (error) {
      toast.error('Failed to approve request');
    } else {
      toast.success('Request approved successfully');
      
      // Send notification email
      await supabase.functions.invoke('send-approval-notification', {
        body: {
          requestId: request.id,
          action: 'approved'
        }
      });

      loadRequests();
    }

    setProcessing(false);
    setSelectedRequest(null);
  };

  const handleReject = async (request: ApprovalRequest) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    
    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', request.id);

    if (error) {
      toast.error('Failed to reject request');
    } else {
      toast.success('Request rejected');
      
      // Send notification email
      await supabase.functions.invoke('send-approval-notification', {
        body: {
          requestId: request.id,
          action: 'rejected',
          reason: rejectionReason
        }
      });

      loadRequests();
    }

    setProcessing(false);
    setSelectedRequest(null);
    setRejectionReason("");
  };

  const getRequestIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      epic_closure: <Target className="h-5 w-5" />,
      budget_change: <DollarSign className="h-5 w-5" />,
      milestone_change: <Calendar className="h-5 w-5" />,
      scope_change: <FileText className="h-5 w-5" />,
      resource_request: <Users className="h-5 w-5" />
    };
    return icons[type] || <FileText className="h-5 w-5" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return colors[priority] || 'outline';
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
      expired: { variant: 'outline', icon: <AlertTriangle className="h-3 w-3 mr-1" /> }
    };
    const config = configs[status] || configs.pending;
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Pending Approvals ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No pending approval requests</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <Card 
                key={request.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getRequestIcon(request.request_type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{request.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{request.projects?.name}</span>
                          {request.epics && (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              <span>{request.epics.title}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(request.priority) as any}>
                        {request.priority}
                      </Badge>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                    {request.due_date && (
                      <span className={`${new Date(request.due_date) < new Date() ? 'text-red-500' : 'text-muted-foreground'}`}>
                        Due: {new Date(request.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            History ({processedRequests.length})
          </h3>

          <div className="space-y-2">
            {processedRequests.slice(0, 10).map(request => (
              <Card key={request.id} className="opacity-75">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRequestIcon(request.request_type)}
                      <div>
                        <CardTitle className="text-sm">{request.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {request.projects?.name}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest && getRequestIcon(selectedRequest.request_type)}
              {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>
              Review this request and take action
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedRequest.projects?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge variant={getPriorityColor(selectedRequest.priority) as any}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {selectedRequest.description && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
                  <p className="text-sm bg-muted p-3 rounded">{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.current_value && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Current Value</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(selectedRequest.current_value, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Proposed Value</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(selectedRequest.proposed_value, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Rejection Reason (required if rejecting)</p>
                  <Textarea
                    placeholder="Explain why this request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {selectedRequest?.status === 'pending' && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleReject(selectedRequest)}
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedRequest)}
                disabled={processing}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}