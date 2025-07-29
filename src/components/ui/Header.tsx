"use client";

import React from "react";

/**
 * Header Component
 * 
 * A fixed, transparent header that contains the dashboard logo and theme toggle.
 * The header is designed to be minimal and unobtrusive while providing essential navigation.
 * 
 * Features:
 * - Fixed positioning at the top of the screen
 * - Transparent background with subtle blur effect
 * - Theme toggle (light/dark mode) with localStorage persistence
 * - Responsive design with proper spacing
 * 
 * @returns {JSX.Element} The header component
 */
export default function Header() {
  // State for managing the current theme (light or dark)
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  /**
   * Initialize theme from localStorage on component mount
   * Falls back to "light" theme if no saved preference exists
   */
  React.useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } catch (error) {
      console.error("Error loading theme from localStorage:", error);
      // Fallback to light theme if localStorage is not available
      setTheme("light");
    }
  }, []);

  /**
   * Update document class and localStorage when theme changes
   * Handles theme persistence and DOM updates
   */
  React.useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
      // Continue with theme change even if localStorage fails
    }
  }, [theme]);

  /**
   * Handle theme toggle between light and dark modes
   * Updates both state and localStorage
   */
  const handleThemeToggle = () => {
    try {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-16 py-4 border-b border-[#374151]/10 bg-black/10 backdrop-blur-sm z-50 fixed top-0 left-0 right-0 animate-fade-in">
      {/* Dashboard Logo Section */}
      <div className="flex items-center gap-12">
        <div className="bg-white text-black font-bold rounded-md px-8 py-3 text-body text-mono tracking-tight hover:bg-[#2563EB] hover:text-white transition-all duration-300">
          AI Dashboard
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button
        aria-label="Toggle dark mode"
        className="rounded-full p-3 transition-all duration-300 hover:bg-[#2563EB]/20 hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:ring-offset-black/20"
        onClick={handleThemeToggle}
      >
        {theme === "dark" ? (
          // Moon icon for dark mode (current theme)
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-[#2563EB]">
            <path
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Sun icon for light mode (current theme)
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-[#2563EB]">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </header>
  );
}
