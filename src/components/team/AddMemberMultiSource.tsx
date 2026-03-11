import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserPlus, Github, Slack, Search, Loader2, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportedMember {
  name: string;
  email: string;
  source: string;
  username?: string;
  avatarUrl?: string;
}

interface AddMemberMultiSourceProps {
  projectId: string;
  projectName: string;
  accessToken?: string;
  onMemberAdded: () => void;
  hasGithub?: boolean;
  hasJira?: boolean;
  hasSlack?: boolean;
  githubRepoName?: string;
}

export function AddMemberMultiSource({
  projectId,
  projectName,
  accessToken,
  onMemberAdded,
  hasGithub = false,
  hasJira = false,
  hasSlack = false,
  githubRepoName,
}: AddMemberMultiSourceProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  
  // Manual form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Integration access grants
  const [grantJiraAccess, setGrantJiraAccess] = useState(true);
  const [grantGithubAccess, setGrantGithubAccess] = useState(true);
  const [grantTeamsAccess, setGrantTeamsAccess] = useState(true);
  
  // Import state
  const [importedMembers, setImportedMembers] = useState<ImportedMember[]>([]);
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setImportedMembers([]);
    setSelectedImports(new Set());
    setGrantJiraAccess(true);
    setGrantGithubAccess(true);
    setGrantTeamsAccess(true);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("add-team-member", {
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          projectId,
          projectName,
          accessToken,
          grantJiraAccess,
          grantGithubAccess,
          grantTeamsAccess,
        },
      });
      if (error) throw error;
      toast.success("Team member added successfully!");
      onMemberAdded();
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(`Failed to add member: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchGithubCollaborators = async () => {
    if (!githubRepoName) {
      toast.error("No GitHub repository connected to this project");
      return;
    }
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-github-activity", {
        body: { repoName: githubRepoName, type: "collaborators" },
      });
      if (error) throw error;

      const collaborators: ImportedMember[] = (data?.collaborators || data || []).map((c: any) => ({
        name: c.login || c.name || "Unknown",
        email: c.email || "",
        source: "github",
        username: c.login,
        avatarUrl: c.avatar_url,
      }));
      setImportedMembers(collaborators);
      if (collaborators.length === 0) {
        toast.info("No collaborators found in this repository");
      }
    } catch (err: any) {
      toast.error(`Failed to fetch GitHub collaborators: ${err.message}`);
      // Show mock data option for demo
      setImportedMembers([]);
    } finally {
      setIsImporting(false);
    }
  };

  const fetchJiraMembers = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-jira-backlog", {
        body: { projectId, type: "members" },
      });
      if (error) throw error;

      const members: ImportedMember[] = (data?.members || data || []).map((m: any) => ({
        name: m.displayName || m.name || "Unknown",
        email: m.emailAddress || m.email || "",
        source: "jira",
        username: m.accountId || m.key,
        avatarUrl: m.avatarUrls?.["48x48"] || m.avatarUrl,
      }));
      setImportedMembers(members);
      if (members.length === 0) {
        toast.info("No members found in this Jira project");
      }
    } catch (err: any) {
      toast.error(`Failed to fetch Jira members: ${err.message}`);
      setImportedMembers([]);
    } finally {
      setIsImporting(false);
    }
  };

  const fetchSlackMembers = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-slack-channels", {
        body: { projectId, type: "members" },
      });
      if (error) throw error;

      const members: ImportedMember[] = (data?.members || data || []).map((m: any) => ({
        name: m.real_name || m.name || "Unknown",
        email: m.profile?.email || m.email || "",
        source: "slack",
        username: m.name,
        avatarUrl: m.profile?.image_48 || m.avatarUrl,
      }));
      setImportedMembers(members);
      if (members.length === 0) {
        toast.info("No members found in the connected Slack channel");
      }
    } catch (err: any) {
      toast.error(`Failed to fetch Slack members: ${err.message}`);
      setImportedMembers([]);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleImportSelection = (key: string) => {
    setSelectedImports((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAllImports = () => {
    if (selectedImports.size === importedMembers.length) {
      setSelectedImports(new Set());
    } else {
      setSelectedImports(new Set(importedMembers.map((_, i) => String(i))));
    }
  };

  const handleBulkImport = async () => {
    const selected = importedMembers.filter((_, i) => selectedImports.has(String(i)));
    if (selected.length === 0) {
      toast.error("Please select at least one member to import");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const member of selected) {
      try {
        const { error } = await supabase.functions.invoke("add-team-member", {
          body: {
            name: member.name,
            email: member.email || `${member.username || member.name.toLowerCase().replace(/\s/g, ".")}@imported.local`,
            projectId,
            projectName,
            accessToken,
            grantJiraAccess,
            grantGithubAccess,
            grantTeamsAccess,
            source: member.source,
          },
        });
        if (error) throw error;
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} team member${successCount > 1 ? "s" : ""}`);
      onMemberAdded();
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} member${failCount > 1 ? "s" : ""}`);
    }

    resetForm();
    setOpen(false);
    setIsSubmitting(false);
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case "github": return <Github className="h-4 w-4" />;
      case "slack": return <Slack className="h-4 w-4" />;
      case "jira": return <span className="h-4 w-4 font-bold text-xs flex items-center justify-center">J</span>;
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
          <DialogDescription>
            Choose a source to add members to {projectName}. You can add manually or import from connected tools.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setImportedMembers([]); setSelectedImports(new Set()); }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual" className="gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="github" disabled={!hasGithub} className="gap-1.5 text-xs">
              <Github className="h-3.5 w-3.5" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="jira" disabled={!hasJira} className="gap-1.5 text-xs">
              <span className="font-bold text-xs">J</span>
              Jira
            </TabsTrigger>
            <TabsTrigger value="slack" disabled={!hasSlack} className="gap-1.5 text-xs">
              <Slack className="h-3.5 w-3.5" />
              Slack
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Full Name *</Label>
                <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email Address *</Label>
                <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
              </div>
              <AccessGrantSection
                grantJira={grantJiraAccess}
                grantGithub={grantGithubAccess}
                grantTeams={grantTeamsAccess}
                onJiraChange={setGrantJiraAccess}
                onGithubChange={setGrantGithubAccess}
                onTeamsChange={setGrantTeamsAccess}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Member"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* GitHub Import */}
          <TabsContent value="github" className="space-y-4 mt-4">
            {!hasGithub ? (
              <NoConnectionMessage source="GitHub" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Import collaborators from <span className="font-medium text-foreground">{githubRepoName}</span>
                  </p>
                  <Button size="sm" onClick={fetchGithubCollaborators} disabled={isImporting}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Fetch
                  </Button>
                </div>
                <ImportList
                  members={importedMembers}
                  selectedImports={selectedImports}
                  onToggle={toggleImportSelection}
                  onSelectAll={selectAllImports}
                  sourceIcon={sourceIcon}
                />
                {importedMembers.length > 0 && (
                  <>
                    <AccessGrantSection
                      grantJira={grantJiraAccess}
                      grantGithub={grantGithubAccess}
                      grantTeams={grantTeamsAccess}
                      onJiraChange={setGrantJiraAccess}
                      onGithubChange={setGrantGithubAccess}
                      onTeamsChange={setGrantTeamsAccess}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={handleBulkImport} disabled={isSubmitting || selectedImports.size === 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Import {selectedImports.size} Member{selectedImports.size !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Jira Import */}
          <TabsContent value="jira" className="space-y-4 mt-4">
            {!hasJira ? (
              <NoConnectionMessage source="Jira" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Import team members from your connected Jira project</p>
                  <Button size="sm" onClick={fetchJiraMembers} disabled={isImporting}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Fetch
                  </Button>
                </div>
                <ImportList
                  members={importedMembers}
                  selectedImports={selectedImports}
                  onToggle={toggleImportSelection}
                  onSelectAll={selectAllImports}
                  sourceIcon={sourceIcon}
                />
                {importedMembers.length > 0 && (
                  <>
                    <AccessGrantSection
                      grantJira={grantJiraAccess}
                      grantGithub={grantGithubAccess}
                      grantTeams={grantTeamsAccess}
                      onJiraChange={setGrantJiraAccess}
                      onGithubChange={setGrantGithubAccess}
                      onTeamsChange={setGrantTeamsAccess}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={handleBulkImport} disabled={isSubmitting || selectedImports.size === 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Import {selectedImports.size} Member{selectedImports.size !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Slack Import */}
          <TabsContent value="slack" className="space-y-4 mt-4">
            {!hasSlack ? (
              <NoConnectionMessage source="Slack" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Import members from your connected Slack workspace</p>
                  <Button size="sm" onClick={fetchSlackMembers} disabled={isImporting}>
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Fetch
                  </Button>
                </div>
                <ImportList
                  members={importedMembers}
                  selectedImports={selectedImports}
                  onToggle={toggleImportSelection}
                  onSelectAll={selectAllImports}
                  sourceIcon={sourceIcon}
                />
                {importedMembers.length > 0 && (
                  <>
                    <AccessGrantSection
                      grantJira={grantJiraAccess}
                      grantGithub={grantGithubAccess}
                      grantTeams={grantTeamsAccess}
                      onJiraChange={setGrantJiraAccess}
                      onGithubChange={setGrantGithubAccess}
                      onTeamsChange={setGrantTeamsAccess}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={handleBulkImport} disabled={isSubmitting || selectedImports.size === 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Import {selectedImports.size} Member{selectedImports.size !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function NoConnectionMessage({ source }: { source: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">{source} not connected</p>
        <p className="text-xs text-muted-foreground mt-1">
          Connect {source} in your Project Workspace settings to import members.
        </p>
      </CardContent>
    </Card>
  );
}

function AccessGrantSection({
  grantJira, grantGithub, grantTeams,
  onJiraChange, onGithubChange, onTeamsChange,
}: {
  grantJira: boolean; grantGithub: boolean; grantTeams: boolean;
  onJiraChange: (v: boolean) => void; onGithubChange: (v: boolean) => void; onTeamsChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3 pt-2">
      <Label className="text-sm font-medium">Grant Access To:</Label>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "grant-jira", label: "Jira Board", checked: grantJira, onChange: onJiraChange },
          { id: "grant-github", label: "GitHub Repo", checked: grantGithub, onChange: onGithubChange },
          { id: "grant-teams", label: "MS Teams", checked: grantTeams, onChange: onTeamsChange },
        ].map(({ id, label, checked, onChange }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v as boolean)} />
            <label htmlFor={id} className="text-xs font-medium leading-none cursor-pointer">{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportList({
  members,
  selectedImports,
  onToggle,
  onSelectAll,
  sourceIcon,
}: {
  members: ImportedMember[];
  selectedImports: Set<string>;
  onToggle: (key: string) => void;
  onSelectAll: () => void;
  sourceIcon: (source: string) => React.ReactNode;
}) {
  if (members.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{members.length} member{members.length !== 1 ? "s" : ""} found</p>
        <Button variant="ghost" size="sm" onClick={onSelectAll} className="text-xs h-7">
          {selectedImports.size === members.length ? "Deselect All" : "Select All"}
        </Button>
      </div>
      <div className="max-h-52 overflow-y-auto space-y-1.5 border rounded-lg p-2">
        {members.map((member, i) => {
          const key = String(i);
          const isSelected = selectedImports.has(key);
          return (
            <div
              key={key}
              onClick={() => onToggle(key)}
              className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"
              }`}
            >
              <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
              }`}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="h-7 w-7 rounded-full shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {sourceIcon(member.source)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{member.name}</p>
                {member.email && <p className="text-xs text-muted-foreground truncate">{member.email}</p>}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{member.source}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
