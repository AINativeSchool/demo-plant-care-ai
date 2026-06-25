"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

// ThemeToggle stores the user's preferred Blend theme on the document root.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("plantcare-theme") as Theme | null;
    const preferred: Theme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(preferred);
    document.documentElement.setAttribute("data-theme", preferred);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("plantcare-theme", nextTheme);
  };

  return (
    <button className="button ghost theme-toggle" type="button" onClick={toggleTheme}>
      {theme === "light" ? "Dark" : "Light"} mode
    </button>
  );
}
