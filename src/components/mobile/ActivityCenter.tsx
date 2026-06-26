import { Bell } from "lucide-react";
import { useState } from "react";

export function ActivityCenter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-colors active:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
      </button>

      {/* Slide-up drawer */}
      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background p-6 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold">Activity Center</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No notifications yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll notify you when your analysis is complete or when there are product updates.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
