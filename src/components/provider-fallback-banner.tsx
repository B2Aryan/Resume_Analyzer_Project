import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProviderFallbackBanner() {
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Info className="h-4 w-4 text-primary" aria-hidden />
      <AlertTitle className="text-foreground">Backup analysis provider used</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Primary provider unavailable. Analysis completed using backup provider.
      </AlertDescription>
    </Alert>
  );
}
