import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const GDPRDataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const exportUserData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to export data",
          variant: "destructive",
        });
        return;
      }

      // Fetch all user data
      const [
        profileData,
        projectsData,
        activityData,
        feedbackData,
        consentsData,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("project_members").select("*, projects(*)").eq("user_id", user.id),
        supabase.from("user_activity_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("user_feedback").select("*").eq("user_id", user.id),
        supabase.from("user_consents").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        profile: profileData.data,
        projects: projectsData.data,
        recent_activity: activityData.data,
        feedback: feedbackData.data,
        consents: consentsData.data,
        user_metadata: {
          email: user.email,
          created_at: user.created_at,
        },
      };

      // Create export request log
      await supabase.from("data_export_requests").insert({
        user_id: user.id,
        completed_date: new Date().toISOString(),
        status: "completed",
        export_data: exportData,
      });

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spark-agile-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const deleteUserData = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      // Delete user account (this will cascade delete most related data due to foreign keys)
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      toast({
        title: "Account deletion initiated",
        description: "Your account and all associated data will be deleted within 30 days.",
      });

      // Sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Data Rights (GDPR)
          </CardTitle>
          <CardDescription>
            Manage your personal data in accordance with GDPR regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Data Portability
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Export all your personal data including profile, projects, activity logs, and preferences in JSON format.
            </p>
            <Button
              onClick={exportUserData}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              {isExporting ? "Exporting..." : "Export My Data"}
            </Button>
          </div>

          <div className="p-4 rounded-lg border bg-destructive/5">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Right to be Forgotten
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your account and all associated personal data. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                >
                  {isDeleting ? "Deleting..." : "Delete My Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers within 30 days. This includes:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Your profile and personal information</li>
                      <li>All projects and team memberships</li>
                      <li>Activity logs and usage data</li>
                      <li>Feedback and survey responses</li>
                      <li>Integration configurations</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteUserData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
            <p className="text-sm">
              <strong>Your Rights:</strong> Under GDPR, you have the right to access, rectify, erase, restrict processing, 
              data portability, and object to processing of your personal data. For any questions or concerns, 
              please contact our Data Protection Officer at{" "}
              <a href="mailto:dpo@spark-agile.com" className="text-primary hover:underline">
                dpo@spark-agile.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};