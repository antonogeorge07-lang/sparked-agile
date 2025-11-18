import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
}

interface Preferences {
  [key: string]: boolean | string | undefined;
  emailNotifications?: boolean;
  darkMode?: boolean;
  language?: string;
}

export const ProfileDialog = ({ isOpen, onClose, userEmail, userName, avatarUrl }: ProfileDialogProps) => {
  const [fullName, setFullName] = useState(userName || "");
  const [avatar, setAvatar] = useState<string | null>(avatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    darkMode: false,
    language: "en",
  });
  const [microsoftConnected, setMicrosoftConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      checkMicrosoftConnection();
    }
  }, [isOpen]);

  const checkMicrosoftConnection = () => {
    const token = localStorage.getItem("microsoft_access_token");
    setMicrosoftConnected(!!token);
  };

  const handleDisconnectMicrosoft = () => {
    localStorage.removeItem("microsoft_access_token");
    setMicrosoftConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Microsoft account has been disconnected",
    });
  };

  const handleConnectMicrosoft = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-microsoft-client-id");
      if (error) throw error;
      if (!data?.clientId) {
        toast({
          title: "Configuration Error",
          description: "Microsoft credentials not configured. Please contact administrator.",
          variant: "destructive",
        });
        return;
      }
      const redirectUri = `${window.location.origin}/project-workspace`;
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${data.clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent("Calendars.ReadWrite offline_access User.Read Group.ReadWrite.All Channel.Create")}`;
      window.location.href = authUrl;
    } catch (e: any) {
      toast({
        title: "Connection Failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, preferences")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setAvatar(profile.avatar_url || null);
        const prefs = profile.preferences as Record<string, any> || {};
        setPreferences({
          emailNotifications: prefs.emailNotifications ?? true,
          darkMode: prefs.darkMode ?? false,
          language: prefs.language ?? "en",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete old avatar if exists
      if (avatar) {
        const oldPath = avatar.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatar(publicUrl);
      
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatar) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const oldPath = avatar.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
      }

      setAvatar(null);
      
      // Update database
      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName,
          avatar_url: avatar,
          preferences: preferences as any,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      onClose();
      window.location.reload(); // Reload to update UI
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar || ""} alt={fullName || userEmail} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-2">Upload</span>
                </Button>
                
                {avatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <X className="h-4 w-4" />
                    <span className="ml-2">Remove</span>
                  </Button>
                )}
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userEmail} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your projects
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={preferences.darkMode}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, darkMode: checked })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">Microsoft Office 365</h3>
                  {microsoftConnected ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {microsoftConnected 
                    ? "Connected - Access to Outlook calendars and Teams" 
                    : "Connect to use Outlook and Teams features"
                  }
                </p>
              </div>
              <div>
                {microsoftConnected ? (
                  <Button 
                    onClick={handleDisconnectMicrosoft} 
                    variant="destructive" 
                    size="sm"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnectMicrosoft} 
                    variant="outline"
                    size="sm"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Why connect Microsoft?</strong>
                <br />
                • Create and manage Outlook calendar events for ceremonies
                <br />
                • Set up Microsoft Teams channels for project collaboration
                <br />
                • Send meeting invites to team members
                <br />
                • Access Microsoft 365 integration features
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
