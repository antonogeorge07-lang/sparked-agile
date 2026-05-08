import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function InviteNudgeCard() {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [refUrl, setRefUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const origin = window.location.origin;
      setRefUrl(`${origin}/auth?ref=${session.user.id}`);
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", session.user.id)
        .maybeSingle();
      if (!ws) return;
      const { count } = await supabase
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id);
      setMemberCount(count ?? 0);
    })();
  }, []);

  if (memberCount === null) return null;

  const goal = 2;
  const remaining = Math.max(goal - memberCount, 0);
  const unlocked = memberCount >= goal;

  const handleCopy = async () => {
    if (!refUrl) return;
    await navigator.clipboard.writeText(refUrl);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-card">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 shrink-0">
          {unlocked ? (
            <Sparkles className="h-5 w-5 text-primary" />
          ) : (
            <UserPlus className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {unlocked
              ? "Your team is set up. Help others discover Spark-Agile."
              : `Invite ${remaining} more teammate${remaining === 1 ? "" : "s"} to unlock the Agent Debate sample pack.`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Free forever for teams up to 10. Share your referral link to grow the community.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Link to="/team-hub">
            <Button size="sm" variant="default" className="gap-2">
              <UserPlus className="h-3.5 w-3.5" /> Invite
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="gap-2" onClick={handleCopy} disabled={!refUrl}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy referral link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
