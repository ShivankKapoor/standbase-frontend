import { Card, CardContent } from '../ui/card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Current streak</span>
          <span className="text-2xl font-semibold tabular-nums">{formatDays(currentStreak)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Longest streak</span>
          <span className="text-2xl font-semibold tabular-nums">{formatDays(longestStreak)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
