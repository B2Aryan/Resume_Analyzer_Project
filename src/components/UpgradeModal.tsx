
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string; // e.g., "resume analyses", "cover letters", "mock interviews"
}

export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:max-w-[420px] lg:max-w-[480px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold uppercase tracking-wider w-fit">
            Free Plan Limit Reached
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Monthly Limit Reached
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            You've used all free {feature} for this month.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight">Unlimited resume analyses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight">Unlimited AI cover letters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight">Unlimited mock interviews</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight">Advanced ATS insights</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm leading-tight">Priority support</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center mb-4">
          Limits reset automatically every month.
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => {
            // TODO: Implement payment flow
            console.log("Upgrade to premium");
            onOpenChange(false);
          }}>
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

