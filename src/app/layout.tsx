import type { ReactNode } from "react";

// Fallback layout for any React-rendered routes. The newsroom pages are served
// as complete HTML documents by Route Handlers (`route.ts`), which bypass this.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
