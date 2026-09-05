import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "StoreFront",
  description: "Professional Product Management Dashboard & Lending Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}
