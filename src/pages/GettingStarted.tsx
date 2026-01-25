import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  MessageCircle, 
  Compass, 
  FolderPlus, 
  Users, 
  BarChart3, 
  Send,
  Loader2,
  ArrowRight,
  Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { formatAIResponse } from "@/utils/textFormatting";
import { useTranslation } from "react-i18next";

export default function GettingStarted() {
  const { t } = useTranslation();
  const [userName, setUserName] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quickActions = [
    {
      icon: FolderPlus,
      titleKey: "gettingStarted.createProject",
      descriptionKey: "gettingStarted.createProjectDesc",
      prompt: "I want to create my first project. Can you guide me through the process?"
    },
    {
      icon: Compass,
      titleKey: "gettingStarted.takeTour",
      descriptionKey: "gettingStarted.takeTourDesc",
      prompt: "I'm new here and would like a tour of the platform. What are the main features and how do I use them?"
    },
    {
      icon: Users,
      titleKey: "gettingStarted.setupTeam",
      descriptionKey: "gettingStarted.setupTeamDesc",
      prompt: "I want to set up my team. How do I add team members and configure my workspace?"
    },
    {
      icon: BarChart3,
      titleKey: "gettingStarted.exploreFeatures",
      descriptionKey: "gettingStarted.exploreFeaturesDesc",
      prompt: "What are all the features available in this platform? I want to understand what I can do here."
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      } else if (user.email) {
        setUserName(user.email.split("@")[0]);
      }
    };

    fetchUser();
  }, [navigate]);

  const streamChat = async (userMessages: typeof messages) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    
    setIsTyping(true);
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      if (!resp.ok) {
        throw new Error("Failed to get response");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              assistantMessage += content;
              
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage
                };
                return newMessages;
              });
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: t('common.error'),
        description: t('gettingStarted.errorOmair'),
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    setShowChat(true);
    setIsLoading(true);
    
    const newMessages = [{ role: "user" as const, content: prompt }];
    setMessages(newMessages);
    
    await streamChat(newMessages);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    await streamChat(newMessages);
  };

  const handleSkip = () => {
    localStorage.setItem("getting_started_completed", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('gettingStarted.welcome')}{userName ? `, ${userName}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('gettingStarted.welcomeMessage')}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showChat ? (
            /* Quick Actions Grid */
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 group h-full"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <action.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base group-hover:text-primary transition-colors">
                              {t(action.titleKey)}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {t(action.descriptionKey)}
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Or ask anything */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('gettingStarted.askAnything')}</span>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={t('gettingStarted.askPlaceholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim()) {
                              handleQuickAction(input);
                            }
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                      <Button 
                        onClick={() => input.trim() && handleQuickAction(input)}
                        disabled={!input.trim()}
                        size="icon"
                        className="h-[60px] w-[60px]"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Skip option */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                  {t('gettingStarted.skipToDashboard')}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* Chat Interface */
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="min-h-[400px] max-h-[500px] flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{t('gettingStarted.chatWithOmair')}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{t('gettingStarted.aiAssistant')}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowChat(false);
                        setMessages([]);
                      }}
                    >
                      {t('common.startOver')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.role === "assistant" ? formatAIResponse(msg.content) : msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && messages[messages.length - 1]?.content === "" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={t('gettingStarted.askPlaceholder')}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[44px] max-h-[120px] resize-none"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-[44px] w-[44px]"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Continue to dashboard */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                }}>
                  {t('common.backToOptions')}
                </Button>
                <Button onClick={handleSkip}>
                  {t('common.continueToDashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
