import { SiteFooter } from "./site-footer";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 animate-page-in">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
