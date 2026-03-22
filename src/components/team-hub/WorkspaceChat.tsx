import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, Trash2, Reply } from "lucide-react";
import { useWorkspaceChat, ChatMessage } from "@/hooks/useWorkspaceChat";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceChatProps {
  workspaceId: string | null;
  workspaceName?: string;
}

export function WorkspaceChat({ workspaceId, workspaceName }: WorkspaceChatProps) {
  const { messages, loading, sending, sendMessage, deleteMessage } = useWorkspaceChat(workspaceId);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const success = await sendMessage(text, replyTo?.id);
    if (success) {
      setText("");
      setReplyTo(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (!workspaceId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">No Workspace Found</h3>
          <p className="text-muted-foreground text-sm">Create or join a workspace to start chatting.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          {workspaceName ? `#general — ${workspaceName}` : "#general"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-1 py-4">
              {messages.map((msg, idx) => {
                const isOwn = msg.author_id === currentUserId;
                const prevMsg = messages[idx - 1];
                const showHeader = !prevMsg || prevMsg.author_id !== msg.author_id ||
                  new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000;
                const replyTarget = msg.reply_to_id
                  ? messages.find(m => m.id === msg.reply_to_id)
                  : null;

                return (
                  <div
                    key={msg.id}
                    className={`group rounded-lg px-3 py-1 hover:bg-muted/40 transition-colors ${showHeader ? 'mt-3' : ''}`}
                  >
                    {replyTarget && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-11 mb-0.5">
                        <Reply className="h-3 w-3" />
                        <span className="font-medium">{replyTarget.author_name}</span>
                        <span className="truncate max-w-[200px]">{replyTarget.content}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      {showHeader ? (
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(msg.author_name || "?")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-sm">{msg.author_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className="h-6 w-6"
                          onClick={() => setReplyTo(msg)}
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </Button>
                        {isOwn && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-6 w-6 text-destructive/60 hover:text-destructive"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Reply indicator */}
        {replyTo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-t text-xs text-muted-foreground">
            <Reply className="h-3.5 w-3.5" />
            <span>Replying to <strong>{replyTo.author_name}</strong></span>
            <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setReplyTo(null)}>
              ×
            </Button>
          </div>
        )}

        {/* Composer */}
        <div className="flex gap-2 p-4 border-t shrink-0">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
