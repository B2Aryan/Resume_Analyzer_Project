import { SiteFooter } from "./site-footer";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 animate-page-in lg:pt-16 pt-0 marketing-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
