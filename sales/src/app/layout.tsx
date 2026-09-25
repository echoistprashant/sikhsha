import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sikhsha | School ERP and AI Teaching Platform",
  description: "Run admissions, attendance, fees, communication, analytics, AI lesson planning, AI decks, and student doubt solving from one school platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(outfit.className, "min-h-screen antialiased")}>
        {children}
      </body>
    </html>
  );
}
