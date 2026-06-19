import { useNavigate } from "@tanstack/react-router";
import { useAnalysisStore } from "@/store/analysisStore";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type PremiumLockOverlayProps = {
  children: React.ReactNode;
  isLocked: boolean;
  type?: "full" | "subtle";
};

export function PremiumLockOverlay({ children, isLocked, type = "subtle" }: PremiumLockOverlayProps) {
  const navigate = useNavigate();
  const savePendingAnalysis = useAnalysisStore((state) => state.savePendingAnalysis);

  const handleSignIn = () => {
    savePendingAnalysis();
    navigate({ to: "/login" });
  };

  const handleCreateAccount = () => {
    savePendingAnalysis();
    navigate({ to: "/login" });
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  if (type === "full") {
    return (
      <div className="relative">
        <div className="pointer-events-none filter blur-[8px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-8 text-center max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">
              Unlock Full ATS Report
            </h3>
            <p className="text-muted-foreground mb-6">
              Create a free account to unlock:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-8 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                AI Resume Improvements
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                AI Cover Letter Generator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Interview Question Generator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Save Reports to Dashboard
              </li>
            </ul>
            <div className="flex gap-3">
              <Button onClick={handleSignIn} variant="secondary" className="flex-1">
                Sign In
              </Button>
              <Button onClick={handleCreateAccount} className="flex-1 bg-gradient-primary">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none filter blur-md">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">🔒 Login required to view this section</p>
        </div>
      </div>
    </div>
  );
}