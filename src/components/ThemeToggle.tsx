'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem('needboard-theme', theme);
}

export default function ThemeToggle() {
  // Starts null so the server-rendered markup matches the client's first
  // paint (the blocking script in <head> already set data-theme on <html>
  // before hydration) — avoids a mismatch flash.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (current === 'dark' || current === 'light') {
      setTheme(current);
    } else {
      // No saved preference — derive from the OS, and reflect it onto <html>
      // too (not persisted to localStorage, so it isn't locked in as an
      // explicit user choice; a later OS-preference change still applies).
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', preferred);
      setTheme(preferred);
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle color theme"
      className="p-1.5 rounded-md border border-border text-ink-muted hover:text-ink hover:border-accent/40 transition-colors cursor-pointer"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
