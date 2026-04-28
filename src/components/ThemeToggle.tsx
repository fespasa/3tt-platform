"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg" />;
  }

  // Cycle: system → light → dark → system
  const cycle = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const icon =
    theme === "system" ? <Monitor size={16} /> :
    resolvedTheme === "dark" ? <Moon size={16} /> :
    <Sun size={16} />;

  const label =
    theme === "system" ? "Automático" :
    resolvedTheme === "dark" ? "Modo oscuro" : "Modo claro";

  return (
    <button
      onClick={cycle}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 text-muted hover:text-foreground hover:bg-[var(--border)]"
      title={label}
      aria-label={label}
    >
      <span className="transition-transform duration-300 ease-in-out">
        {icon}
      </span>
    </button>
  );
}
