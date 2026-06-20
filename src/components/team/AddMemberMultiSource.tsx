import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserPlus, Github, Slack, Search, Loader2, AlertCircle, Check, Users, Upload, Mail, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportedMember {
  name: string;
  email: string;
  source: string;
  username?: string;
  avatarUrl?: string;
}

interface ParsedBulkEntry {
  name: string;
  email: string;
  valid: boolean;
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailLine(line: string): ParsedBulkEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Try CSV: "Name,email" or "email,Name"
  const parts = trimmed.split(/[,\t;]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));

  if (parts.length >= 2) {
    const [a, b] = parts;
    if (EMAIL_REGEX.test(b)) return { name: a || b.split("@")[0], email: b.toLowerCase(), valid: true };
    if (EMAIL_REGEX.test(a)) return { name: b || a.split("@")[0], email: a.toLowerCase(), valid: true };
  }

  // Single value - must be email
  if (EMAIL_REGEX.test(trimmed)) {
    return { name: trimmed.split("@")[0], email: trimmed.toLowerCase(), valid: true };
  }

  return { name: trimmed, email: "", valid: false };
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

  // Manual form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("member");

  // Bulk paste
  const [bulkText, setBulkText] = useState("");
  const [parsedEntries, setParsedEntries] = useState<ParsedBulkEntry[]>([]);
  const [bulkRole, setBulkRole] = useState<string>("member");

  // Integration access
  const [grantJiraAccess, setGrantJiraAccess] = useState(true);
  const [grantGithubAccess, setGrantGithubAccess] = useState(true);
  const [grantTeamsAccess, setGrantTeamsAccess] = useState(true);

  // Import state
  const [importedMembers, setImportedMembers] = useState<ImportedMember[]>([]);
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());
  const [importRole, setImportRole] = useState<string>("member");
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progress tracking
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("member");
    setBulkText("");
    setParsedEntries([]);
    setBulkRole("member");
    setImportedMembers([]);
    setSelectedImports(new Set());
    setImportRole("member");
    setGrantJiraAccess(true);
    setGrantGithubAccess(true);
    setGrantTeamsAccess(true);
    setProgress({ done: 0, total: 0 });
  };

  const parseBulkInput = useCallback((text: string) => {
    setBulkText(text);
    const lines = text.split("\n");
    const entries = lines.map(parseEmailLine).filter(Boolean) as ParsedBulkEntry[];
    setParsedEntries(entries);
  }, []);

  const removeParsedEntry = (index: number) => {
    setParsedEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
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
          role,
          accessToken,
          grantJiraAccess,
          grantGithubAccess,
          grantTeamsAccess,
        },
      });
      if (error) throw error;
      toast.success(`${name.trim()} added as ${role}`);
      onMemberAdded();
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(`Failed to add member: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAdd = async () => {
    const validEntries = parsedEntries.filter((e) => e.valid);
    if (validEntries.length === 0) {
      toast.error("No valid email addresses found");
      return;
    }

    setIsSubmitting(true);
    setProgress({ done: 0, total: validEntries.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      try {
        const { error } = await supabase.functions.invoke("add-team-member", {
          body: {
            name: entry.name,
            email: entry.email,
            projectId,
            projectName,
            role: bulkRole,
            accessToken,
            grantJiraAccess,
            grantGithubAccess,
            grantTeamsAccess,
          },
        });
        if (error) throw error;
        successCount++;
      } catch {
        failCount++;
      }
      setProgress({ done: i + 1, total: validEntries.length });
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} member${successCount > 1 ? "s" : ""}`);
      onMemberAdded();
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} member${failCount > 1 ? "s" : ""}`);
    }

    resetForm();
    setOpen(false);
  };

  const addMemberFromImport = async (members: ImportedMember[], selectedRole: string) => {
    setIsSubmitting(true);
    setProgress({ done: 0, total: members.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      try {
        const { error } = await supabase.functions.invoke("add-team-member", {
          body: {
            name: member.name,
            email: member.email || `${member.username || member.name.toLowerCase().replace(/\s/g, ".")}@imported.local`,
            projectId,
            projectName,
            role: selectedRole,
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
      setProgress({ done: i + 1, total: members.length });
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} member${successCount > 1 ? "s" : ""}`);
      onMemberAdded();
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} member${failCount > 1 ? "s" : ""}`);
    }

    resetForm();
    setOpen(false);
  };

  const handleBulkImport = async () => {
    const selected = importedMembers.filter((_, i) => selectedImports.has(String(i)));
    if (selected.length === 0) {
      toast.error("Please select at least one member to import");
      return;
    }
    await addMemberFromImport(selected, importRole);
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
      if (collaborators.length === 0) toast.info("No collaborators found");
    } catch (err: any) {
      toast.error(`Failed to fetch GitHub collaborators: ${err.message}`);
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
      if (members.length === 0) toast.info("No members found in Jira project");
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
      if (members.length === 0) toast.info("No members found in Slack");
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
      next.has(key) ? next.delete(key) : next.add(key);
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

  const sourceIcon = (source: string) => {
    switch (source) {
      case "github": return <Github className="h-4 w-4" />;
      case "slack": return <Slack className="h-4 w-4" />;
      case "jira": return <span className="h-4 w-4 font-bold text-xs flex items-center justify-center">J</span>;
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  const validBulkCount = parsedEntries.filter((e) => e.valid).length;
  const invalidBulkCount = parsedEntries.filter((e) => !e.valid).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Add Team Members
          </DialogTitle>
          <DialogDescription>
            Add members manually, paste a list of emails, or import from connected tools.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setImportedMembers([]); setSelectedImports(new Set()); setParsedEntries([]); setBulkText(""); }}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="manual" className="gap-1 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-1 text-xs">
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="github" disabled={!hasGithub} className="gap-1 text-xs">
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="jira" disabled={!hasJira} className="gap-1 text-xs">
              <span className="font-bold text-xs">J</span>
              <span className="hidden sm:inline">Jira</span>
            </TabsTrigger>
            <TabsTrigger value="slack" disabled={!hasSlack} className="gap-1 text-xs">
              <Slack className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Slack</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Manual Entry ─── */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="member-name">Full Name *</Label>
                  <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email *</Label>
                  <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <RolePicker value={role} onChange={setRole} />
                <AccessGrantSection
                  grantJira={grantJiraAccess} grantGithub={grantGithubAccess} grantTeams={grantTeamsAccess}
                  onJiraChange={setGrantJiraAccess} onGithubChange={setGrantGithubAccess} onTeamsChange={setGrantTeamsAccess}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><Mail className="mr-2 h-4 w-4" />Add & Invite</>}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ─── Bulk Paste/CSV ─── */}
          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Paste emails (one per line, or CSV: name, email)</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => parseBulkInput(e.target.value)}
                placeholder={`jane@example.com\nJohn Doe, john@example.com\nSarah Connor, sarah@example.com`}
                rows={5}
                className="font-mono text-sm"
              />
            </div>

            {parsedEntries.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {validBulkCount > 0 && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      {validBulkCount} valid
                    </Badge>
                  )}
                  {invalidBulkCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {invalidBulkCount} invalid
                    </Badge>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {parsedEntries.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm ${
                        entry.valid ? "bg-primary/5" : "bg-destructive/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {entry.valid ? (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className="truncate font-medium">{entry.name}</span>
                        {entry.email && <span className="truncate text-muted-foreground">{entry.email}</span>}
                      </div>
                      <button onClick={() => removeParsedEntry(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <RolePicker value={bulkRole} onChange={setBulkRole} />
              <AccessGrantSection
                grantJira={grantJiraAccess} grantGithub={grantGithubAccess} grantTeams={grantTeamsAccess}
                onJiraChange={setGrantJiraAccess} onGithubChange={setGrantGithubAccess} onTeamsChange={setGrantTeamsAccess}
              />
            </div>

            {isSubmitting && progress.total > 0 && <ProgressBar done={progress.done} total={progress.total} />}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkAdd} disabled={isSubmitting || validBulkCount === 0}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding {progress.done}/{progress.total}...</>
                ) : (
                  <><Users className="mr-2 h-4 w-4" />Add {validBulkCount} Member{validBulkCount !== 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* ─── GitHub Import ─── */}
          <TabsContent value="github" className="space-y-4 mt-4">
            {!hasGithub ? (
              <NoConnectionMessage source="GitHub" />
            ) : (
              <IntegrationImportTab
                label={`Import collaborators from ${githubRepoName}`}
                onFetch={fetchGithubCollaborators}
                isImporting={isImporting}
                importedMembers={importedMembers}
                selectedImports={selectedImports}
                onToggle={toggleImportSelection}
                onSelectAll={selectAllImports}
                sourceIcon={sourceIcon}
                role={importRole}
                onRoleChange={setImportRole}
                grantJira={grantJiraAccess} grantGithub={grantGithubAccess} grantTeams={grantTeamsAccess}
                onJiraChange={setGrantJiraAccess} onGithubChange={setGrantGithubAccess} onTeamsChange={setGrantTeamsAccess}
                isSubmitting={isSubmitting}
                onImport={handleBulkImport}
                onCancel={() => setOpen(false)}
                progress={progress}
              />
            )}
          </TabsContent>

          {/* ─── Jira Import ─── */}
          <TabsContent value="jira" className="space-y-4 mt-4">
            {!hasJira ? (
              <NoConnectionMessage source="Jira" />
            ) : (
              <IntegrationImportTab
                label="Import team members from your connected Jira project"
                onFetch={fetchJiraMembers}
                isImporting={isImporting}
                importedMembers={importedMembers}
                selectedImports={selectedImports}
                onToggle={toggleImportSelection}
                onSelectAll={selectAllImports}
                sourceIcon={sourceIcon}
                role={importRole}
                onRoleChange={setImportRole}
                grantJira={grantJiraAccess} grantGithub={grantGithubAccess} grantTeams={grantTeamsAccess}
                onJiraChange={setGrantJiraAccess} onGithubChange={setGrantGithubAccess} onTeamsChange={setGrantTeamsAccess}
                isSubmitting={isSubmitting}
                onImport={handleBulkImport}
                onCancel={() => setOpen(false)}
                progress={progress}
              />
            )}
          </TabsContent>

          {/* ─── Slack Import ─── */}
          <TabsContent value="slack" className="space-y-4 mt-4">
            {!hasSlack ? (
              <NoConnectionMessage source="Slack" />
            ) : (
              <IntegrationImportTab
                label="Import members from your connected Slack workspace"
                onFetch={fetchSlackMembers}
                isImporting={isImporting}
                importedMembers={importedMembers}
                selectedImports={selectedImports}
                onToggle={toggleImportSelection}
                onSelectAll={selectAllImports}
                sourceIcon={sourceIcon}
                role={importRole}
                onRoleChange={setImportRole}
                grantJira={grantJiraAccess} grantGithub={grantGithubAccess} grantTeams={grantTeamsAccess}
                onJiraChange={setGrantJiraAccess} onGithubChange={setGrantGithubAccess} onTeamsChange={setGrantTeamsAccess}
                isSubmitting={isSubmitting}
                onImport={handleBulkImport}
                onCancel={() => setOpen(false)}
                progress={progress}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Sub-components ─── */

function RolePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>Role</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Adding members…</span>
        <span>{done}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
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
    <div className="space-y-2">
      <Label className="text-sm">Grant Access</Label>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {[
          { id: "g-jira", label: "Jira", checked: grantJira, onChange: onJiraChange },
          { id: "g-github", label: "GitHub", checked: grantGithub, onChange: onGithubChange },
          { id: "g-teams", label: "Teams", checked: grantTeams, onChange: onTeamsChange },
        ].map(({ id, label, checked, onChange }) => (
          <div key={id} className="flex items-center space-x-1.5">
            <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v as boolean)} />
            <label htmlFor={id} className="text-xs cursor-pointer">{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationImportTab({
  label, onFetch, isImporting, importedMembers, selectedImports,
  onToggle, onSelectAll, sourceIcon, role, onRoleChange,
  grantJira, grantGithub, grantTeams, onJiraChange, onGithubChange, onTeamsChange,
  isSubmitting, onImport, onCancel, progress,
}: {
  label: string;
  onFetch: () => void;
  isImporting: boolean;
  importedMembers: ImportedMember[];
  selectedImports: Set<string>;
  onToggle: (key: string) => void;
  onSelectAll: () => void;
  sourceIcon: (source: string) => React.ReactNode;
  role: string;
  onRoleChange: (v: string) => void;
  grantJira: boolean; grantGithub: boolean; grantTeams: boolean;
  onJiraChange: (v: boolean) => void; onGithubChange: (v: boolean) => void; onTeamsChange: (v: boolean) => void;
  isSubmitting: boolean;
  onImport: () => void;
  onCancel: () => void;
  progress: { done: number; total: number };
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Button size="sm" onClick={onFetch} disabled={isImporting}>
          {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Fetch
        </Button>
      </div>
      <ImportList members={importedMembers} selectedImports={selectedImports} onToggle={onToggle} onSelectAll={onSelectAll} sourceIcon={sourceIcon} />
      {importedMembers.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <RolePicker value={role} onChange={onRoleChange} />
            <AccessGrantSection
              grantJira={grantJira} grantGithub={grantGithub} grantTeams={grantTeams}
              onJiraChange={onJiraChange} onGithubChange={onGithubChange} onTeamsChange={onTeamsChange}
            />
          </div>
          {isSubmitting && progress.total > 0 && <ProgressBar done={progress.done} total={progress.total} />}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onImport} disabled={isSubmitting || selectedImports.size === 0}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing…</>
              ) : (
                <>Import {selectedImports.size} Member{selectedImports.size !== 1 ? "s" : ""}</>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function ImportList({
  members, selectedImports, onToggle, onSelectAll, sourceIcon,
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
