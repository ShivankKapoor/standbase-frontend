import { ChartColumn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm pt-safe px-safe">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/cal.svg" alt="" className="h-9 w-9" />
          <span className="truncate text-lg font-semibold tracking-tight underline underline-offset-4">Standbase</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {username && (
            <span className="mr-2 hidden text-sm sm:inline text-muted-foreground">{username}</span>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate('/stats')} aria-label="Statistics">
            <ChartColumn className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} aria-label={username ? `Logout ${username}` : 'Logout'} title={username ? `Signed in as ${username}` : undefined}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
