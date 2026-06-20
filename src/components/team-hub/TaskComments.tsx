import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  item_id: string;
  author_id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

interface TaskCommentsProps {
  itemId: string;
  itemTitle?: string;
}

export function TaskComments({ itemId, itemTitle }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('item_comments')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const authorIds = [...new Set((data || []).map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, { name: p.full_name, avatar: p.avatar_url }])
      );

      setComments(
        (data || []).map(c => ({
          ...c,
          is_ai_generated: c.is_ai_generated ?? false,
          author_name: profileMap.get(c.author_id)?.name || 'Team Member',
          author_avatar: profileMap.get(c.author_id)?.avatar || undefined,
        }))
      );
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('item_comments').insert({
        item_id: itemId,
        author_id: user.id,
        content: text.trim(),
      });
      if (error) throw error;
      setText("");
      await fetchComments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Comments
          {itemTitle && <span className="text-muted-foreground font-normal text-sm">{itemTitle && <span className="text-muted-foreground font-normal text-sm">- {itemTitle}</span>}</span>}
          <Badge variant="secondary" className="ml-auto text-xs">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarImage src={comment.author_avatar} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(comment.author_name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{comment.author_name}</span>
                    {comment.is_ai_generated && (
                      <Badge variant="outline" className="text-[10px] gap-1 py-0">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            className="min-h-[60px] flex-1 resize-none"
            rows={2}
          />
          <Button size="icon" className="self-end" onClick={handleSend} disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
