
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./providers";
import { Suspense } from "react";

const siteUrl =
  process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "StoreFront",
    template: "%s | StoreFront",
  },

  description:
    "Discover products, compare specifications, and explore your next purchase on StoreFront.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 font-sans">
        <Providers>
          <Suspense>
            <Header />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}

