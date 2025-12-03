import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Send, Loader2, Trash2, Sparkles, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { chatSounds } from "@/utils/chatSounds";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const firstTokenReceived = useRef(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load chat history from database
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingHistory(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (isOpen && isAuthenticated) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    
    // Show typing indicator and play typing sound
    setIsTyping(true);
    chatSounds.playTypingStart();
    firstTokenReceived.current = false;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } else if (resp.status === 402) {
        toast({
          title: "AI usage limit reached",
          description: "Please contact support.",
          variant: "destructive",
        });
      }
      throw new Error("Failed to start stream");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            // Hide typing indicator and play receive sound on first token
            if (!firstTokenReceived.current) {
              setIsTyping(false);
              chatSounds.playReceive();
              firstTokenReceived.current = true;
            }
            
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const saveMessageToDb = async (role: 'user' | 'assistant', content: string) => {
    if (!isAuthenticated) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role, content });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Play send sound
    chatSounds.playSend();

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    await saveMessageToDb('user', userMessage.content);

    try {
      const assistantResponse = await streamChat(newMessages);
      
      // Save assistant response to database
      if (assistantResponse) {
        await saveMessageToDb('assistant', assistantResponse);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!isAuthenticated) {
      setMessages([]);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      toast({
        title: "Chat cleared",
        description: "Your conversation history has been deleted.",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "How do I create a new project?",
    "Explain SAFe methodology",
    "Help with sprint planning",
    "Best practices for retrospectives"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[60]"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary to-primary/80 hover:scale-110 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Animated rings */}
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
              <span className="absolute inset-2 rounded-full animate-pulse bg-primary/20" />
              
              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary-foreground" />
              </div>
              
              {/* Sparkle effect */}
              <Sparkles className="absolute top-1 right-1 h-4 w-4 text-primary-foreground/80 animate-pulse" />
            </Button>
            
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -left-20 top-1/2 -translate-y-1/2 bg-background border rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap"
            >
              <span className="text-sm font-medium">Ask Omair</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[60]"
          >
            <Card className="w-[calc(100vw-3rem)] sm:w-[420px] h-[calc(100vh-8rem)] sm:h-[650px] max-h-[650px] shadow-2xl flex flex-col overflow-hidden border-2">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Omair</h3>
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Your Agile Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleClearChat}
                        title="Clear chat history"
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {isLoadingHistory ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm">Loading chat history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="space-y-6">
                    {/* Welcome Message */}
                    <div className="text-center py-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">Hi! I'm Omair 👋</h4>
                      <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                        Your AI-powered assistant for agile best practices, SAFe methodology, and platform guidance.
                      </p>
                    </div>

                    {/* Quick Prompts */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center mb-3">Quick questions to get started:</p>
                      <div className="grid gap-2">
                        {quickPrompts.map((prompt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="justify-start h-auto py-2.5 px-3 text-left text-sm hover:bg-primary/5 hover:border-primary/30 transition-colors"
                            onClick={() => {
                              setInput(prompt);
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                            <span className="line-clamp-1">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          msg.role === "user" 
                            ? "bg-secondary" 
                            : "bg-gradient-to-br from-primary to-primary/60"
                        }`}>
                          {msg.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <TypingIndicator />
                      </motion.div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Omair anything..."
                    className="min-h-[52px] max-h-[120px] resize-none bg-background"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-[52px] w-[52px] shrink-0 rounded-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Omair can help with agile practices, platform features & more
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
