import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Crimson_Pro, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Logo } from "./components/Logo";
import { ThemeToggle } from "./components/ThemeToggle";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body"
});

const headingFont = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "Talk to your plant",
  description: "Upload a photo, hear what your plant needs, and keep the conversation going.",
  icons: {
    icon: "/icon.svg"
  }
};

// RootLayout provides the shared Blend shell and font variables.
export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-body)" }}>
        <main className="shell">
          <header className="topbar">
            <div className="brand" aria-label="Talk to your plant">
              <Logo size={44} />
              <strong>Talk to your plant</strong>
            </div>
            <ThemeToggle />
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
