import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PendingApprovalBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <Clock className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100 mb-2">
        Account Pending Approval
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          Your account is awaiting admin approval. You'll receive an email notification once approved.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Explore demo features</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Learn platform features</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Review documentation</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/user-guide")}
          className="gap-2 bg-background hover:bg-accent"
        >
          <BookOpen className="w-4 h-4" />
          View User Guide
        </Button>
      </AlertDescription>
    </Alert>
  );
};
