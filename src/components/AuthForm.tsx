import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User } from "lucide-react";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to SilentRisk. Start monitoring your health.",
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "Your health dashboard is ready.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-6">
            <span className="text-3xl font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-3xl font-bold font-heading gradient-text">SilentRisk</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered health risk detection
          </p>
        </div>

        {/* Form */}
        <div className="glass-card-elevated rounded-2xl p-8 slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-semibold font-heading text-foreground mb-6">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 h-12 bg-muted/50 border-border focus:border-primary"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 bg-muted/50 border-border focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 h-12 bg-muted/50 border-border focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 slide-up" style={{ animationDelay: "200ms" }}>
          {["Track Metrics", "AI Insights", "Early Alerts"].map((feature, i) => (
            <div
              key={feature}
              className="text-center p-3 glass-card rounded-xl"
            >
              <p className="text-xs text-muted-foreground">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
