import { Toaster as Sonner, toast } from "sonner";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Wrap toast methods at runtime to set custom durations
if (typeof window !== "undefined" && !(toast as any).__wrapped) {
  (toast as any).__wrapped = true;
  
  const originalSuccess = toast.success;
  toast.success = (message: any, options: any) => {
    return originalSuccess(message, { duration: 2500, ...options });
  };

  const originalInfo = toast.info;
  toast.info = (message: any, options: any) => {
    return originalInfo(message, { duration: 3000, ...options });
  };

  const originalWarning = toast.warning;
  toast.warning = (message: any, options: any) => {
    return originalWarning(message, { duration: 4000, ...options });
  };

  const originalError = toast.error;
  toast.error = (message: any, options: any) => {
    return originalError(message, { duration: Infinity, ...options });
  };
}

const SuccessIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.15)]">
    <Check className="h-4.5 w-4.5" />
  </div>
);

const ErrorIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
    <X className="h-4.5 w-4.5" />
  </div>
);

const WarningIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
    <AlertTriangle className="h-4.5 w-4.5" />
  </div>
);

const InfoIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
    <Info className="h-4.5 w-4.5" />
  </div>
);

const LoadingIcon = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
    <Loader2 className="h-4.5 w-4.5 animate-spin" />
  </div>
);

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton={true}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "toast-custom group flex items-center gap-3.5 w-full max-w-[90%] sm:max-w-[380px] md:max-w-[420px] bg-[#0B1120]/95 backdrop-blur-md border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[22px] py-4 px-[18px] text-foreground relative overflow-hidden",
          content: "flex-1 min-w-0 pr-6 flex flex-col gap-0.5",
          title: "text-[15px] font-semibold text-slate-100 leading-snug",
          description: "text-[13px] text-slate-400 leading-normal mt-0.5",
          closeButton: "absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white border border-slate-700/40 transition-all duration-200 active:scale-95 cursor-pointer opacity-0 lg:group-hover:opacity-100 max-lg:opacity-100",
        },
      }}
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <InfoIcon />,
        warning: <WarningIcon />,
        loading: <LoadingIcon />,
      }}
      {...props}
    />
  );
};

export { Toaster };
