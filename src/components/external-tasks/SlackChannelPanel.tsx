import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Send, RefreshCw, Lock, MessageCircle, AlertCircle } from "lucide-react";
import { useSlackMessages, SlackChannel } from "@/hooks/useSlackMessages";
import { formatDistanceToNow } from "date-fns";

export function SlackChannelPanel() {
  const slack = useSlackMessages();
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    slack.fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      slack.fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel?.id]);

  if (slack.isConnected === false) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Slack Not Connected</h3>
          <p className="text-muted-foreground text-sm">
            Connect your Slack workspace from Integration Settings to send and read messages here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (slack.error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
          <h3 className="text-lg font-medium mb-2">Connection Issue</h3>
          <p className="text-muted-foreground text-sm mb-4">{slack.error}</p>
          <Button variant="outline" onClick={slack.fetchChannels}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSend = async () => {
    if (!selectedChannel || !messageText.trim()) return;
    const success = await slack.sendMessage(selectedChannel.id, messageText);
    if (success) setMessageText('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Slack Channels
            </CardTitle>
            <CardDescription>
              {selectedChannel ? `#${selectedChannel.name}` : `${slack.channels.length} channels`}
            </CardDescription>
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => selectedChannel ? slack.fetchMessages(selectedChannel.id) : slack.fetchChannels()}
            disabled={slack.isLoadingChannels || slack.isLoadingMessages}
          >
            <RefreshCw className={`h-4 w-4 ${(slack.isLoadingChannels || slack.isLoadingMessages) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {slack.isLoadingChannels ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !selectedChannel ? (
          /* Channel list */
          <div className="space-y-1.5">
            {slack.channels.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No channels found</p>
            ) : (
              slack.channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  {ch.isPrivate ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{ch.name}</p>
                    {ch.topic && (
                      <p className="text-xs text-muted-foreground truncate">{ch.topic}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {ch.memberCount} members
                  </Badge>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Message view */
          <div className="space-y-3">
            <Button
              variant="ghost" size="sm"
              onClick={() => setSelectedChannel(null)}
              className="text-xs text-muted-foreground"
            >
              ← Back to channels
            </Button>

            <ScrollArea className="h-[360px] pr-2">
              {slack.isLoadingMessages ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : slack.messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No recent messages</p>
              ) : (
                <div className="space-y-2">
                  {slack.messages.map(msg => (
                    <div key={msg.ts} className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </span>
                        {msg.replyCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Compose */}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder={`Message #${selectedChannel.name}...`}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={slack.isSending}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={slack.isSending || !messageText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
