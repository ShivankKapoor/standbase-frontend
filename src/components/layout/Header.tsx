import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/cal.svg" alt="" className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight underline underline-offset-4">Standbase</span>
        </div>
        <div className="flex items-center gap-1">
          {username && (
            <span className="mr-2 text-sm text-muted-foreground">{username}</span>
          )}
<ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
