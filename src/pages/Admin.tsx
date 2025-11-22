import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Clock, Users, Search, Check, Bell, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useItemPresence } from "@/hooks/useItemPresence";
import { CollaborationIndicator } from "@/components/CollaborationIndicator";
import { HelpTooltip } from "@/components/HelpTooltip";
import { BackButton } from "@/components/BackButton";
import { ApproveUsersDialog } from "@/components/ApproveUsersDialog";
import { useUserRole } from "@/hooks/useUserRole";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const UserProfileRow = ({ profile, onUpdateRole, getRoleBadge }: {
  profile: Profile;
  onUpdateRole: (userId: string, role: 'admin' | 'member' | 'pending') => void;
  getRoleBadge: (role: string) => JSX.Element;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { activeUsers } = useItemPresence(
    profile.id,
    'user-profile',
    isEditing ? 'editing' : 'viewing'
  );

  return (
    <div
      key={profile.id}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      onMouseEnter={() => setIsEditing(false)}
      onFocus={() => setIsEditing(true)}
      onBlur={() => setIsEditing(false)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start sm:items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium truncate">{profile.full_name || 'No name'}</h3>
              <CollaborationIndicator users={activeUsers} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="shrink-0">
            {getRoleBadge(profile.role)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {profile.role === 'pending' && (
          <>
            <Button
              size="sm"
              onClick={() => onUpdateRole(profile.id, 'member')}
              className="gap-1 flex-1 sm:flex-initial"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateRole(profile.id, 'pending')}
              className="gap-1 flex-1 sm:flex-initial"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </Button>
          </>
        )}
        {profile.role === 'member' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRole(profile.id, 'admin')}
              className="flex-1 sm:flex-initial whitespace-nowrap"
            >
              Admin
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRole(profile.id, 'pending')}
              className="flex-1 sm:flex-initial whitespace-nowrap"
            >
              Revoke
            </Button>
          </>
        )}
        {profile.role === 'admin' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateRole(profile.id, 'member')}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "pending" | "member" | "admin">("all");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading) {
      if (role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setIsAdmin(true);
      loadProfiles();
      setIsLoading(false);
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      checkFirstTimeUser();
    }
  }, [isAdmin]);

  const checkFirstTimeUser = async () => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenAdminOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenAdminOnboarding', 'true');
    setShowOnboarding(false);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } else {
      setProfiles(data || []);
    }
  };

  const bulkApproveUsers = async () => {
    const pendingUsers = profiles.filter(p => p.role === 'pending');
    if (pendingUsers.length === 0) return;

    try {
      for (const user of pendingUsers) {
        await updateUserRole(user.id, 'member');
      }
      toast({
        title: "Success",
        description: `Approved ${pendingUsers.length} users`,
      });
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast({
        title: "Error",
        description: "Failed to approve all users",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'member' | 'pending') => {
    // Delete existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return;
    }

    // Insert new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return;
    }

    // Update profiles table for display purposes
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    toast({
      title: "Success",
      description: `User role updated to ${newRole}`,
    });
    await loadProfiles();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'member':
        return <Badge className="bg-green-500">Member</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || profile.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const pendingCount = profiles.filter(p => p.role === 'pending').length;
  const memberCount = profiles.filter(p => p.role === 'member').length;
  const adminCount = profiles.filter(p => p.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-8 max-w-2xl w-full shadow-2xl animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold">Welcome to Admin Dashboard</h2>
              <p className="text-muted-foreground">
                As an administrator, you have full control over user access and permissions. Here's what you can do:
              </p>
              <div className="text-left space-y-3 py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Approve Pending Users</p>
                    <p className="text-sm text-muted-foreground">Review and approve new user registrations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Manage User Roles</p>
                    <p className="text-sm text-muted-foreground">Promote members to admin or revoke access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Search & Filter</p>
                    <p className="text-sm text-muted-foreground">Quickly find users by name, email, or role</p>
                  </div>
                </div>
              </div>
              <Button onClick={completeOnboarding} size="lg" className="w-full">
                Got it, Let's Start!
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage user access and permissions</p>
              </div>
            </div>
            <div className="flex gap-2">
              {pendingCount > 0 && (
                <>
                  <Button 
                    onClick={() => setShowApproveDialog(true)} 
                    className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm" 
                    size="sm"
                    variant="outline"
                  >
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Review</span>
                    <Badge variant="secondary" className="ml-1 text-xs">{pendingCount}</Badge>
                  </Button>
                  <Button onClick={bulkApproveUsers} className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm" size="sm">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Approve All</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memberCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminCount}</div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-primary/50"
              onClick={() => navigate("/admin/incidents")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-primary">View Incidents</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>User Management</CardTitle>
                <HelpTooltip content="Review and approve user registrations. Only approved users with assigned roles can access projects." />
              </div>
              <CardDescription>Approve, reject, or modify user access</CardDescription>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="w-full sm:w-auto px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Roles</option>
                  <option value="pending">Pending</option>
                  <option value="member">Members</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProfiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchQuery || filterRole !== "all" ? "No users match your filters" : "No users found"}
                  </p>
                ) : (
                  filteredProfiles.map((profile) => (
                    <UserProfileRow
                      key={profile.id}
                      profile={profile}
                      onUpdateRole={updateUserRole}
                      getRoleBadge={getRoleBadge}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <ApproveUsersDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        onUserApproved={loadProfiles}
      />
    </div>
  );
}
