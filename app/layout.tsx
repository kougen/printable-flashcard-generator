import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import React from "react";
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashcard PDF Generator",
  description: "Create your printer-friendly flashcard PDFs in seconds.",
};

export default function RootLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar variant="inset"/>
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
