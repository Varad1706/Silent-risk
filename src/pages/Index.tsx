import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-6">
            <span className="text-3xl font-bold text-primary-foreground">S</span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
};

export default Index;
