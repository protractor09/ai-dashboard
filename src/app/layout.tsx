import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Header from "@/components/ui/Header";

/**
 * Font Configuration
 * 
 * Geist Sans: Primary font for body text and general content
 * Geist Mono: Monospace font for technical elements and code-like content
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata Configuration
 * 
 * SEO and browser metadata for the application
 */
export const metadata: Metadata = {
  title: "AI Dashboard",
  description: "Professional data visualization and analytics dashboard",
};

/**
 * Root Layout Component
 * 
 * The main layout wrapper for the entire application.
 * Provides the HTML structure, font loading, and global styling.
 * 
 * Features:
 * - Font loading and CSS variable setup
 * - Header component integration
 * - Responsive layout with proper spacing
 * - Theme support (light/dark mode)
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root layout component
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-500 bg-background text-foreground`}
      >
        {/* Fixed Header - Contains logo and theme toggle */}
        <Header />
        
        {/* Main Content Area - Contains all dashboard content */}
        <main className="pt-32 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
