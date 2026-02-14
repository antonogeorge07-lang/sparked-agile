import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Archive, Trash2, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface EpicActionsProps {
  epic: any;
  onEdit: () => void;
  onUpdate: () => void;
}

export function EpicActions({ epic, onEdit, onUpdate }: EpicActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [cloning, setCloning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from('epics')
        .update({ status: 'archived' })
        .eq('id', epic.id);

      if (error) throw error;
      toast({ title: "Epic archived", description: `"${epic.title}" has been archived` });
      onUpdate();
      setShowArchiveDialog(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      // Delete related records first
      await supabase.from('epic_stakeholders').delete().eq('epic_id', epic.id);
      await supabase.from('epic_milestones').delete().eq('epic_id', epic.id);
      await supabase.from('epic_progress_snapshots').delete().eq('epic_id', epic.id);
      await supabase.from('epic_impact_metrics').delete().eq('epic_id', epic.id);
      await supabase.from('epic_readiness_checks').delete().eq('epic_id', epic.id);

      const { error } = await supabase
        .from('epics')
        .delete()
        .eq('id', epic.id);

      if (error) throw error;
      toast({ title: "Epic deleted", description: `"${epic.title}" has been permanently deleted` });
      navigate('/epic-management');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clone the epic
      const { data: newEpic, error: epicError } = await supabase
        .from('epics')
        .insert({
          title: `${epic.title} (Copy)`,
          description: epic.description,
          value_stream_id: epic.value_stream_id,
          business_justification: epic.business_justification,
          strategic_goals: epic.strategic_goals,
          priority: epic.priority,
          business_value: epic.business_value,
          acceptance_criteria: epic.acceptance_criteria,
          start_date: null,
          end_date: null,
          effort_estimate: epic.effort_estimate,
          roi_score: epic.roi_score,
          created_by: user.id,
          status: 'backlog',
          health_score: 'on_track',
          color_hex: epic.color_hex,
        })
        .select()
        .single();

      if (epicError) throw epicError;

      // Clone stakeholders
      const { data: stakeholders } = await supabase
        .from('epic_stakeholders')
        .select('user_id, role')
        .eq('epic_id', epic.id);

      if (stakeholders && stakeholders.length > 0) {
        await supabase.from('epic_stakeholders').insert(
          stakeholders.map(s => ({ epic_id: newEpic.id, user_id: s.user_id, role: s.role }))
        );
      }

      // Clone milestones
      const { data: milestones } = await supabase
        .from('epic_milestones')
        .select('title, description, target_date, status')
        .eq('epic_id', epic.id);

      if (milestones && milestones.length > 0) {
        await supabase.from('epic_milestones').insert(
          milestones.map(m => ({ epic_id: newEpic.id, title: m.title, description: m.description, target_date: m.target_date, status: 'pending' }))
        );
      }

      // Clone features
      const { data: features } = await supabase
        .from('features')
        .select('title, description, priority, effort_estimate, display_order')
        .eq('epic_id', epic.id);

      if (features && features.length > 0) {
        await supabase.from('features').insert(
          features.map(f => ({ epic_id: newEpic.id, title: f.title, description: f.description, priority: f.priority, effort_estimate: f.effort_estimate, display_order: f.display_order, status: 'backlog' }))
        );
      }

      toast({ title: "Epic cloned", description: `"${newEpic.title}" created with all features, milestones, and stakeholders` });
      navigate(`/epic/${newEpic.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCloning(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={cloning}>
            {cloning ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />Edit Epic
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClone}>
            <Copy className="mr-2 h-4 w-4" />Clone Epic
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
            <Archive className="mr-2 h-4 w-4" />Archive Epic
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />Delete Epic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Epic</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive "{epic.title}". It will no longer appear in active views but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Epic Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{epic.title}" and all associated data (features, milestones, stakeholders, snapshots). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
