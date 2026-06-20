import { useState } from "react";
import { User, Settings, LogOut, CreditCard, Shield, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProfileDialog } from "./ProfileDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useUIMode } from "@/hooks/useUIMode";

interface ProfileMenuProps {
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
}

export const ProfileMenu = ({ userEmail, userName, avatarUrl }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { mode, toggle } = useUIMode();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      // Add fade-out effect to body
      document.body?.classList.add('animate-fade-out');
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect to landing page
      navigate("/");
      
      // Remove animation class after redirect
      setTimeout(() => {
        document.body?.classList.remove('animate-fade-out');
      }, 100);
    } catch (error) {
      document.body?.classList.remove('animate-fade-out');
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || ""} alt={userName || userEmail} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggle}>
            {mode === "simple" ? (
              <Layers className="mr-2 h-4 w-4" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span>{mode === "simple" ? "Switch to Advanced mode" : "Switch to Simple mode"}</span>
          </DropdownMenuItem>
          {role === 'admin' && (
            <>
              <DropdownMenuItem onClick={() => navigate("/usage-analytics")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Platform Analytics</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ProfileDialog 
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
      />
    </>
  );
};
