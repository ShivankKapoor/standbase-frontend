import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  function handleClick() {
    setDark((d) => !d);
    setSpinning(true);
  }

  const Icon = dark ? Sun : Moon;

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} aria-label="Toggle theme">
      <Icon
        className={`h-4 w-4 ${spinning ? 'animate-theme-spin' : ''}`}
        onAnimationEnd={() => setSpinning(false)}
      />
    </Button>
  );
}
