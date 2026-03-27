import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Loader2, AlertCircle, Mail, Eye } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

// Client-side leaked password check using HIBP k-anonymity API
async function sha1Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function getPwnedCount(password: string): Promise<number | 'error'> {
  try {
    if (!password || password.length < 6) return 0;
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });

    if (!res.ok) return 'error';

    const text = await res.text();
    for (const line of text.split('\n')) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10);
        return isNaN(count) ? 1 : count;
      }
    }
    return 0;
  } catch {
    return 'error';
  }
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("signin");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Check for password recovery hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setShowUpdatePassword(true);
      return;
    }

    // Check if user is already logged in - redirect to landing page
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Authenticated users go to dashboard, not landing
        navigate("/home");
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      } else if (session && event === 'SIGNED_IN') {
        // After sign in, redirect to dashboard
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = (includeFullName: boolean = false) => {
    try {
      const data = includeFullName 
        ? { email, password, fullName }
        : { email, password };
      authSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      // Leaked password protection (client-side)
      const pwnedCount = await getPwnedCount(password);
      if (pwnedCount === 'error') {
        toast({
          title: "Password check unavailable",
          description: "We couldn't verify your password against breach databases. Please try again or use a different password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (typeof pwnedCount === 'number' && pwnedCount > 0) {
        toast({
          title: "Insecure password detected",
          description: "This password appears in known data breaches. Choose a different password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          setShowExistingUserDialog(true);
          setIsLoading(false);
          return;
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome to SAAI!",
          description: "Your account has been created successfully. Please check your email to verify your account.",
        });
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        
        // Auto-sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError) {
          // Navigate to dashboard after signup
          navigate("/home");
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        
        // Navigate to dashboard after sign in
        navigate("/home");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      z.string().email().parse(email);
      setErrors({});
    } catch {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Check your email!",
        description: "We've sent you a password reset link. Click the link in your email to set a new password.",
      });
      setShowForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      // Leaked password protection (client-side)
      const pwnedCount = await getPwnedCount(newPassword);
      if (pwnedCount === 'error') {
        toast({
          title: "Password check unavailable",
          description: "We couldn't verify your new password against breach databases. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (typeof pwnedCount === 'number' && pwnedCount > 0) {
        toast({
          title: "Insecure password detected",
          description: "This password appears in known data breaches. Choose a different password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated. You can now sign in.",
      });
      
      setShowUpdatePassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem("guest_mode", "true");
    localStorage.setItem("onboarding_completed", "true");
    toast({
      title: "Welcome to Guest Mode!",
      description: "Explore features with sample data. Sign up anytime to save your work.",
    });
    navigate("/");
  };

  // Show password update form if user clicked reset link
  if (showUpdatePassword) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('pages.auth.updatePassword')}</CardTitle>
            <CardDescription>{t('pages.auth.enterNewPassword')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('pages.auth.newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('pages.auth.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('pages.auth.updatingPassword')}
                    </>
                  ) : (
                    t('pages.auth.updatePassword')
                  )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <AlertDialog open={showExistingUserDialog} onOpenChange={setShowExistingUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              An account with the email <strong>{email}</strong> already exists. 
              Would you like to sign in or recover your password?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExistingUserDialog(false);
                setActiveTab("signin");
              }}
            >
              Sign In
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                setShowExistingUserDialog(false);
                setActiveTab("signin");
                setShowForgotPassword(true);
              }}
            >
              Recover Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('pages.auth.title')}</CardTitle>
          <CardDescription>{t('pages.auth.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('pages.auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('pages.auth.signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">{t('pages.auth.email')}</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setErrors({});
                      }}
                      disabled={isLoading}
                    >
                      {t('common.back')}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('pages.auth.sending')}
                        </>
                      ) : (
                        t('pages.auth.sendResetLink')
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('pages.auth.email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">{t('pages.auth.password')}</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        {t('pages.auth.forgotPassword')}
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('pages.auth.signingIn')}
                      </>
                    ) : (
                      t('pages.auth.signIn')
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('pages.auth.orContinueWith')}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('pages.auth.signInWithGoogle')}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGuestMode}
                    disabled={isLoading}
                  >
                    <Eye className="w-4 h-4" />
                    {t('pages.auth.continueAsGuest')}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('pages.auth.fullName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('pages.auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('pages.auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('pages.auth.creatingAccount')}
                    </>
                  ) : (
                    t('pages.auth.signUp')
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('pages.auth.orSignUpWith')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('pages.auth.signUpWithGoogle')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleGuestMode}
            >
              <Eye className="w-4 h-4" />
              Continue as Guest (Try Before Signing Up)
            </Button>
          </div>

          <Alert className="mt-4 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Quick Start:</strong> New accounts can immediately access all features. 
              While waiting, you can explore demo features, review guides, and learn the platform.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
